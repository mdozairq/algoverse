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

    const phases = await FirebaseService.getMintPhasesByProject(id)

    return NextResponse.json({
      success: true,
      phases
    })
  } catch (error) {
    console.error('Error fetching mint phases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mint phases' },
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
    const { name, description, startTime, price, maxPerWallet, isWhitelist } = body

    if (!name || !description || !startTime || !price || !maxPerWallet) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create mint phase
    const phaseData = {
      projectId: id,
      name,
      description,
      startTime,
      endTime: body.endTime,
      price: parseFloat(price),
      maxPerWallet: parseInt(maxPerWallet),
      isWhitelist: Boolean(isWhitelist),
      isActive: false,
      minted: 0,
      total: body.total || 1000,
      whitelistAddresses: body.whitelistAddresses || []
    }

    const phaseId = await FirebaseService.createMintPhase(phaseData)

    return NextResponse.json({
      success: true,
      phaseId,
      message: 'Mint phase created successfully'
    })
  } catch (error) {
    console.error('Error creating mint phase:', error)
    return NextResponse.json(
      { error: 'Failed to create mint phase' },
      { status: 500 }
    )
  }
}
