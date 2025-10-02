import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { requireRole } from "@/lib/auth/middleware"

// GET /api/marketplaces/[id] - Get specific marketplace
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const marketplace = await FirebaseService.getMarketplaceById(params.id)
    
    if (!marketplace) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    // Get merchant details
    const merchant = await FirebaseService.getUserById(marketplace.merchantId)
    
    return NextResponse.json({
      marketplace: {
        ...marketplace,
        merchant: merchant ? {
          id: merchant.id,
          businessName: merchant.businessName,
          email: merchant.email,
          category: merchant.category
        } : null
      }
    })
  } catch (error: any) {
    console.error("Error fetching marketplace:", error)
    return NextResponse.json({ error: "Failed to fetch marketplace" }, { status: 500 })
  }
}

// PUT /api/marketplaces/[id] - Update marketplace (merchant only)
export const PUT = requireRole(["merchant"])(async (request: NextRequest) => {
  try {
    const auth = (request as any).auth
    const updateData = await request.json()
    
    // Extract ID from URL path
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const marketplaceId = pathParts[pathParts.length - 1]

    // Get marketplace to verify ownership
    const marketplace = await FirebaseService.getMarketplaceById(marketplaceId)
    if (!marketplace) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    // Get merchant to verify ownership
    const merchant = await FirebaseService.getMerchantById(marketplace.merchantId);
    
    if (!merchant || merchant.id !== marketplace.merchantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update marketplace
    await FirebaseService.updateMarketplace(marketplaceId, {
      ...updateData,
      updatedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      message: "Marketplace updated successfully"
    })
  } catch (error: any) {
    console.error("Error updating marketplace:", error)
    return NextResponse.json({ error: "Failed to update marketplace" }, { status: 500 })
  }
})

// DELETE /api/marketplaces/[id] - Delete marketplace (merchant only)
export const DELETE = requireRole(["merchant"])(async (request: NextRequest) => {
  try {
    const auth = (request as any).auth
    
    // Extract ID from URL path
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const marketplaceId = pathParts[pathParts.length - 1]

    // Get marketplace to verify ownership
    const marketplace = await FirebaseService.getMarketplaceById(marketplaceId)
    if (!marketplace) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    // Get merchant to verify ownership
    const merchant = await FirebaseService.getMerchantById(marketplace.merchantId)
    if (!merchant || merchant.id !== marketplace.merchantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete marketplace
    await FirebaseService.deleteMarketplace(marketplaceId)

    return NextResponse.json({
      success: true,
      message: "Marketplace deleted successfully"
    })
  } catch (error: any) {
    console.error("Error deleting marketplace:", error)
    return NextResponse.json({ error: "Failed to delete marketplace" }, { status: 500 })
  }
})