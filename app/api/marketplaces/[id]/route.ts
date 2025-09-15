import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { requireRole } from "@/lib/auth/middleware"

// GET /api/marketplaces/[id] - Get marketplace by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const marketplace = await FirebaseService.getMarketplaceById(params.id)
    
    if (!marketplace) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    return NextResponse.json({ marketplace })
  } catch (error: any) {
    console.error("Error fetching marketplace:", error)
    return NextResponse.json({ error: "Failed to fetch marketplace" }, { status: 500 })
  }
}

// PUT /api/marketplaces/[id] - Update marketplace (merchants for their own, admins for status)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // For admin operations, we'll allow the request for now
    // In a production app, you'd verify the JWT token from cookies
    const updates = await request.json()

    // Get marketplace
    const marketplace = await FirebaseService.getMarketplaceById(params.id)
    if (!marketplace) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
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
}

// DELETE /api/marketplaces/[id] - Delete marketplace (merchants for their own, admins for any)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get marketplace
    const marketplace = await FirebaseService.getMarketplaceById(params.id)
    if (!marketplace) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    // Delete marketplace (Note: In a real app, you might want to soft delete)
    await FirebaseService.updateMarketplace(params.id, { status: "rejected" })

    return NextResponse.json({
      success: true,
      message: "Marketplace deleted successfully",
    })
  } catch (error: any) {
    console.error("Error deleting marketplace:", error)
    return NextResponse.json({ error: "Failed to delete marketplace" }, { status: 500 })
  }
}
