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

    // Helper function to remove undefined values from objects
    const removeUndefined = (obj: any): any => {
      if (obj === null || obj === undefined) {
        return undefined
      }
      if (Array.isArray(obj)) {
        return obj.map(removeUndefined).filter(item => item !== undefined)
      }
      if (typeof obj === 'object') {
        const cleaned: any = {}
        for (const [key, value] of Object.entries(obj)) {
          const cleanedValue = removeUndefined(value)
          if (cleanedValue !== undefined) {
            cleaned[key] = cleanedValue
          }
        }
        return Object.keys(cleaned).length > 0 ? cleaned : undefined
      }
      return obj
    }

    // Build properties object, only including defined values
    const properties: any = {
      ...(nftData.properties || {}),
      mediaCategory: nftData.category || "any",
    }

    // Only add fileType if it exists
    if (nftData.fileType) {
      properties.fileType = nftData.fileType
    }

    // Only add category-specific metadata if it exists and has values
    if (nftData.audioMetadata) {
      const cleanedAudio = removeUndefined(nftData.audioMetadata)
      if (cleanedAudio && Object.keys(cleanedAudio).length > 0) {
        properties.audioMetadata = cleanedAudio
      }
    }

    if (nftData.videoMetadata) {
      const cleanedVideo = removeUndefined(nftData.videoMetadata)
      if (cleanedVideo && Object.keys(cleanedVideo).length > 0) {
        properties.videoMetadata = cleanedVideo
      }
    }

    if (nftData.imageMetadata) {
      const cleanedImage = removeUndefined(nftData.imageMetadata)
      if (cleanedImage && Object.keys(cleanedImage).length > 0) {
        properties.imageMetadata = cleanedImage
      }
    }

    if (nftData.fileMetadata) {
      const cleanedFile = removeUndefined(nftData.fileMetadata)
      if (cleanedFile && Object.keys(cleanedFile).length > 0) {
        properties.fileMetadata = cleanedFile
      }
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
        properties: removeUndefined(properties) || {},
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
