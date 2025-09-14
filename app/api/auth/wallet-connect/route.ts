import { type NextResponse, NextRequest } from "next/server"
import { withAuth, type AuthenticatedRequest } from "@/lib/auth/middleware"
import { FirebaseService } from "@/lib/firebase/collections"
import { signJWT } from "@/lib/auth/jwt"

export const POST = withAuth(async (req: AuthenticatedRequest): Promise<NextResponse> => {
  try {
    const { walletAddress } = await (req as unknown as NextRequest).json()

    if (!walletAddress || typeof walletAddress !== "string") {
      return new Response(JSON.stringify({ error: "walletAddress is required" }), { status: 400 }) as unknown as NextResponse
    }

    const user = req.user!

    // Update wallet address depending on role
    if (user.role === "merchant") {
      const merchant = await FirebaseService.getMerchantByUid(user.userId) || (await FirebaseService.getMerchantByUid(user.userId!))
      if (merchant?.id) {
        await FirebaseService.updateMerchant(merchant.id, { walletAddress })
      }
    } else if (user.role === "user") {
      // user.userId should be the users collection doc id
      await FirebaseService.updateUser(user.userId, { walletAddress })
    }

    // Issue a new JWT with updated wallet address
    const newToken = await signJWT({
      userId: user.userId,
      email: user.email,
      role: user.role as any,
      walletAddress,
      isVerified: user.isVerified,
      uid: (user as any).uid,
    })

    const res = new Response(JSON.stringify({ success: true }), { status: 200 }) as unknown as NextResponse
    res.cookies.set("auth-token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return res
  } catch (error) {
    console.error("Wallet connect error:", error)
    return new Response(JSON.stringify({ error: "Failed to connect wallet" }), { status: 500 }) as unknown as NextResponse
  }
})


