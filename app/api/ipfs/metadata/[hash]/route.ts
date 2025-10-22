import { NextRequest, NextResponse } from 'next/server'
import { getMetadataFromIPFS } from '@/lib/ipfs'

export async function GET(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  try {
    const { hash } = params
    
    if (!hash) {
      return NextResponse.json(
        { error: 'Hash parameter is required' },
        { status: 400 }
      )
    }

    // Construct IPFS URL
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${hash}`
    
    // Fetch metadata from IPFS
    const metadata = await getMetadataFromIPFS(ipfsUrl)
    
    return NextResponse.json({
      success: true,
      metadata,
      ipfsUrl
    })

  } catch (error) {
    console.error('Error fetching metadata:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metadata from IPFS' },
      { status: 500 }
    )
  }
}
