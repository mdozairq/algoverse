import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { requireRole } from "@/lib/auth/middleware"

// GET /api/marketplaces/[id] - Get single marketplace
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const marketplaceId = params.id

    if (!marketplaceId) {
      return NextResponse.json({ error: "Marketplace ID is required" }, { status: 400 })
    }

    const marketplace = await FirebaseService.getMarketplaceById(marketplaceId)
    if (!marketplace) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    return NextResponse.json({ marketplace })
  } catch (error: any) {
    console.error("Error fetching marketplace:", error)
    return NextResponse.json({ error: "Failed to fetch marketplace" }, { status: 500 })
  }
}

// PUT /api/marketplaces/[id] - Update marketplace
export const PUT = requireRole(["merchant", "admin"])(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const marketplaceData = await request.json()
    const marketplaceId = params.id

    if (!marketplaceId) {
      return NextResponse.json({ error: "Marketplace ID is required" }, { status: 400 })
    }

    // Get the marketplace first to check if it exists
    const marketplace = await FirebaseService.getMarketplaceById(marketplaceId)
    if (!marketplace) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    // Update marketplace
    await FirebaseService.updateMarketplace(marketplaceId, {
      ...marketplaceData,
      updatedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: "Marketplace updated successfully",
    })
  } catch (error: any) {
    console.error("Error updating marketplace:", error)
    return NextResponse.json({ error: "Failed to update marketplace" }, { status: 500 })
  }
})

// DELETE /api/marketplaces/[id] - Delete marketplace
export const DELETE = requireRole(["merchant"])(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const marketplaceId = params.id

    if (!marketplaceId) {
      return NextResponse.json({ error: "Marketplace ID is required" }, { status: 400 })
    }

    // Get the marketplace first to check if it exists
    const marketplace = await FirebaseService.getMarketplaceById(marketplaceId)
    if (!marketplace) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    // Delete marketplace
    await FirebaseService.deleteMarketplace(marketplaceId)

    return NextResponse.json({
      success: true,
      message: "Marketplace deleted successfully",
    })
  } catch (error: any) {
    console.error("Error deleting marketplace:", error)
    return NextResponse.json({ error: "Failed to delete marketplace" }, { status: 500 })
  }
})