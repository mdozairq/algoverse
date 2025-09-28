import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { adminAuth } from "@/lib/firebase/admin"
import { requireRole } from "@/lib/auth/middleware"

// GET /api/admin/merchants - Get merchants with optional status filter
export const GET = requireRole(["admin"])(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let merchants = []
    
    if (status === 'pending') {
      merchants = await FirebaseService.getPendingMerchants()
    } else if (status === 'approved') {
      merchants = await FirebaseService.getApprovedMerchants()
    } else if (status === 'rejected') {
      // Get all merchants and filter for rejected ones
      const allMerchants = await FirebaseService.getMerchants()
      merchants = allMerchants.filter(merchant => merchant.status === 'rejected')
    } else {
      // Get all merchants for 'all' status
      merchants = await FirebaseService.getMerchants()
    }
    
    return NextResponse.json({ merchants })
  } catch (error: any) {
    console.error("Error fetching merchants:", error)
    return NextResponse.json({ error: "Failed to fetch merchants" }, { status: 500 })
  }
})

// POST /api/admin/merchants - Update merchant status
export const POST = requireRole(["admin"])(async (request: NextRequest) => {
  try {
    const { merchantId, approved } = await request.json()

    // Resolve the correct document ID. merchantId may be a doc ID or a UID from older data.
    let target = await FirebaseService.getUserById(merchantId)
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

    // Determine the new status
    const newStatus = approved ? 'approved' : 'rejected'
    
    // Update merchant verification status with new status field
    await FirebaseService.updateUser(target.id, {
      isApproved: approved,
      status: newStatus,
      updatedAt: new Date(),
    })

    // Update the user's verification status if approved
    if (approved && target.uid) {
      const user = await FirebaseService.getUserByUid(target.uid)
      if (user) {
        await FirebaseService.updateUser(user.id, {
          isVerified: true
        })
      }
    }

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
