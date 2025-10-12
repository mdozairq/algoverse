import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"

// GET /api/marketplace-templates - Get all marketplace templates
export async function GET(request: NextRequest) {
  try {
    const templates = await FirebaseService.getAllMarketplaceTemplates()
    
    return NextResponse.json({ 
      templates,
      count: templates.length 
    })
  } catch (error: any) {
    console.error("Error fetching marketplace templates:", error)
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
}