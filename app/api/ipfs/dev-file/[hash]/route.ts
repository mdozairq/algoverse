import { NextRequest, NextResponse } from 'next/server'
import { getDevFile } from '@/lib/dev-storage'

export async function GET(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  try {
    const { hash } = params
    
    // Check if we have the file in memory
    const fileData = getDevFile(hash)
    if (fileData) {
      const { buffer, contentType } = fileData
      
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
          'Content-Disposition': `inline; filename="${hash}"`,
        },
      })
    }
    
    // If not found, return 404
    return new NextResponse('File not found', { status: 404 })
    
  } catch (error) {
    console.error('Error serving dev file:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

