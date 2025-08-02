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
        uid: userRecord.uid,
        businessName,
        description: "",
        category: Array.isArray(category) ? category : [category],
        verified: false,
        walletAddress: walletAddress || "",
        totalRevenue: 0,
        totalEvents: 0,
        totalSales: 0,
        rating: 0,
        reviewCount: 0,
        marketplaceEnabled: false,
      })
    } else {
      await FirebaseService.createUser({
        uid: userRecord.uid,
        email,
        displayName: displayName || "",
        role: role || "user",
        walletAddress: walletAddress || "",
        verified: false,
        loyaltyPoints: 0,
        totalSpent: 0,
        eventsAttended: 0,
        nftsOwned: 0,
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
