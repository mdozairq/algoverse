// Execute trade endpoint - builds atomic transaction groups for trading
import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { adminDb } from "@/lib/firebase/admin"
import { validateOrder, SignedOrder } from "@/lib/trading/order-signing"
import {
  buildTradeTransactionGroup,
  submitTradeTransactionGroup,
} from "@/lib/trading/trade-execution"
import { getAlgodClient } from "@/lib/algorand/config"
import algosdk from "algosdk"
import { requireAuth } from "@/lib/auth/middleware"

// POST /api/marketplaces/[id]/trading/execute - Prepare trade transaction group
export const POST = requireAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const marketplaceId = params.id
    const body = await request.json()
    const { orderId, buyerAddress } = body

    if (!marketplaceId || !orderId || !buyerAddress) {
      return NextResponse.json(
        { error: "Marketplace ID, order ID, and buyer address are required" },
        { status: 400 }
      )
    }

    // Get the order from database
    const orderDoc = await adminDb
      .collection("trading_orders")
      .doc(orderId)
      .get()

    if (!orderDoc.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const signedOrder = orderDoc.data() as SignedOrder

    // Verify marketplace ID matches
    if (signedOrder.marketplaceId !== marketplaceId) {
      return NextResponse.json(
        { error: "Marketplace ID mismatch" },
        { status: 400 }
      )
    }

    // Validate order
    const validation = validateOrder(signedOrder)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || "Invalid order" },
        { status: 400 }
      )
    }

    // Check if order is still active
    if (signedOrder.status !== "active") {
      return NextResponse.json(
        { error: `Order is ${signedOrder.status}` },
        { status: 400 }
      )
    }

    // Get NFT info
    const nft = await FirebaseService.getNFTById(signedOrder.nftId)
    if (!nft) {
      return NextResponse.json({ error: "NFT not found" }, { status: 404 })
    }

    // Verify NFT owner (may have changed since order was created)
    const nftOwnerAddress = nft.ownerAddress || nft.ownerId
    if (!nftOwnerAddress) {
      return NextResponse.json(
        { error: "NFT owner not found" },
        { status: 400 }
      )
    }

    // Get creator address for royalties
    const creatorAddress = nft.creatorAddress || nft.royaltyRecipient
    const royaltyPercentage = nft.royaltyPercentage || 0

    // Build transaction group
    const transactionGroup = await buildTradeTransactionGroup({
      signedOrder,
      buyerAddress,
      nftOwnerAddress,
      creatorAddress,
      royaltyPercentage,
    })

    // Convert transactions to base64 for signing
    const transactionsBase64 = transactionGroup.transactions.map((txn) => {
      return Buffer.from(algosdk.encodeUnsignedTransaction(txn)).toString(
        "base64"
      )
    })

    return NextResponse.json({
      success: true,
      transactions: transactionsBase64,
      needsOptIn: transactionGroup.needsOptIn,
      buyerTransactionIndices: transactionGroup.buyerTransactionIndices,
      sellerTransactionIndices: transactionGroup.sellerTransactionIndices,
      sellerAddress: signedOrder.sellerAddress,
      nftOwnerAddress,
      transactionInfo: transactionGroup.transactionInfo,
      orderId,
    })
  } catch (error: any) {
    console.error("Error preparing trade execution:", error)
    return NextResponse.json(
      { error: error.message || "Failed to prepare trade execution" },
      { status: 500 }
    )
  }
})

