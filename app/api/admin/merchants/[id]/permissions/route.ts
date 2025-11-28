// PUT /api/admin/merchants/[id]/permissions - Update merchant permissions
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

    // Update merchant permissions
    // Try merchants collection first, fallback to users collection
    let merchantRef = adminDb.collection("merchants").doc(params.id)
    let merchantDoc = await merchantRef.get()
    
    // If not found in merchants collection, try users collection
    if (!merchantDoc.exists) {
      merchantRef = adminDb.collection("users").doc(params.id)
      merchantDoc = await merchantRef.get()
    }
    
    if (!merchantDoc.exists) {
      return NextResponse.json(
        { error: "Merchant not found" },
        { status: 404 }
      )
    }

    await merchantRef.update({
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
      message: "Permissions updated successfully",
    })
  } catch (error: any) {
    console.error("Error updating permissions:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update permissions" },
      { status: 500 }
    )
  }
})

