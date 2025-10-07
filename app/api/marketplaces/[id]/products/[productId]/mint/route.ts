import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { AlgorandNFTService } from '@/lib/algorand/nft-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; productId: string } }
) {
  try {
    const { id: marketplaceId, productId } = params
    const body = await request.json()
    const { buyerAddress, assetId, amount } = body

    // Validate required fields
    if (!buyerAddress || !assetId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get marketplace details
    const marketplaceRef = adminDb.collection('marketplaces').doc(marketplaceId)
    const marketplaceDoc = await marketplaceRef.get()
    
    if (!marketplaceDoc.exists) {
      return NextResponse.json(
        { error: 'Marketplace not found' },
        { status: 404 }
      )
    }

    const marketplace = marketplaceDoc.data()

    // Get product details
    const productRef = adminDb.collection('products').doc(productId)
    const productDoc = await productRef.get()
    
    if (!productDoc.exists) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const product = productDoc.data()

    // Check if product is an NFT and available for minting
    if (product.type !== 'nft' || !product.nftData) {
      return NextResponse.json(
        { error: 'Product is not an NFT' },
        { status: 400 }
      )
    }

    if (!product.isEnabled || !product.inStock) {
      return NextResponse.json(
        { error: 'Product not available for minting' },
        { status: 400 }
      )
    }

    // Check available supply
    if (product.nftData.availableSupply < amount) {
      return NextResponse.json(
        { error: 'Insufficient supply available' },
        { status: 400 }
      )
    }

    // Mint NFT using Algorand
    try {
      // For demo purposes, we'll use a mock private key
      // In production, this should be securely managed
      const minterPrivateKey = process.env.MINTER_PRIVATE_KEY || 'demo_key'
      
      const mintResult = await AlgorandNFTService.mintNFT(
        assetId,
        buyerAddress,
        amount,
        minterPrivateKey
      )

      // Update product supply
      const newAvailableSupply = product.nftData.availableSupply - amount
      const newCurrentSupply = (product.nftData.currentSupply || 0) + amount
      
      await productRef.update({
        'nftData.availableSupply': newAvailableSupply,
        'nftData.currentSupply': newCurrentSupply,
        inStock: newAvailableSupply > 0,
        updatedAt: new Date()
      })

      // Record the mint transaction
      const mintData = {
        productId,
        marketplaceId,
        buyerAddress,
        assetId,
        amount,
        transactionId: mintResult.transactionId,
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const mintRef = await adminDb.collection('mints').add(mintData)

      // Update user's NFT holdings
      const userNFTRef = adminDb.collection('user_nfts').doc(`${buyerAddress}_${assetId}`)
      const userNFTDoc = await userNFTRef.get()
      
      if (userNFTDoc.exists) {
        const currentBalance = userNFTDoc.data().balance || 0
        await userNFTRef.update({
          balance: currentBalance + amount,
          updatedAt: new Date()
        })
      } else {
        await userNFTRef.set({
          address: buyerAddress,
          assetId,
          balance: amount,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }

      return NextResponse.json({
        success: true,
        mintId: mintRef.id,
        transactionId: mintResult.transactionId,
        amount: mintResult.amount,
        message: 'NFT minted successfully'
      })

    } catch (algorandError) {
      console.error('Algorand minting error:', algorandError)
      return NextResponse.json(
        { error: 'Failed to mint NFT on Algorand blockchain' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Mint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}