import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { requireRole } from "@/lib/auth/middleware"

// GET /api/marketplace-templates - Get all marketplace templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    let templates = []
    if (category) {
      templates = await FirebaseService.getMarketplaceTemplatesByCategory(category)
    } else {
      templates = await FirebaseService.getAllMarketplaceTemplates()
    }

    return NextResponse.json({ templates })
  } catch (error: any) {
    console.error("Error fetching marketplace templates:", error)
    return NextResponse.json({ error: "Failed to fetch marketplace templates" }, { status: 500 })
  }
}

// POST /api/marketplace-templates - Create new marketplace template (admin only)
export const POST = requireRole(["admin"])(async (request: NextRequest) => {
  try {
    const templateData = await request.json()

    // Validate required fields
    if (!templateData.name || !templateData.description || !templateData.configuration) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create template
    const templateId = await FirebaseService.createMarketplaceTemplate({
      ...templateData,
      isActive: true,
    })

    return NextResponse.json({
      success: true,
      templateId,
      message: "Marketplace template created successfully",
    })
  } catch (error: any) {
    console.error("Error creating marketplace template:", error)
    return NextResponse.json({ error: "Failed to create marketplace template" }, { status: 500 })
  }
})
