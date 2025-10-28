import { NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { requireRole } from "@/lib/auth/middleware"

export const POST = requireRole(["user", "merchant"])(async (request: NextRequest) => {
  try {
    const auth = (request as any).auth
    const nftData = await request.json()

    // Validate required fields
    if (!nftData.name || !nftData.image) {
      return NextResponse.json({ error: "Name and Image are required" }, { status: 400 })
    }

    if (!nftData.userAddress) {
      return NextResponse.json({ error: "User address is required" }, { status: 400 })
    }

    if (!nftData.collectionId) {
      return NextResponse.json({ error: "Collection ID is required. NFTs must belong to a collection." }, { status: 400 })
    }

    // Create NFT in database
    const nftId = await FirebaseService.createNFT({
      eventId: nftData.collectionId || "",
      ownerId: nftData.userAddress,
      tokenId: `nft_${Date.now()}`,
      assetId: 0, // Will be set when minted on blockchain
      price: nftData.price || 0,
      collectionId: nftData.collectionId || "",
      creatorId: nftData.merchantId || "",
      creatorAddress: nftData.userAddress || "",
      marketplaceId: nftData.marketplaceId || "",
      status: "draft",
      metadata: {
        name: nftData.name,
        description: nftData.description || "",
        image: nftData.image,
        rarity: nftData.rarity || "common",
        category: nftData.category || "",
        traits: nftData.traits || [],
        royaltyFee: nftData.royaltyFee || 0,
        properties: nftData.properties || {},
      },
      isEnabled: true,
      allowSwap: false,
      maxSupply: nftData.maxSupply || 1,
      availableSupply: nftData.maxSupply || 1
    })

    return NextResponse.json({
      success: true,
      nftId,
      message: "NFT created successfully. Use the mint endpoint to mint on blockchain.",
      mintEndpoint: `/api/nfts/mint`
    })
  } catch (error: any) {
    console.error("Error creating NFT:", error)
    return NextResponse.json({ error: "Failed to create NFT" }, { status: 500 })
  }
})
