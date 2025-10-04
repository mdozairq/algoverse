import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { requireRole } from "@/lib/auth/middleware"

// PUT /api/products/[id] - Update product settings
export const PUT = requireRole(["merchant"])(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const auth = (request as any).auth
    const { isEnabled, allowSwap } = await request.json()

    // Get the product to check ownership
    const product = await FirebaseService.getNFTById(params.id)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Get the marketplace to check merchant ownership
    const marketplace = await FirebaseService.getMarketplaceById(product.marketplaceId || "")
    if (!marketplace || marketplace.merchantId !== auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update the product
    const updates: any = {}
    if (typeof isEnabled === 'boolean') {
      updates.isEnabled = isEnabled
    }
    if (typeof allowSwap === 'boolean') {
      updates.allowSwap = allowSwap
    }

    await FirebaseService.updateNFT(params.id, updates)

    return NextResponse.json({
      success: true,
      message: "Product updated successfully"
    })
  } catch (error: any) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
})
