import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { requireRole } from "@/lib/auth/middleware"

// GET /api/marketplaces/[id]/pages/[pageId] - Get specific marketplace page
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; pageId: string } }
) {
  try {
    const page = await FirebaseService.getMarketplacePageById(params.pageId)
    
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    // Verify page belongs to marketplace
    if (page.marketplaceId !== params.id) {
      return NextResponse.json({ error: "Page not found in this marketplace" }, { status: 404 })
    }

    return NextResponse.json({ page })
  } catch (error: any) {
    console.error("Error fetching marketplace page:", error)
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 })
  }
}

// PUT /api/marketplaces/[id]/pages/[pageId] - Update marketplace page
export const PUT = requireRole(["merchant"])(async (request: NextRequest) => {
  try {
    const auth = (request as any).auth
    const updateData = await request.json()
    
    // Extract IDs from URL path
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const pageId = pathParts[pathParts.length - 1]
    const marketplaceId = pathParts[pathParts.length - 3] // marketplace id is third from last

    // Get page to verify ownership
    const page = await FirebaseService.getMarketplacePageById(pageId)
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    // Verify page belongs to marketplace
    if (page.marketplaceId !== marketplaceId) {
      return NextResponse.json({ error: "Page not found in this marketplace" }, { status: 404 })
    }

    // Get merchant to verify ownership
    const merchant = await FirebaseService.getMerchantByUid(auth.uid)
    if (!merchant || merchant.id !== page.merchantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update page
    await FirebaseService.updateMarketplacePage(pageId, {
      ...updateData,
      updatedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      message: "Page updated successfully"
    })
  } catch (error: any) {
    console.error("Error updating marketplace page:", error)
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 })
  }
})

// DELETE /api/marketplaces/[id]/pages/[pageId] - Delete marketplace page
export const DELETE = requireRole(["merchant"])(async (request: NextRequest) => {
  try {
    const auth = (request as any).auth
    
    // Extract IDs from URL path
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const pageId = pathParts[pathParts.length - 1]
    const marketplaceId = pathParts[pathParts.length - 3] // marketplace id is third from last

    // Get page to verify ownership
    const page = await FirebaseService.getMarketplacePageById(pageId)
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    // Verify page belongs to marketplace
    if (page.marketplaceId !== marketplaceId) {
      return NextResponse.json({ error: "Page not found in this marketplace" }, { status: 404 })
    }

    // Get merchant to verify ownership
    const merchant = await FirebaseService.getMerchantByUid(auth.uid)
    if (!merchant || merchant.id !== page.merchantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete page
    await FirebaseService.deleteMarketplacePage(pageId)

    return NextResponse.json({
      success: true,
      message: "Page deleted successfully"
    })
  } catch (error: any) {
    console.error("Error deleting marketplace page:", error)
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 })
  }
})
