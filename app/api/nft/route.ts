import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"

export const dynamic = 'force-dynamic'

// GET /api/nft - Get NFTs with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get("ownerId")
    const eventId = searchParams.get("eventId")
    const forSale = searchParams.get("forSale")

    let nfts = []

    if (ownerId) {
      // Get NFTs owned by specific user
      nfts = await FirebaseService.getNFTsByOwner(ownerId)
    } else if (eventId) {
      // Get NFTs for specific event
      nfts = await FirebaseService.getNFTsByEvent(eventId)
    } else if (forSale === "true") {
      // Get NFTs listed for sale
      nfts = await FirebaseService.getNFTsForSale()
    } else {
      // Get all NFTs - implement pagination as needed
      nfts = await FirebaseService.getAllNFTs()
    }

    // Convert date fields to strings
    const nftsWithStringDates = nfts.map(nft => ({
      ...nft,
      createdAt: nft.createdAt instanceof Date ? nft.createdAt.toISOString() : nft.createdAt,
      updatedAt: nft.updatedAt instanceof Date ? nft.updatedAt.toISOString() : nft.updatedAt
    }))

    return NextResponse.json({ nfts: nftsWithStringDates })
  } catch (error: any) {
    console.error("Error fetching NFTs:", error)
    return NextResponse.json({ error: "Failed to fetch NFTs" }, { status: 500 })
  }
}
