import { NextRequest, NextResponse } from "next/server"
import { DutchMintContract } from "@/lib/algorand/dutch-mint-contract"
import { requireRole } from "@/lib/auth/middleware"
import algosdk from "algosdk"
import { adminDb } from "@/lib/firebase/admin"
import { WalletMintService } from "@/lib/algorand/wallet-mint-service"
import { FirebaseService } from "@/lib/firebase/collections"

// Trigger batch minting when threshold is met
export const POST = requireRole(["user", "merchant"])(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const auth = (request as any).auth
    const marketplaceId = params.id

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

    // Get user
    const userDoc = await adminDb.collection('users').doc(auth.uid).get()
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userDoc.data()
    if (!user?.walletAddress) {
      return NextResponse.json({ error: "User wallet address not found" }, { status: 400 })
    }

    // Check queue status
    const queueStatus = await DutchMintContract.getQueueStatus(dutchMintAppId)
    if (!queueStatus.canTrigger) {
      return NextResponse.json({
        error: "Cannot trigger minting. Threshold not met or queue not ready.",
        queueStatus,
      }, { status: 400 })
    }

    // Create trigger transaction
    const { transactions, groupId } = await DutchMintContract.triggerMint({
      callerAddress: user.walletAddress,
      appId: dutchMintAppId,
      escrowPrivateKey,
    })

    // Get all pending queue requests
    const queueRequestsSnapshot = await adminDb
      .collection('dutch_mint_queue')
      .where('marketplaceId', '==', marketplaceId)
      .where('status', '==', 'pending')
      .get()

    const queueRequests = queueRequestsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Encode transactions for client
    const encodedTransactions = transactions.map(txn => ({
      txn: Buffer.from(algosdk.encodeUnsignedTransaction(txn)).toString('base64'),
    }))

    return NextResponse.json({
      success: true,
      transactions: encodedTransactions,
      groupId,
      queueStatus,
      pendingRequests: queueRequests.length,
      message: "Trigger transaction created. After signing, batch minting will begin.",
    })
  } catch (error: any) {
    console.error("Error triggering mint:", error)
    return NextResponse.json({
      error: error.message || "Failed to trigger mint",
    }, { status: 500 })
  }
})

// Submit signed trigger transaction and execute batch minting
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

    // Get all pending queue requests
    const queueRequestsSnapshot = await adminDb
      .collection('dutch_mint_queue')
      .where('marketplaceId', '==', marketplaceId)
      .where('status', '==', 'pending')
      .get()

    const queueRequests = queueRequestsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Execute batch minting for all queued NFTs
    const mintResults = []
    const mintErrors = []

    for (const request of queueRequests) {
      try {
        // Get user for this request
        const requestUserDoc = await adminDb.collection('users').doc(request.userId).get()
        const requestUser = requestUserDoc.data()

        if (!requestUser?.walletAddress) {
          mintErrors.push({
            requestId: request.id,
            error: "User wallet address not found",
          })
          continue
        }

        // Mint each NFT in the request
        for (const nftId of request.nftIds) {
          try {
            const nft = await FirebaseService.getNFTById(nftId)
            if (!nft) {
              mintErrors.push({
                requestId: request.id,
                nftId,
                error: "NFT not found",
              })
              continue
            }

            // Check if already minted
            if (nft.assetId && nft.assetId > 0) {
              mintErrors.push({
                requestId: request.id,
                nftId,
                error: "NFT already minted",
              })
              continue
            }

            // Create mint transaction
            const metadata = {
              name: nft.metadata?.name || "NFT",
              description: nft.metadata?.description || "",
              image: nft.metadata?.image || "",
              attributes: nft.metadata?.traits || [],
            }

            const mintParams = {
              nftId,
              userAddress: requestUser.walletAddress,
              metadata,
              totalSupply: nft.maxSupply || 1,
              royaltyPercentage: nft.metadata?.royaltyFee || 5,
              royaltyRecipient: requestUser.walletAddress,
            }

            const { transaction } = await WalletMintService.createMintTransaction(mintParams)

            // Note: In production, you would batch these transactions or use a service account
            // For now, we'll mark them as ready for individual minting
            mintResults.push({
              requestId: request.id,
              nftId,
              status: 'ready',
              transaction: Buffer.from(algosdk.encodeUnsignedTransaction(transaction)).toString('base64'),
            })
          } catch (error: any) {
            mintErrors.push({
              requestId: request.id,
              nftId,
              error: error.message,
            })
          }
        }

        // Update request status
        await adminDb.collection('dutch_mint_queue').doc(request.id).update({
          status: 'processing',
          triggeredAt: new Date(),
          triggeredBy: auth.uid,
        })
      } catch (error: any) {
        mintErrors.push({
          requestId: request.id,
          error: error.message,
        })
      }
    }

    return NextResponse.json({
      success: true,
      transactionId: txId,
      mintResults,
      mintErrors,
      message: `Batch minting triggered. ${mintResults.length} NFTs ready for minting.`,
    })
  } catch (error: any) {
    console.error("Error submitting trigger transaction:", error)
    return NextResponse.json({
      error: error.message || "Failed to submit trigger transaction",
    }, { status: 500 })
  }
})

