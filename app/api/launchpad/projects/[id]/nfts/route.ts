import { NextRequest, NextResponse } from 'next/server'
import { FirebaseService } from '@/lib/firebase/collections'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    const nfts = await FirebaseService.getLaunchpadNFTsByProject(id)

    // Apply pagination
    const paginatedNfts = nfts.slice(offset, offset + limit)

    // Convert date fields to strings
    const nftsWithStringDates = paginatedNfts.map(nft => ({
      ...nft,
      mintedAt: nft.mintedAt instanceof Date ? nft.mintedAt.toISOString() : nft.mintedAt,
      createdAt: nft.createdAt instanceof Date ? nft.createdAt.toISOString() : nft.createdAt,
      updatedAt: nft.updatedAt instanceof Date ? nft.updatedAt.toISOString() : nft.updatedAt,
      lastSale: nft.lastSale ? {
        ...nft.lastSale,
        date: nft.lastSale.date instanceof Date ? nft.lastSale.date.toISOString() : nft.lastSale.date
      } : nft.lastSale
    }))

    return NextResponse.json({
      success: true,
      nfts: nftsWithStringDates,
      total: nfts.length,
      limit,
      offset
    })
  } catch (error) {
    console.error('Error fetching NFTs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch NFTs' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Validate required fields
    const { tokenId, ownerAddress, phaseId, mintPrice, currency, transactionHash, metadata } = body

    if (!tokenId || !ownerAddress || !phaseId || !mintPrice || !currency || !transactionHash || !metadata) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create NFT
    const nftData = {
      tokenId,
      projectId: id,
      ownerAddress: ownerAddress.toLowerCase(),
      phaseId,
      mintPrice: parseFloat(mintPrice),
      currency,
      mintedAt: new Date(),
      transactionHash,
      metadata,
      traits: body.traits || [],
      rarityScore: body.rarityScore || 0,
      rarityRank: body.rarityRank || 0,
      price: body.price,
      isListed: Boolean(body.isListed),
      lastSale: body.lastSale,
      views: 0,
      likes: 0
    }

    const nftId = await FirebaseService.createLaunchpadNFT(nftData)

    return NextResponse.json({
      success: true,
      nftId,
      message: 'NFT created successfully'
    })
  } catch (error) {
    console.error('Error creating NFT:', error)
    return NextResponse.json(
      { error: 'Failed to create NFT' },
      { status: 500 }
    )
  }
}
