import { type NextRequest, NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebase/admin"
import { FirebaseService } from "@/lib/firebase/collections"

export async function POST(request: NextRequest) {
  try {
    const { email, password, role, adminKey } = await request.json()

    // Verify admin key if admin login
    if (role === "admin") {
      const expectedAdminKey = process.env.ADMIN_MASTER_KEY || "admin123"
      if (adminKey !== expectedAdminKey) {
        return NextResponse.json({ error: "Invalid admin master key" }, { status: 401 })
      }
    }

    // Sign in with Firebase Auth
    const userRecord = await adminAuth.getUserByEmail(email)
    
    // Verify user exists and has correct role
    const customClaims = userRecord.customClaims || {}
    if (role && customClaims.role !== role) {
      return NextResponse.json({ error: "Invalid role for this account" }, { status: 403 })
    }

    // Get user data from Firestore
    let userData
    if (role === "merchant") {
      userData = await FirebaseService.getMerchant(userRecord.uid)
    } else if (role === "admin") {
      userData = await FirebaseService.getUser(userRecord.uid)
    } else {
      userData = await FirebaseService.getUser(userRecord.uid)
    }

    if (!userData) {
      return NextResponse.json({ error: "User data not found" }, { status: 404 })
    }

    // Check if merchant is verified (for merchant login)
    if (role === "merchant" && !userData.verified) {
      return NextResponse.json({ error: "Merchant account not yet verified" }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role: customClaims.role || "user",
        ...userData,
      },
    })
  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json({ error: error.message || "Login failed" }, { status: 400 })
  }
} 