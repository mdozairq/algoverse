import { NextRequest, NextResponse } from 'next/server'
import { uploadMetadataToIPFS, createARC3Metadata, validateARC3Metadata } from '@/lib/ipfs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, image, attributes, properties } = body

    if (!name || !description || !image) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, image' },
        { status: 400 }
      )
    }

    // Create ARC3 compliant metadata
    const metadata = createARC3Metadata(
      name,
      description,
      image,
      attributes,
      properties
    )

    // Validate metadata
    if (!validateARC3Metadata(metadata)) {
      return NextResponse.json(
        { error: 'Invalid metadata format' },
        { status: 400 }
      )
    }

    // Upload metadata to IPFS
    const ipfsUrl = await uploadMetadataToIPFS(metadata)
    
    // Extract hash from URL
    const ipfsHash = ipfsUrl.split('/').pop() || ''
    
    return NextResponse.json({
      success: true,
      ipfsHash,
      ipfsUrl,
      metadata
    })

  } catch (error) {
    console.error('Metadata upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload metadata to IPFS' },
      { status: 500 }
    )
  }
}
