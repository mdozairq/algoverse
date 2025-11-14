import { NextRequest, NextResponse } from "next/server"
import { DutchMintContract } from "@/lib/algorand/dutch-mint-contract"
import { requireRole } from "@/lib/auth/middleware"
import algosdk from "algosdk"
import { adminDb } from "@/lib/firebase/admin"

// Request refund
export const POST = requireRole(["user", "merchant"])(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const auth = (request as any).auth
    const marketplaceId = params.id

    // Get user
    const userDoc = await adminDb.collection('users').doc(auth.uid).get()
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userDoc.data()
    if (!user?.walletAddress) {
      return NextResponse.json({ error: "User wallet address not found" }, { status: 400 })
    }

    // Get marketplace configuration
    const marketplaceDoc = await adminDb.collection('marketplaces').doc(marketplaceId).get()
    if (!marketplaceDoc.exists) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    const marketplace = marketplaceDoc.data()
    const dutchMintAppId = marketplace?.dutchMintAppId
    const escrowPrivateKey = process.env.DUTCH_MINT_ESCROW_PRIVATE_KEY

    if (!dutchMintAppId) {
      return NextResponse.json({
        error: "Dutch mint contract not configured for this marketplace",
      }, { status: 404 })
    }

    if (!escrowPrivateKey) {
      return NextResponse.json({
        error: "Escrow private key not configured",
      }, { status: 500 })
    }

    // Check if user has escrowed amount
    const userEscrowed = await DutchMintContract.getUserEscrowedAmount(
      user.walletAddress,
      dutchMintAppId
    )

    if (userEscrowed === 0) {
      return NextResponse.json({
        error: "No escrowed amount to refund",
      }, { status: 400 })
    }

    // Check queue status to verify refund conditions
    const queueStatus = await DutchMintContract.getQueueStatus(dutchMintAppId)
    if (!queueStatus.canRefund) {
      return NextResponse.json({
        error: "Refund conditions not met. Time window not expired or threshold already met.",
        queueStatus,
      }, { status: 400 })
    }

    // Create refund transaction
    const { transactions, groupId } = await DutchMintContract.requestRefund({
      userAddress: user.walletAddress,
      appId: dutchMintAppId,
      escrowPrivateKey,
    })

    // Update queue requests status
    const queueRequestsSnapshot = await adminDb
      .collection('dutch_mint_queue')
      .where('marketplaceId', '==', marketplaceId)
      .where('userId', '==', auth.uid)
      .where('status', '==', 'pending')
      .get()

    for (const doc of queueRequestsSnapshot.docs) {
      await doc.ref.update({
        status: 'refunded',
        refundedAt: new Date(),
      })
    }

    // Encode transactions for client
    const encodedTransactions = transactions.map(txn => ({
      txn: Buffer.from(algosdk.encodeUnsignedTransaction(txn)).toString('base64'),
    }))

    return NextResponse.json({
      success: true,
      transactions: encodedTransactions,
      groupId,
      refundAmount: userEscrowed,
      refundAmountAlgos: userEscrowed / 1000000,
      message: "Refund transaction created. Please sign to receive your refund.",
    })
  } catch (error: any) {
    console.error("Error requesting refund:", error)
    return NextResponse.json({
      error: error.message || "Failed to request refund",
    }, { status: 500 })
  }
})

