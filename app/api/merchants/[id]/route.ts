import { NextRequest, NextResponse } from 'next/server'
import { FirebaseService } from '@/lib/firebase/collections'
import { requireRole } from '@/lib/auth/middleware'

export const GET = requireRole(["user", "merchant", "admin"])(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const merchantId = params.id

    if (!merchantId) {
      return NextResponse.json({ error: "Merchant ID is required" }, { status: 400 })
    }

    // Get merchant details
    const merchant = await FirebaseService.getMerchantById(merchantId)
    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      merchant: merchant
    })

  } catch (error: any) {
    console.error("Error getting merchant details:", error)
    return NextResponse.json({ error: "Failed to get merchant details" }, { status: 500 })
  }
})
