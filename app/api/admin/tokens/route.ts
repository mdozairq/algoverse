import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { marketplaceTokensCollection, tokenLiquidityPoolsCollection } from '@/lib/firebase/collections'
import { requireRole } from '@/lib/auth/middleware'

/**
 * GET /api/admin/tokens
 * Get all tokens with optional status filter
 */
export const GET = requireRole(['admin'])(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let tokens = []

    if (status === 'pending') {
      tokens = await marketplaceTokensCollection.getPending()
    } else if (status === 'approved') {
      // Get all approved tokens (sort in memory to avoid index requirement)
      const snapshot = await adminDb
        .collection('marketplace_tokens')
        .where('status', '==', 'approved')
        .get()
      
      tokens = snapshot.docs.map((doc: any) => {
        const data = doc.data()
        return {
          ...data,
          id: doc.id,
          createdAt: data?.createdAt?.toDate() || new Date(),
          updatedAt: data?.updatedAt?.toDate(),
          approvedAt: data?.approvedAt?.toDate(),
          deployedAt: data?.deployedAt?.toDate(),
        }
      }).sort((a: any, b: any) => {
        // Sort by approvedAt descending in memory
        const aDate = a.approvedAt || new Date(0)
        const bDate = b.approvedAt || new Date(0)
        return bDate.getTime() - aDate.getTime()
      })
    } else {
      // Get all tokens
      const snapshot = await adminDb
        .collection('marketplace_tokens')
        .orderBy('createdAt', 'desc')
        .limit(100)
        .get()
      
      tokens = snapshot.docs.map((doc: any) => {
        const data = doc.data()
        return {
          ...data,
          id: doc.id,
          createdAt: data?.createdAt?.toDate() || new Date(),
          updatedAt: data?.updatedAt?.toDate(),
          approvedAt: data?.approvedAt?.toDate(),
          deployedAt: data?.deployedAt?.toDate(),
        }
      })
    }

    return NextResponse.json({
      success: true,
      tokens: tokens.map((token: any) => ({
        ...token,
        createdAt: token.createdAt instanceof Date ? token.createdAt.toISOString() : token.createdAt,
        updatedAt: token.updatedAt instanceof Date ? token.updatedAt.toISOString() : token.updatedAt,
        approvedAt: token.approvedAt instanceof Date ? token.approvedAt.toISOString() : token.approvedAt,
        deployedAt: token.deployedAt instanceof Date ? token.deployedAt.toISOString() : token.deployedAt,
      }))
    })
  } catch (error: any) {
    console.error('Error fetching tokens:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 }
    )
  }
})

/**
 * POST /api/admin/tokens
 * Approve or reject a token
 */
export const POST = requireRole(['admin'])(async (request: NextRequest) => {
  try {
    const auth = (request as any).auth
    const { tokenId, action, notes, rejectionReason } = await request.json()

    if (!tokenId || !action) {
      return NextResponse.json(
        { error: 'Token ID and action are required' },
        { status: 400 }
      )
    }

    const token = await marketplaceTokensCollection.getById(tokenId)
    if (!token) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      )
    }

    if (action === 'approve') {
      await marketplaceTokensCollection.approve(tokenId, auth.userId, notes)
      
      // Create liquidity pool records based on token configuration
      if (token.liquidityPools) {
        // Create pool records for enabled DEXs
        if (token.liquidityPools.tinyman?.enabled) {
          const poolData: any = {
            tokenId,
            dex: 'tinyman',
            tokenReserve: 0,
            algoReserve: 0,
            totalLiquidity: 0,
            price: token.initialPrice,
            volume24h: 0,
            fees24h: 0,
            status: 'pending', // Will be updated when pool is actually created on-chain
          }
          
          // Only include poolId and poolAddress if they are defined
          if (token.liquidityPools.tinyman.poolId) {
            poolData.poolId = token.liquidityPools.tinyman.poolId
          }
          if (token.liquidityPools.tinyman.poolAddress) {
            poolData.poolAddress = token.liquidityPools.tinyman.poolAddress
          }
          
          await tokenLiquidityPoolsCollection.create(poolData)
        }
        
        if (token.liquidityPools.pact?.enabled) {
          const poolData: any = {
            tokenId,
            dex: 'pact',
            tokenReserve: 0,
            algoReserve: 0,
            totalLiquidity: 0,
            price: token.initialPrice,
            volume24h: 0,
            fees24h: 0,
            status: 'pending', // Will be updated when pool is actually created on-chain
          }
          
          // Only include poolId and poolAddress if they are defined
          if (token.liquidityPools.pact.poolId) {
            poolData.poolId = token.liquidityPools.pact.poolId
          }
          if (token.liquidityPools.pact.poolAddress) {
            poolData.poolAddress = token.liquidityPools.pact.poolAddress
          }
          
          await tokenLiquidityPoolsCollection.create(poolData)
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'Token approved successfully. Liquidity pools configured.',
      })
    } else if (action === 'reject') {
      if (!rejectionReason) {
        return NextResponse.json(
          { error: 'Rejection reason is required' },
          { status: 400 }
        )
      }
      await marketplaceTokensCollection.reject(tokenId, rejectionReason)
      return NextResponse.json({
        success: true,
        message: 'Token rejected',
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "approve" or "reject"' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Error updating token status:', error)
    return NextResponse.json(
      { error: 'Failed to update token status' },
      { status: 500 }
    )
  }
})

