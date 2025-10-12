import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"

// GET /api/marketplaces/[id]/collections - Get collections for a marketplace
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const marketplaceId = params.id

    if (!marketplaceId) {
      return NextResponse.json({ error: "Marketplace ID is required" }, { status: 400 })
    }

    // Fetch collections for this marketplace
    const collections = await FirebaseService.getCollectionsByMarketplace(marketplaceId)

    return NextResponse.json({
      success: true,
      collections,
      count: collections.length
    })
  } catch (error: any) {
    console.error("Error fetching collections:", error)
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 })
  }
}
