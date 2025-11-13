import { NextRequest, NextResponse } from 'next/server'
import { uploadFileToIPFS } from '@/lib/ipfs'
import { storeDevFile } from '@/lib/dev-storage'

// Pinata API configuration
const PINATA_JWT = process.env.PINATA_JWT

// Allowed file types for different categories
const ALLOWED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/wave', 'audio/x-wav', 'audio/webm'],
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'],
  file: ['application/pdf', 'application/zip', 'application/json', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  any: [
    // Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // Audio
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/wave', 'audio/x-wav', 'audio/webm',
    // Video
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo',
    // Files
    'application/pdf', 'application/zip', 'application/json', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
}

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

    // Validate file type - allow all supported types
    const allAllowedTypes = [...ALLOWED_TYPES.image, ...ALLOWED_TYPES.audio, ...ALLOWED_TYPES.video, ...ALLOWED_TYPES.file]
    if (!allAllowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Supported types: images, audio, video, and documents.` },
        { status: 400 }
      )
    }

    // Validate file size (50MB limit for multimedia, 10MB for images)
    const maxSize = file.type.startsWith('image/') ? 10 * 1024 * 1024 : 50 * 1024 * 1024 // 10MB for images, 50MB for others
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB.` },
        { status: 400 }
      )
    }

    // Upload to IPFS using Pinata
    const ipfsUrl = await uploadFileToIPFS(file)
    
    // Extract hash from URL for development mode
    const isDevelopment = ipfsUrl.includes('/api/ipfs/dev-file/')
    const ipfsHash = isDevelopment 
      ? ipfsUrl.split('/').pop() || ''
      : ipfsUrl.split('/').pop() || ''
    
    return NextResponse.json({
      success: true,
      ipfsHash,
      ipfsUrl,
      gatewayUrl: ipfsUrl,
      fileType: file.type
    })

  } catch (error) {
    console.error('IPFS upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload to IPFS' },
      { status: 500 }
    )
  }
}

