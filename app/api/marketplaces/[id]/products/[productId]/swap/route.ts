import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { requireRole } from "@/lib/auth/middleware"

// POST /api/marketplaces/[id]/products/[productId]/swap - Initiate NFT swap
export const POST = requireRole(["user"])(async (
  request: NextRequest,
  { params }: { params: { id: string; productId: string } }
) => {
  try {
    const auth = (request as any).auth
    const { offeredNftId, message } = await request.json()

    // Get marketplace details
    const marketplace = await FirebaseService.getMarketplaceById(params.id)
    if (!marketplace) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    if (marketplace.status !== "approved") {
      return NextResponse.json({ error: "Marketplace not available" }, { status: 403 })
    }

    // Get user details
    const user = await FirebaseService.getUserById(auth.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get the NFT being offered for swap
    const offeredNft = await FirebaseService.getNFTById(offeredNftId)
    if (!offeredNft) {
      return NextResponse.json({ error: "Offered NFT not found" }, { status: 404 })
    }

    // Check if user owns the offered NFT
    if (offeredNft.ownerId !== auth.userId) {
      return NextResponse.json({ error: "You don't own this NFT" }, { status: 403 })
    }

    // Get the target NFT
    const targetNft = await FirebaseService.getNFTById(params.productId)
    if (!targetNft) {
      return NextResponse.json({ error: "Target NFT not found" }, { status: 404 })
    }

    // Check if target NFT is available for swap (NFTs are unique items)
    // For now, we assume all NFTs are available for swap

    // Create swap proposal
    const swapData = {
      proposerId: auth.userId,
      proposerWalletAddress: user.walletAddress || "",
      targetNftId: params.productId,
      offeredNftId: offeredNftId,
      targetNftOwnerId: targetNft.ownerId,
      marketplaceId: params.id,
      message: message || "",
      status: "pending" as const,
    }

    const swapId = await FirebaseService.createSwap(swapData)

    return NextResponse.json({
      success: true,
      swapId,
      message: "Swap proposal created successfully",
      data: {
        swapId,
        offeredNft: {
          id: offeredNft.id,
          name: offeredNft.metadata.name || "Unnamed NFT",
          image: offeredNft.metadata.image || "/placeholder.jpg",
          owner: user.name || user.email
        },
        targetNft: {
          id: targetNft.id,
          name: targetNft.metadata.name || "Unnamed NFT",
          image: targetNft.metadata.image || "/placeholder.jpg",
          owner: targetNft.ownerId
        },
        status: "pending"
      }
    })
  } catch (error: any) {
    console.error("Error creating swap proposal:", error)
    return NextResponse.json({ error: "Failed to create swap proposal" }, { status: 500 })
  }
})

// GET /api/marketplaces/[id]/products/[productId]/swap - Get swap proposals for an NFT
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; productId: string } }
) {
  try {
    // Check if marketplace exists
    const marketplace = await FirebaseService.getMarketplaceById(params.id)
    if (!marketplace) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    // Get swap proposals for this NFT
    const swaps = await FirebaseService.getSwapsByTargetNft(params.productId)

    return NextResponse.json({
      swaps: swaps.filter(swap => swap.status === "pending")
    })
  } catch (error: any) {
    console.error("Error fetching swap proposals:", error)
    return NextResponse.json({ error: "Failed to fetch swap proposals" }, { status: 500 })
  }
}
