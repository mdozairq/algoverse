import { NextRequest, NextResponse } from 'next/server'
import { WalletMintService } from '@/lib/algorand/wallet-mint-service'
import { uploadMetadataToIPFS } from '@/lib/ipfs'
import { FirebaseService } from '@/lib/firebase/collections'
import { requireRole } from '@/lib/auth/middleware'
import algosdk from 'algosdk'

export const POST = requireRole(["merchant"])(async (request: NextRequest) => {
  try {
    const auth = (request as any).auth
    const {
      eventId,
      eventName,
      eventDescription,
      eventCategory,
      imageUrl,
      ticketTiers,
      enableResale,
      royaltyFee,
      userAddress // User's wallet address for minting
    } = await request.json()

    // Validate required fields
    if (!eventId || !eventName || !eventDescription || !imageUrl) {
      return NextResponse.json({ 
        error: "Missing required fields: eventId, eventName, eventDescription, imageUrl" 
      }, { status: 400 })
    }

    if (!userAddress) {
      return NextResponse.json({ 
        error: "User wallet address is required for minting" 
      }, { status: 400 })
    }

    // Get merchant info
    const merchant = await FirebaseService.getMerchantById(auth.userId)
    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 })
    }

    // Validate ticket tiers
    if (!ticketTiers || !Array.isArray(ticketTiers) || ticketTiers.length === 0) {
      return NextResponse.json({ 
        error: "Ticket tiers are required" 
      }, { status: 400 })
    }

    // Validate each tier and calculate total supply
    let totalSupply = 0
    for (const tier of ticketTiers) {
      if (!tier.name || !tier.price || tier.quantity === undefined) {
        return NextResponse.json({ 
          error: `Invalid ticket tier: ${JSON.stringify(tier)}. Each tier must have name, price, and quantity.` 
        }, { status: 400 })
      }
      
      const tierQuantity = Number(tier.quantity)
      if (tierQuantity <= 0) {
        return NextResponse.json({ 
          error: `Invalid quantity for tier "${tier.name}": ${tierQuantity}. Quantity must be greater than 0.` 
        }, { status: 400 })
      }
      
      totalSupply += tierQuantity
    }
    
    if (totalSupply === 0) {
      return NextResponse.json({ 
        error: "Total supply must be greater than 0" 
      }, { status: 400 })
    }

    // Check account balance first
    const balanceCheck = await WalletMintService.checkAccountBalance(userAddress)
    
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

    // Create NFT metadata
    const metadata = {
      name: `${eventName} - Event NFT`,
      description: eventDescription,
      image: imageUrl,
      attributes: [
        {
          trait_type: "Event Name",
          value: eventName
        },
        {
          trait_type: "Category",
          value: eventCategory
        },
        {
          trait_type: "Total Supply",
          value: totalSupply.toString()
        },
        {
          trait_type: "Resale Enabled",
          value: enableResale.toString()
        },
        {
          trait_type: "Royalty Fee",
          value: `${royaltyFee}%`
        }
      ]
    }

    // Create mint transaction using wallet-based approach
    const mintParams = {
      nftId: eventId, // Use eventId as nftId for the mint service
      userAddress: userAddress,
      metadata
    }

    const { transaction, transactionId } = await WalletMintService.createMintTransaction(mintParams)

    // Return transaction for client to sign (like NFT creation form)
    return NextResponse.json({
      success: true,
      transaction: {
        // Return the unsigned transaction bytes for signing
        txn: Buffer.from(algosdk.encodeUnsignedTransaction(transaction)).toString('base64'),
        message: "Transaction created. Please sign with your wallet to complete minting."
      },
      transactionId,
      message: "Transaction ready for signing",
      eventId,
      totalSupply
    })

  } catch (error: any) {
    console.error("Error creating mint transaction:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to create mint transaction",
      details: error.toString()
    }, { status: 500 })
  }
})

// PUT endpoint to submit signed transaction (like NFT creation form)
export const PUT = requireRole(["merchant"])(async (request: NextRequest) => {
  try {
    const auth = (request as any).auth
    const {
      eventId,
      signedTransaction
    } = await request.json()

    if (!eventId || !signedTransaction) {
      return NextResponse.json({ 
        error: "Missing required fields: eventId, signedTransaction" 
      }, { status: 400 })
    }

    // Submit signed transaction
    const result = await WalletMintService.submitSignedTransaction(
      Buffer.from(signedTransaction, 'base64')
    )

    // Get event details for updating
    const event = await FirebaseService.getEventById(eventId)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Update event with NFT details
    await FirebaseService.updateEvent(eventId, {
      assetId: result.assetId,
      transactionId: result.transactionId,
      status: "minted",
      nftCreated: true,
      nftCreatedAt: new Date(),
      nftAssetId: result.assetId,
      nftAssetName: `${event.title} - Event NFT`,
      nftUnitName: "EVENT",
      updatedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      assetId: result.assetId,
      transactionId: result.transactionId,
      message: "Event NFTs minted successfully"
    })

  } catch (error: any) {
    console.error("Error submitting signed transaction:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to submit signed transaction",
      details: error.toString()
    }, { status: 500 })
  }
})
