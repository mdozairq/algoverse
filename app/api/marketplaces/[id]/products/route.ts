import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { requireRole } from "@/lib/auth/middleware"

// GET /api/marketplaces/[id]/products - Get marketplace products
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const marketplaceId = params.id

    if (!marketplaceId) {
      return NextResponse.json({ error: "Marketplace ID is required" }, { status: 400 })
    }

    // Get marketplace to verify it exists and is enabled
    const marketplace = await FirebaseService.getMarketplaceById(marketplaceId)
    if (!marketplace) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    if (!marketplace.isEnabled) {
      return NextResponse.json({ error: "Marketplace is disabled" }, { status: 403 })
    }

    // Get products for this marketplace
    const products = await FirebaseService.getNFTsByMarketplace(marketplaceId)

    // Filter only enabled products
    const enabledProducts = products.filter(product => product.isEnabled)

    // Transform products to include additional data and analytics
    const transformedProducts = enabledProducts.map(product => ({
      id: product.id,
      name: product.metadata?.name || `NFT #${product.assetId}`,
      description: product.metadata?.description || "Digital collectible",
      price: product.price || 0,
      currency: "ETH", // Changed to ETH for consistency with Magic Eden style
      image: product.metadata?.image || "/placeholder.jpg",
      category: product.metadata?.category || "nft",
      type: "nft" as const,
      inStock: true,
      rating: 4.5,
      reviews: Math.floor(Math.random() * 50) + 10,
      isEnabled: product.isEnabled,
      allowSwap: product.allowSwap,
      nftData: {
        assetId: product.assetId,
        totalSupply: product.metadata?.totalSupply || 1,
        availableSupply: product.metadata?.availableSupply || 1,
        royaltyPercentage: product.metadata?.royaltyPercentage || 0
      },
      // Add analytics data
      floorPrice: (product.price || 0) + (Math.random() - 0.5) * (product.price || 0) * 0.2,
      volume: Math.random() * 1000,
      sales: Math.floor(Math.random() * 100),
      listed: Math.floor(Math.random() * 20),
      floorChange: (Math.random() - 0.5) * 20,
      topOffer: Math.random() > 0.5 ? (product.price || 0) * (0.8 + Math.random() * 0.4) : undefined,
      lastSale: {
        price: (product.price || 0) * (0.9 + Math.random() * 0.2),
        currency: "ETH",
        date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    }))

    return NextResponse.json({
      products: transformedProducts,
      total: transformedProducts.length
    })
  } catch (error: any) {
    console.error("Error fetching marketplace products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

// POST /api/marketplaces/[id]/products - Add product to marketplace
export const POST = requireRole(["merchant"])(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const auth = (request as any).auth
    const marketplaceId = params.id
    const productData = await request.json()

    if (!marketplaceId) {
      return NextResponse.json({ error: "Marketplace ID is required" }, { status: 400 })
    }

    // Get marketplace to verify ownership
    const marketplace = await FirebaseService.getMarketplaceById(marketplaceId)
    if (!marketplace) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    // Check permissions
    if (marketplace.merchantId !== auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Validate required fields
    if (!productData.name || !productData.description || !productData.price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create NFT product
    const nftData = {
      eventId: "", // Will be set when creating from event
      ownerId: auth.userId,
      tokenId: `nft_${Date.now()}`,
      assetId: Math.floor(Math.random() * 1000000),
      creatorId: auth.userId,
      price: productData.price,
      metadata: {
        name: productData.name,
        description: productData.description,
        image: productData.image || "/placeholder.jpg",
        category: productData.category || "nft",
        type: productData.type || "nft",
        totalSupply: productData.totalSupply || 1,
        availableSupply: productData.availableSupply || 1,
        royaltyPercentage: productData.royaltyPercentage || 0
      },
      marketplaceId: marketplaceId,
      isEnabled: productData.isEnabled !== false,
      allowSwap: productData.allowSwap !== false,
      listedForSale: true
    }

    const productId = await FirebaseService.createNFT(nftData)

    return NextResponse.json({
      success: true,
      productId,
      message: "Product added successfully"
    })
  } catch (error: any) {
    console.error("Error adding product:", error)
    return NextResponse.json({ error: "Failed to add product" }, { status: 500 })
  }
})