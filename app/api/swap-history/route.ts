import { NextRequest, NextResponse } from 'next/server'
import { swapHistoryCollection } from '@/lib/firebase/collections'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('userAddress')
    const marketplaceId = searchParams.get('marketplaceId')

    if (!userAddress && !marketplaceId) {
      return NextResponse.json(
        { error: 'Either userAddress or marketplaceId is required' },
        { status: 400 }
      )
    }

    let swapHistory
    if (userAddress) {
      swapHistory = await swapHistoryCollection.getByUserAddress(userAddress)
    } else if (marketplaceId) {
      swapHistory = await swapHistoryCollection.getByMarketplace(marketplaceId)
    }

    return NextResponse.json({ swapHistory })
  } catch (error) {
    console.error('Error fetching swap history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch swap history' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = [
      'userAddress',
      'marketplaceId', 
      'merchantId',
      'inputAsset',
      'outputAsset',
      'swapDirection',
      'quoteType',
      'fees',
      'slippage',
      'minAmountOut',
      'txId'
    ]

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const swapData = {
      userAddress: body.userAddress,
      marketplaceId: body.marketplaceId,
      merchantId: body.merchantId,
      inputAsset: body.inputAsset,
      outputAsset: body.outputAsset,
      swapDirection: body.swapDirection,
      quoteType: body.quoteType,
      fees: body.fees,
      slippage: body.slippage,
      minAmountOut: body.minAmountOut,
      txId: body.txId,
      status: body.status || 'pending'
    }

    const swapId = await swapHistoryCollection.create(swapData)

    return NextResponse.json({ 
      success: true, 
      swapId,
      message: 'Swap history recorded successfully' 
    })
  } catch (error) {
    console.error('Error creating swap history:', error)
    return NextResponse.json(
      { error: 'Failed to create swap history' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, confirmedAt } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: id and status' },
        { status: 400 }
      )
    }

    await swapHistoryCollection.updateStatus(id, status, confirmedAt ? new Date(confirmedAt) : undefined)

    return NextResponse.json({ 
      success: true, 
      message: 'Swap status updated successfully' 
    })
  } catch (error) {
    console.error('Error updating swap status:', error)
    return NextResponse.json(
      { error: 'Failed to update swap status' },
      { status: 500 }
    )
  }
}
