import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { marketplaceTokensCollection } from '@/lib/firebase/collections'
import { multiDEXAggregator } from '@/lib/dex/multi-dex-aggregator'

/**
 * GET /api/marketplaces/[id]/tokens/swap-quote
 * Get swap quote for marketplace token
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: marketplaceId } = params
    const { searchParams } = new URL(request.url)
    const amountIn = parseFloat(searchParams.get('amountIn') || '0')
    const tokenIn = searchParams.get('tokenIn') || 'ALGO' // ALGO or token asset ID
    const slippage = parseFloat(searchParams.get('slippage') || '0.5')

    if (!amountIn || amountIn <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Get marketplace
    const marketplaceRef = adminDb.collection('marketplaces').doc(marketplaceId)
    const marketplaceDoc = await marketplaceRef.get()
    
    if (!marketplaceDoc.exists) {
      return NextResponse.json(
        { error: 'Marketplace not found' },
        { status: 404 }
      )
    }

    const marketplace = marketplaceDoc.data()

    // Get marketplace token
    const tokens = await marketplaceTokensCollection.getByMarketplace(marketplaceId)
    const activeToken = tokens.find(t => t.status === 'deployed' && t.assetId)

    if (!activeToken || !activeToken.assetId) {
      return NextResponse.json(
        { error: 'Marketplace token not found or not deployed' },
        { status: 404 }
      )
    }

    // Determine swap direction
    let assetIn: number | string
    let assetOut: number | string

    if (tokenIn === 'ALGO' || tokenIn === '0') {
      // Swapping ALGO for marketplace token
      assetIn = 0 // ALGO
      assetOut = activeToken.assetId
    } else {
      // Swapping marketplace token for ALGO
      assetIn = activeToken.assetId
      assetOut = 0 // ALGO
    }

    // Get aggregated quote from multi-DEX aggregator
    const quote = await multiDEXAggregator.getAggregatedQuote(
      assetIn,
      assetOut,
      amountIn,
      slippage
    )

    return NextResponse.json({
      success: true,
      quote: {
        tokenIn: tokenIn === 'ALGO' ? 'ALGO' : activeToken.symbol,
        tokenOut: tokenIn === 'ALGO' ? activeToken.symbol : 'ALGO',
        amountIn: quote.amountIn,
        amountOut: quote.amountOut,
        priceImpact: quote.totalPriceImpact,
        fees: quote.totalFees,
        minAmountOut: quote.minAmountOut,
        recommendedSlippage: quote.recommendedSlippage,
        route: quote.bestRoute,
        executionTime: quote.executionTime,
      },
    })
  } catch (error: any) {
    console.error('Error getting swap quote:', error)
    return NextResponse.json(
      { error: `Failed to get swap quote: ${error.message}` },
      { status: 500 }
    )
  }
}

