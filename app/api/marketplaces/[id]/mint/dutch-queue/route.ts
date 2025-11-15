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
    const { nftIds, requestCount, walletAddress } = await request.json()

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    if (!nftIds || !Array.isArray(nftIds) || nftIds.length === 0) {
      return NextResponse.json({ error: "NFT IDs are required" }, { status: 400 })
    }

    if (!requestCount || requestCount <= 0) {
      return NextResponse.json({ error: "Request count must be greater than 0" }, { status: 400 })
    }

    // Use walletAddress directly, or try to get from user if authenticated
    let userWalletAddress = walletAddress
    if (auth?.uid) {
      const userDoc = await adminDb.collection('users').doc(auth.uid).get()
      if (userDoc.exists) {
        const user = userDoc.data()
        if (user?.walletAddress) {
          userWalletAddress = user.walletAddress
        }
      }
    }

    // Get marketplace configuration
    const marketplaceDoc = await adminDb.collection('marketplaces').doc(marketplaceId).get()
    if (!marketplaceDoc.exists) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    const marketplace = marketplaceDoc.data()
    const dutchMintAppId = marketplace?.dutchMintAppId
    const dutchMintConfig = marketplace?.dutchMintConfig

    if (!dutchMintAppId) {
      return NextResponse.json({
        error: "Dutch mint contract not configured for this marketplace",
      }, { status: 404 })
    }

    // Get effective cost from contract, fallback to config if contract state not available
    let effectiveCost: number
    try {
      effectiveCost = await DutchMintContract.getEffectiveCost(dutchMintAppId)
    } catch (error) {
      // Fallback to config value (convert ALGO to microAlgos)
      effectiveCost = dutchMintConfig?.effectiveCost 
        ? Math.round(dutchMintConfig.effectiveCost * 1000000)
        : 7000 // Default: 0.007 ALGO
      // Only log if config is also missing
      if (!dutchMintConfig?.effectiveCost) {
        console.warn("Using default effective cost (0.007 ALGO) - contract state and config not available")
      }
    }

    // Get escrow address from contract, fallback to config if contract state not available
    let escrowAddress: string | undefined
    try {
      escrowAddress = await DutchMintContract.getEscrowAddress(dutchMintAppId)
    } catch (error) {
      // Fallback to config value
      escrowAddress = dutchMintConfig?.escrowAddress
      // Only log if config is also missing
      if (!escrowAddress) {
        console.warn("Escrow address not found in contract state or config")
      }
    }

    if (!escrowAddress) {
      return NextResponse.json({
        error: "Escrow address not found. Please ensure the contract is properly configured.",
      }, { status: 500 })
    }

    // Create join queue transaction with effective cost and escrow address
    const { transactions, groupId } = await DutchMintContract.joinQueue({
      userAddress: userWalletAddress,
      requestCount,
      appId: dutchMintAppId,
      effectiveCost, // Pass effective cost to avoid reading from contract again
      escrowAddress, // Pass escrow address to avoid reading from contract again
    })

    // Store queue request in database
    const queueRequestRef = await adminDb.collection('dutch_mint_queue').add({
      marketplaceId,
      userId: auth?.uid || null,
      userAddress: userWalletAddress,
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
    const { signedTransactions, queueRequestId } = await request.json()

    if (!signedTransactions || !Array.isArray(signedTransactions)) {
      return NextResponse.json({ error: "Signed transactions are required" }, { status: 400 })
    }

    // Wallet address is optional in PUT, but we need it for transaction verification
    // If not provided, try to get from authenticated user

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

    // Update queue request status if queueRequestId is provided
    if (queueRequestId && typeof queueRequestId === 'string' && queueRequestId.trim() !== '') {
      try {
        await adminDb.collection('dutch_mint_queue').doc(queueRequestId).update({
          status: 'confirmed',
          transactionId: txId,
          confirmedAt: new Date(),
        })
      } catch (updateError) {
        console.warn("Failed to update queue request status:", updateError)
        // Don't fail the request if update fails
      }
    }

    return NextResponse.json({
      success: true,
      transactionId: txId,
      message: "Successfully joined the queue",
    })
  } catch (error: any) {
    console.error("Error submitting join queue transaction:", error)
    
    // Provide helpful error message for insufficient balance
    let errorMessage = error.message || "Failed to submit transactions"
    if (errorMessage.includes("overspend") || errorMessage.includes("Insufficient balance")) {
      errorMessage = "Insufficient balance. Please fund your wallet with testnet ALGO from https://testnet.algoexplorer.io/dispenser"
    }
    
    return NextResponse.json({
      error: errorMessage,
    }, { status: 500 })
  }
})

