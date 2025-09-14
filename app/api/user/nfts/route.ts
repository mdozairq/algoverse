import { type NextResponse } from "next/server"
import { withAuth, type AuthenticatedRequest } from "@/lib/auth/middleware"
import { FirebaseService } from "@/lib/firebase/collections"

export const GET = withAuth(async (req: AuthenticatedRequest): Promise<NextResponse> => {
  try {
    const ownerId = req.user!.userId
    const nfts = await FirebaseService.getNFTsByOwner(ownerId)
    return new Response(JSON.stringify({ nfts }), { status: 200 }) as unknown as NextResponse
  } catch (error) {
    console.error("User NFTs fetch error:", error)
    return new Response(JSON.stringify({ error: "Failed to fetch NFTs" }), { status: 500 }) as unknown as NextResponse
  }
})


