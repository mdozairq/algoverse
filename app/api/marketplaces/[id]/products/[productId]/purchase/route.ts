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
    const { quantity, paymentMethod, transactionId, buyerAddress } = body

    // Validate required fields
    if (!quantity || !paymentMethod || !transactionId || !buyerAddress) {
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

    // Check if marketplace has a custom token
    const hasCustomToken = marketplace?.tokenAssetId && marketplace?.tokenSymbol

    // If payment method is custom token, validate token payment
    if (paymentMethod === 'custom_token' && hasCustomToken) {
      // Get marketplace token
      const { marketplaceTokensCollection } = await import('@/lib/firebase/collections')
      const tokens = await marketplaceTokensCollection.getByMarketplace(marketplaceId)
      const activeToken = tokens.find(t => t.status === 'deployed' && t.assetId === marketplace.tokenAssetId)

      if (!activeToken) {
        return NextResponse.json(
          { error: 'Marketplace token not available' },
          { status: 400 }
        )
      }

      // TODO: Verify token payment transaction
      // This would involve checking the transaction on-chain
      // to ensure the buyer sent the correct amount of tokens
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

    // Check if product is available
    if (!product.isEnabled || !product.inStock) {
      return NextResponse.json(
        { error: 'Product not available' },
        { status: 400 }
      )
    }

    // Create purchase record
    const purchaseData = {
      productId,
      marketplaceId,
      buyerAddress,
      quantity,
      paymentMethod,
      transactionId,
      price: product.price,
      currency: product.currency,
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const purchaseRef = await adminDb.collection('purchases').add(purchaseData)

    // Update product availability if it's an NFT
    if (product.type === 'nft' && product.nftData) {
      const newAvailableSupply = Math.max(0, product.nftData.availableSupply - quantity)
      
      await productRef.update({
        'nftData.availableSupply': newAvailableSupply,
        inStock: newAvailableSupply > 0,
        updatedAt: new Date()
      })
    }

    // Update marketplace stats
    await marketplaceRef.update({
      totalSales: (marketplace.totalSales || 0) + 1,
      totalRevenue: (marketplace.totalRevenue || 0) + (product.price * quantity),
      updatedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      purchaseId: purchaseRef.id,
      transactionId,
      message: 'Purchase completed successfully'
    })

  } catch (error) {
    console.error('Purchase error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}