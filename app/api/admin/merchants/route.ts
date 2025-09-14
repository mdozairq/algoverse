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

    // Resolve the correct document ID. merchantId may be a doc ID or a UID from older data.
    let target = await FirebaseService.getMerchantById(merchantId)
    if (!target) {
      // Fallback: try by UID
      const byUid = await FirebaseService.getMerchantByUid(merchantId)
      if (byUid) {
        target = byUid
      }
    }

    if (!target) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 })
    }

    // Update merchant verification status
    await FirebaseService.updateMerchant(target.id, {
      isApproved: approved,
      updatedAt: new Date(),
    })

    // Update user custom claims if approved
    if (approved && target.uid) {
      try {
        await adminAuth.setCustomUserClaims(target.uid, {
          role: "merchant",
          verified: true,
        })
      } catch (e) {
        // In local/mock environments, Admin Auth may not be fully configured.
        console.warn("Skipping setCustomUserClaims due to admin auth config:", e)
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
