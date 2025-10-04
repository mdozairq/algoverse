import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { requireRole } from "@/lib/auth/middleware"

// POST /api/marketplaces/[id]/products/[productId]/purchase - Purchase a product
export const POST = requireRole(["user"])(async (
  request: NextRequest,
  { params }: { params: { id: string; productId: string } }
) => {
  try {
    const auth = (request as any).auth
    const { quantity = 1, paymentMethod = "algorand" } = await request.json()

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

    // Check if user has wallet connected
    if (!user.walletAddress) {
      return NextResponse.json({ 
        error: "Wallet not connected. Please connect your wallet to make purchases." 
      }, { status: 400 })
    }

    // Get product details (check both NFTs and Events)
    let product = null
    let productType = null

    // Check if it's an NFT
    const nft = await FirebaseService.getNFTById(params.productId)
    if (nft) {
      product = nft
      productType = "nft"
    } else {
      // Check if it's an Event
      const event = await FirebaseService.getEventById(params.productId)
      if (event) {
        product = event
        productType = "event"
      }
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check availability
    if (product.availableSupply < quantity) {
      return NextResponse.json({ 
        error: `Only ${product.availableSupply} items available` 
      }, { status: 400 })
    }

    // Calculate total price
    const unitPrice = productType === "event" ? parseFloat(product.price) : product.price
    const totalPrice = unitPrice * quantity

    // Create purchase transaction record
    const transactionData = {
      userId: auth.userId,
      marketplaceId: params.id,
      productId: params.productId,
      productType,
      quantity,
      unitPrice,
      totalPrice,
      currency: "ALGO",
      paymentMethod,
      status: "pending",
      merchantId: marketplace.merchantId,
      buyerWalletAddress: user.walletAddress,
      sellerWalletAddress: marketplace.walletAddress,
      createdAt: new Date(),
    }

    const transactionId = await FirebaseService.createTransaction(transactionData)

    // For now, we'll create the transaction record and return success
    // In a real implementation, you would integrate with Algorand blockchain
    // to process the actual payment and transfer

    return NextResponse.json({
      success: true,
      transactionId,
      message: "Purchase initiated successfully",
      data: {
        productName: productType === "event" ? product.title : product.name,
        quantity,
        totalPrice,
        currency: "ALGO",
        transactionId,
        // Include blockchain transaction details when implemented
        blockchainTx: {
          status: "pending",
          message: "Transaction will be processed on Algorand blockchain"
        }
      }
    })
  } catch (error: any) {
    console.error("Error processing purchase:", error)
    return NextResponse.json({ error: "Failed to process purchase" }, { status: 500 })
  }
})
