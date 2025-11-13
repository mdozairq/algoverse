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
    // Note: Using Record<string, any> to allow additional fields not in Collection interface
    // (symbol, metadataUrl, artType, chain, mintPrice, etc. are stored but not in the base interface)
    const collectionId = await FirebaseService.createCollection({
      name: collectionData.name,
      description: collectionData.description || "",
      image: collectionData.image || "",
      category: collectionData.category || "nft",
      type: (collectionData.type || "nft") as "nft" | "event" | "merchandise",
      currency: collectionData.currency || "ALGO",
      marketplaceId: collectionData.marketplaceId,
      merchantId: collectionData.merchantId,
      isEnabled: collectionData.isEnabled !== false,
      allowSwap: collectionData.allowSwap || false,
      nftCount: collectionData.nftCount || 1,
      maxSupply: collectionData.maxSupply || 1000,
      royaltyPercentage: collectionData.royaltyFee || 0,
      mediaCategory: collectionData.mediaCategory || "any",
      // Additional fields stored in Firestore but not in Collection interface
      symbol: collectionData.symbol,
      metadataUrl: collectionData.metadataUrl || "",
      artType: collectionData.artType || "unique",
      chain: collectionData.chain || "algorand",
      mintPrice: collectionData.mintPrice || 0,
      royaltyFee: collectionData.royaltyFee || 0,
      mintLimit: collectionData.mintLimit || 1,
      mintStartDate: collectionData.mintStartDate ? new Date(collectionData.mintStartDate) : new Date(),
      mintStages: collectionData.mintStages || [],
      creatorAddress: collectionData.userAddress,
      nftImages: collectionData.nftImages || [],
      status: "draft",
      source: collectionData.source || "merchant",
      createdAt: new Date(),
      updatedAt: new Date()
    } as any)

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
