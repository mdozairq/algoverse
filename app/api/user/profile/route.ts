import { type NextResponse } from "next/server"
import { withAuth, type AuthenticatedRequest } from "@/lib/auth/middleware"
import { FirebaseService } from "@/lib/firebase/collections"

export const GET = withAuth(async (req: AuthenticatedRequest): Promise<NextResponse> => {
  try {
    const userId = req.user!.userId
    const user = await FirebaseService.getUserById(userId)
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 }) as unknown as NextResponse
    }
    return new Response(JSON.stringify({ user }), { status: 200 }) as unknown as NextResponse
  } catch (error) {
    console.error("Profile fetch error:", error)
    return new Response(JSON.stringify({ error: "Failed to fetch profile" }), { status: 500 }) as unknown as NextResponse
  }
})

export const POST = withAuth(async (req: AuthenticatedRequest): Promise<NextResponse> => {
  try {
    const userId = req.user!.userId
    const body = await (req as any).json()

    const updates: any = {}
    if (typeof body.name === "string") updates.name = body.name
    if (typeof body.walletAddress === "string") updates.walletAddress = body.walletAddress

    await FirebaseService.updateUser(userId, { ...updates, updatedAt: new Date() } as any)
    const user = await FirebaseService.getUserById(userId)
    return new Response(JSON.stringify({ success: true, user }), { status: 200 }) as unknown as NextResponse
  } catch (error) {
    console.error("Profile update error:", error)
    return new Response(JSON.stringify({ error: "Failed to update profile" }), { status: 500 }) as unknown as NextResponse
  }
})


