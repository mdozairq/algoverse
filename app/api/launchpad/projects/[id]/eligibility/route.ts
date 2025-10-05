import { NextRequest, NextResponse } from 'next/server'
import { FirebaseService } from '@/lib/firebase/collections'

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

    const { walletAddress, phaseId } = body

    if (!walletAddress || !phaseId) {
      return NextResponse.json(
        { error: 'Wallet address and phase ID are required' },
        { status: 400 }
      )
    }

    // Check whitelist eligibility
    const isWhitelisted = await FirebaseService.checkWhitelistEligibility(
      walletAddress.toLowerCase(),
      phaseId
    )

    // Get user's mint count for this phase
    const mintCount = await FirebaseService.getUserMintCount(
      walletAddress.toLowerCase(),
      phaseId
    )

    return NextResponse.json({
      success: true,
      eligible: isWhitelisted,
      isWhitelisted,
      mintCount
    })
  } catch (error) {
    console.error('Error checking eligibility:', error)
    return NextResponse.json(
      { error: 'Failed to check eligibility' },
      { status: 500 }
    )
  }
}
