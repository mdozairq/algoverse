// GET /api/admin/merchants/[id] - Get merchant details
import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/middleware"
import { FirebaseService } from "@/lib/firebase/collections"

export const GET = requireAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    // Try to get merchant from merchants collection first
    let merchant = await FirebaseService.getMerchantById(params.id)
    
    // If not found, try users collection (for backward compatibility)
    if (!merchant) {
      const user = await FirebaseService.getUserById(params.id)
      if (user && user.role === "merchant") {
        merchant = user as any // Cast to Merchant type
      }
    }
    
    if (!merchant) {
      return NextResponse.json(
        { error: "Merchant not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      merchant: {
        id: merchant.id,
        businessName: merchant.businessName,
        email: merchant.email,
        category: merchant.category,
        walletAddress: merchant.walletAddress,
        isApproved: merchant.isApproved,
        status: merchant.status,
        permissions: merchant.permissions || {},
      },
    })
  } catch (error: any) {
    console.error("Error fetching merchant:", error)
    return NextResponse.json(
      { error: "Failed to fetch merchant" },
      { status: 500 }
    )
  }
})

