import { type NextRequest, NextResponse } from "next/server"
import { AlgorandNFTService } from "@/lib/algorand"
import { verifyAuthToken } from "@/lib/auth/middleware"
import { FirebaseService } from "@/lib/firebase/collections"
import { adminDb } from "@/lib/firebase/admin"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuthToken(request)
    if (!auth || !auth.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      assetId,
      toAddress,
      amount = 1,
      eventId
    } = await request.json()

    // Validate required fields
    if (!assetId || !toAddress) {
      return NextResponse.json({ 
        error: "Missing required fields: assetId, toAddress" 
      }, { status: 400 })
    }

    // Get user details
    const user = await FirebaseService.getUserByUid(auth.uid)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If eventId is provided, verify the user has purchased a ticket
    if (eventId) {
      // Check if user has purchased this event (this would be in your purchase system)
      // For now, we'll assume the user is authorized to mint
    }

    // Get merchant's wallet private key for minting
    const merchantPrivateKey = process.env.MERCHANT_PRIVATE_KEY || ""
    if (!merchantPrivateKey) {
      return NextResponse.json({ error: "Merchant wallet not configured" }, { status: 500 })
    }

    // Ensure user has opted in to the asset
    try {
      await AlgorandNFTService.optInToAsset(assetId, toAddress, user.walletAddress || "")
    } catch (optInError) {
      console.warn("User may already be opted in:", optInError)
    }

    // Mint NFT to user's address
    const result = await AlgorandNFTService.mintNFT(
      assetId,
      toAddress,
      amount,
      merchantPrivateKey
    )

    // Record the minting in Firestore
    await adminDb.collection('nft_mints').add({
      assetId,
      toAddress,
      amount,
      fromUser: auth.uid,
      eventId: eventId || null,
      transactionId: result.transactionId,
      createdAt: new Date(),
      status: 'completed'
    })

    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
      amount: result.amount,
      message: "NFT minted successfully"
    })

  } catch (error: any) {
    console.error("Error minting NFT:", error)
    return NextResponse.json({ 
      error: "Failed to mint NFT",
      details: error.message 
    }, { status: 500 })
  }
}