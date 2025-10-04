import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { requireRole } from "@/lib/auth/middleware"

// GET /api/marketplaces/[id]/products - Get products for a specific marketplace
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if marketplace exists
    const marketplace = await FirebaseService.getMarketplaceById(params.id)
    if (!marketplace) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    // Get NFTs associated with this marketplace
    const nfts = await FirebaseService.getNFTsByMarketplace(params.id)
    
    // Get events associated with this marketplace
    const events = await FirebaseService.getEventsByMerchant(marketplace.merchantId)

    // Transform data to Product interface
    const products = [
      ...nfts.map(nft => ({
        id: nft.id,
        name: nft.metadata.name || "Unnamed NFT",
        description: nft.metadata.description || "",
        price: nft.price || 0,
        currency: "ALGO",
        image: nft.metadata.image || "/placeholder.jpg",
        category: nft.metadata.category || "nft",
        type: "nft" as const,
        inStock: !nft.isUsed,
        isEnabled: nft.isEnabled ?? true,
        allowSwap: nft.allowSwap ?? true,
        marketplaceId: params.id,
        createdAt: nft.createdAt
      })),
      ...events.map(event => ({
        id: event.id,
        name: event.title,
        description: event.description,
        price: event.price,
        currency: "ALGO",
        image: event.imageUrl || "/placeholder.jpg",
        category: event.category || "event",
        type: "event" as const,
        inStock: event.availableSupply > 0,
        isEnabled: true, // Events don't have individual enable/disable
        allowSwap: false, // Events typically don't support swaps
        marketplaceId: params.id,
        createdAt: event.createdAt
      }))
    ]

    return NextResponse.json({
      success: true,
      products: products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    })
  } catch (error: any) {
    console.error("Error fetching marketplace products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}