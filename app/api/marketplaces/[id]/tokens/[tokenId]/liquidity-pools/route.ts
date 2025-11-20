import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { marketplaceTokensCollection } from '@/lib/firebase/collections'
import { requireAuth } from '@/lib/auth/middleware'
import { multiDEXAggregator } from '@/lib/dex/multi-dex-aggregator'
import { TokenLiquidityPool } from '@/lib/firebase/collections'

/**
 * GET /api/marketplaces/[id]/tokens/[tokenId]/liquidity-pools
 * Get liquidity pools for a token
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; tokenId: string } }
) {
  try {
    const { id: marketplaceId, tokenId } = params

    // Verify token belongs to marketplace
    const token = await marketplaceTokensCollection.getById(tokenId)
    if (!token || token.marketplaceId !== marketplaceId) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      )
    }

    if (!token.assetId) {
      return NextResponse.json(
        { error: 'Token not deployed yet' },
        { status: 400 }
      )
    }

    // Get pools from database
    const snapshot = await adminDb
      .collection('token_liquidity_pools')
      .where('tokenId', '==', tokenId)
      .get()

    let pools = snapshot.docs.map((doc: any) => {
      const data = doc.data()
      return {
        ...data,
        id: doc.id,
        createdAt: data?.createdAt?.toDate()?.toISOString(),
        updatedAt: data?.updatedAt?.toDate()?.toISOString(),
      }
    })

    // If no pools in database, try to find them on-chain
    if (pools.length === 0) {
      const onChainPools = await multiDEXAggregator.findPools(token.assetId, 0) // ALGO pairs

      // Create pool records
      for (const pool of onChainPools) {
        const poolData: Omit<TokenLiquidityPool, 'id' | 'createdAt' | 'updatedAt'> = {
          tokenId,
          dex: pool.dex,
          poolId: pool.poolId,
          poolAddress: pool.poolAddress,
          tokenReserve: pool.reserveA,
          algoReserve: pool.reserveB,
          totalLiquidity: pool.liquidity,
          price: pool.reserveB / pool.reserveA, // Price in ALGO
          volume24h: 0,
          fees24h: 0,
          status: 'active',
        }

        const docRef = await adminDb.collection('token_liquidity_pools').add({
          ...poolData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        pools.push({
          ...poolData,
          id: docRef.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }
    } else {
      // Update pool data from on-chain
      for (const pool of pools) {
        try {
          const onChainPools = await multiDEXAggregator.findPools(token.assetId, 0)
          const matchingPool = onChainPools.find(p => p.poolId === pool.poolId)

          if (matchingPool) {
            await adminDb.collection('token_liquidity_pools').doc(pool.id).update({
              tokenReserve: matchingPool.reserveA,
              algoReserve: matchingPool.reserveB,
              totalLiquidity: matchingPool.liquidity,
              price: matchingPool.reserveB / matchingPool.reserveA,
              updatedAt: new Date(),
            })

            pool.tokenReserve = matchingPool.reserveA
            pool.algoReserve = matchingPool.reserveB
            pool.totalLiquidity = matchingPool.liquidity
            pool.price = matchingPool.reserveB / matchingPool.reserveA
          }
        } catch (error) {
          console.error(`Error updating pool ${pool.id}:`, error)
        }
      }
    }

    return NextResponse.json({
      success: true,
      pools,
    })
  } catch (error: any) {
    console.error('Error fetching liquidity pools:', error)
    return NextResponse.json(
      { error: `Failed to fetch liquidity pools: ${error.message}` },
      { status: 500 }
    )
  }
}

/**
 * POST /api/marketplaces/[id]/tokens/[tokenId]/liquidity-pools
 * Create or update liquidity pool record
 */
export const POST = requireAuth(async (
  request: NextRequest,
  { params }: { params: { id: string; tokenId: string } }
) => {
  try {
    const auth = (request as any).auth
    const { id: marketplaceId, tokenId } = params
    const body = await request.json()

    // Verify token belongs to marketplace and merchant
    const token = await marketplaceTokensCollection.getById(tokenId)
    if (!token || token.marketplaceId !== marketplaceId || token.merchantId !== auth.uid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { dex, poolId, poolAddress } = body

    if (!dex || !['tinyman', 'pact'].includes(dex)) {
      return NextResponse.json(
        { error: 'Invalid DEX' },
        { status: 400 }
      )
    }

    // Check if pool already exists
    const existingSnapshot = await adminDb
      .collection('token_liquidity_pools')
      .where('tokenId', '==', tokenId)
      .where('dex', '==', dex)
      .get()

    if (!existingSnapshot.empty) {
      // Update existing pool
      const existingDoc = existingSnapshot.docs[0]
      await existingDoc.ref.update({
        poolId,
        poolAddress,
        updatedAt: new Date(),
      })

      return NextResponse.json({
        success: true,
        poolId: existingDoc.id,
        message: 'Liquidity pool updated',
      })
    }

    // Create new pool record
    const poolData: Omit<TokenLiquidityPool, 'id' | 'createdAt' | 'updatedAt'> = {
      tokenId,
      dex: dex as 'tinyman' | 'pact',
      poolId,
      poolAddress,
      tokenReserve: 0,
      algoReserve: 0,
      totalLiquidity: 0,
      price: 0,
      volume24h: 0,
      fees24h: 0,
      status: 'pending',
    }

    const docRef = await adminDb.collection('token_liquidity_pools').add({
      ...poolData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      poolId: docRef.id,
      message: 'Liquidity pool created',
    })
  } catch (error: any) {
    console.error('Error managing liquidity pool:', error)
    return NextResponse.json(
      { error: 'Failed to manage liquidity pool' },
      { status: 500 }
    )
  }
})

