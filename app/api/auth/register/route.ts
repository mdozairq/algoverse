import { type NextRequest, NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebase/admin"
import { FirebaseService } from "@/lib/firebase/collections"

export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName, role, walletAddress, businessName, category } = await request.json()

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
    })

    // Set custom claims for role
    await adminAuth.setCustomUserClaims(userRecord.uid, { role })

    // Create user document in Firestore
    if (role === "merchant") {
      await FirebaseService.createMerchant({
        businessName,
        email,
        description: "",
        category: Array.isArray(category) ? category[0] : category,
        walletAddress: walletAddress || "",
        isApproved: false,
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
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role,
      },
    })
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 400 })
  }
}
