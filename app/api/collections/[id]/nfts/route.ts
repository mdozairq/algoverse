import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"

// GET /api/collections/[id]/nfts - Get NFTs in a collection
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const collectionId = params.id

    if (!collectionId) {
      return NextResponse.json({ error: "Collection ID is required" }, { status: 400 })
    }

    // Fetch NFTs in this collection
    const nfts = await FirebaseService.getNFTsByCollection(collectionId)

    return NextResponse.json({
      success: true,
      nfts,
      count: nfts.length
    })
  } catch (error: any) {
    console.error("Error fetching collection NFTs:", error)
    return NextResponse.json({ error: "Failed to fetch collection NFTs" }, { status: 500 })
  }
}
