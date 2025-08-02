import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { AlgorandNFTService } from "@/lib/algorand/nft"
import { PLATFORM_CONFIG } from "@/lib/algorand/config"
import { requireAuth } from "@/lib/auth/middleware"

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const auth = (request as any).auth
    const { nftId, buyerWalletAddress } = await request.json()

    // Get NFT info
    const nft = await FirebaseService.getNFTById(nftId)
    if (!nft || !nft.listedForSale) {
      return NextResponse.json({ error: "NFT not available for purchase" }, { status: 400 })
    }

    // Get buyer info
    const buyer = await FirebaseService.getUserByUid(auth.uid)
    if (!buyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 })
    }

    // Get seller (current owner) info
    const seller = await FirebaseService.getUserById(nft.ownerId)
    if (!seller || !seller.walletAddress) {
      return NextResponse.json({ error: "Seller wallet not configured" }, { status: 400 })
    }

    // Get creator info for royalties
    const creator = await FirebaseService.getUserById(nft.creatorId)
    if (!creator || !creator.walletAddress) {
      return NextResponse.json({ error: "Creator wallet not configured" }, { status: 400 })
    }

    const platformWallet = process.env.PLATFORM_WALLET_ADDRESS!
    const totalAmount = Math.floor(nft.price * 1000000) // Convert to microAlgos

    // Create payment transactions with royalties
    const paymentTxns = await AlgorandNFTService.createPaymentWithRoyalties(
      buyerWalletAddress,
      seller.walletAddress,
      creator.walletAddress,
      platformWallet,
      totalAmount,
      PLATFORM_CONFIG.ROYALTY_PERCENTAGE,
      PLATFORM_CONFIG.PLATFORM_FEE_PERCENTAGE,
    )

    // Create NFT transfer transaction
    const transferTxn = await AlgorandNFTService.createTransferTransaction(
      seller.walletAddress,
      buyerWalletAddress,
      nft.assetId,
    )

    // Create opt-in transaction if needed
    const optInTxn = await AlgorandNFTService.createOptInTransaction(buyerWalletAddress, nft.assetId)

    // Combine all transactions
    const allTxns = [optInTxn, ...paymentTxns, transferTxn]

    return NextResponse.json({
      success: true,
      transactions: allTxns.map((txn) => Buffer.from(txn.toByte()).toString("base64")),
    })
  } catch (error: any) {
    console.error("Error creating purchase transaction:", error)
    return NextResponse.json({ error: "Failed to create purchase transaction" }, { status: 500 })
  }
})
