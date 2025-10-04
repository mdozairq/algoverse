import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { requireRole } from "@/lib/auth/middleware"

// GET /api/merchants/[id]/marketplaces - Get marketplaces for a specific merchant
export const GET = requireRole(["merchant"])(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const auth = (request as any).auth
    
    // Check if user is accessing their own data or is admin
    if (auth.userId !== params.id && auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const marketplaces = await FirebaseService.getMarketplacesByMerchant(params.id)
    
    return NextResponse.json({
      success: true,
      marketplaces: marketplaces.map(marketplace => ({
        ...marketplace,
        // Ensure isEnabled and allowSwap are boolean
        isEnabled: marketplace.isEnabled ?? true,
        allowSwap: marketplace.allowSwap ?? true
      }))
    })
  } catch (error: any) {
    console.error("Error fetching merchant marketplaces:", error)
    return NextResponse.json({ error: "Failed to fetch marketplaces" }, { status: 500 })
  }
})
