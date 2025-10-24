import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"

// GET /api/marketplaces/[id]/mint/collections - Get collections where allowMint is true
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const marketplaceId = params.id

    if (!marketplaceId) {
      return NextResponse.json({ error: "Marketplace ID is required" }, { status: 400 })
    }

    // Fetch collections for this marketplace where allowMint is true
    const collections = await FirebaseService.getCollectionsByMarketplace(marketplaceId)
    
    // Filter collections where allowMint is true (mintable collections)
    const mintableCollections = collections.filter(collection => 
      collection.allowMint === true
    )

    // Add minting metrics to each collection
    const collectionsWithMintingData = await Promise.all(
      mintableCollections.map(async (collection) => {
        // Get draft NFTs for this collection
        const nfts = await FirebaseService.getNFTsByCollection(collection.id)
        const draftNFTs = nfts.filter(nft => nft.status === "draft")
        
        // Calculate minting metrics
        const totalSupply = draftNFTs.length
        const mintedCount = nfts.filter(nft => nft.status === "minted").length
        const availableSupply = totalSupply - mintedCount
        const mintPrice = collection.price || 0
        const currency = collection.currency || "ALGO"

        // Calculate minting progress
        const mintingProgress = totalSupply > 0 ? (mintedCount / totalSupply) * 100 : 0

        return {
          ...collection,
          // Minting specific fields
          totalSupply,
          mintedCount,
          availableSupply,
          mintPrice,
          currency,
          mintingProgress,
          draftNFTs: draftNFTs.length,
          isActive: true, // All mintable collections are active
          mintingConfig: {
            startDate: collection.createdAt,
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from creation
            maxPerWallet: 10, // Default max per wallet
            whitelistRequired: false
          },
          createdAt: collection.createdAt instanceof Date ? collection.createdAt.toISOString() : collection.createdAt,
          updatedAt: collection.updatedAt instanceof Date ? collection.updatedAt.toISOString() : collection.updatedAt
        }
      })
    )

    return NextResponse.json({
      success: true,
      collections: collectionsWithMintingData,
      count: collectionsWithMintingData.length
    })
  } catch (error: any) {
    console.error("Error fetching mintable collections:", error)
    return NextResponse.json({ error: "Failed to fetch mintable collections" }, { status: 500 })
  }
}
