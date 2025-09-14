import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { requireRole } from "@/lib/auth/middleware"

// GET /api/events - Get all events with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const featured = searchParams.get("featured")
    const trending = searchParams.get("trending")
    const merchantId = searchParams.get("merchantId")

    let events = []

    if (featured === "true") {
      events = await FirebaseService.getFeaturedEvents(10)
    } else if (trending === "true") {
      events = await FirebaseService.getTrendingEvents(10)
    } else if (merchantId) {
      events = await FirebaseService.getEventsByMerchant(merchantId)
    } else {
      // Get all events - implement pagination as needed
      events = await FirebaseService.getFeaturedEvents(50)
    }

    return NextResponse.json({ events })
  } catch (error: any) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}

// POST /api/events - Create new event (merchants only)
export const POST = requireRole(["merchant"])(async (request: NextRequest) => {
  try {
    const auth = (request as any).auth
    const eventData = await request.json()

    // Resolve merchant by uid (preferred) or by email
    let merchant = auth.uid ? await FirebaseService.getMerchantByUid(auth.uid) : null
    if (!merchant && auth.email) {
      // fallback: find merchant by email in approved list
      const approved = await FirebaseService.getApprovedMerchants()
      merchant = approved.find((m: any) => m.email === auth.email) as any
    }
    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 })
    }

    // Create event
    const eventId = await FirebaseService.createEvent({
      ...eventData,
      merchantId: merchant.id!,
      availableSupply: eventData.totalSupply,
      soldCount: 0,
      status: "draft",
      featured: false,
      trending: false,
    })

    return NextResponse.json({
      success: true,
      eventId,
    })
  } catch (error: any) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
})
