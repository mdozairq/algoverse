import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { requireRole } from "@/lib/auth/middleware"

// GET /api/collections/[id] - Get collection by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const collectionId = params.id

    if (!collectionId) {
      return NextResponse.json({ error: "Collection ID is required" }, { status: 400 })
    }

    // Fetch collection details
    const collection = await FirebaseService.getCollectionById(collectionId)

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      collection
    })
  } catch (error: any) {
    console.error("Error fetching collection:", error)
    return NextResponse.json({ error: "Failed to fetch collection" }, { status: 500 })
  }
}

// PUT /api/collections/[id] - Update collection
export const PUT = requireRole(["merchant"])(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const collectionId = params.id

    if (!collectionId) {
      return NextResponse.json({ error: "Collection ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const updateData = { ...body, updatedAt: new Date() }

    // Update the collection
    await FirebaseService.updateCollection(collectionId, updateData)

    return NextResponse.json({
      success: true,
      message: "Collection updated successfully"
    })
  } catch (error: any) {
    console.error("Error updating collection:", error)
    return NextResponse.json({ error: "Failed to update collection" }, { status: 500 })
  }
})
