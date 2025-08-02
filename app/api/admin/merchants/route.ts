import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { adminAuth } from "@/lib/firebase/admin"
import { requireRole } from "@/lib/auth/middleware"

// GET /api/admin/merchants - Get pending merchants
export const GET = requireRole(["admin"])(async (request: NextRequest) => {
  try {
    const pendingMerchants = await FirebaseService.getPendingMerchants()
    return NextResponse.json({ merchants: pendingMerchants })
  } catch (error: any) {
    console.error("Error fetching pending merchants:", error)
    return NextResponse.json({ error: "Failed to fetch merchants" }, { status: 500 })
  }
})

// POST /api/admin/merchants/approve - Approve merchant
export const POST = requireRole(["admin"])(async (request: NextRequest) => {
  try {
    const { merchantId, approved } = await request.json()

    // Update merchant verification status
    await FirebaseService.updateMerchant(merchantId, {
      verified: approved,
      marketplaceEnabled: approved,
    })

    // Update user custom claims if approved
    if (approved) {
      const merchant = await FirebaseService.getMerchantById(merchantId)
      if (merchant) {
        await adminAuth.setCustomUserClaims(merchant.uid, {
          role: "merchant",
          verified: true,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: approved ? "Merchant approved" : "Merchant rejected",
    })
  } catch (error: any) {
    console.error("Error updating merchant status:", error)
    return NextResponse.json({ error: "Failed to update merchant status" }, { status: 500 })
  }
})
