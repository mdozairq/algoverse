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

    // Convert date fields to strings
    const marketplaceWithStringDates = {
      ...marketplace,
      createdAt: marketplace.createdAt instanceof Date ? marketplace.createdAt.toISOString() : marketplace.createdAt,
      updatedAt: marketplace.updatedAt instanceof Date ? marketplace.updatedAt.toISOString() : marketplace.updatedAt,
      merchant: merchant ? {
        id: merchant.id,
        businessName: merchant.businessName,
        email: merchant.email,
        category: merchant.category,
        description: merchant.description,
        isApproved: merchant.isApproved,
        isVerified: merchant.isVerified,
        createdAt: merchant.createdAt instanceof Date ? merchant.createdAt.toISOString() : merchant.createdAt,
        updatedAt: merchant.updatedAt instanceof Date ? merchant.updatedAt.toISOString() : merchant.updatedAt
      } : null,
      template: template ? {
        id: template.id,
        name: template.name,
        description: template.description,
        configuration: template.configuration,
        createdAt: template.createdAt instanceof Date ? template.createdAt.toISOString() : template.createdAt,
        updatedAt: template.updatedAt instanceof Date ? template.updatedAt.toISOString() : template.updatedAt
      } : null
    }

    return NextResponse.json({
      marketplace: marketplaceWithStringDates
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

    console.log("PUT /api/marketplaces/[id] - Request data:", {
      marketplaceId,
      updates,
      auth: auth ? { userId: auth.userId, role: auth.role } : null
    })

    if (!marketplaceId) {
      return NextResponse.json({ error: "Marketplace ID is required" }, { status: 400 })
    }

    // Get existing marketplace
    const existingMarketplace = await FirebaseService.getMarketplaceById(marketplaceId)
    if (!existingMarketplace) {
      console.log("Marketplace not found:", marketplaceId)
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    // Check permissions
    if (auth.role === "merchant" && existingMarketplace.merchantId !== auth.userId) {
      console.log("Unauthorized access:", { 
        authUserId: auth.userId, 
        marketplaceMerchantId: existingMarketplace.merchantId 
      })
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Validate template if being updated
    if (updates.template) {
      console.log("Validating template:", updates.template)
      
      // Allow common template names without strict validation
      const commonTemplates = ['modern', 'classic', 'minimal', 'gaming', 'art', 'music', 'default']
      if (commonTemplates.includes(updates.template.toLowerCase())) {
        console.log("Using common template (no validation needed):", updates.template)
        // Skip validation for common templates
      } else {
        try {
          // First try to get by ID
          let template = await FirebaseService.getMarketplaceTemplateById(updates.template)
          
          // If not found by ID, try to get by name (case-insensitive)
          if (!template) {
            console.log("Template not found by ID, trying by name:", updates.template)
          const allTemplates = await FirebaseService.getAllMarketplaceTemplates()
          template = allTemplates.find(t => 
            t.name.toLowerCase() === updates.template.toLowerCase()
          ) || null
          }
          
          if (!template) {
            console.log("Template not found in database, but allowing update:", updates.template)
            // Allow the update even if template doesn't exist in database
            console.log("Template validation skipped for:", updates.template)
          } else {
            console.log("Template validation successful:", template.name)
          }
        } catch (templateError: any) {
          console.error("Template validation error:", templateError)
          // Don't fail the request for template validation errors
          console.log("Template validation failed, but allowing update:", updates.template)
        }
      }
    }

    // Validate required fields for marketplace updates
    const allowedFields = [
      'businessName', 'description', 'category', 'template', 
      'primaryColor', 'secondaryColor', 'customDomain',
      'isEnabled', 'allowSwap', 'allowMint', 'allowTrading',
      'walletAddress', 'website', 'logo', 'banner', 'allowCreate'
    ]
    
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        // Validate specific field types
        if (key === 'isEnabled' || key === 'allowSwap' || key === 'allowMint' || key === 'allowTrading') {
          obj[key] = Boolean(updates[key])
        } else if (key === 'primaryColor' || key === 'secondaryColor') {
          // Validate color format
          const color = updates[key]
          if (typeof color === 'string' && (color.startsWith('#') || color.startsWith('rgb'))) {
            obj[key] = color
          } else {
            console.warn(`Invalid color format for ${key}:`, color)
          }
        } else {
          obj[key] = updates[key]
        }
        return obj
      }, {} as any)

    console.log("Filtered updates:", filteredUpdates)

    // Validate that we have at least one field to update
    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({ 
        error: "No valid fields to update" 
      }, { status: 400 })
    }

    // Update marketplace
    try {
      await FirebaseService.updateMarketplace(marketplaceId, {
        ...filteredUpdates,
        updatedAt: new Date()
      })

      console.log("Marketplace updated successfully:", marketplaceId)
      
      return NextResponse.json({
        success: true,
        message: "Marketplace updated successfully"
      })
    } catch (updateError: any) {
      console.error("Firebase update error:", updateError)
      return NextResponse.json({ 
        error: "Failed to update marketplace in database",
        details: updateError.message 
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Error updating marketplace:", error)
    return NextResponse.json({ 
      error: "Failed to update marketplace",
      details: error.message 
    }, { status: 500 })
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