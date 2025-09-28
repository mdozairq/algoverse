import { type NextRequest, NextResponse } from "next/server"
import { AlgorandNFTService } from "@/lib/algorand"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { assetId, address, eventId } = await request.json()

    // Validate required fields
    if (!assetId || !address || !eventId) {
      return NextResponse.json({ 
        error: "Missing required fields: assetId, address, eventId" 
      }, { status: 400 })
    }

    // Verify NFT ticket
    const verification = await AlgorandNFTService.verifyNFTTicket(assetId, address, eventId)

    return NextResponse.json({
      success: true,
      isValid: verification.isValid,
      owner: verification.owner,
      metadata: verification.metadata,
      message: verification.isValid ? "Ticket is valid" : "Ticket is invalid"
    })

  } catch (error: any) {
    console.error("Error verifying NFT ticket:", error)
    return NextResponse.json({ 
      error: "Failed to verify NFT ticket",
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')
    const address = searchParams.get('address')
    const eventId = searchParams.get('eventId')

    // Validate required fields
    if (!assetId || !address || !eventId) {
      return NextResponse.json({ 
        error: "Missing required fields: assetId, address, eventId" 
      }, { status: 400 })
    }

    // Verify NFT ticket
    const verification = await AlgorandNFTService.verifyNFTTicket(
      parseInt(assetId), 
      address, 
      eventId
    )

    return NextResponse.json({
      success: true,
      isValid: verification.isValid,
      owner: verification.owner,
      metadata: verification.metadata,
      message: verification.isValid ? "Ticket is valid" : "Ticket is invalid"
    })

  } catch (error: any) {
    console.error("Error verifying NFT ticket:", error)
    return NextResponse.json({ 
      error: "Failed to verify NFT ticket",
      details: error.message 
    }, { status: 500 })
  }
}
