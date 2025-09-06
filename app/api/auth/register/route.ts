import { type NextRequest, NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebase/admin"
import { FirebaseService } from "@/lib/firebase/collections"

export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName, role, walletAddress, businessName, category, description } = await request.json()

    // Check if user already exists
    const existingUser = await FirebaseService.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 400 })
    }

    // Generate a unique ID for the user
    const userId = `${role}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create user document in Firestore
    if (role === "merchant") {
      await FirebaseService.createMerchant({
        businessName: businessName || displayName,
        email,
        description: description || "",
        category: Array.isArray(category) ? category[0] : category || "Other",
        walletAddress: walletAddress || "",
        isApproved: false,
        uid: userId,
      })
    } else {
      await FirebaseService.createUser({
        email,
        name: displayName || "",
        role: role || "user",
        walletAddress: walletAddress || "",
        isVerified: false,
      })
    }

    return NextResponse.json({
      success: true,
      message: role === "merchant" 
        ? "Merchant application submitted successfully. You'll receive an email once approved."
        : "User account created successfully.",
      user: {
        uid: userId,
        email,
        displayName,
        role,
      },
    })
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 400 })
  }
}
