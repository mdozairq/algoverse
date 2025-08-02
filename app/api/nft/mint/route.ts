import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { AlgorandNFTService } from "@/lib/algorand/nft"
import { requireRole } from "@/lib/auth/middleware"

export const POST = requireRole(["merchant"])(async (request: NextRequest) => {
  try {
    const auth = (request as any).auth
    const { eventId, signedTransaction, assetId } = await request.json()

    // Submit transaction to Algorand
    const txId = await AlgorandNFTService.submitTransaction(new Uint8Array(Buffer.from(signedTransaction, "base64")))

    // Get event and merchant info
    const event = await FirebaseService.getEventById(eventId)
    const merchant = await FirebaseService.getMerchantByUid(auth.uid)

    if (!event || !merchant) {
      return NextResponse.json({ error: "Event or merchant not found" }, { status: 404 })
    }

    // Update event with asset ID
    await FirebaseService.updateEvent(eventId, {
      assetId,
      status: "active",
    })

    // Create NFT records for each token
    for (let i = 0; i < event.totalSupply; i++) {
      await FirebaseService.createNFT({
        assetId,
        eventId,
        merchantId: merchant.id!,
        ownerId: merchant.id!, // Initially owned by merchant
        creatorId: merchant.id!,
        title: event.title,
        description: event.description,
        image: event.images[0],
        metadata: event.metadata,
        price: event.price,
        originalPrice: event.price,
        currency: "ALGO",
        status: "active",
        transferable: event.metadata.transferable,
        resellable: event.metadata.resellable,
        used: false,
        listedForSale: true,
      })
    }

    return NextResponse.json({
      success: true,
      txId,
      assetId,
    })
  } catch (error: any) {
    console.error("Error minting NFT:", error)
    return NextResponse.json({ error: "Failed to mint NFT" }, { status: 500 })
  }
})
