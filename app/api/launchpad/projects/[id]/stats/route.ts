import { NextRequest, NextResponse } from 'next/server'
import { FirebaseService } from '@/lib/firebase/collections'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Fetch project and NFTs
    const project = await FirebaseService.getLaunchpadProjectById(id)
    const nfts = await FirebaseService.getLaunchpadNFTsByProject(id)

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Calculate price stats
    const listedNfts = nfts.filter(nft => nft.isListed && nft.price)
    const prices = listedNfts.map(nft => nft.price!).filter(price => price > 0)

    const floorPrice = prices.length > 0 ? Math.min(...prices) : 0
    const averagePrice = prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0
    const highestSale = nfts.reduce((max, nft) => {
      if (nft.lastSale && nft.lastSale.price > max) {
        return nft.lastSale.price
      }
      return max
    }, 0)

    // Calculate total volume from last sales
    const totalVolume = nfts.reduce((sum, nft) => {
      if (nft.lastSale) {
        return sum + nft.lastSale.price
      }
      return sum
    }, 0)

    const stats = {
      floorPrice,
      averagePrice,
      highestSale,
      totalVolume,
      currency: project.keyMetrics.currency
    }

    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
