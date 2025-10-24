import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"

// GET /api/marketplaces/[id]/mint/nfts - Get draft NFTs for minting
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const marketplaceId = params.id
    const { searchParams } = new URL(request.url)
    const collectionId = searchParams.get('collectionId')

    if (!marketplaceId) {
      return NextResponse.json({ error: "Marketplace ID is required" }, { status: 400 })
    }

    let nfts = []

    if (collectionId) {
      // Get NFTs for specific collection
      nfts = await FirebaseService.getNFTsByCollection(collectionId)
    } else {
      // Get all NFTs for this marketplace
      nfts = await FirebaseService.getNFTsByMarketplace(marketplaceId)
    }

    // Filter only draft NFTs (ready for minting)
    const draftNFTs = nfts.filter(nft => nft.status === "draft")

    // Add minting specific fields to each NFT
    const mintingNFTs = draftNFTs.map(nft => {
      // Generate minting metadata
      const mintPrice = nft.price || 0
      const currency = "ALGO"
      const rarityScore = Math.floor(Math.random() * 10000) + 1

      // Generate traits for the NFT
      const traits = [
        { trait_type: "Background", value: "Blue", rarity: Math.floor(Math.random() * 10) + 1 },
        { trait_type: "Eyes", value: "Normal", rarity: Math.floor(Math.random() * 10) + 1 },
        { trait_type: "Hat", value: "None", rarity: Math.floor(Math.random() * 10) + 1 }
      ]

      return {
        ...nft,
        // Minting specific fields
        name: nft.metadata?.name || `NFT #${nft.tokenId}`,
        image: nft.metadata?.image || "/placeholder.jpg",
        mintPrice,
        currency,
        rarityScore,
        traits,
        isMintable: true,
        mintingStatus: "ready", // ready, minting, minted
        createdAt: nft.createdAt instanceof Date ? nft.createdAt.toISOString() : nft.createdAt
      }
    })

    return NextResponse.json({
      success: true,
      nfts: mintingNFTs,
      count: mintingNFTs.length
    })
  } catch (error: any) {
    console.error("Error fetching draft NFTs:", error)
    return NextResponse.json({ error: "Failed to fetch draft NFTs" }, { status: 500 })
  }
}
