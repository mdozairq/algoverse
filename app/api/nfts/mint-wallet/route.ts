import { NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { WalletMintService } from "@/lib/algorand/wallet-mint-service"
import { requireRole } from "@/lib/auth/middleware"
import algosdk from "algosdk"

export const POST = requireRole(["user", "merchant"])(async (request: NextRequest) => {
  try {
    const auth = (request as any).auth
    const mintData = await request.json()

    // Validate required fields
    if (!mintData.nftId) {
      return NextResponse.json({ error: "NFT ID is required" }, { status: 400 })
    }

    if (!mintData.userAddress) {
      return NextResponse.json({ error: "User address is required" }, { status: 400 })
    }

    // Get NFT details from database
    const nft = await FirebaseService.getNFTById(mintData.nftId)
    if (!nft) {
      return NextResponse.json({ error: "NFT not found" }, { status: 404 })
    }

    // Check if NFT is already minted
    if (nft.assetId && nft.assetId > 0) {
      return NextResponse.json({ error: "NFT is already minted on blockchain" }, { status: 400 })
    }

    // Prepare metadata for Algorand
    const metadata = {
      name: nft.metadata?.name || "NFT",
      description: nft.metadata?.description || "",
      image: nft.metadata?.image || "",
      attributes: nft.metadata?.traits || []
    }

    // Check account balance first
    const balanceCheck = await WalletMintService.checkAccountBalance(mintData.userAddress)
    
    if (!balanceCheck.hasSufficientBalance) {
      return NextResponse.json({
        success: false,
        error: "Insufficient balance",
        details: {
          currentBalance: balanceCheck.currentBalance,
          requiredBalance: balanceCheck.requiredBalance,
          dispenserUrl: balanceCheck.dispenserUrl,
          message: `Your account has ${balanceCheck.currentBalance} microAlgos but needs at least ${balanceCheck.requiredBalance} microAlgos to mint an NFT. Please fund your account using the testnet dispenser.`
        }
      }, { status: 400 })
    }

    // Create mint transaction
    const mintParams = {
      nftId: mintData.nftId,
      userAddress: mintData.userAddress,
      metadata
    }

    const { transaction, transactionId } = await WalletMintService.createMintTransaction(mintParams)

    // Return transaction for client to sign
    return NextResponse.json({
      success: true,
      transaction: {
        // Return the unsigned transaction bytes for signing
        txn: Buffer.from(algosdk.encodeUnsignedTransaction(transaction)).toString('base64'),
        message: "Transaction created. Please sign with your wallet to complete minting."
      },
      transactionId,
      message: "Transaction ready for signing"
    })
  } catch (error: any) {
    console.error("Error creating mint transaction:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to create mint transaction",
      details: error.toString()
    }, { status: 500 })
  }
})

export const PUT = requireRole(["user", "merchant"])(async (request: NextRequest) => {
  try {
    const auth = (request as any).auth
    const submitData = await request.json()

    // Validate required fields
    if (!submitData.signedTransaction) {
      return NextResponse.json({ error: "Signed transaction is required" }, { status: 400 })
    }

    if (!submitData.nftId) {
      return NextResponse.json({ error: "NFT ID is required" }, { status: 400 })
    }

    // Convert base64 signed transaction back to Uint8Array
    const signedTxn = new Uint8Array(Buffer.from(submitData.signedTransaction, 'base64'))

    // Submit signed transaction to network
    const result = await WalletMintService.submitSignedTransaction(signedTxn)

    // Update NFT in database with blockchain details
    await FirebaseService.updateNFT(submitData.nftId, {
      assetId: result.assetId,
      transactionId: result.transactionId,
      status: "minted"
    })

    return NextResponse.json({
      success: true,
      assetId: result.assetId,
      transactionId: result.transactionId,
      message: "NFT minted successfully on Algorand blockchain"
    })
  } catch (error: any) {
    console.error("Error submitting mint transaction:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to submit mint transaction",
      details: error.toString()
    }, { status: 500 })
  }
})
