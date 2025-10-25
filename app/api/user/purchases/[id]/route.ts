import { NextRequest, NextResponse } from 'next/server'
import { FirebaseService } from '@/lib/firebase/collections'
import { requireRole } from '@/lib/auth/middleware'

export const GET = requireRole(["user"])(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const auth = (request as any).auth
    const purchaseId = params.id

    if (!purchaseId) {
      return NextResponse.json({ error: "Purchase ID is required" }, { status: 400 })
    }

    // Get purchase details
    const purchase = await FirebaseService.getPurchaseById(purchaseId)
    if (!purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 })
    }

    // Verify the purchase belongs to the user
    if (purchase.userId !== auth.userId) {
      return NextResponse.json({ error: "Unauthorized access to purchase" }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      purchase: purchase
    })

  } catch (error: any) {
    console.error("Error getting purchase details:", error)
    return NextResponse.json({ error: "Failed to get purchase details" }, { status: 500 })
  }
})
