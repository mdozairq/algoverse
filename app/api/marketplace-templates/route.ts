import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"

// GET /api/marketplace-templates - Get all marketplace templates
export async function GET(request: NextRequest) {
  try {
    const templates = await FirebaseService.getAllMarketplaceTemplates()
    
    // Convert date fields to strings
    const templatesWithStringDates = templates.map(template => ({
      ...template,
      createdAt: template.createdAt instanceof Date ? template.createdAt.toISOString() : template.createdAt,
      updatedAt: template.updatedAt instanceof Date ? template.updatedAt.toISOString() : template.updatedAt
    }))

    return NextResponse.json({ 
      templates: templatesWithStringDates,
      count: templates.length 
    })
  } catch (error: any) {
    console.error("Error fetching marketplace templates:", error)
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
}