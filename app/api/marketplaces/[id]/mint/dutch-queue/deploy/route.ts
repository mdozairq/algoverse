import { NextRequest, NextResponse } from "next/server"
import { DutchMintContract } from "@/lib/algorand/dutch-mint-contract"
import { requireRole } from "@/lib/auth/middleware"
import { adminDb } from "@/lib/firebase/admin"
import algosdk from "algosdk"

// Create deployment transaction (unsigned) - for wallet signing
export const POST = requireRole(["admin", "merchant"])(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const auth = (request as any).auth
    const marketplaceId = params.id
    const body = await request.json()

    // Get marketplace
    const marketplaceDoc = await adminDb.collection('marketplaces').doc(marketplaceId).get()
    if (!marketplaceDoc.exists) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    const marketplace = marketplaceDoc.data()

    // Validate required fields
    const {
      creatorAddress, // Wallet address (from connected wallet)
      threshold = 100,
      baseCost = 0.01, // ALGO
      effectiveCost = 0.007, // ALGO (30% discount)
      platformAddress,
      escrowAddress,
      timeWindow = 86400, // 24 hours in seconds
      signedTransaction, // If provided, this is the signed transaction to submit
      deleteExisting, // If true, delete existing contract first
      existingAppId, // App ID of existing contract to delete
    } = body

    // Handle deletion of existing contract
    if (deleteExisting && existingAppId) {
      if (!creatorAddress) {
        return NextResponse.json({ error: "Creator address is required" }, { status: 400 })
      }

      if (!algosdk.isValidAddress(creatorAddress)) {
        return NextResponse.json({ error: "Invalid creator address" }, { status: 400 })
      }

      // If signedTransaction is provided, submit the delete transaction
      if (signedTransaction) {
        const { getAlgodClient } = await import('@/lib/algorand/config')
        const algodClient = getAlgodClient()
        
        const signedTxnBytes = new Uint8Array(Buffer.from(signedTransaction, 'base64'))
        const result = await algodClient.sendRawTransaction(signedTxnBytes).do()
        const txId = result.txid
        
        // Wait for confirmation
        await algosdk.waitForConfirmation(algodClient, txId, 4)

        // Clear the appId from Firestore
        await adminDb.collection('marketplaces').doc(marketplaceId).update({
          dutchMintAppId: null,
          updatedAt: new Date(),
        })

        return NextResponse.json({
          success: true,
          transactionId: txId,
          message: "Existing contract deleted successfully. You can now deploy a new contract.",
        })
      }

      // Create unsigned delete transaction
      const { getAlgodClient } = await import('@/lib/algorand/config')
      const algodClient = getAlgodClient()
      const suggestedParams = await algodClient.getTransactionParams().do()

      const deleteTxn = algosdk.makeApplicationDeleteTxnFromObject({
        sender: creatorAddress,
        suggestedParams,
        appIndex: existingAppId,
      })

      const deleteTxnBytes = deleteTxn.toByte()
      const deleteTxnBase64 = Buffer.from(deleteTxnBytes).toString('base64')

      return NextResponse.json({
        success: true,
        transaction: deleteTxnBase64,
        transactionId: deleteTxn.txID(),
        message: "Please sign the deletion transaction to delete the existing contract.",
        type: "delete",
      })
    }

    // If signedTransaction is provided, submit it
    if (signedTransaction) {
      const { getAlgodClient } = await import('@/lib/algorand/config')
      const algodClient = getAlgodClient()
      
      const signedTxnBytes = new Uint8Array(Buffer.from(signedTransaction, 'base64'))
      const result = await algodClient.sendRawTransaction(signedTxnBytes).do()
      const txId = result.txid
      
      // Wait for confirmation
      const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4)
      const appId = Number(confirmedTxn.applicationIndex)

      // Create initialization transaction (unsigned) - user needs to sign this too
      const initParams = await algodClient.getTransactionParams().do()
      const initTxn = algosdk.makeApplicationNoOpTxnFromObject({
        sender: creatorAddress,
        suggestedParams: initParams,
        appIndex: appId,
        appArgs: [new Uint8Array(Buffer.from("init"))], // "init" as ASCII bytes
      })

      const initTxnBytes = initTxn.toByte()
      const initTxnBase64 = Buffer.from(initTxnBytes).toString('base64')

      // Update marketplace with appId (even though init is pending)
      const updateData: any = {
        dutchMintAppId: appId,
        dutchMintConfig: {
          threshold,
          baseCost,
          effectiveCost,
          platformAddress,
          escrowAddress,
          timeWindow,
          deployedAt: new Date(),
        },
        updatedAt: new Date(),
      }

      // Only add deployedBy if auth.userId exists
      if (auth?.userId) {
        updateData.dutchMintConfig.deployedBy = auth.userId
      }

      await adminDb.collection('marketplaces').doc(marketplaceId).update(updateData)

      return NextResponse.json({
        success: true,
        appId,
        transactionId: txId,
        initTransaction: initTxnBase64,
        initTransactionId: initTxn.txID(),
        message: "Dutch mint contract deployed successfully. Please sign the initialization transaction.",
      })
    }

    // Otherwise, create unsigned transaction for wallet signing
    if (!creatorAddress) {
      return NextResponse.json({ error: "Creator address is required" }, { status: 400 })
    }

    if (!platformAddress || !escrowAddress) {
      return NextResponse.json({ 
        error: "Platform address and escrow address are required" 
      }, { status: 400 })
    }

    // Validate addresses
    if (!algosdk.isValidAddress(platformAddress)) {
      return NextResponse.json({ error: "Invalid platform address" }, { status: 400 })
    }

    if (!algosdk.isValidAddress(escrowAddress)) {
      return NextResponse.json({ error: "Invalid escrow address" }, { status: 400 })
    }

    if (!algosdk.isValidAddress(creatorAddress)) {
      return NextResponse.json({ error: "Invalid creator address" }, { status: 400 })
    }

    // Create unsigned deployment transaction
    const { getAlgodClient } = await import('@/lib/algorand/config')
    const algodClient = getAlgodClient()
    const fs = await import('fs/promises')
    const path = await import('path')

    // Read and compile TEAL programs
    const approvalProgramPath = path.join(process.cwd(), 'contracts', 'dutch-mint', 'approval.teal')
    const clearProgramPath = path.join(process.cwd(), 'contracts', 'dutch-mint', 'clear.teal')
    
    const approvalProgram = await fs.readFile(approvalProgramPath, 'utf-8')
    const clearProgram = await fs.readFile(clearProgramPath, 'utf-8')

    const approvalCompiled = await algodClient.compile(approvalProgram).do()
    const clearCompiled = await algodClient.compile(clearProgram).do()

    const approvalProgramBytes = new Uint8Array(Buffer.from(approvalCompiled.result, "base64"))
    const clearProgramBytes = new Uint8Array(Buffer.from(clearCompiled.result, "base64"))

    const suggestedParams = await algodClient.getTransactionParams().do()

    // Helper function
    const algosToMicroAlgos = (algos: number): number => Math.round(algos * 1000000)

    // Create application creation transaction (unsigned)
    const appCreateTxn = algosdk.makeApplicationCreateTxnFromObject({
      sender: creatorAddress,
      suggestedParams,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      approvalProgram: approvalProgramBytes,
      clearProgram: clearProgramBytes,
      numGlobalByteSlices: 2,
      numGlobalInts: 7,
      numLocalByteSlices: 0,
      numLocalInts: 2,
      appArgs: [
        new Uint8Array(Buffer.from("init")), // "init" as ASCII bytes (used during creation, not as method call)
        algosdk.encodeUint64(threshold),
        algosdk.encodeUint64(algosToMicroAlgos(baseCost)),
        algosdk.encodeUint64(algosToMicroAlgos(effectiveCost)),
        algosdk.decodeAddress(platformAddress).publicKey,
        algosdk.decodeAddress(escrowAddress).publicKey,
        algosdk.encodeUint64(timeWindow),
      ],
    })

    // Convert to base64 for frontend
    const unsignedTxnBytes = appCreateTxn.toByte()
    const unsignedTxnBase64 = Buffer.from(unsignedTxnBytes).toString('base64')

    return NextResponse.json({
      transaction: unsignedTxnBase64,
      transactionId: appCreateTxn.txID(),
      config: {
        threshold,
        baseCost,
        effectiveCost,
        platformAddress,
        escrowAddress,
        timeWindow,
      },
    })
  } catch (error: any) {
    console.error("Error creating deployment transaction:", error)
    return NextResponse.json({
      error: error.message || "Failed to create deployment transaction",
      details: error.toString(),
    }, { status: 500 })
  }
})

// Get deployment status (public - no auth required for read-only)
export const GET = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const marketplaceId = params.id

    const marketplaceDoc = await adminDb.collection('marketplaces').doc(marketplaceId).get()
    if (!marketplaceDoc.exists) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    const marketplace = marketplaceDoc.data()
    const dutchMintAppId = marketplace?.dutchMintAppId
    const dutchMintConfig = marketplace?.dutchMintConfig

    if (!dutchMintAppId) {
      return NextResponse.json({
        configured: false,
        message: "Dutch mint contract not configured",
      })
    }

    // Get current queue status
    let queueStatus = null
    try {
      queueStatus = await DutchMintContract.getQueueStatus(dutchMintAppId)
    } catch (error) {
      console.error("Error getting queue status:", error)
    }

    return NextResponse.json({
      configured: true,
      appId: dutchMintAppId,
      config: dutchMintConfig,
      queueStatus,
    })
  } catch (error: any) {
    console.error("Error getting deployment status:", error)
    return NextResponse.json({
      error: error.message || "Failed to get deployment status",
    }, { status: 500 })
  }
}

