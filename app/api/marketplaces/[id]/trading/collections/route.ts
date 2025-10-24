import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"

// GET /api/marketplaces/[id]/trading/collections - Get trading collections (allowMint: false)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const marketplaceId = params.id

    if (!marketplaceId) {
      return NextResponse.json({ error: "Marketplace ID is required" }, { status: 400 })
    }

    // Fetch collections for this marketplace where allowMint is false
    const collections = await FirebaseService.getCollectionsByMarketplace(marketplaceId)
    
    // Filter collections where allowMint is false (trading collections)
    const tradingCollections = collections.filter(collection => 
      collection.allowMint === false || collection.allowMint === undefined
    )

    // Add trading metrics to each collection
    const collectionsWithMetrics = await Promise.all(
      tradingCollections.map(async (collection) => {
        // Get NFTs for this collection
        const nfts = await FirebaseService.getNFTsByCollection(collection.id)
        
        // Filter only minted NFTs with assetId
        const mintedNFTs = nfts.filter(nft => 
          nft.status === "minted" && nft.assetId
        )

        // Calculate trading metrics
        const floorPrice = mintedNFTs.length > 0 
          ? Math.min(...mintedNFTs.map(nft => nft.price || 0).filter(price => price > 0))
          : 0

        const totalVolume = mintedNFTs.reduce((sum, nft) => sum + (nft.price || 0), 0)
        const marketCap = mintedNFTs.length * floorPrice
        const listedCount = mintedNFTs.filter(nft => nft.listedForSale).length
        const ownersCount = new Set(mintedNFTs.map(nft => nft.ownerId)).size

        // Calculate 1-day changes (mock data for now - in real implementation, you'd query historical data)
        const floorChange1d = Math.random() * 20 - 10 // -10% to +10%
        const volume1d = totalVolume * (0.1 + Math.random() * 0.3) // 10-40% of total volume
        const volumeChange1d = Math.random() * 40 - 20 // -20% to +20%
        const sales1d = Math.floor(Math.random() * 50) + 5 // 5-55 sales

        return {
          ...collection,
          // Trading specific fields
          floorPrice,
          totalVolume,
          marketCap,
          topOffer: floorPrice * 1.1, // 10% above floor
          floorChange1d,
          volume1d,
          volumeChange1d,
          sales1d,
          listed: listedCount,
          listedPercentage: mintedNFTs.length > 0 ? (listedCount / mintedNFTs.length) * 100 : 0,
          owners: ownersCount,
          ownersPercentage: mintedNFTs.length > 0 ? (ownersCount / mintedNFTs.length) * 100 : 0,
          verified: true, // You can add verification logic here
          chain: "Algorand",
          category: collection.category || "Art",
          createdAt: collection.createdAt instanceof Date ? collection.createdAt.toISOString() : collection.createdAt,
          updatedAt: collection.updatedAt instanceof Date ? collection.updatedAt.toISOString() : collection.updatedAt
        }
      })
    )

    return NextResponse.json({
      success: true,
      collections: collectionsWithMetrics,
      count: collectionsWithMetrics.length
    })
  } catch (error: any) {
    console.error("Error fetching trading collections:", error)
    return NextResponse.json({ error: "Failed to fetch trading collections" }, { status: 500 })
  }
}
