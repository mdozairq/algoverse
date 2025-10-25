import { NextRequest, NextResponse } from 'next/server'
import { FirebaseService } from '@/lib/firebase/collections'
import { requireRole } from '@/lib/auth/middleware'
import { walletService } from '@/lib/wallet/wallet-service'
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

    if (quantity < 1) {
      return NextResponse.json({ error: "Quantity must be at least 1" }, { status: 400 })
    }

    // Get event details
    const event = await FirebaseService.getEventById(eventId)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check if event is available for purchase
    if (event.status !== 'approved' && event.status !== 'minted') {
      return NextResponse.json({ 
        error: "Event is not available for purchase" 
      }, { status: 400 })
    }

    // Check available supply
    if (event.availableSupply < quantity) {
      return NextResponse.json({ 
        error: `Only ${event.availableSupply} tickets available, requested ${quantity}` 
      }, { status: 400 })
    }

    // Parse event price (assuming it's in ALGO)
    const pricePerTicket = parseFloat(event.price.replace(/[^\d.]/g, ''))
    if (isNaN(pricePerTicket) || pricePerTicket <= 0) {
      return NextResponse.json({ 
        error: "Invalid event price" 
      }, { status: 400 })
    }

    const totalPrice = pricePerTicket * quantity
    const totalPriceInMicroAlgos = Math.round(totalPrice * 1000000) // Convert to microAlgos

    // Check user balance
    const accountInfo = await WalletMintService.getAccountInfo(userAddress)
    const requiredBalance = totalPriceInMicroAlgos + 2000 // Price + fees
    if (accountInfo.balance < requiredBalance) {
      return NextResponse.json({ 
        error: `Insufficient balance. Required: ${totalPrice} ALGO, Available: ${accountInfo.balance / 1000000} ALGO` 
      }, { status: 400 })
    }

    try {
      // Create payment transaction to merchant
      const suggestedParams = await algodClient.getTransactionParams().do()
      
      // Get merchant info for payment
      const merchant = await FirebaseService.getMerchantById(event.merchantId)
      if (!merchant) {
        return NextResponse.json({ error: "Merchant not found" }, { status: 404 })
      }

      // Create payment transaction
      const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: userAddress,
        receiver: merchant.walletAddress || event.merchantId, // Use merchant's wallet address
        amount: totalPriceInMicroAlgos,
        suggestedParams: suggestedParams,
        note: new TextEncoder().encode(`Event Ticket Purchase: ${event.title}`)
      })

      // Convert to base64 for signing
      const unsignedTxn = paymentTxn.toByte()
      const base64Txn = Buffer.from(unsignedTxn).toString('base64')

      // Return transaction for signing
      return NextResponse.json({
        success: true,
        transaction: base64Txn,
        transactionId: paymentTxn.txID(),
        totalPrice: totalPrice,
        totalPriceInMicroAlgos: totalPriceInMicroAlgos,
        quantity: quantity,
        event: {
          id: event.id,
          title: event.title,
          price: event.price,
          availableSupply: event.availableSupply
        }
      })

    } catch (error: any) {
      console.error('Error creating purchase transaction:', error)
      return NextResponse.json({ 
        error: "Failed to create purchase transaction" 
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error("Error in purchase endpoint:", error)
    return NextResponse.json({ error: "Failed to process purchase" }, { status: 500 })
  }
})
