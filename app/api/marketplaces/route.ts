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

    // Validate template exists
    const template = await FirebaseService.getMarketplaceTemplatesByCategory(marketplaceData.template)
    if (!template) {
      return NextResponse.json({ error: "Invalid template" }, { status: 400 })
    }

    console.log("template", template);
 
    // Create marketplace with template configuration
    const marketplacePayload = {
      ...marketplaceData,
      merchantId: merchant.id!,
      walletAddress: merchant.walletAddress || "",
      status: marketplaceData.status || "pending", // Allow draft creation
      isEnabled: true, // Default to enabled
      allowSwap: true, // Default to allowing swaps
      // Apply template's default colors if not provided
      primaryColor: marketplaceData.primaryColor || template.configuration.theme.primaryColor,
      secondaryColor: marketplaceData.secondaryColor || template.configuration.theme.secondaryColor,
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
