import { NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { AlgorandNFTService } from "@/lib/algorand/nft-service"
import { requireRole } from "@/lib/auth/middleware"

export const POST = requireRole(["user", "merchant"])(async (request: NextRequest) => {
  try {
    const auth = (request as any).auth
    const mintData = await request.json()

    // Validate required fields
    if (!mintData.nftId) {
      return NextResponse.json({ error: "NFT ID is required" }, { status: 400 })
    }

    if (!mintData.userAddress) {
      return NextResponse.json({ error: "User address is required" }, { status: 400 })
    }

    if (!mintData.privateKey) {
      return NextResponse.json({ error: "Private key is required for minting" }, { status: 400 })
    }

    // Get NFT details from database
    const nft = await FirebaseService.getNFTById(mintData.nftId)
    if (!nft) {
      return NextResponse.json({ error: "NFT not found" }, { status: 404 })
    }

    // Check if NFT is already minted
    if (nft.assetId && nft.assetId > 0) {
      return NextResponse.json({ error: "NFT is already minted on blockchain" }, { status: 400 })
    }

    // Prepare metadata for Algorand
    const metadata = {
      name: nft.metadata?.name || "NFT",
      description: nft.metadata?.description || "",
      image: nft.metadata?.image || "",
      attributes: nft.metadata?.attributes || [],
      event_id: nft.eventId || "",
      event_title: nft.metadata?.name || "NFT",
      event_date: new Date().toISOString(),
      event_location: "Digital Marketplace",
      ticket_type: "general" as const,
      price: nft.price || 0,
      currency: "ALGO" as const
    }

    // Create NFT on Algorand blockchain
    const nftParams = {
      metadata,
      totalSupply: 1,
      decimals: 0,
      defaultFrozen: false,
      unitName: (nft.metadata?.name || "NFT").substring(0, 8).toUpperCase(),
      assetName: nft.metadata?.name || "NFT",
      url: nft.metadata?.image || "",
      managerAddress: mintData.userAddress,
      reserveAddress: mintData.userAddress,
      freezeAddress: mintData.userAddress,
      clawbackAddress: mintData.userAddress,
      royaltyPercentage: 0
    }

    const mintResult = await AlgorandNFTService.createNFT(nftParams, mintData.privateKey)

    // Update NFT in database with blockchain details
    await FirebaseService.updateNFT(mintData.nftId, {
      assetId: mintResult.assetId,
      transactionId: mintResult.transactionId,
      status: "minted"
    })

    return NextResponse.json({
      success: true,
      assetId: mintResult.assetId,
      transactionId: mintResult.transactionId,
      message: "NFT minted successfully on Algorand blockchain"
    })
  } catch (error: any) {
    console.error("Error minting NFT:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to mint NFT on blockchain",
      details: error.toString()
    }, { status: 500 })
  }
})
