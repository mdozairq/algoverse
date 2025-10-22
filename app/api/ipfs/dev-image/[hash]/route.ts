import { NextRequest, NextResponse } from 'next/server'
import { getDevImage } from '@/lib/dev-storage'

export async function GET(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  try {
    const { hash } = params
    
    // Check if we have the image in memory
    const imageData = getDevImage(hash)
    if (imageData) {
      const { buffer, contentType } = imageData
      
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        },
      })
    }
    
    // If not found, return 404
    return new NextResponse('Image not found', { status: 404 })
    
  } catch (error) {
    console.error('Error serving dev image:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

