import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { requireRole } from "@/lib/auth/middleware"

// PUT /api/admin/events/[id] - Update event status
export const PUT = requireRole(["admin"])(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { status } = await request.json()
    const eventId = params.id

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    }

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status. Must be 'approved' or 'rejected'" }, { status: 400 })
    }

    // Get the event first to check if it exists
    const event = await FirebaseService.getEventById(eventId)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Update event status
    await FirebaseService.updateEvent(eventId, {
      status,
      updatedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: `Event ${status} successfully`,
    })
  } catch (error: any) {
    console.error("Error updating event status:", error)
    return NextResponse.json({ error: "Failed to update event status" }, { status: 500 })
  }
})
