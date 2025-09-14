import { type NextResponse } from "next/server"
import { withAuth, type AuthenticatedRequest } from "@/lib/auth/middleware"
import { FirebaseService } from "@/lib/firebase/collections"

export const GET = withAuth(async (req: AuthenticatedRequest): Promise<NextResponse> => {
  try {
    const userId = req.user!.userId
    // In a real app, you'd fetch user activity from a dedicated collection
    // For now, return mock data based on user's NFTs and events
    const nfts = await FirebaseService.getNFTsByOwner(userId)
    
    const activities = [
      {
        id: "1",
        type: "purchase",
        title: "Purchased NFT",
        description: "Bought event ticket",
        amount: "0.5 ALGO",
        timestamp: new Date().toISOString(),
        status: "completed"
      },
      {
        id: "2", 
        type: "reward",
        title: "Earned loyalty points",
        description: "Attended event",
        amount: "+25 points",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: "completed"
      },
      {
        id: "3",
        type: "checkin",
        title: "Checked in to event",
        description: "Successfully checked in",
        amount: "Event completed",
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        status: "completed"
      }
    ]

    return new Response(JSON.stringify({ activities }), { status: 200 }) as unknown as NextResponse
  } catch (error) {
    console.error("User activity fetch error:", error)
    return new Response(JSON.stringify({ error: "Failed to fetch activity" }), { status: 500 }) as unknown as NextResponse
  }
})

export const POST = withAuth(async (req: AuthenticatedRequest): Promise<NextResponse> => {
  try {
    const userId = req.user!.userId
    const body = await (req as any).json()
    
    const { type, title, description, amount } = body
    
    // In a real app, you'd save this to a user_activities collection
    const activity = {
      userId,
      type,
      title,
      description,
      amount,
      timestamp: new Date().toISOString(),
      status: "completed"
    }
    
    // For now, just return success
    return new Response(JSON.stringify({ success: true, activity }), { status: 200 }) as unknown as NextResponse
  } catch (error) {
    console.error("User activity creation error:", error)
    return new Response(JSON.stringify({ error: "Failed to create activity" }), { status: 500 }) as unknown as NextResponse
  }
})
