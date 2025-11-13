import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { requireRole } from "@/lib/auth/middleware"

// POST /api/marketplaces/create-collection - Create new NFT collection
export const POST = requireRole(["merchant", "user"])(async (request: NextRequest) => {
  try {
    const auth = (request as any).auth
    const collectionData = await request.json()

    // Validate required fields
    if (!collectionData.name || !collectionData.symbol) {
      return NextResponse.json({ error: "Name and Symbol are required" }, { status: 400 })
    }

    if (!collectionData.userAddress) {
      return NextResponse.json({ error: "User address is required" }, { status: 400 })
    }

    // Create collection in database
    const collectionId = await FirebaseService.createCollection({
      name: collectionData.name,
      symbol: collectionData.symbol,
      description: collectionData.description || "",
      image: collectionData.image || "",
      metadataUrl: collectionData.metadataUrl || "",
      artType: collectionData.artType || "unique",
      chain: collectionData.chain || "algorand",
      mintPrice: collectionData.mintPrice || 0,
      royaltyFee: collectionData.royaltyFee || 0,
      maxSupply: collectionData.maxSupply || 1000,
      mintLimit: collectionData.mintLimit || 1,
      mintStartDate: collectionData.mintStartDate ? new Date(collectionData.mintStartDate) : new Date(),
      mintStages: collectionData.mintStages || [],
      creatorAddress: collectionData.userAddress,
      marketplaceId: collectionData.marketplaceId,
      merchantId: collectionData.merchantId,
      nftImages: collectionData.nftImages || [],
      status: "draft",
      source: collectionData.source || "merchant",
      isEnabled: collectionData.isEnabled || true,
      mediaCategory: collectionData.mediaCategory || "any", // Default to "any" for existing collections
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      collectionId,
      message: "Collection created successfully",
    })
  } catch (error: any) {
    console.error("Error creating collection:", error)
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 })
  }
})
