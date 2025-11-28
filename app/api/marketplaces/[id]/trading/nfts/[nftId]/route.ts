// GET /api/marketplaces/[id]/trading/nfts/[nftId] - Get NFT details for trading
import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { adminDb } from "@/lib/firebase/admin"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; nftId: string } }
) {
  try {
    const marketplaceId = params.id
    const nftId = params.nftId

    if (!marketplaceId || !nftId) {
      return NextResponse.json(
        { error: "Marketplace ID and NFT ID are required" },
        { status: 400 }
      )
    }

    // Get NFT details
    const nft = await FirebaseService.getNFTById(nftId)
    if (!nft) {
      return NextResponse.json({ error: "NFT not found" }, { status: 404 })
    }

    // Verify NFT is minted
    if (!nft.assetId || nft.status !== "minted") {
      return NextResponse.json(
        { error: "NFT not yet minted" },
        { status: 400 }
      )
    }

    // Get active listings for this NFT
    const ordersSnapshot = await adminDb
      .collection("trading_orders")
      .where("marketplaceId", "==", marketplaceId)
      .where("nftId", "==", nftId)
      .where("status", "==", "active")
      .orderBy("price", "asc")
      .get()

    const activeListings = ordersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Get trade history for this NFT
    const tradesSnapshot = await adminDb
      .collection("nft_trades")
      .where("nftId", "==", nftId)
      .where("status", "==", "completed")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get()

    const tradeHistory = tradesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
    }))

    // Calculate price statistics
    const prices = tradeHistory.map((trade: any) => trade.price || 0).filter((p: number) => p > 0)
    const floorPrice = activeListings.length > 0 
      ? Math.min(...activeListings.map((l: any) => l.price || 0))
      : prices.length > 0 ? Math.min(...prices) : 0
    const lastSale = tradeHistory[0] || null
    const totalVolume = prices.reduce((sum: number, p: number) => sum + p, 0)
    const averagePrice = prices.length > 0 ? totalVolume / prices.length : 0

    // Format NFT data
    const nftData = {
      ...nft,
      name: nft.metadata?.name || `NFT #${nft.tokenId}`,
      image: nft.metadata?.image || "/placeholder.jpg",
      description: nft.metadata?.description || nft.description || "",
      price: nft.price || 0,
      currency: "ALGO",
      owner: nft.ownerAddress || nft.ownerId,
      listed: nft.listedForSale || false,
      createdAt: nft.createdAt instanceof Date ? nft.createdAt.toISOString() : nft.createdAt,
      updatedAt: nft.updatedAt instanceof Date ? nft.updatedAt.toISOString() : nft.updatedAt,
    }

    return NextResponse.json({
      success: true,
      nft: nftData,
      activeListings,
      tradeHistory,
      statistics: {
        floorPrice,
        lastSalePrice: lastSale?.price || 0,
        totalVolume,
        averagePrice,
        totalSales: tradeHistory.length,
        activeListingsCount: activeListings.length,
      },
    })
  } catch (error: any) {
    console.error("Error fetching NFT trading details:", error)
    return NextResponse.json(
      { error: "Failed to fetch NFT trading details" },
      { status: 500 }
    )
  }
}

