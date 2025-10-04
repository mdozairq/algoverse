import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { requireRole } from "@/lib/auth/middleware"

// GET /api/marketplaces/[id] - Get specific marketplace
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const marketplace = await FirebaseService.getMarketplaceById(params.id)
    
    if (!marketplace) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    // Only return approved marketplaces for public access
    if (marketplace.status !== "approved") {
      return NextResponse.json({ error: "Marketplace not available" }, { status: 403 })
    }

    return NextResponse.json({ marketplace })
  } catch (error: any) {
    console.error("Error fetching marketplace:", error)
    return NextResponse.json({ error: "Failed to fetch marketplace" }, { status: 500 })
  }
}

// PUT /api/marketplaces/[id] - Update marketplace (merchant/admin only)
export const PUT = requireRole(["merchant", "admin"])(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const auth = (request as any).auth
    const updates = await request.json()

    // Check if marketplace exists
    const existingMarketplace = await FirebaseService.getMarketplaceById(params.id)
    if (!existingMarketplace) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    // Check if user has permission to update this marketplace
    if (auth.role !== "admin" && existingMarketplace.merchantId !== auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update marketplace
    await FirebaseService.updateMarketplace(params.id, updates)

    return NextResponse.json({
      success: true,
      message: "Marketplace updated successfully",
    })
  } catch (error: any) {
    console.error("Error updating marketplace:", error)
    return NextResponse.json({ error: "Failed to update marketplace" }, { status: 500 })
  }
})

// DELETE /api/marketplaces/[id] - Delete marketplace (merchant/admin only)
export const DELETE = requireRole(["merchant", "admin"])(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const auth = (request as any).auth

    // Check if marketplace exists
    const existingMarketplace = await FirebaseService.getMarketplaceById(params.id)
    if (!existingMarketplace) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    // Check if user has permission to delete this marketplace
    if (auth.role !== "admin" && existingMarketplace.merchantId !== auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete marketplace
    await FirebaseService.deleteMarketplace(params.id)

    return NextResponse.json({
      success: true,
      message: "Marketplace deleted successfully",
    })
  } catch (error: any) {
    console.error("Error deleting marketplace:", error)
    return NextResponse.json({ error: "Failed to delete marketplace" }, { status: 500 })
  }
})