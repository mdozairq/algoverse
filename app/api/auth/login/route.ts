import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { verifyPassword } from "@/lib/auth/password"
import { signJWT } from "@/lib/auth/jwt"

export async function POST(request: NextRequest) {
  try {
    const { email, password, role, adminKey } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Verify admin key if admin login
    if (role === "admin") {
      const expectedAdminKey = process.env.ADMIN_MASTER_KEY
      if (!expectedAdminKey || adminKey !== expectedAdminKey) {
        return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 })
      }
    }

    let userData = null

    if (role === "merchant") {
      // For merchant login, check merchants collection first
      const merchants = await FirebaseService.getApprovedMerchants()
      userData = merchants.find((m) => m.email === email)
      
      // If not found in merchants, check users collection
      if (!userData) {
        userData = await FirebaseService.getUserByEmail(email)
      }
    } else {
      userData = await FirebaseService.getUserByEmail(email)
    }

    if (!userData) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    if (role === "merchant") {
      // Check if user is verified (for users collection) or if merchant is approved (for merchants collection)
      const isVerified = (userData as any).isVerified || (userData as any).isApproved
      if (!isVerified) {
        return NextResponse.json({ error: "Account pending approval" }, { status: 403 })
      }
    }

    const storedPassword = (userData as any).password
    if (!storedPassword) {
      if (process.env.DEV_AUTH_BYPASS === "true") {
        // Allow login without stored password in dev environments
      } else {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }
    } else {
      const valid = await verifyPassword(password, storedPassword)
      if (!valid) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }
    }

    const jwtPayload = {
      userId: userData.id || email,
      email: (userData as any).email,
      role: role === "merchant" ? "merchant" : ((userData as any).role || role || "user"),
      walletAddress: userData.walletAddress,
      isVerified: (userData as any).isVerified || (userData as any).isApproved || (userData as any).role === "admin",
      uid: (userData as any).uid,
    }

    // Debug logging for merchant login
    if (role === "merchant") {
      console.log("Merchant login - User data role:", (userData as any).role)
      console.log("Merchant login - Requested role:", role)
      console.log("Merchant login - Final JWT role:", jwtPayload.role)
    }

    const token = await signJWT(jwtPayload)

    const successResponse = NextResponse.json({
      success: true,
      user: jwtPayload,
    })

    // Clear any existing auth token cookie first, then set the new one
    successResponse.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })

    // Set the new auth token cookie
    successResponse.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return successResponse
  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
