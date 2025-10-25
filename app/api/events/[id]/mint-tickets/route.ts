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

export const POST = requireRole(["user"])(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const auth = (request as any).auth
    const eventId = params.id
    const { userAddress, quantity = 1 } = await request.json()

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    }

    if (!userAddress) {
      return NextResponse.json({ error: "User wallet address is required" }, { status: 400 })
    }

    // Get event details
    const event = await FirebaseService.getEventById(eventId)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    try {
      const suggestedParams = await algodClient.getTransactionParams().do()
      const nftTransactions = []

      // Create NFT minting transactions for each ticket
      for (let i = 0; i < quantity; i++) {
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
            { trait_type: "Price", value: event.price }
          ]
        }

        // Create NFT asset transaction
        const nftAsset = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
          sender: userAddress, // User creates the NFT
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
          note: new TextEncoder().encode(`Event Ticket NFT: ${event.title}`)
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
        message: `Created ${quantity} NFT minting transaction(s) for ${event.title}`
      })

    } catch (error: any) {
      console.error('Error creating NFT minting transactions:', error)
      return NextResponse.json({ 
        error: "Failed to create NFT minting transactions" 
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error("Error in mint-tickets endpoint:", error)
    return NextResponse.json({ error: "Failed to process NFT minting" }, { status: 500 })
  }
})
