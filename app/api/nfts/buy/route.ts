import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { getAlgodClient, algosToMicroAlgos, APP_CONFIG, PLATFORM_CONFIG, isValidAlgorandAddress } from "@/lib/algorand/config"
import { requireAuth } from "@/lib/auth/middleware"
import { adminDb } from "@/lib/firebase/admin"
import algosdk from "algosdk"

// Helper function to check if buyer has opted in to an asset
async function hasOptedIn(address: string, assetId: number): Promise<boolean> {
  try {
    const algodClient = getAlgodClient()
    const accountInfo = await algodClient.accountInformation(address).do()
    const assets = accountInfo.assets || []
    return assets.some((asset: any) => asset['asset-id'] === assetId)
  } catch (error) {
    console.error("Error checking opt-in status:", error)
    return false
  }
}

// POST /api/nfts/buy - Create buy transaction group
export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const auth = (request as any).auth
    const { nftId, buyerWalletAddress } = await request.json()

    if (!nftId || !buyerWalletAddress) {
      return NextResponse.json(
        { error: "NFT ID and buyer wallet address are required" },
        { status: 400 }
      )
    }

    // Get NFT info
    const nft = await FirebaseService.getNFTById(nftId)
    if (!nft) {
      return NextResponse.json({ error: "NFT not found" }, { status: 404 })
    }

    // Check if NFT has assetId (already minted)
    if (!nft.assetId) {
      return NextResponse.json(
        { error: "NFT not yet minted on blockchain. Cannot purchase." },
        { status: 400 }
      )
    }

    // Check if NFT is for sale
    if (!nft.forSale || !nft.price) {
      return NextResponse.json(
        { error: "NFT is not available for purchase" },
        { status: 400 }
      )
    }

    // Check available supply
    if (nft.availableSupply !== undefined && nft.availableSupply <= 0) {
      return NextResponse.json(
        { error: "NFT is sold out" },
        { status: 400 }
      )
    }

    // Get buyer info (only if uid exists)
    let buyer = null
    if (auth?.uid) {
      buyer = await FirebaseService.getUserByUid(auth.uid)
    }

    // Get seller (current owner) info
    const sellerAddress = nft.ownerAddress || nft.ownerId
    if (!sellerAddress) {
      return NextResponse.json(
        { error: "Seller address not found" },
        { status: 400 }
      )
    }

    // Validate that buyer and seller are different
    if (buyerWalletAddress.toLowerCase() === sellerAddress.toLowerCase()) {
      return NextResponse.json(
        { error: "You cannot buy your own NFT" },
        { status: 400 }
      )
    }

    // Use NFT's own creator and royalty info (no collection lookup)
    const creatorAddress = nft.creatorAddress || nft.royaltyRecipient || sellerAddress
    const royaltyPercentage = nft.royaltyPercentage || 0

    // Get Algorand client
    const algodClient = getAlgodClient()
    const suggestedParams = await algodClient.getTransactionParams().do()

    // Calculate payment amount
    const totalPrice = algosToMicroAlgos(nft.price)
    const platformFee = Math.floor(totalPrice * (APP_CONFIG.platformFeePercentage / 100))
    const royaltyAmount = Math.floor(totalPrice * (royaltyPercentage / 100))
    const sellerAmount = totalPrice - platformFee - royaltyAmount

    const platformFeeAddress = PLATFORM_CONFIG.platformFeeAddress

    // Validate addresses
    if (!isValidAlgorandAddress(buyerWalletAddress)) {
      return NextResponse.json(
        { error: "Invalid buyer wallet address" },
        { status: 400 }
      )
    }

    if (!isValidAlgorandAddress(sellerAddress)) {
      return NextResponse.json(
        { error: "Invalid seller address" },
        { status: 400 }
      )
    }

    // Check if buyer needs to opt-in
    const needsOptIn = !(await hasOptedIn(buyerWalletAddress, nft.assetId))
    
    const transactions: algosdk.Transaction[] = []

    // 1. Opt-in transaction (if needed)
    if (needsOptIn) {
      const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        sender: buyerWalletAddress,
        receiver: buyerWalletAddress,
        amount: 0,
        assetIndex: nft.assetId,
        suggestedParams,
      })
      transactions.push(optInTxn)
    }

    // 2. Payment transaction from buyer to seller (MUST be first - seller receives payment)
    const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: buyerWalletAddress,
      receiver: sellerAddress,
      amount: sellerAmount,
      suggestedParams,
      note: new TextEncoder().encode(`NFT Purchase: ${nft?.metadata?.name || nftId}`),
    })
    transactions.push(paymentTxn)

    // 3. Payment transaction for platform fee (if applicable and valid address)
    if (platformFee > 0 && platformFeeAddress && 
        platformFeeAddress !== "PLATFORM_FEE_ADDRESS_NOT_SET" &&
        isValidAlgorandAddress(platformFeeAddress)) {
      const platformFeeTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: buyerWalletAddress,
        receiver: platformFeeAddress,
        amount: platformFee,
        suggestedParams,
        note: new TextEncoder().encode(`Platform Fee: NFT ${nftId}`),
      })
      transactions.push(platformFeeTxn)
    }

    // 4. Payment transaction for royalty (if applicable and valid address)
    if (royaltyAmount > 0 && creatorAddress && creatorAddress !== sellerAddress &&
        isValidAlgorandAddress(creatorAddress)) {
      const royaltyTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: buyerWalletAddress,
        receiver: creatorAddress,
        amount: royaltyAmount,
        suggestedParams,
        note: new TextEncoder().encode(`Royalty: NFT ${nftId}`),
      })
      transactions.push(royaltyTxn)
    }

    // 5. Asset transfer transaction from seller to buyer (AFTER payment is made)
    const assetTransferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: sellerAddress,
      receiver: buyerWalletAddress,
      amount: 1, // NFTs are non-divisible (amount = 1)
      assetIndex: nft.assetId,
      suggestedParams,
      note: new TextEncoder().encode(`NFT Transfer: ${nftId}`),
    })
    transactions.push(assetTransferTxn)

    // 6. Optional: Application call to marketplace smart contract (if app exists)
    if (APP_CONFIG.marketplaceAppId && APP_CONFIG.marketplaceAppId > 0) {
      try {
        const appArgs = [
          new TextEncoder().encode("buy"),
          algosdk.encodeUint64(nft.assetId),
          algosdk.encodeUint64(totalPrice),
          algosdk.decodeAddress(sellerAddress).publicKey,
          algosdk.decodeAddress(buyerWalletAddress).publicKey,
        ]

        const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
          sender: buyerWalletAddress,
          appIndex: APP_CONFIG.marketplaceAppId,
          onComplete: algosdk.OnApplicationComplete.NoOpOC,
          appArgs,
          suggestedParams,
        })
        
        // Insert app call before asset transfer (seller must sign asset transfer, buyer signs app call)
        transactions.splice(transactions.length - 1, 0, appCallTxn)
      } catch (error) {
        console.warn("Failed to create app call transaction:", error)
        // Continue without app call if it fails
      }
    }

    // Assign group ID to all transactions
    algosdk.assignGroupID(transactions)

    // Identify which transactions need buyer signature vs seller/escrow signature
    // Buyer signs: opt-in (if needed), payments, app call (if exists)
    // Seller/Escrow signs: asset transfer
    const buyerTransactionIndices: number[] = []
    const sellerTransactionIndices: number[] = []
    
    transactions.forEach((txn, index) => {
      const sender = algosdk.encodeAddress(txn.sender.publicKey)
      if (sender === buyerWalletAddress) {
        buyerTransactionIndices.push(index)
      } else {
        sellerTransactionIndices.push(index)
      }
    })

    // Convert transactions to base64 for signing
    const transactionsBase64 = transactions.map((txn) => {
      return Buffer.from(algosdk.encodeUnsignedTransaction(txn)).toString("base64")
    })

    return NextResponse.json({
      success: true,
      transactions: transactionsBase64,
      needsOptIn,
      buyerTransactionIndices,
      sellerTransactionIndices,
      sellerAddress,
      transactionInfo: {
        totalPrice: nft.price,
        sellerAmount: sellerAmount / 1000000,
        platformFee: platformFee / 1000000,
        royaltyAmount: royaltyAmount / 1000000,
        assetId: nft.assetId,
      },
    })
  } catch (error: any) {
    console.error("Error creating buy transaction:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create buy transaction" },
      { status: 500 }
    )
  }
})

