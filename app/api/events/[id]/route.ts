import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { verifyAuthToken } from "@/lib/auth/middleware"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const event = await FirebaseService.getEventById(params.id)

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Get merchant info only if merchantId is valid
    let merchant = null
    if (event.merchantId && event.merchantId.trim() !== "") {
      try {
        merchant = await FirebaseService.getMerchantById(event.merchantId)
      } catch (merchantError) {
        console.warn("Failed to fetch merchant info:", merchantError)
        // Continue without merchant info
      }
    }

    return NextResponse.json({
      event: {
        ...event,
        merchant: merchant
          ? {
              id: merchant.id,
              businessName: merchant.businessName,
              verified: merchant.isApproved,
            }
          : null,
      },
    })
  } catch (error: any) {
    console.error("Error fetching event:", error)
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 })
  }
}

// PUT /api/events/[id] - Update event (merchants only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Manual auth check
    const auth = await verifyAuthToken(request)
    if (!auth || !auth.uid || (auth.role !== "merchant" && auth.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const updateData = await request.json()

    // Get the event to verify ownership
    const event = await FirebaseService.getEventById(params.id)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Verify the merchant owns this event
    const merchant = await FirebaseService.getMerchantByUid(auth.uid)
    if (!merchant || event.merchantId !== merchant.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update the event
    await FirebaseService.updateEvent(params.id, updateData)

    return NextResponse.json({
      success: true,
      message: "Event updated successfully",
    })
  } catch (error: any) {
    console.error("Error updating event:", error)
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
}

// DELETE /api/events/[id] - Delete event (merchants only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Manual auth check
    const auth = await verifyAuthToken(request)
    if (!auth || !auth.uid || (auth.role !== "merchant" && auth.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the event to verify ownership
    const event = await FirebaseService.getEventById(params.id)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Verify the merchant owns this event
    const merchant = await FirebaseService.getMerchantByUid(auth.uid)
    if (!merchant || event.merchantId !== merchant.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete the event
    await FirebaseService.deleteEvent(params.id)

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    })
  } catch (error: any) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
  }
}
