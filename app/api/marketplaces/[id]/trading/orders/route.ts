import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { adminDb } from "@/lib/firebase/admin"
import { validateOrder, SignedOrder } from "@/lib/trading/order-signing"
import { getAlgodClient } from "@/lib/algorand/config"

// GET /api/marketplaces/[id]/trading/orders - Get trading orders
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const marketplaceId = params.id
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'buy' or 'sell'
    const status = searchParams.get('status') // 'active', 'filled', 'cancelled'
    const nftId = searchParams.get('nftId')

    if (!marketplaceId) {
      return NextResponse.json({ error: "Marketplace ID is required" }, { status: 400 })
    }

    try {
      // Query trading orders from Firestore
      let query = adminDb
        .collection("trading_orders")
        .where("marketplaceId", "==", marketplaceId)

      if (type) {
        query = query.where("type", "==", type) as any
      }
      if (status) {
        query = query.where("status", "==", status) as any
      }
      if (nftId) {
        query = query.where("nftId", "==", nftId) as any
      }

      const snapshot = await query.get()
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      // Filter out expired orders and validate signatures
      const validOrders = []
      for (const order of orders) {
        if (order.status === "active") {
          const validation = validateOrder(order as SignedOrder)
          if (validation.valid) {
            validOrders.push(order)
          } else {
            // Mark expired/invalid orders as cancelled
            await doc.ref.update({ status: "cancelled", cancelledReason: validation.error })
          }
        } else {
          validOrders.push(order)
        }
      }

      return NextResponse.json({
        success: true,
        orders: validOrders,
        count: validOrders.length
      })
    } catch (dbError) {
      console.error("Error fetching trading orders from database:", dbError)
      // Fallback to empty array if database query fails
      return NextResponse.json({
        success: true,
        orders: [],
        count: 0
      })
    }
  } catch (error: any) {
    console.error("Error fetching trading orders:", error)
    return NextResponse.json({ error: "Failed to fetch trading orders" }, { status: 500 })
  }
}

// POST /api/marketplaces/[id]/trading/orders - Create a trading order (listing)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const marketplaceId = params.id
    const body = await request.json()
    const { signedOrder } = body

    if (!marketplaceId) {
      return NextResponse.json({ 
        error: "Marketplace ID is required" 
      }, { status: 400 })
    }

    if (!signedOrder) {
      return NextResponse.json({ 
        error: "Signed order is required" 
      }, { status: 400 })
    }

    // Validate the signed order
    const validation = validateOrder(signedOrder as SignedOrder)
    if (!validation.valid) {
      return NextResponse.json({ 
        error: validation.error || "Invalid order" 
      }, { status: 400 })
    }

    // Verify marketplace ID matches
    if (signedOrder.marketplaceId !== marketplaceId) {
      return NextResponse.json({ 
        error: "Marketplace ID mismatch" 
      }, { status: 400 })
    }

    // Get NFT to verify it exists and get assetId
    const nft = await FirebaseService.getNFTById(signedOrder.nftId)
    if (!nft) {
      return NextResponse.json({ 
        error: "NFT not found" 
      }, { status: 404 })
    }

    // Verify NFT is minted
    if (!nft.assetId) {
      return NextResponse.json({ 
        error: "NFT not yet minted on blockchain" 
      }, { status: 400 })
    }

    // Verify assetId matches
    if (nft.assetId !== signedOrder.assetId) {
      return NextResponse.json({ 
        error: "Asset ID mismatch" 
      }, { status: 400 })
    }

    // Verify seller owns the NFT
    const sellerAddress = signedOrder.sellerAddress.toLowerCase()
    const ownerAddress = (nft.ownerAddress || nft.ownerId || "").toLowerCase()
    if (sellerAddress !== ownerAddress) {
      return NextResponse.json({ 
        error: "Seller does not own this NFT" 
      }, { status: 403 })
    }

    // Check if there's already an active order for this NFT from this seller
    const existingOrdersSnapshot = await adminDb
      .collection("trading_orders")
      .where("marketplaceId", "==", marketplaceId)
      .where("nftId", "==", signedOrder.nftId)
      .where("sellerAddress", "==", signedOrder.sellerAddress)
      .where("status", "==", "active")
      .get()

    if (!existingOrdersSnapshot.empty) {
      // Cancel existing orders
      const batch = adminDb.batch()
      existingOrdersSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { 
          status: "cancelled", 
          cancelledReason: "Replaced by new order" 
        })
      })
      await batch.commit()
    }

    // Save the signed order to database
    const orderData = {
      ...signedOrder,
      status: "active",
      type: "sell", // Listings are sell orders
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const orderRef = await adminDb.collection("trading_orders").add(orderData)

    // Update NFT listing status
    await FirebaseService.updateNFT(signedOrder.nftId, {
      listedForSale: true,
      price: signedOrder.price,
      updatedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      order: {
        id: orderRef.id,
        ...orderData,
      },
      message: "Trading order created successfully"
    })
  } catch (error: any) {
    console.error("Error creating trading order:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to create trading order" 
    }, { status: 500 })
  }
}
