import { NextRequest, NextResponse } from 'next/server'
import { FirebaseService } from '@/lib/firebase/collections'
import { requireRole } from '@/lib/auth/middleware'
import { WalletMintService } from '@/lib/algorand/wallet-mint-service'
import algosdk from 'algosdk'

// Algorand configuration
const ALGOD_TOKEN = process.env.ALGOD_TOKEN || ''
const ALGOD_SERVER = process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud'
const ALGOD_PORT = parseInt(process.env.ALGOD_PORT || '443') || 443

const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT)

export const POST = requireRole(["user"])(async (request: NextRequest) => {
  try {
    const auth = (request as any).auth
    const { userAddress, purchaseId } = await request.json()

    if (!userAddress) {
      return NextResponse.json({ error: "User wallet address is required" }, { status: 400 })
    }

    if (!purchaseId) {
      return NextResponse.json({ error: "Purchase ID is required" }, { status: 400 })
    }

    // Get purchase details
    const purchase = await FirebaseService.getPurchaseById(purchaseId)
    if (!purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 })
    }

    // Verify the purchase belongs to the user
    if (purchase.userId !== auth.userId) {
      return NextResponse.json({ error: "Unauthorized access to purchase" }, { status: 403 })
    }

    // Get event details
    const event = await FirebaseService.getEventById(purchase.eventId)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Add balance check like the minting flow
    const balanceCheck = await WalletMintService.checkAccountBalance(userAddress)
    
    if (!balanceCheck.hasSufficientBalance) {
      return NextResponse.json({
        success: false,
        error: "Insufficient balance for NFT minting",
        details: {
          currentBalance: balanceCheck.currentBalance,
          requiredBalance: balanceCheck.requiredBalance,
          dispenserUrl: balanceCheck.dispenserUrl,
          message: `Your account has ${balanceCheck.currentBalance} microAlgos but needs at least ${balanceCheck.requiredBalance} microAlgos to mint NFTs. Please fund your account using the testnet dispenser.`
        }
      }, { status: 400 })
    }

    try {
      const suggestedParams = await algodClient.getTransactionParams().do()

      // Create a single NFT asset with total supply equal to the number of tickets
      const ticketMetadata = {
        name: `${event.title} - Event Tickets`,
        description: `NFT Tickets for ${event.title} - ${event.description}`,
        image: event.imageUrl || 'https://example.com/placeholder.svg',
        attributes: [
          { trait_type: "Event", value: event.title },
          { trait_type: "Date", value: event.date },
          { trait_type: "Location", value: event.location },
          { trait_type: "Category", value: event.category },
          { trait_type: "Total Tickets", value: purchase.quantity.toString() },
          { trait_type: "Event ID", value: event.id },
          { trait_type: "Price", value: event.price },
          { trait_type: "Purchase ID", value: purchaseId }
        ]
      }

      // Create single NFT asset with total supply equal to number of tickets
      const nftAsset = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        sender: userAddress,
        suggestedParams,
        total: purchase.quantity, // Total supply = number of tickets
        decimals: 0,
        defaultFrozen: false,
        unitName: `${event.title.substring(0, 6).toUpperCase()}TK`, // Ensure <= 8 chars
        assetName: `${event.title} - Tickets`.substring(0, 32), // Ensure <= 32 chars
        assetURL: event.imageUrl || 'https://example.com/placeholder.svg',
        manager: userAddress,
        reserve: userAddress,
        freeze: userAddress,
        clawback: userAddress,
        note: new TextEncoder().encode(`Event Ticket NFTs: ${event.title} - Purchase: ${purchaseId}`)
      })

      // Convert to base64 using the same method as marketplace create API
      const base64Txn = Buffer.from(algosdk.encodeUnsignedTransaction(nftAsset)).toString('base64')

      // Return single transaction instead of multiple
      const nftTransaction = {
        transaction: base64Txn,
        transactionId: nftAsset.txID(),
        metadata: ticketMetadata,
        totalSupply: purchase.quantity
      }

      return NextResponse.json({
        success: true,
        nftTransaction: nftTransaction, // Single transaction instead of array
        purchase: {
          id: purchase.id,
          eventTitle: event.title,
          quantity: purchase.quantity,
          totalPrice: purchase.totalPrice
        },
        message: `Created NFT asset with ${purchase.quantity} ticket units for ${event.title}`
      })

    } catch (error: any) {
      console.error('Error creating NFT minting transactions:', error)
      return NextResponse.json({ 
        error: "Failed to create NFT minting transactions" 
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error("Error in claim-nft-tickets endpoint:", error)
    return NextResponse.json({ error: "Failed to process NFT ticket claiming" }, { status: 500 })
  }
})
