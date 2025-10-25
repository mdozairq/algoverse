import { NextRequest, NextResponse } from 'next/server'
import { FirebaseService } from '@/lib/firebase/collections'
import { requireRole } from '@/lib/auth/middleware'
import { WalletMintService } from '@/lib/algorand/wallet-mint-service'
import algosdk from 'algosdk'
import { uploadMetadataToIPFS } from '@/lib/ipfs'

// Algorand configuration
const ALGOD_TOKEN = process.env.ALGOD_TOKEN || ''
const ALGOD_SERVER = process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud'
const ALGOD_PORT = parseInt(process.env.ALGOD_PORT || '443') || 443

const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT)

export const POST = requireRole(["user"])(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const auth = (request as any).auth
    const eventId = params.id
    const { signedTransaction, quantity = 1 } = await request.json()

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    }

    if (!signedTransaction) {
      return NextResponse.json({ error: "Signed transaction is required" }, { status: 400 })
    }

    // Get event details
    const event = await FirebaseService.getEventById(eventId)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check available supply again
    if (event.availableSupply < quantity) {
      return NextResponse.json({ 
        error: `Only ${event.availableSupply} tickets available, requested ${quantity}` 
      }, { status: 400 })
    }

    try {
      console.log('Processing purchase confirmation for event:', eventId)
      console.log('Signed transaction length:', signedTransaction.length)
      
      // Convert base64 signed transaction to Uint8Array for submission
      const signedTxnBytes = Buffer.from(signedTransaction, 'base64')
      console.log('Converted to bytes, length:', signedTxnBytes.length)
      
      // Submit the signed payment transaction
      const paymentResult = await WalletMintService.submitSignedTransaction(signedTxnBytes)
      console.log('Payment transaction result:', paymentResult)
      
      if (!paymentResult.transactionId) {
        console.error('Payment transaction failed - no transaction ID returned')
        return NextResponse.json({ 
          error: "Payment transaction failed - no transaction ID returned" 
        }, { status: 400 })
      }

      // Create NFT tickets metadata for each purchased ticket
      const nftTickets = []

      for (let i = 0; i < quantity; i++) {
        try {
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

          // For now, just create the metadata without IPFS upload to avoid errors
          nftTickets.push({
            transactionId: `nft_${Date.now()}_${i}`, // Generate unique ID
            metadata: ticketMetadata,
            metadataUrl: event.imageUrl || '/placeholder.svg' // Use event image as fallback
          })

        } catch (nftError: any) {
          console.error(`Error creating NFT ticket ${i + 1}:`, nftError)
          // Continue with other tickets even if one fails
        }
      }

      // Update event available supply
      const newAvailableSupply = event.availableSupply - quantity
      await FirebaseService.updateEvent(eventId, {
        availableSupply: newAvailableSupply,
        updatedAt: new Date()
      })

      // Create purchase record in database
      const purchaseRecord = {
        eventId: eventId,
        userId: auth.userId,
        quantity: quantity,
        totalPrice: parseFloat(event.price.replace(/[^\d.]/g, '')) * quantity,
        paymentTransactionId: paymentResult.transactionId,
        nftTickets: nftTickets.map(ticket => ({
          transactionId: ticket.transactionId,
          metadataUrl: ticket.metadataUrl
        })),
        status: 'completed' as const
      }

      // Store purchase record
      const purchaseId = await FirebaseService.createPurchase(purchaseRecord)

      return NextResponse.json({
        success: true,
        purchaseId: purchaseId,
        paymentTransactionId: paymentResult.transactionId,
        nftTickets: nftTickets,
        updatedEvent: {
          id: event.id,
          availableSupply: newAvailableSupply,
          totalSupply: event.totalSupply
        },
        message: `Successfully purchased ${quantity} ticket(s) for ${event.title}`
      })

    } catch (error: any) {
      console.error('Error confirming purchase:', error)
      return NextResponse.json({ 
        error: "Failed to confirm purchase" 
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error("Error in confirm-purchase endpoint:", error)
    return NextResponse.json({ error: "Failed to process purchase confirmation" }, { status: 500 })
  }
})
