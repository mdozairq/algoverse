import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"

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

    if (!marketplaceId) {
      return NextResponse.json({ error: "Marketplace ID is required" }, { status: 400 })
    }

    // For now, return mock data. In a real implementation, you'd query a trading orders collection
    const mockOrders = [
      {
        id: "1",
        marketplaceId,
        nftId: "nft-1",
        type: "buy",
        price: 6.91,
        currency: "ALGO",
        status: "active",
        buyerAddress: "0x123...abc",
        sellerAddress: null,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      },
      {
        id: "2",
        marketplaceId,
        nftId: "nft-2",
        type: "sell",
        price: 7.2,
        currency: "ALGO",
        status: "active",
        buyerAddress: null,
        sellerAddress: "0x456...def",
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    // Filter by type and status if provided
    let filteredOrders = mockOrders
    if (type) {
      filteredOrders = filteredOrders.filter(order => order.type === type)
    }
    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status)
    }

    return NextResponse.json({
      success: true,
      orders: filteredOrders,
      count: filteredOrders.length
    })
  } catch (error: any) {
    console.error("Error fetching trading orders:", error)
    return NextResponse.json({ error: "Failed to fetch trading orders" }, { status: 500 })
  }
}

// POST /api/marketplaces/[id]/trading/orders - Create a trading order
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const marketplaceId = params.id
    const body = await request.json()
    const {
      nftId,
      type, // 'buy' or 'sell'
      price,
      currency = "ALGO",
      userAddress,
      expiresInDays = 7
    } = body

    if (!marketplaceId || !nftId || !type || !price || !userAddress) {
      return NextResponse.json({ 
        error: "Marketplace ID, NFT ID, type, price, and user address are required" 
      }, { status: 400 })
    }

    if (type !== "buy" && type !== "sell") {
      return NextResponse.json({ 
        error: "Type must be 'buy' or 'sell'" 
      }, { status: 400 })
    }

    // Create the trading order
    const orderData = {
      id: `order-${Date.now()}`,
      marketplaceId,
      nftId,
      type,
      price,
      currency,
      status: "active",
      [type === "buy" ? "buyerAddress" : "sellerAddress"]: userAddress,
      [type === "buy" ? "sellerAddress" : "buyerAddress"]: null,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    }

    // In a real implementation, you'd save this to your database
    // await FirebaseService.createTradingOrder(orderData)

    return NextResponse.json({
      success: true,
      order: orderData,
      message: "Trading order created successfully"
    })
  } catch (error: any) {
    console.error("Error creating trading order:", error)
    return NextResponse.json({ error: "Failed to create trading order" }, { status: 500 })
  }
}
