import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { requireRole } from "@/lib/auth/middleware"

// GET /api/marketplaces - Get marketplaces with filtering and merchant details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const merchantId = searchParams.get("merchantId")

    let marketplaces = []

    if (merchantId) {
      marketplaces = await FirebaseService.getMarketplacesByMerchant(merchantId)
    } else if (status === "pending") {
      marketplaces = await FirebaseService.getPendingMarketplaces()
    } else if (status === "approved") {
      marketplaces = await FirebaseService.getApprovedMarketplaces()
    } else {
      marketplaces = await FirebaseService.getAllMarketplaces()
    }

    // Join marketplace data with merchant information
    const marketplacesWithMerchants = await Promise.all(
      marketplaces.map(async (marketplace) => {
        try {
          // Fetch merchant details if merchantId exists
          if (marketplace.merchantId) {
            const merchant = await FirebaseService.getMerchantById(marketplace.merchantId)
            if (merchant) {
              return {
                ...marketplace,
                merchantName: merchant.businessName,
                merchantEmail: merchant.email,
                merchantId: marketplace.merchantId,
              }
            }
          }
          
          // Return marketplace without merchant details if merchant not found
          return {
            ...marketplace,
            merchantName: 'Unknown Merchant',
            merchantEmail: null,
            merchantId: marketplace.merchantId || null,
          }
        } catch (error) {
          console.error(`Error fetching merchant for marketplace ${marketplace.id}:`, error)
          return {
            ...marketplace,
            merchantName: 'Unknown Merchant',
            merchantEmail: null,
            merchantId: marketplace.merchantId || null,
          }
        }
      })
    )

    return NextResponse.json({ marketplaces: marketplacesWithMerchants })
  } catch (error: any) {
    console.error("Error fetching marketplaces:", error)
    return NextResponse.json({ error: "Failed to fetch marketplaces" }, { status: 500 })
  }
}

// POST /api/marketplaces - Create new marketplace (merchants only)
export const POST = requireRole(["merchant"])(async (request: NextRequest) => {
  try {
    const auth = (request as any).auth
    const marketplaceData = await request.json()

    let merchant = null
    if (auth.userId) {
      merchant = await FirebaseService.getMerchantById(auth.userId)
    }
    
    if (!merchant) {
       merchant = await FirebaseService.getMerchantById(marketplaceData.merchantId)
    }
    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 })
    }

    // Validate required fields
    if (!marketplaceData.businessName || !marketplaceData.description || !marketplaceData.category || !marketplaceData.template) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get all templates first to see what's available
    const allTemplates = await FirebaseService.getAllMarketplaceTemplates()
    console.log("All available templates:", allTemplates.map(t => ({ id: t.id, name: t.name, category: t.category, isActive: t.isActive })))
    console.log("Requested template:", marketplaceData.template)
    
    // Validate template exists - try by ID first, then by name/category
    let template = null
    
    // First try to get template by ID
    if (marketplaceData.template) {
      template = await FirebaseService.getMarketplaceTemplateById(marketplaceData.template)
      console.log("Template found by ID:", template)
    }
    
    // If not found by ID, try by category
    if (!template) {
      const templates = await FirebaseService.getMarketplaceTemplatesByCategory(marketplaceData.template)
      console.log("Templates found by category:", templates)
      if (templates && templates.length > 0) {
        template = templates[0]
      }
    }
    
    // If still not found, try to find by name (case insensitive)
    if (!template) {
      const matchingTemplate = allTemplates.find(t => 
        t.name.toLowerCase() === marketplaceData.template.toLowerCase() ||
        t.id.toLowerCase() === marketplaceData.template.toLowerCase()
      )
      if (matchingTemplate) {
        template = matchingTemplate
        console.log("Template found by name match:", template)
      }
    }
    
    if (!template) {
      return NextResponse.json({ 
        error: `Invalid template: ${marketplaceData.template}. Available templates: ${allTemplates.map(t => `${t.name} (${t.id})`).join(', ')}` 
      }, { status: 400 })
    }

    console.log("template", template);
 
    // Create marketplace with template configuration
    const marketplacePayload = {
      ...marketplaceData,
      merchantId: merchant.id!,
      walletAddress: merchant.walletAddress || "",
      status: marketplaceData.status || "pending", // Allow draft creation
      isEnabled: true, // Default to enabled
      allowSwap: false, // Default to allowing swaps
      allowMint: false, // Default to disabled
      allowTrading: false, // Default to disabled
      // Apply selected colors or template defaults
      colors: {
        primary: marketplaceData.primaryColor || marketplaceData.colors?.primary || template.configuration?.theme?.primaryColor || (template as any).colors?.primary || '#3B82F6',
        secondary: marketplaceData.secondaryColor || marketplaceData.colors?.secondary || template.configuration?.theme?.secondaryColor || (template as any).colors?.secondary || '#1E40AF',
        accent: marketplaceData.accentColor || marketplaceData.colors?.accent || template.configuration?.theme?.accentColor || (template as any).colors?.accent || '#F59E0B',
        background: marketplaceData.backgroundColor || marketplaceData.colors?.background || template.configuration?.theme?.backgroundColor || (template as any).colors?.background || '#FFFFFF',
        text: marketplaceData.textColor || marketplaceData.colors?.text || template.configuration?.theme?.textColor || (template as any).colors?.text || '#1F2937',
        // Additional color options
        success: marketplaceData.colors?.success || (template as any).colors?.success || '#10B981',
        warning: marketplaceData.colors?.warning || (template as any).colors?.warning || '#F59E0B',
        error: marketplaceData.colors?.error || (template as any).colors?.error || '#EF4444',
        info: marketplaceData.colors?.info || (template as any).colors?.info || '#3B82F6'
      },
      // Store template reference
      templateId: template.id,
      templateName: template.name,
      templateCategory: template.category
    }
    const marketplaceId = await FirebaseService.createMarketplace(marketplacePayload)

    return NextResponse.json({
      success: true,
      marketplaceId,
      message: marketplaceData.status === "draft" 
        ? "Marketplace draft saved successfully" 
        : "Marketplace created successfully and submitted for approval",
    })
  } catch (error: any) {
    console.error("Error creating marketplace:", error)
    return NextResponse.json({ error: "Failed to create marketplace" }, { status: 500 })
  }
})