// PUT /api/nfts/buy - Submit signed buy transactions
export const PUT = requireAuth(async (request: NextRequest) => {
  try {
    const auth = (request as any).auth
    const { 
      nftId, 
      signedTransactions, 
      buyerWalletAddress,
      transactionGroup, // Base64 encoded transaction group (for escrow signing)
      buyerTransactionIndices,
      sellerTransactionIndices
    } = await request.json()

    if (!nftId || !signedTransactions || !Array.isArray(signedTransactions)) {
      return NextResponse.json(
        { error: "NFT ID and signed transactions are required" },
        { status: 400 }
      )
    }

    // Get NFT info
    const nft = await FirebaseService.getNFTById(nftId)
    if (!nft) {
      return NextResponse.json({ error: "NFT not found" }, { status: 404 })
    }

    // Get buyer info (only if uid exists)
    let buyer = null
    if (auth?.uid) {
      buyer = await FirebaseService.getUserByUid(auth.uid)
    }

    const sellerAddress = nft.ownerAddress || nft.ownerId
    const escrowAddress = PLATFORM_CONFIG.platformEscrowAddress

    // Check if NFT is in escrow (platform-controlled account)
    // If so, we can sign the asset transfer transaction server-side
    const isInEscrow = sellerAddress === escrowAddress && escrowAddress !== "PLATFORM_ESCROW_ADDRESS_NOT_SET"

    let finalSignedTransactions: Uint8Array[]

    if (isInEscrow && process.env.ESCROW_PRIVATE_KEY && transactionGroup && sellerTransactionIndices) {
      // NFT is in escrow - Pera Wallet returns complete group with buyer transactions signed
      // We need to sign the seller transactions using the SAME group ID from Pera Wallet
      
      // Decode all transactions from Pera Wallet
      const allSignedTxnsFromWallet = signedTransactions.map((txn: string) =>
        Uint8Array.from(Buffer.from(txn, "base64"))
      )

      // Get original unsigned transactions for seller signing
      const allUnsignedTransactions = transactionGroup.map((txnBase64: string) =>
        algosdk.decodeUnsignedTransaction(Buffer.from(txnBase64, "base64"))
      )

      // Extract group ID from buyer's signed transaction (Pera Wallet preserves group structure)
      // We need to use the SAME group ID when signing seller transactions
      let groupId: Uint8Array | null = null
      if (buyerTransactionIndices && buyerTransactionIndices.length > 0) {
        const firstBuyerIdx = buyerTransactionIndices[0]
        const buyerSignedTxnBytes = allSignedTxnsFromWallet[firstBuyerIdx]
        if (buyerSignedTxnBytes) {
          try {
            const buyerSignedTxn = algosdk.decodeSignedTransaction(buyerSignedTxnBytes)
            groupId = buyerSignedTxn.txn.group || null
          } catch (error) {
            console.error("Failed to extract group ID from buyer transaction:", error)
          }
        }
      }

      // If we extracted group ID, apply it to all unsigned transactions before signing
      // Otherwise, reassign group ID (should match if Pera Wallet preserved it)
      if (groupId) {
        allUnsignedTransactions.forEach((txn: algosdk.Transaction) => {
          txn.group = groupId!
        })
      } else {
        algosdk.assignGroupID(allUnsignedTransactions)
      }

      // Sign seller transactions with escrow private key
      const escrowAccount = algosdk.mnemonicToSecretKey(process.env.ESCROW_PRIVATE_KEY)
      const finalSignedTxns: Uint8Array[] = []

      allUnsignedTransactions.forEach((unsignedTxn: algosdk.Transaction, index: number) => {
        if (buyerTransactionIndices && buyerTransactionIndices.includes(index)) {
          // Buyer transaction - use signed version from Pera Wallet
          finalSignedTxns.push(allSignedTxnsFromWallet[index])
        } else if (sellerTransactionIndices.includes(index)) {
          // Seller transaction - sign with escrow key (now has matching group ID)
          const signed = unsignedTxn.signTxn(escrowAccount.sk)
          finalSignedTxns.push(signed)
        } else {
          // Should not happen, but use wallet version as fallback
          finalSignedTxns.push(allSignedTxnsFromWallet[index])
        }
      })

      finalSignedTransactions = finalSignedTxns
    } else {
      // Direct peer-to-peer sale or non-escrow sale
      // Pera Wallet returns complete transaction group - buyer transactions are signed
      // Seller transactions may be signed (if seller pre-signed) or unsigned
      // Use the complete group as returned by Pera Wallet
      
      // Decode all signed transactions from Pera Wallet
      finalSignedTransactions = signedTransactions.map((txn: string) =>
        Uint8Array.from(Buffer.from(txn, "base64"))
      )
      
      // Check if seller transactions need signing
      // If not in escrow and seller transactions are unsigned, we can't proceed
      // But Pera Wallet should have returned them - try to submit as-is
      // The blockchain will reject if signatures are missing
    }

    // Submit transactions
    const algodClient = getAlgodClient()
    const result = await algodClient.sendRawTransaction(finalSignedTransactions).do()
    const txId = result.txid

    // Wait for confirmation
    await algosdk.waitForConfirmation(algodClient, txId, 4)

    // Update NFT ownership and sale status
    const updateData: any = {
      ownerAddress: buyerWalletAddress,
      forSale: false,
      updatedAt: new Date(),
    }

    // Only update ownerId if buyer info is available
    if (buyer?.id) {
      updateData.ownerId = buyer.id
    }

    // Update available supply if applicable
    if (nft.availableSupply !== undefined && nft.availableSupply > 0) {
      updateData.availableSupply = nft.availableSupply - 1
    }

    await FirebaseService.updateNFT(nftId, updateData)

    // Record purchase in history
    await adminDb.collection("nft_purchases").add({
      nftId,
      buyerId: buyer?.id || null,
      buyerAddress: buyerWalletAddress,
      sellerAddress: nft.ownerAddress,
      price: nft.price,
      assetId: nft.assetId,
      transactionId: txId,
      createdAt: new Date(),
      status: "completed",
    })

    return NextResponse.json({
      success: true,
      transactionId: txId,
      message: "NFT purchased successfully",
    })
  } catch (error: any) {
    console.error("Error submitting buy transaction:", error)
    return NextResponse.json(
      { error: error.message || "Failed to submit buy transaction" },
      { status: 500 }
    )
  }
})

