// POST /api/marketplaces/[id]/trading/orders/[orderId]/cancel - Cancel a trading order
import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase/admin"
import { requireAuth } from "@/lib/auth/middleware"

export const POST = requireAuth(async (
  request: NextRequest,
  { params }: { params: { id: string; orderId: string } }
) => {
  try {
    const auth = (request as any).auth
    const marketplaceId = params.id
    const orderId = params.orderId

    if (!marketplaceId || !orderId) {
      return NextResponse.json(
        { error: "Marketplace ID and order ID are required" },
        { status: 400 }
      )
    }

    // Get the order
    const orderDoc = await adminDb
      .collection("trading_orders")
      .doc(orderId)
      .get()

    if (!orderDoc.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const order = orderDoc.data()

    // Verify marketplace ID matches
    if (order?.marketplaceId !== marketplaceId) {
      return NextResponse.json(
        { error: "Marketplace ID mismatch" },
        { status: 400 }
      )
    }

    // Verify order is active
    if (order?.status !== "active") {
      return NextResponse.json(
        { error: `Order is ${order?.status} and cannot be cancelled` },
        { status: 400 }
      )
    }

    // Get user address from body or auth
    const body = await request.json().catch(() => ({}))
    const userAddress = body.userAddress || auth?.walletAddress || null
    
    // Verify user is the seller (or admin)
    const isSeller = userAddress && order?.sellerAddress?.toLowerCase() === userAddress.toLowerCase()
    const isAdmin = auth?.role === "admin"

    if (!isSeller && !isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Only the seller can cancel this order" },
        { status: 403 }
      )
    }

    // Cancel the order
    await orderDoc.ref.update({
      status: "cancelled",
      cancelledAt: new Date(),
      cancelledBy: auth?.uid || userAddress,
      cancelledReason: "Cancelled by seller",
    })

    // Update NFT listing status if this was the only active listing
    const otherActiveListings = await adminDb
      .collection("trading_orders")
      .where("nftId", "==", order.nftId)
      .where("status", "==", "active")
      .get()

    if (otherActiveListings.empty) {
      // No other active listings, update NFT
      const { FirebaseService } = await import("@/lib/firebase/collections")
      await FirebaseService.updateNFT(order.nftId, {
        listedForSale: false,
        updatedAt: new Date(),
      })
    }

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
    })
  } catch (error: any) {
    console.error("Error cancelling order:", error)
    return NextResponse.json(
      { error: error.message || "Failed to cancel order" },
      { status: 500 }
    )
  }
})

