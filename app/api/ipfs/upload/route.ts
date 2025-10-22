import { NextRequest, NextResponse } from 'next/server'
import { uploadImageToIPFS } from '@/lib/ipfs'
import { storeDevImage } from '@/lib/dev-storage'

// Pinata API configuration
const PINATA_JWT = process.env.PINATA_JWT

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Upload to IPFS using Pinata
    const ipfsUrl = await uploadImageToIPFS(file)
    
    // Extract hash from URL for development mode
    const isDevelopment = ipfsUrl.includes('/api/ipfs/dev-image/')
    const ipfsHash = isDevelopment 
      ? ipfsUrl.split('/').pop() || ''
      : ipfsUrl.split('/').pop() || ''
    
    return NextResponse.json({
      success: true,
      ipfsHash,
      ipfsUrl,
      gatewayUrl: ipfsUrl
    })

  } catch (error) {
    console.error('IPFS upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload to IPFS' },
      { status: 500 }
    )
  }
}

