import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { requireRole } from "@/lib/auth/middleware"

// GET /api/events - Get events with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const merchantId = searchParams.get("merchantId")
    const status = searchParams.get("status")

    let events = []

    if (merchantId) {
      events = await FirebaseService.getEventsByMerchant(merchantId)
    } else if (status === "pending") {
      events = await FirebaseService.getPendingEvents()
    } else if (status === "approved") {
      events = await FirebaseService.getApprovedEvents()
    } else if (status === "rejected") {
      events = await FirebaseService.getRejectedEvents()
    } else {
      events = await FirebaseService.getAllEvents()
    }

    // Convert date fields to strings
    const eventsWithStringDates = events.map(event => ({
      ...event,
      createdAt: event.createdAt instanceof Date ? event.createdAt.toISOString() : event.createdAt,
      updatedAt: event.updatedAt instanceof Date ? event.updatedAt.toISOString() : event.updatedAt,
      nftCreatedAt: event.nftCreatedAt instanceof Date ? event.nftCreatedAt.toISOString() : event.nftCreatedAt
    }))

    return NextResponse.json({ events: eventsWithStringDates })
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

    // Get merchant info from authenticated user
    let merchant = null
    if (auth.userId) {
      merchant = await FirebaseService.getMerchantById(auth.userId)
    }
    
    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 })
    }

    // Validate required fields
    if (!eventData.title || !eventData.description || !eventData.category || !eventData.date || !eventData.location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create event
    const eventId = await FirebaseService.createEvent({
      ...eventData,
      merchantId: merchant.id!,
      status: eventData.status || "draft",
    })

    return NextResponse.json({
      success: true,
      eventId,
      message: "Event created successfully",
    })
  } catch (error: any) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
})