import { type NextResponse } from "next/server"
import { withAuth, type AuthenticatedRequest } from "@/lib/auth/middleware"
import { FirebaseService } from "@/lib/firebase/collections"

export const GET = withAuth(async (req: AuthenticatedRequest): Promise<NextResponse> => {
  try {
    const ownerId = req.user!.userId
    const nfts = await FirebaseService.getNFTsByOwner(ownerId)
    const eventIds = Array.from(new Set(nfts.map((n: any) => n.eventId).filter(Boolean)))
    const events = await Promise.all(eventIds.map((id) => FirebaseService.getEventById(id)))
    return new Response(JSON.stringify({ events: events.filter(Boolean) }), { status: 200 }) as unknown as NextResponse
  } catch (error) {
    console.error("User events fetch error:", error)
    return new Response(JSON.stringify({ error: "Failed to fetch events" }), { status: 500 }) as unknown as NextResponse
  }
})