// PUT /api/marketplaces/[id]/trading/execute - Submit signed trade transactions
export const PUT = requireAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const auth = (request as any).auth
    const marketplaceId = params.id
    const body = await request.json()
    const {
      orderId,
      signedTransactions,
      buyerWalletAddress,
      transactionGroup, // Original unsigned transactions for seller signing
      buyerTransactionIndices,
      sellerTransactionIndices,
    } = body

    if (!orderId || !signedTransactions || !Array.isArray(signedTransactions)) {
      return NextResponse.json(
        { error: "Order ID and signed transactions are required" },
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

    const signedOrder = orderDoc.data() as SignedOrder

    // Verify order is still active
    if (signedOrder.status !== "active") {
      return NextResponse.json(
        { error: `Order is ${signedOrder.status}` },
        { status: 400 }
      )
    }

    // Get NFT info
    const nft = await FirebaseService.getNFTById(signedOrder.nftId)
    if (!nft) {
      return NextResponse.json({ error: "NFT not found" }, { status: 404 })
    }

    const nftOwnerAddress = nft.ownerAddress || nft.ownerId
    const escrowAddress = process.env.PLATFORM_ESCROW_ADDRESS

    // Check if NFT is in escrow (platform-controlled account)
    const isInEscrow =
      escrowAddress &&
      escrowAddress !== "PLATFORM_ESCROW_ADDRESS_NOT_SET" &&
      nftOwnerAddress?.toLowerCase() === escrowAddress.toLowerCase()

    let finalSignedTransactions: Uint8Array[]

    if (
      isInEscrow &&
      process.env.ESCROW_PRIVATE_KEY &&
      transactionGroup &&
      sellerTransactionIndices
    ) {
      // NFT is in escrow - sign seller transactions server-side
      const allSignedTxnsFromWallet = signedTransactions.map((txn: string) =>
        Uint8Array.from(Buffer.from(txn, "base64"))
      )

      const allUnsignedTransactions = transactionGroup.map(
        (txnBase64: string) =>
          algosdk.decodeUnsignedTransaction(Buffer.from(txnBase64, "base64"))
      )

      // Extract group ID from buyer's signed transaction
      let groupId: Uint8Array | null = null
      if (buyerTransactionIndices && buyerTransactionIndices.length > 0) {
        const firstBuyerIdx = buyerTransactionIndices[0]
        const buyerSignedTxnBytes = allSignedTxnsFromWallet[firstBuyerIdx]
        if (buyerSignedTxnBytes) {
          try {
            const buyerSignedTxn = algosdk.decodeSignedTransaction(
              buyerSignedTxnBytes
            )
            groupId = buyerSignedTxn.txn.group || null
          } catch (error) {
            console.error("Failed to extract group ID:", error)
          }
        }
      }

      // Apply group ID to all transactions
      if (groupId) {
        allUnsignedTransactions.forEach((txn: algosdk.Transaction) => {
          txn.group = groupId!
        })
      } else {
        algosdk.assignGroupID(allUnsignedTransactions)
      }

      // Sign seller transactions with escrow private key
      const escrowAccount = algosdk.mnemonicToSecretKey(
        process.env.ESCROW_PRIVATE_KEY
      )
      const finalSignedTxns: Uint8Array[] = []

      allUnsignedTransactions.forEach(
        (unsignedTxn: algosdk.Transaction, index: number) => {
          if (
            buyerTransactionIndices &&
            buyerTransactionIndices.includes(index)
          ) {
            finalSignedTxns.push(allSignedTxnsFromWallet[index])
          } else if (sellerTransactionIndices.includes(index)) {
            const signed = unsignedTxn.signTxn(escrowAccount.sk)
            finalSignedTxns.push(signed)
          } else {
            finalSignedTxns.push(allSignedTxnsFromWallet[index])
          }
        }
      )

      finalSignedTransactions = finalSignedTxns
    } else {
      // Direct peer-to-peer sale - use transactions as returned by wallet
      finalSignedTransactions = signedTransactions.map((txn: string) =>
        Uint8Array.from(Buffer.from(txn, "base64"))
      )
    }

    // Submit transactions
    const txId = await submitTradeTransactionGroup(finalSignedTransactions)

    // Update order status
    await orderDoc.ref.update({
      status: "filled",
      buyerAddress: buyerWalletAddress,
      transactionId: txId,
      filledAt: new Date(),
      updatedAt: new Date(),
    })

    // Update NFT ownership
    const updateData: any = {
      ownerAddress: buyerWalletAddress,
      listedForSale: false,
      forSale: false,
      updatedAt: new Date(),
    }

    // Get buyer info if available
    let buyer = null
    if (auth?.uid) {
      buyer = await FirebaseService.getUserByUid(auth.uid)
      if (buyer?.id) {
        updateData.ownerId = buyer.id
      }
    }

    await FirebaseService.updateNFT(signedOrder.nftId, updateData)

    // Record trade in history
    await adminDb.collection("nft_trades").add({
      orderId,
      nftId: signedOrder.nftId,
      assetId: signedOrder.assetId,
      marketplaceId,
      buyerId: buyer?.id || null,
      buyerAddress: buyerWalletAddress,
      sellerAddress: signedOrder.sellerAddress,
      price: signedOrder.price,
      currency: signedOrder.currency,
      transactionId: txId,
      createdAt: new Date(),
      status: "completed",
    })

    // Cancel any other active orders for this NFT
    const otherOrdersSnapshot = await adminDb
      .collection("trading_orders")
      .where("nftId", "==", signedOrder.nftId)
      .where("status", "==", "active")
      .get()

    if (!otherOrdersSnapshot.empty) {
      const batch = adminDb.batch()
      otherOrdersSnapshot.docs.forEach((doc) => {
        if (doc.id !== orderId) {
          batch.update(doc.ref, {
            status: "cancelled",
            cancelledReason: "NFT sold",
          })
        }
      })
      await batch.commit()
    }

    return NextResponse.json({
      success: true,
      transactionId: txId,
      message: "Trade executed successfully",
    })
  } catch (error: any) {
    console.error("Error executing trade:", error)
    return NextResponse.json(
      { error: error.message || "Failed to execute trade" },
      { status: 500 }
    )
  }
})

