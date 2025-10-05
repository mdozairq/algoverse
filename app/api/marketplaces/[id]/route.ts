import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { requireRole } from "@/lib/auth/middleware"

// GET /api/marketplaces/[id] - Get marketplace by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const marketplaceId = params.id

    if (!marketplaceId) {
      return NextResponse.json({ error: "Marketplace ID is required" }, { status: 400 })
    }

    const marketplace = await FirebaseService.getMarketplaceById(marketplaceId)

    if (!marketplace) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    // Get merchant details
    const merchant = await FirebaseService.getMerchantById(marketplace.merchantId)
    
    // Get template details
    const template = await FirebaseService.getMarketplaceTemplateById(marketplace.template)

    return NextResponse.json({
      marketplace: {
        ...marketplace,
        merchant: merchant ? {
          id: merchant.id,
          businessName: merchant.businessName,
          email: merchant.email,
          category: merchant.category,
          description: merchant.description,
          isApproved: merchant.isApproved,
          isVerified: merchant.isVerified
        } : null,
        template: template ? {
          id: template.id,
          name: template.name,
          description: template.description,
          configuration: template.configuration
        } : null
      }
    })
  } catch (error: any) {
    console.error("Error fetching marketplace:", error)
    return NextResponse.json({ error: "Failed to fetch marketplace" }, { status: 500 })
  }
}

// PUT /api/marketplaces/[id] - Update marketplace
export const PUT = requireRole(["merchant", "admin"])(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const auth = (request as any).auth
    const marketplaceId = params.id
    const updates = await request.json()

    if (!marketplaceId) {
      return NextResponse.json({ error: "Marketplace ID is required" }, { status: 400 })
    }

    // Get existing marketplace
    const existingMarketplace = await FirebaseService.getMarketplaceById(marketplaceId)
    if (!existingMarketplace) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    // Check permissions
    if (auth.role === "merchant" && existingMarketplace.merchantId !== auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Validate template if being updated
    if (updates.template) {
      const template = await FirebaseService.getMarketplaceTemplateById(updates.template)
      if (!template) {
        return NextResponse.json({ error: "Invalid template" }, { status: 400 })
      }
    }

    // Update marketplace
    await FirebaseService.updateMarketplace(marketplaceId, {
      ...updates,
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

// DELETE /api/marketplaces/[id] - Delete marketplace
export const DELETE = requireRole(["merchant", "admin"])(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const auth = (request as any).auth
    const marketplaceId = params.id

    if (!marketplaceId) {
      return NextResponse.json({ error: "Marketplace ID is required" }, { status: 400 })
    }

    // Get existing marketplace
    const existingMarketplace = await FirebaseService.getMarketplaceById(marketplaceId)
    if (!existingMarketplace) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    // Check permissions
    if (auth.role === "merchant" && existingMarketplace.merchantId !== auth.userId) {
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