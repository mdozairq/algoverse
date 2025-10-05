import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"

// GET /api/marketplace-templates/[id] - Get marketplace template by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id

    if (!templateId) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 })
    }

    const template = await FirebaseService.getMarketplaceTemplateById(templateId)

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    return NextResponse.json({
      template
    })
  } catch (error: any) {
    console.error("Error fetching marketplace template:", error)
    return NextResponse.json({ error: "Failed to fetch template" }, { status: 500 })
  }
}