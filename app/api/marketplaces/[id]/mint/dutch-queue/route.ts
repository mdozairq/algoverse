import { NextRequest, NextResponse } from "next/server"
import { DutchMintContract } from "@/lib/algorand/dutch-mint-contract"
import { requireRole } from "@/lib/auth/middleware"
import algosdk from "algosdk"
import { adminDb } from "@/lib/firebase/admin"

// Get queue status (public - no auth required for read-only access)
export const GET = async (
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

    // Get user's escrowed amount if authenticated (optional)
    const auth = (request as any).auth
    let userEscrowed = 0
    let userEscrowedAlgos = 0
    
    // Try to get wallet address from query params or auth
    const walletAddress = request.nextUrl.searchParams.get('walletAddress')
    
    if (walletAddress) {
      // If wallet address is provided in query, use it directly
      try {
        userEscrowed = await DutchMintContract.getUserEscrowedAmount(
          walletAddress,
          dutchMintAppId
        )
        userEscrowedAlgos = userEscrowed / 1000000
      } catch (error) {
        // User might not have opted in yet, which is fine
        console.warn("Could not get user escrowed amount:", error)
      }
    } else if (auth?.userId || auth?.uid) {
      // Try to get from authenticated user
      try {
        const userId = auth.uid || auth.userId
        const user = await adminDb.collection('users').doc(userId).get()
        const userData = user.data()
        if (userData?.walletAddress) {
          userEscrowed = await DutchMintContract.getUserEscrowedAmount(
            userData.walletAddress,
            dutchMintAppId
          )
          userEscrowedAlgos = userEscrowed / 1000000
        }
      } catch (error) {
        // User might not exist or not have wallet, which is fine
        console.warn("Could not get user escrowed amount from auth:", error)
      }
    }

    return NextResponse.json({
      success: true,
      queueStatus: {
        ...queueStatus,
        userEscrowed,
        userEscrowedAlgos,
      },
    })
  } catch (error: any) {
    console.error("Error getting queue status:", error)
    return NextResponse.json({
      error: error.message || "Failed to get queue status",
    }, { status: 500 })
  }
}

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

    // Prevent marketplace owner/creator from joining the queue
    const marketplaceWalletAddress = marketplace?.walletAddress
    const platformAddress = dutchMintConfig?.platformAddress
    const configEscrowAddress = dutchMintConfig?.escrowAddress

    // Check if user is the marketplace owner or contract addresses
    if (
      userWalletAddress === marketplaceWalletAddress ||
      userWalletAddress === platformAddress ||
      userWalletAddress === configEscrowAddress
    ) {
      return NextResponse.json({
        error: "Marketplace owners and contract addresses cannot join the Dutch mint queue",
      }, { status: 403 })
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
      escrowAddress = configEscrowAddress
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

    // Check opt-in status and record in database
    const isOptedIn = await DutchMintContract.isOptedIn(userWalletAddress, dutchMintAppId)
    
    // Record opt-in status in database (create or update user opt-in record)
    try {
      const optInRef = adminDb.collection('dutch_mint_opt_ins').doc(`${userWalletAddress}_${dutchMintAppId}`)
      await optInRef.set({
        userAddress: userWalletAddress,
        appId: dutchMintAppId,
        marketplaceId,
        isOptedIn,
        lastChecked: new Date(),
        userId: auth?.uid || null,
      }, { merge: true })
    } catch (optInError) {
      console.warn("Failed to record opt-in status in database:", optInError)
      // Don't fail the request if database update fails
    }

    // Create join queue transaction with effective cost and escrow address
    const { transactions, groupId, needsOptIn } = await DutchMintContract.joinQueue({
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
      needsOptIn,
      isOptedIn, // Record the opt-in status at time of request
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
      needsOptIn, // Inform frontend if opt-in transaction is included
      message: needsOptIn 
        ? "Queue request created. Please sign transactions to opt-in and join the queue."
        : "Queue request created. Please sign transactions to join the queue.",
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

    let result
    let txId
    try {
      result = await algodClient.sendRawTransaction(signedTxns).do()
      txId = result.txid
    } catch (submitError: any) {
      // Check if error is due to account already opted in
      const errorMessage = submitError.message || submitError.body?.message || JSON.stringify(submitError)
      
      if (errorMessage.includes('already opted in') || errorMessage.includes('has already opted in')) {
        console.log("Account already opted in, retrying without opt-in transaction...")
        
        // Get queue request to check if it had opt-in
        if (queueRequestId) {
          const queueRequestDoc = await adminDb.collection('dutch_mint_queue').doc(queueRequestId).get()
          if (queueRequestDoc.exists) {
            const queueRequest = queueRequestDoc.data()
            const marketplaceId = queueRequest?.marketplaceId
            const userAddress = queueRequest?.userAddress
            const requestCount = queueRequest?.requestCount
            const nftIds = queueRequest?.nftIds || []
            
            if (marketplaceId && userAddress && requestCount) {
              // Get marketplace config
              const marketplaceDoc = await adminDb.collection('marketplaces').doc(marketplaceId).get()
              if (marketplaceDoc.exists) {
                const marketplace = marketplaceDoc.data()
                const dutchMintAppId = marketplace?.dutchMintAppId
                const dutchMintConfig = marketplace?.dutchMintConfig
                
                if (dutchMintAppId) {
                  // Get effective cost and escrow address
                  let effectiveCost: number
                  try {
                    effectiveCost = await DutchMintContract.getEffectiveCost(dutchMintAppId)
                  } catch (error) {
                    effectiveCost = dutchMintConfig?.effectiveCost 
                      ? Math.round(dutchMintConfig.effectiveCost * 1000000)
                      : 7000
                  }
                  
                  let escrowAddress: string | undefined
                  try {
                    escrowAddress = await DutchMintContract.getEscrowAddress(dutchMintAppId)
                  } catch (error) {
                    escrowAddress = dutchMintConfig?.escrowAddress
                  }
                  
                  if (escrowAddress) {
                    // Create new transaction group without opt-in
                    const { transactions: newTransactions, groupId: newGroupId } = await DutchMintContract.joinQueue({
                      userAddress,
                      requestCount,
                      appId: dutchMintAppId,
                      effectiveCost,
                      escrowAddress,
                    })
                    
                    // Update queue request with new group ID
                    await adminDb.collection('dutch_mint_queue').doc(queueRequestId).update({
                      groupId: newGroupId,
                      needsOptIn: false,
                      isOptedIn: true,
                      retryReason: 'already_opted_in',
                    })
                    
                    // Return new transactions to client
                    const encodedTransactions = newTransactions.map(txn => ({
                      txn: Buffer.from(algosdk.encodeUnsignedTransaction(txn)).toString('base64'),
                    }))
                    
                    return NextResponse.json({
                      success: true,
                      queueRequestId,
                      transactions: encodedTransactions,
                      groupId: newGroupId,
                      needsOptIn: false,
                      message: "Account is already opted in. Please sign the updated transactions to join the queue.",
                      retry: true,
                    }, { status: 200 })
                  }
                }
              }
            }
          }
        }
        
        // If we can't retry, return error
        return NextResponse.json({
          error: "Account is already opted in to this application. Please try again.",
          retry: true,
        }, { status: 400 })
      }
      
      // Re-throw other errors
      throw submitError
    }

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

