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

    // Get merchant info - try to use merchantId from request body first, then fall back to UID
    let merchant = null
    if (marketplaceData.merchantId) {
      merchant = await FirebaseService.getMerchantById(marketplaceData.merchantId)
    }
    
    if (!merchant) {
      merchant = await FirebaseService.getMerchantByUid(auth.uid)
    }
    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 })
    }

    // Validate required fields
    if (!marketplaceData.businessName || !marketplaceData.description || !marketplaceData.category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create marketplace
    const marketplacePayload = {
      ...marketplaceData,
      merchantId: merchant.id!,
      status: "pending", // All new marketplaces start as pending
    }
    const marketplaceId = await FirebaseService.createMarketplace(marketplacePayload)

    return NextResponse.json({
      success: true,
      marketplaceId,
      message: "Marketplace created successfully and submitted for approval",
    })
  } catch (error: any) {
    console.error("Error creating marketplace:", error)
    return NextResponse.json({ error: "Failed to create marketplace" }, { status: 500 })
  }
})
