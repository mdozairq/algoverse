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
      name: nftData.name,
      description: nftData.description || "",
      image: nftData.image,
      ownerAddress: nftData.userAddress,
      collectionId: nftData.collectionId || null,
      assetId: 0, // Will be set when minted on blockchain
      price: nftData.price || 0,
      currency: nftData.currency || "ALGO",
      rarity: nftData.rarity || "common",
      category: nftData.category || "",
      properties: nftData.properties || {},
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      nftId,
      message: "NFT created successfully",
    })
  } catch (error: any) {
    console.error("Error creating NFT:", error)
    return NextResponse.json({ error: "Failed to create NFT" }, { status: 500 })
  }
})
