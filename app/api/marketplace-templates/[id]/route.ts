import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { requireRole } from "@/lib/auth/middleware"

// GET /api/marketplace-templates/[id] - Get specific marketplace template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const template = await FirebaseService.getMarketplaceTemplateById(params.id)
    
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    return NextResponse.json({ template })
  } catch (error: any) {
    console.error("Error fetching marketplace template:", error)
    return NextResponse.json({ error: "Failed to fetch marketplace template" }, { status: 500 })
  }
}

// PUT /api/marketplace-templates/[id] - Update marketplace template (admin only)
export const PUT = requireRole(["admin"])(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const updates = await request.json()

    // Check if template exists
    const existingTemplate = await FirebaseService.getMarketplaceTemplateById(params.id)
    if (!existingTemplate) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Update template
    await FirebaseService.updateMarketplaceTemplate(params.id, updates)

    return NextResponse.json({
      success: true,
      message: "Marketplace template updated successfully",
    })
  } catch (error: any) {
    console.error("Error updating marketplace template:", error)
    return NextResponse.json({ error: "Failed to update marketplace template" }, { status: 500 })
  }
})

// DELETE /api/marketplace-templates/[id] - Delete marketplace template (admin only)
export const DELETE = requireRole(["admin"])(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    // Check if template exists
    const existingTemplate = await FirebaseService.getMarketplaceTemplateById(params.id)
    if (!existingTemplate) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Delete template
    await FirebaseService.deleteMarketplaceTemplate(params.id)

    return NextResponse.json({
      success: true,
      message: "Marketplace template deleted successfully",
    })
  } catch (error: any) {
    console.error("Error deleting marketplace template:", error)
    return NextResponse.json({ error: "Failed to delete marketplace template" }, { status: 500 })
  }
})
