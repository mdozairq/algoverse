import { NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { requireRole } from "@/lib/auth/middleware"

export const POST = requireRole(["user", "merchant"])(async (request: NextRequest) => {
  try {
    const auth = (request as any).auth
    const sellData = await request.json()

    // Validate required fields
    if (!sellData.nftId) {
      return NextResponse.json({ error: "NFT ID is required" }, { status: 400 })
    }

    if (!sellData.salePrice) {
      return NextResponse.json({ error: "Sale price is required" }, { status: 400 })
    }

    if (!sellData.buyerAddress) {
      return NextResponse.json({ error: "Buyer address is required" }, { status: 400 })
    }

    // Get NFT details
    const nft = await FirebaseService.getNFTById(sellData.nftId)
    if (!nft) {
      return NextResponse.json({ error: "NFT not found" }, { status: 404 })
    }

    // Get collection details for default royalty settings
    const collection = await FirebaseService.getCollectionById(nft.collectionId)
    
    // Calculate royalties
    const royaltyPercentage = nft.royaltyPercentage || collection?.royaltyPercentage || 5
    const royaltyRecipient = nft.royaltyRecipient || collection?.royaltyRecipient || nft.creatorAddress || nft.ownerAddress
    
    const royaltyAmount = FirebaseService.calculateRoyalty(sellData.salePrice, royaltyPercentage)
    const sellerAmount = FirebaseService.calculateSellerAmount(sellData.salePrice, royaltyPercentage)

    // Update NFT ownership
    await FirebaseService.updateNFT(sellData.nftId, {
      ownerId: sellData.buyerAddress,
      ownerAddress: sellData.buyerAddress,
      listedForSale: false,
      forSale: false,
      price: sellData.salePrice
    })

    // Create transaction record
    await FirebaseService.createTransaction({
      userId: sellData.buyerAddress,
      marketplaceId: nft.marketplaceId || "",
      productId: sellData.nftId,
      productType: "nft",
      quantity: 1,
      unitPrice: sellData.salePrice,
      totalPrice: sellData.salePrice,
      currency: "ALGO",
      paymentMethod: "algorand",
      status: "completed",
      merchantId: collection?.merchantId || "",
      buyerWalletAddress: sellData.buyerAddress,
      sellerWalletAddress: nft.ownerAddress || "",
      completedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      salePrice: sellData.salePrice,
      royaltyAmount,
      royaltyPercentage,
      royaltyRecipient,
      sellerAmount,
      message: "NFT sold successfully with royalty distribution"
    })
  } catch (error: any) {
    console.error("Error processing NFT sale:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to process NFT sale",
      details: error.toString()
    }, { status: 500 })
  }
})
