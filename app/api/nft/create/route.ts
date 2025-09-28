import { type NextRequest, NextResponse } from "next/server"
import { AlgorandNFTService, type NFTCreationParams } from "../../../../lib/algorand"
import { verifyAuthToken } from "@/lib/auth/middleware"
import { FirebaseService } from "@/lib/firebase/collections"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuthToken(request)
    if (!auth || !auth.uid || (auth.role !== "merchant" && auth.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      eventId,
      metadata,
      totalSupply,
      unitName,
      assetName,
      url,
      royaltyPercentage = 0
    } = await request.json()

    // Validate required fields
    if (!eventId || !metadata || !totalSupply || !unitName || !assetName) {
      return NextResponse.json({ 
        error: "Missing required fields: eventId, metadata, totalSupply, unitName, assetName" 
      }, { status: 400 })
    }

    // Get merchant details
    const merchant = await FirebaseService.getMerchantByUid(auth.uid)
    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 })
    }

    // Get event details
    const event = await FirebaseService.getEventById(eventId)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Verify merchant owns the event
    if (event.merchantId !== merchant.id) {
      return NextResponse.json({ error: "Unauthorized to create NFT for this event" }, { status: 403 })
    }

    // Get merchant's wallet private key (in production, this should be stored securely)
    const merchantPrivateKey = process.env.MERCHANT_PRIVATE_KEY || ""
    if (!merchantPrivateKey) {
      return NextResponse.json({ error: "Merchant wallet not configured" }, { status: 500 })
    }

    // Prepare NFT creation parameters
    const nftParams: NFTCreationParams = {
      metadata: {
        ...metadata,
        event_id: eventId,
        event_title: event.title,
        event_date: event.date,
        event_location: event.location,
        price: parseFloat(event.price),
        currency: 'ALGO'
      },
      totalSupply,
      decimals: 0, // NFTs have 0 decimals
      defaultFrozen: false,
      unitName,
      assetName,
      url,
      managerAddress: merchant.walletAddress,
      reserveAddress: merchant.walletAddress,
      freezeAddress: merchant.walletAddress,
      clawbackAddress: merchant.walletAddress,
      royaltyPercentage
    }

    // Create NFT on Algorand
    const result = await AlgorandNFTService.createNFT(nftParams, merchantPrivateKey)

    // Update event with NFT asset ID
    await FirebaseService.updateEvent(eventId, {
      nftAssetId: result.assetId,
      nftCreated: true,
      nftCreatedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      assetId: result.assetId,
      transactionId: result.transactionId,
      metadata: result.metadata,
      message: "NFT created successfully"
    })

  } catch (error: any) {
    console.error("Error creating NFT:", error)
    return NextResponse.json({ 
      error: "Failed to create NFT",
      details: error.message 
    }, { status: 500 })
  }
}