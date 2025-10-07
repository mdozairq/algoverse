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
    const { offeredNftId, message, buyerAddress, productAssetId } = body

    // Validate required fields
    if (!offeredNftId || !buyerAddress || !productAssetId) {
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

    // Check if marketplace allows swaps
    if (!marketplace.allowSwap) {
      return NextResponse.json(
        { error: 'Swaps are not enabled for this marketplace' },
        { status: 400 }
      )
    }

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

    // Check if product allows swaps
    if (!product.allowSwap || product.type !== 'nft') {
      return NextResponse.json(
        { error: 'Product does not support swaps' },
        { status: 400 }
      )
    }

    // Verify that the user owns the offered NFT
    const userNFTsRef = adminDb.collection('user_nfts').where('address', '==', buyerAddress)
    const userNFTsSnapshot = await userNFTsRef.get()
    
    const userOwnsNFT = userNFTsSnapshot.docs.some((doc: any) => {
      const userNFT = doc.data()
      return userNFT.assetId === parseInt(offeredNftId) && userNFT.balance > 0
    })

    if (!userOwnsNFT) {
      return NextResponse.json(
        { error: 'You do not own the offered NFT' },
        { status: 400 }
      )
    }

    // Create swap proposal
    const swapId = `swap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const swapData = {
      swapId,
      marketplaceId,
      productId,
      productAssetId: parseInt(productAssetId),
      offeredNftId: parseInt(offeredNftId),
      buyerAddress,
      sellerAddress: marketplace.walletAddress,
      message: message || '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }

    const swapRef = await adminDb.collection('nft_swaps').add(swapData)

    // Create atomic swap using Algorand
    try {
      const swapParams = {
        assetId1: parseInt(offeredNftId),
        assetId2: parseInt(productAssetId),
        fromAddress1: buyerAddress,
        fromAddress2: marketplace.walletAddress,
        amount1: 1,
        amount2: 1,
        expiryTime: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
      }

      const atomicSwap = await AlgorandNFTService.createAtomicSwap(swapParams)
      
      // Update swap with transaction details
      await swapRef.update({
        algorandSwapId: atomicSwap.swapId,
        transactionId: atomicSwap.transactionId,
        status: 'created'
      })

      return NextResponse.json({
        success: true,
        swapId,
        algorandSwapId: atomicSwap.swapId,
        transactionId: atomicSwap.transactionId,
        message: 'Swap proposal created successfully'
      })

    } catch (algorandError) {
      console.error('Algorand swap creation error:', algorandError)
      
      // Still create the swap proposal in database even if Algorand fails
      return NextResponse.json({
        success: true,
        swapId,
        message: 'Swap proposal created (Algorand integration pending)'
      })
    }

  } catch (error) {
    console.error('Swap creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; productId: string } }
) {
  try {
    const { id: marketplaceId, productId } = params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'

    // Get all swaps for this product
    let swapsQuery = adminDb.collection('nft_swaps')
      .where('marketplaceId', '==', marketplaceId)
      .where('productId', '==', productId)

    if (status !== 'all') {
      swapsQuery = swapsQuery.where('status', '==', status)
    }

    const swapsSnapshot = await swapsQuery.get()
    const swaps = swapsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json({
      success: true,
      swaps
    })

  } catch (error) {
    console.error('Get swaps error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}