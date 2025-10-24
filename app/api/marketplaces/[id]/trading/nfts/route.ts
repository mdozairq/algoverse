import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"

// GET /api/marketplaces/[id]/trading/nfts - Get trading NFTs (minted with assetId)
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

    // Filter only minted NFTs with assetId
    const mintedNFTs = nfts.filter(nft => 
      nft.status === "minted" && nft.assetId
    )

    // Add trading specific fields to each NFT
    const tradingNFTs = mintedNFTs.map(nft => {
      // Calculate rarity score (mock implementation)
      const rarityScore = Math.floor(Math.random() * 10000) + 1

      // Generate traits (mock implementation)
      const traits = [
        { trait_type: "Background", value: "Blue", rarity: Math.floor(Math.random() * 10) + 1 },
        { trait_type: "Eyes", value: "Normal", rarity: Math.floor(Math.random() * 10) + 1 },
        { trait_type: "Hat", value: "None", rarity: Math.floor(Math.random() * 10) + 1 }
      ]

      // Calculate floor price for the collection
      const floorPrice = nft.price || 0

      return {
        ...nft,
        // Trading specific fields
        name: nft.metadata?.name || `NFT #${nft.tokenId}`,
        image: nft.metadata?.image || "/placeholder.jpg",
        price: nft.price || 0,
        currency: "ALGO",
        floorPrice,
        topOffer: floorPrice * 0.95, // 5% below floor
        rarityScore,
        traits,
        owner: nft.ownerId,
        listed: nft.listedForSale || false,
        lastSale: nft.price ? {
          price: nft.price,
          currency: "ALGO",
          date: nft.createdAt
        } : null,
        createdAt: nft.createdAt instanceof Date ? nft.createdAt.toISOString() : nft.createdAt
      }
    })

    return NextResponse.json({
      success: true,
      nfts: tradingNFTs,
      count: tradingNFTs.length
    })
  } catch (error: any) {
    console.error("Error fetching trading NFTs:", error)
    return NextResponse.json({ error: "Failed to fetch trading NFTs" }, { status: 500 })
  }
}
