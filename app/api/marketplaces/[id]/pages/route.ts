import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { requireRole } from "@/lib/auth/middleware"

// GET /api/marketplaces/[id]/pages - Get marketplace pages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const marketplace = await FirebaseService.getMarketplaceById(params.id)
    
    if (!marketplace) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    // Get marketplace pages
    const pages = await FirebaseService.getMarketplacePages(params.id)

    return NextResponse.json({ pages })
  } catch (error: any) {
    console.error("Error fetching marketplace pages:", error)
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 })
  }
}

// POST /api/marketplaces/[id]/pages - Create new marketplace page
export const POST = requireRole(["merchant"])(async (request: NextRequest) => {
  try {
    const auth = (request as any).auth
    const pageData = await request.json()
    
    // Extract ID from URL path
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const marketplaceId = pathParts[pathParts.length - 2] // pages is the last part, so id is second to last

    // Get marketplace to verify ownership
    const marketplace = await FirebaseService.getMarketplaceById(marketplaceId)
    if (!marketplace) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    // Get merchant to verify ownership
    const merchant = await FirebaseService.getMerchantByUid(auth.uid)
    if (!merchant || merchant.id !== marketplace.merchantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Validate required fields
    if (!pageData.type || !pageData.title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create page
    const pageId = await FirebaseService.createMarketplacePage({
      ...pageData,
      marketplaceId: marketplaceId,
      merchantId: merchant.id,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      pageId,
      message: "Page created successfully"
    })
  } catch (error: any) {
    console.error("Error creating marketplace page:", error)
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 })
  }
})
