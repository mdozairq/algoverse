import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { requireRole } from "@/lib/auth/middleware"

// GET /api/marketplaces/[id]/configuration - Get marketplace configuration
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const marketplace = await FirebaseService.getMarketplaceById(params.id)
    
    if (!marketplace) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    return NextResponse.json({
      configuration: marketplace.configuration || {
        mintingConfig: {
          enabled: true,
          autoApprove: false,
          requireKYC: false,
          maxSupply: 1000,
          defaultPrice: 1,
          currency: 'ALGO'
        },
        tradingConfig: {
          auctionEnabled: true,
          flashSaleEnabled: true,
          auctionDuration: 24,
          flashSaleDuration: 1,
          minBidIncrement: 0.1,
          reservePrice: true
        },
        swapConfig: {
          enabled: true,
          allowPartialSwaps: false,
          requireApproval: true,
          maxSwapValue: 1000
        },
        nftConfig: {
          transferable: true,
          burnable: true,
          pausable: true,
          royaltyPercentage: 2.5
        },
        addressConfig: {
          managerAddress: '',
          reserveAddress: '',
          freezeAddress: '',
          clawbackAddress: ''
        }
      }
    })
  } catch (error: any) {
    console.error("Error fetching marketplace configuration:", error)
    return NextResponse.json({ error: "Failed to fetch configuration" }, { status: 500 })
  }
}

// PUT /api/marketplaces/[id]/configuration - Update marketplace configuration
export const PUT = requireRole(["merchant"])(async (request: NextRequest) => {
  try {
    const auth = (request as any).auth
    const configuration = await request.json()
    
    // Extract ID from URL path
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const marketplaceId = pathParts[pathParts.length - 2] // configuration is the last part, so id is second to last

    // Get marketplace to verify ownership
    const marketplace = await FirebaseService.getMarketplaceById(marketplaceId)
    if (!marketplace) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    // Get merchant to verify ownership
    const merchant = await FirebaseService.getMerchantByUid(auth.uid)
    if (!merchant || merchant.id !== marketplace.merchantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Validate configuration
    if (!configuration.mintingConfig || !configuration.tradingConfig || 
        !configuration.swapConfig || !configuration.nftConfig || !configuration.addressConfig) {
      return NextResponse.json({ error: "Invalid configuration structure" }, { status: 400 })
    }

    // Update marketplace configuration
    await FirebaseService.updateMarketplace(marketplaceId, {
      configuration,
      updatedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      message: "Configuration updated successfully"
    })
  } catch (error: any) {
    console.error("Error updating marketplace configuration:", error)
    return NextResponse.json({ error: "Failed to update configuration" }, { status: 500 })
  }
})
