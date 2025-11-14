import { NextRequest, NextResponse } from "next/server"
import { DutchMintContract } from "@/lib/algorand/dutch-mint-contract"
import { requireRole } from "@/lib/auth/middleware"
import algosdk from "algosdk"
import { adminDb } from "@/lib/firebase/admin"

// Get queue status
export const GET = requireRole(["user", "merchant"])(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const marketplaceId = params.id

    // Get marketplace configuration
    const marketplaceDoc = await adminDb.collection('marketplaces').doc(marketplaceId).get()
    if (!marketplaceDoc.exists) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    const marketplace = marketplaceDoc.data()
    const dutchMintAppId = marketplace?.dutchMintAppId

    if (!dutchMintAppId) {
      return NextResponse.json({
        error: "Dutch mint contract not configured for this marketplace",
        queueStatus: null,
      }, { status: 404 })
    }

    // Get queue status from contract
    const queueStatus = await DutchMintContract.getQueueStatus(dutchMintAppId)

    // Get user's escrowed amount if authenticated
    const auth = (request as any).auth
    let userEscrowed = 0
    if (auth?.uid) {
      const user = await adminDb.collection('users').doc(auth.uid).get()
      const userData = user.data()
      if (userData?.walletAddress) {
        userEscrowed = await DutchMintContract.getUserEscrowedAmount(
          userData.walletAddress,
          dutchMintAppId
        )
      }
    }

    return NextResponse.json({
      success: true,
      queueStatus: {
        ...queueStatus,
        userEscrowed,
        userEscrowedAlgos: userEscrowed / 1000000,
      },
    })
  } catch (error: any) {
    console.error("Error getting queue status:", error)
    return NextResponse.json({
      error: error.message || "Failed to get queue status",
    }, { status: 500 })
  }
})

// Join queue
export const POST = requireRole(["user", "merchant"])(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const auth = (request as any).auth
    const marketplaceId = params.id
    const { nftIds, requestCount } = await request.json()

    if (!nftIds || !Array.isArray(nftIds) || nftIds.length === 0) {
      return NextResponse.json({ error: "NFT IDs are required" }, { status: 400 })
    }

    if (!requestCount || requestCount <= 0) {
      return NextResponse.json({ error: "Request count must be greater than 0" }, { status: 400 })
    }

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

    if (!dutchMintAppId) {
      return NextResponse.json({
        error: "Dutch mint contract not configured for this marketplace",
      }, { status: 404 })
    }

    // Create join queue transaction
    const { transactions, groupId } = await DutchMintContract.joinQueue({
      userAddress: user.walletAddress,
      requestCount,
      appId: dutchMintAppId,
    })

    // Store queue request in database
    const queueRequestRef = await adminDb.collection('dutch_mint_queue').add({
      marketplaceId,
      userId: auth.uid,
      userAddress: user.walletAddress,
      nftIds,
      requestCount,
      status: 'pending',
      createdAt: new Date(),
      groupId,
    })

    // Encode transactions for client
    const encodedTransactions = transactions.map(txn => ({
      txn: Buffer.from(algosdk.encodeUnsignedTransaction(txn)).toString('base64'),
    }))

    return NextResponse.json({
      success: true,
      queueRequestId: queueRequestRef.id,
      transactions: encodedTransactions,
      groupId,
      message: "Queue request created. Please sign transactions to join the queue.",
    })
  } catch (error: any) {
    console.error("Error joining queue:", error)
    return NextResponse.json({
      error: error.message || "Failed to join queue",
    }, { status: 500 })
  }
})

// Submit signed join queue transactions
export const PUT = requireRole(["user", "merchant"])(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const auth = (request as any).auth
    const marketplaceId = params.id
    const { signedTransactions } = await request.json()

    if (!signedTransactions || !Array.isArray(signedTransactions)) {
      return NextResponse.json({ error: "Signed transactions are required" }, { status: 400 })
    }

    // Submit signed transactions
    const algodClient = await import('algosdk').then(m => {
      const { getAlgodClient } = require('@/lib/algorand/config')
      return getAlgodClient()
    })

    const signedTxns = signedTransactions.map((tx: string) => 
      new Uint8Array(Buffer.from(tx, 'base64'))
    )

    const result = await algodClient.sendRawTransaction(signedTxns).do()
    const txId = result.txid

    // Wait for confirmation
    await algosdk.waitForConfirmation(algodClient, txId, 4)

    return NextResponse.json({
      success: true,
      transactionId: txId,
      message: "Successfully joined the queue",
    })
  } catch (error: any) {
    console.error("Error submitting join queue transaction:", error)
    return NextResponse.json({
      error: error.message || "Failed to submit transactions",
    }, { status: 500 })
  }
})

