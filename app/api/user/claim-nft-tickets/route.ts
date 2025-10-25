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

    try {
      const suggestedParams = await algodClient.getTransactionParams().do()
      const nftTransactions = []

      // Create NFT minting transactions for each ticket in the purchase
      for (let i = 0; i < purchase.quantity; i++) {
        // Create metadata for the NFT ticket
        const ticketMetadata = {
          name: `${event.title} - Ticket #${i + 1}`,
          description: `NFT Ticket for ${event.title} - ${event.description}`,
          image: event.imageUrl || '/placeholder.svg',
          attributes: [
            { trait_type: "Event", value: event.title },
            { trait_type: "Date", value: event.date },
            { trait_type: "Location", value: event.location },
            { trait_type: "Category", value: event.category },
            { trait_type: "Ticket Number", value: `${i + 1}` },
            { trait_type: "Event ID", value: event.id },
            { trait_type: "Price", value: event.price },
            { trait_type: "Purchase ID", value: purchaseId }
          ]
        }

        // Create NFT asset transaction
        const nftAsset = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
          sender: userAddress,
          suggestedParams,
          total: 1,
          decimals: 0,
          defaultFrozen: false,
          unitName: `${event.title.substring(0, 8).toUpperCase()}${i + 1}`,
          assetName: `${event.title} - Ticket #${i + 1}`,
          assetURL: event.imageUrl || '/placeholder.svg',
          manager: userAddress,
          reserve: userAddress,
          freeze: userAddress,
          clawback: userAddress,
          note: new TextEncoder().encode(`Event Ticket NFT: ${event.title} - Purchase: ${purchaseId}`)
        })

        // Convert to base64 for signing
        const unsignedTxn = nftAsset.toByte()
        const base64Txn = Buffer.from(unsignedTxn).toString('base64')

        nftTransactions.push({
          transaction: base64Txn,
          transactionId: nftAsset.txID(),
          metadata: ticketMetadata
        })
      }

      return NextResponse.json({
        success: true,
        nftTransactions: nftTransactions,
        purchase: {
          id: purchase.id,
          eventTitle: event.title,
          quantity: purchase.quantity,
          totalPrice: purchase.totalPrice
        },
        message: `Created ${purchase.quantity} NFT minting transaction(s) for ${event.title}`
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
