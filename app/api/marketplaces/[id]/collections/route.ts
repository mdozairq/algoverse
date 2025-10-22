import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { requireRole } from "@/lib/auth/middleware"

// GET /api/marketplaces/[id]/collections - Get collections for a marketplace
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const marketplaceId = params.id

    if (!marketplaceId) {
      return NextResponse.json({ error: "Marketplace ID is required" }, { status: 400 })
    }

    // Fetch collections for this marketplace
    const collections = await FirebaseService.getCollectionsByMarketplace(marketplaceId)

    // Convert date fields to strings
    const collectionsWithStringDates = collections.map(collection => ({
      ...collection,
      createdAt: collection.createdAt instanceof Date ? collection.createdAt.toISOString() : collection.createdAt,
      updatedAt: collection.updatedAt instanceof Date ? collection.updatedAt.toISOString() : collection.updatedAt
    }))

    return NextResponse.json({
      success: true,
      collections: collectionsWithStringDates,
      count: collections.length
    })
  } catch (error: any) {
    console.error("Error fetching collections:", error)
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 })
  }
}

// POST /api/marketplaces/[id]/collections - Create a new collection for a marketplace
export const POST = requireRole(["merchant"])(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const marketplaceId = params.id

    if (!marketplaceId) {
      return NextResponse.json({ error: "Marketplace ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const {
      name,
      description,
      price,
      currency,
      category,
      type,
      image,
      nftCount,
      isEnabled,
      allowSwap,
      userAddress,
      marketplaceId: requestMarketplaceId,
      merchantId
    } = body

    // Validate required fields
    if (!name || !description || !userAddress) {
      return NextResponse.json({ 
        error: "Name, description, and user address are required" 
      }, { status: 400 })
    }

    // Validate nftCount
    if (nftCount < 1) {
      return NextResponse.json({ 
        error: "Collection must have at least 1 NFT" 
      }, { status: 400 })
    }

    // Create the collection
    const collectionData = {
      name,
      description,
      price: price || 0,
      currency: currency || "ALGO",
      category: category || "nft",
      type: type || "nft",
      image: image || "/placeholder.jpg",
      nftCount: nftCount || 1,
      isEnabled: isEnabled !== false,
      allowSwap: allowSwap || false,
      marketplaceId,
      merchantId,
      creatorAddress: userAddress,
      createdAt: new Date(),
      views: 0,
      sales: 0,
      rating: 0,
      reviews: 0
    }

    const collectionId = await FirebaseService.createCollection(collectionData)

    return NextResponse.json({
      success: true,
      collectionId,
      message: "Collection created successfully"
    })
  } catch (error: any) {
    console.error("Error creating collection:", error)
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 })
  }
})
