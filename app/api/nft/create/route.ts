import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { AlgorandNFTService, type NFTMetadata } from "@/lib/algorand/nft"
import { requireRole } from "@/lib/auth/middleware"

export const POST = requireRole(["merchant"])(async (request: NextRequest) => {
  try {
    const auth = (request as any).auth
    const { eventId, metadata, totalSupply } = await request.json()

    // Get merchant info
    const merchant = await FirebaseService.getMerchantByUid(auth.uid)
    if (!merchant || !merchant.walletAddress) {
      return NextResponse.json({ error: "Merchant wallet not configured" }, { status: 400 })
    }

    // Get event info
    const event = await FirebaseService.getEventById(eventId)
    if (!event || event.merchantId !== merchant.id) {
      return NextResponse.json({ error: "Event not found or unauthorized" }, { status: 404 })
    }

    // Create NFT metadata
    const nftMetadata: NFTMetadata = {
      name: event.title,
      description: event.description,
      image: metadata.image || event.images[0],
      eventDate: event.eventDate,
      eventTime: event.eventTime,
      venue: event.venue,
      location: event.location,
      category: event.category,
      seatInfo: metadata.seatInfo,
      benefits: event.metadata.benefits,
      transferable: event.metadata.transferable,
      resellable: event.metadata.resellable,
      maxResellPrice: event.metadata.maxResellPrice,
    }

    // Create Algorand transaction for NFT creation
    const createTxn = await AlgorandNFTService.createNFT({
      creatorAddress: merchant.walletAddress,
      metadata: nftMetadata,
      totalSupply,
      unitName: "EVTNFT",
      assetName: event.title.substring(0, 32), // Algorand limit
    })

    // Return unsigned transaction for client to sign
    return NextResponse.json({
      success: true,
      transaction: Buffer.from(createTxn.toByte()).toString("base64"),
      metadata: nftMetadata,
    })
  } catch (error: any) {
    console.error("Error creating NFT:", error)
    return NextResponse.json({ error: "Failed to create NFT" }, { status: 500 })
  }
})
