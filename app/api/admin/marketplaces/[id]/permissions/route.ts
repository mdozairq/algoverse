// PUT /api/admin/marketplaces/[id]/permissions - Update marketplace permissions
import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/middleware"
import { adminDb } from "@/lib/firebase/admin"

export const PUT = requireAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const auth = (request as any).auth
    
    // Verify admin role
    if (auth?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { permissions } = body

    if (!permissions || typeof permissions !== "object") {
      return NextResponse.json(
        { error: "Invalid permissions data" },
        { status: 400 }
      )
    }

    // Update marketplace permissions
    const marketplaceRef = adminDb.collection("marketplaces").doc(params.id)
    const marketplaceDoc = await marketplaceRef.get()
    
    if (!marketplaceDoc.exists) {
      return NextResponse.json(
        { error: "Marketplace not found" },
        { status: 404 }
      )
    }

    await marketplaceRef.update({
      permissions: {
        allowMarketplace: permissions.allowMarketplace ?? false,
        allowMint: permissions.allowMint ?? false,
        allowDutchMint: permissions.allowDutchMint ?? false,
        allowAIGenerated: permissions.allowAIGenerated ?? false,
        allowTrade: permissions.allowTrade ?? false,
        allowSwap: permissions.allowSwap ?? false,
      },
      updatedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: "Marketplace permissions updated successfully",
    })
  } catch (error: any) {
    console.error("Error updating marketplace permissions:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update marketplace permissions" },
      { status: 500 }
    )
  }
})

