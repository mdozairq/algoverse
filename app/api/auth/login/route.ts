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

    // Unified approach: all users are in the users collection
    let userData = await FirebaseService.getUserByEmail(email, role)

    if (!userData) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check role-specific verification
    if (role === "merchant") {
      // For merchants, check if they are approved
      if (!userData.isApproved || userData.status !== "approved") {
        return NextResponse.json({ error: "Account pending approval" }, { status: 403 })
      }
    } else if (role === "user") {
      // For regular users, check if they are verified
      if (!userData.isVerified) {
        return NextResponse.json({ error: "Account not verified" }, { status: 403 })
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
      email: userData.email || email,
      role: role || userData.role || "user", // Prioritize requested role over stored role
      walletAddress: userData.walletAddress,
      isVerified: userData.isVerified || userData.isApproved || userData.role === "admin",
      uid: userData.uid,
    }

    // Debug logging for merchant login
    if (role === "merchant") {
      console.log("Merchant login - User data role:", userData.role)
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
