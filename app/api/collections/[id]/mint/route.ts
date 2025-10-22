import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { requireRole } from "@/lib/auth/middleware"

// POST /api/collections/[id]/mint - Mint NFT from collection
export const POST = requireRole(["merchant", "user"])(async (request: NextRequest) => {
  try {
    const collectionId = request.url.split('/')[5] // Extract collection ID from URL
    const { userAddress, quantity } = await request.json()

    if (!userAddress) {
      return NextResponse.json({ error: "User address is required" }, { status: 400 })
    }

    if (!quantity || quantity < 1) {
      return NextResponse.json({ error: "Quantity must be at least 1" }, { status: 400 })
    }

    // Get collection details
    const collection = await FirebaseService.getCollectionById(collectionId)
    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    // Check if collection is published
    if (collection.status !== 'published') {
      return NextResponse.json({ error: "Collection is not published" }, { status: 400 })
    }

    // Check mint limit
    const userMints = await FirebaseService.getUserMintsInCollection(collectionId, userAddress)
    if (userMints.length + quantity > (collection.mintLimit || 1)) {
      return NextResponse.json({ 
        error: `Mint limit exceeded. You can only mint ${collection.mintLimit || 1} NFTs from this collection` 
      }, { status: 400 })
    }

    // Check if minting has started
    const now = new Date()
    const mintStartDate = new Date(collection.mintStartDate)
    if (now < mintStartDate) {
      return NextResponse.json({ 
        error: `Minting starts on ${mintStartDate}` 
      }, { status: 400 })
    }

    // Create NFTs
    const mintedNFTs = []
    for (let i = 0; i < quantity; i++) {
      const nftId = await FirebaseService.createNFT({
        eventId: collectionId,
        metadata: {
          name: `${collection.name} #${userMints.length + i + 1}`,
          description: collection.description,
          image: collection.image,
          attributes: [
            { trait_type: "Collection", value: collection.name },
            { trait_type: "Token ID", value: userMints.length + i + 1 }
          ]
        },
        ownerId: userAddress,
        tokenId: (userMints.length + i + 1).toString(),
        assetId: 0, // Will be set when minted on blockchain
        isEnabled: true,
        allowSwap: false
      })
      
      mintedNFTs.push(nftId)
    }

    return NextResponse.json({
      success: true,
      nftIds: mintedNFTs,
      message: `Successfully minted ${quantity} NFT(s) from ${collection.name}`,
    })
  } catch (error: any) {
    console.error("Error minting NFT:", error)
    return NextResponse.json({ error: "Failed to mint NFT" }, { status: 500 })
  }
})
