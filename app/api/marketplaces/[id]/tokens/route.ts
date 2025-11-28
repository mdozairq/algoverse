import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { marketplaceTokensCollection } from '@/lib/firebase/collections'
import { requireRole } from '@/lib/auth/middleware'
import { AlgorandNFTService } from '@/lib/algorand/nft-service'
import algosdk from 'algosdk'
import { getAlgodClient } from '@/lib/algorand/config'

/**
 * GET /api/marketplaces/[id]/tokens
 * Get all tokens for a marketplace
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: marketplaceId } = params
    const tokens = await marketplaceTokensCollection.getByMarketplace(marketplaceId)

    return NextResponse.json({
      success: true,
      tokens: tokens.map(token => ({
        ...token,
        createdAt: token.createdAt instanceof Date ? token.createdAt.toISOString() : token.createdAt,
        updatedAt: token.updatedAt instanceof Date ? token.updatedAt.toISOString() : token.updatedAt,
        approvedAt: token.approvedAt instanceof Date ? token.approvedAt.toISOString() : token.approvedAt,
        deployedAt: token.deployedAt instanceof Date ? token.deployedAt.toISOString() : token.deployedAt,
      }))
    })
  } catch (error: any) {
    console.error('Error fetching marketplace tokens:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/marketplaces/[id]/tokens
 * Create a new token for a marketplace (Merchant only)
 */
export const POST = requireRole(["merchant"])(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const auth = (request as any).auth
    const { id: marketplaceId } = params
    const body = await request.json()

    // Validate required fields
    const {
      name,
      symbol,
      description,
      totalSupply,
      decimals = 6,
      initialPrice,
      initialLiquidity,
      logoUrl,
      website,
      whitepaper,
      liquidityPools,
      tradingRules,
    } = body

    if (!name || !symbol || !description || !totalSupply || !initialPrice || !initialLiquidity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get marketplace to verify merchant ownership
    const marketplaceRef = adminDb.collection('marketplaces').doc(marketplaceId)
    const marketplaceDoc = await marketplaceRef.get()

    if (!marketplaceDoc.exists) {
      return NextResponse.json(
        { error: 'Marketplace not found' },
        { status: 404 }
      )
    }

    const marketplace = marketplaceDoc.data()

    // Verify merchant owns this marketplace
    if (marketplace?.merchantId !== auth.userId) {
      console.log("Unauthorized access:", { 
        authUserId: auth.userId, 
        marketplaceMerchantId: marketplace?.merchantId 
      })
      return NextResponse.json(
        { error: 'Unauthorized: You do not own this marketplace' },
        { status: 403 }
      )
    }

    // Check if marketplace already has a token
    const existingTokens = await marketplaceTokensCollection.getByMarketplace(marketplaceId)
    const activeToken = existingTokens.find(t => t.status === 'approved' || t.status === 'deployed')
    
    if (activeToken) {
      return NextResponse.json(
        { error: 'Marketplace already has an active token' },
        { status: 400 }
      )
    }

    // Create token record - filter out undefined values
    const tokenData: any = {
      marketplaceId,
      merchantId: auth.userId,
      name,
      symbol: symbol.toUpperCase(),
      description,
      totalSupply: Number(totalSupply),
      decimals: Number(decimals),
      initialPrice: Number(initialPrice),
      initialLiquidity: Number(initialLiquidity),
      status: 'pending' as const,
      liquidityPools: liquidityPools || {
        tinyman: { enabled: true },
        pact: { enabled: false },
      },
      tradingRules: tradingRules || {},
    }

    // Only add optional fields if they have values
    if (logoUrl) tokenData.logoUrl = logoUrl
    if (website) tokenData.website = website
    if (whitepaper) tokenData.whitepaper = whitepaper

    const tokenId = await marketplaceTokensCollection.create(tokenData)

    return NextResponse.json({
      success: true,
      tokenId,
      message: 'Token launchpad request submitted. Waiting for admin approval.',
    })
  } catch (error: any) {
    console.error('Error creating token:', error)
    return NextResponse.json(
      { error: 'Failed to create token' },
      { status: 500 }
    )
  }
})

