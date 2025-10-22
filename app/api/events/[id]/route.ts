import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { requireRole } from "@/lib/auth/middleware"

// GET /api/events/[id] - Get single event
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    }

    const event = await FirebaseService.getEventById(eventId)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Convert date fields to strings
    const eventWithStringDates = {
      ...event,
      createdAt: event.createdAt instanceof Date ? event.createdAt.toISOString() : event.createdAt,
      updatedAt: event.updatedAt instanceof Date ? event.updatedAt.toISOString() : event.updatedAt,
      nftCreatedAt: event.nftCreatedAt instanceof Date ? event.nftCreatedAt.toISOString() : event.nftCreatedAt
    }

    return NextResponse.json({ event: eventWithStringDates })
  } catch (error: any) {
    console.error("Error fetching event:", error)
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 })
  }
}

// PUT /api/events/[id] - Update event
export const PUT = requireRole(["merchant"])(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const eventData = await request.json()
    const eventId = params.id

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    }

    // Get the event first to check if it exists and belongs to the merchant
    const event = await FirebaseService.getEventById(eventId)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Update event
    await FirebaseService.updateEvent(eventId, {
      ...eventData,
      updatedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: "Event updated successfully",
    })
  } catch (error: any) {
    console.error("Error updating event:", error)
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
})

// DELETE /api/events/[id] - Delete event
export const DELETE = requireRole(["merchant"])(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const eventId = params.id

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    }

    // Get the event first to check if it exists
    const event = await FirebaseService.getEventById(eventId)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Delete event
    await FirebaseService.deleteEvent(eventId)

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    })
  } catch (error: any) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
  }
})