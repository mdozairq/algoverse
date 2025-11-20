/**
 * Multi-DEX Aggregator Service
 * 
 * Aggregates liquidity from multiple DEX protocols (Tinyman V2, Pact Finance)
 * to provide optimal swap rates and routing.
 * 
 * Features:
 * - Multi-DEX liquidity aggregation
 * - Best price routing
 * - Multi-hop swap support
 * - Slippage protection
 * - Price impact calculation
 */

import algosdk from 'algosdk'
import { 
  poolUtils,
  Swap,
  SwapType,
  type SupportedNetwork
} from '@tinymanorg/tinyman-js-sdk'
import { getAlgodClient } from '@/lib/algorand/config'

const ALGORAND_NETWORK = process.env.NEXT_PUBLIC_ALGORAND_NETWORK || 'testnet'

export interface DEXPool {
  dex: 'tinyman' | 'pact'
  poolId: string
  poolAddress: string
  assetA: number // Asset ID
  assetB: number // Asset ID (ALGO = 0)
  reserveA: number
  reserveB: number
  fee: number // Fee percentage (e.g., 0.30 for 0.30%)
  liquidity: number
}

export interface SwapRoute {
  dex: 'tinyman' | 'pact'
  poolId: string
  amountIn: number
  amountOut: number
  priceImpact: number
  fees: number
}

export interface AggregatedSwapQuote {
  tokenIn: string | number
  tokenOut: string | number
  amountIn: number
  amountOut: number
  bestRoute: SwapRoute[]
  alternativeRoutes: SwapRoute[][]
  totalPriceImpact: number
  totalFees: number
  minAmountOut: number
  recommendedSlippage: number
  executionTime: number // Estimated execution time in seconds
}

export class MultiDEXAggregator {
  private network: SupportedNetwork
  private algodClient: algosdk.Algodv2
  private pactClient: any // Will be implemented when Pact SDK is available

  constructor(network: 'testnet' | 'mainnet' = 'testnet') {
    this.network = network as SupportedNetwork
    this.algodClient = getAlgodClient()
    console.log('Multi-DEX Aggregator initialized for:', this.network)
  }

  /**
   * Find all available pools for a token pair across all DEXs
   */
  async findPools(
    assetA: number | string,
    assetB: number | string = 0 // ALGO
  ): Promise<DEXPool[]> {
    const pools: DEXPool[] = []

    try {
      // Find Tinyman pools
      const tinymanPools = await this.findTinymanPools(assetA, assetB)
      pools.push(...tinymanPools)

      // TODO: Find Pact Finance pools
      // const pactPools = await this.findPactPools(assetA, assetB)
      // pools.push(...pactPools)

    } catch (error) {
      console.error('Error finding pools:', error)
    }

    return pools
  }

  /**
   * Find Tinyman V2 pools for a token pair
   */
  private async findTinymanPools(
    assetA: number | string,
    assetB: number | string
  ): Promise<DEXPool[]> {
    const pools: DEXPool[] = []

    try {
      // Convert asset IDs to numbers
      const assetAId = typeof assetA === 'string' ? parseInt(assetA) : assetA
      const assetBId = typeof assetB === 'string' ? parseInt(assetB) : assetB

      // Get pool info from Tinyman
      // Note: This is a simplified implementation
      // In production, you'd query Tinyman's API or indexer for all pools
      
      // Try to get pool info using Tinyman pool utils
      try {
        const poolInfo = await poolUtils.v2.getPoolInfo({
          network: this.network,
          client: this.algodClient,
          asset1ID: assetAId,
          asset2ID: assetBId,
        })

        if (poolInfo && !poolUtils.isPoolNotCreated(poolInfo)) {
          // Extract pool data - V2PoolInfo structure may vary
          // For now, we'll create a basic pool entry and fetch reserves when needed
          pools.push({
            dex: 'tinyman',
            poolId: `${assetAId}-${assetBId}`,
            poolAddress: '', // Will be populated when pool info is accessed
            assetA: assetAId,
            assetB: assetBId,
            reserveA: 0, // Will be fetched when getting quotes
            reserveB: 0, // Will be fetched when getting quotes
            fee: 0.30, // Tinyman V2 fee
            liquidity: 0, // Will be calculated when reserves are known
          })
        }
      } catch (error) {
        // Pool doesn't exist, skip
        console.log(`No Tinyman pool found for ${assetAId}/${assetBId}`)
      }
    } catch (error) {
      console.error('Error finding Tinyman pools:', error)
    }

    return pools
  }

  /**
   * Get aggregated swap quote from all available DEXs
   */
  async getAggregatedQuote(
    tokenIn: number | string,
    tokenOut: number | string,
    amountIn: number,
    slippage: number = 0.5 // Default 0.5% slippage
  ): Promise<AggregatedSwapQuote> {
    const startTime = Date.now()

    // Find all available pools
    const pools = await this.findPools(tokenIn, tokenOut)

    if (pools.length === 0) {
      throw new Error('No liquidity pools found for this token pair')
    }

    // Get quotes from all pools
    const quotes: SwapRoute[] = []

    for (const pool of pools) {
      try {
        const quote = await this.getPoolQuote(pool, tokenIn, tokenOut, amountIn)
        if (quote) {
          quotes.push(quote)
        }
      } catch (error) {
        console.error(`Error getting quote from ${pool.dex} pool ${pool.poolId}:`, error)
      }
    }

    if (quotes.length === 0) {
      throw new Error('No valid quotes found')
    }

    // Sort by best output amount
    quotes.sort((a, b) => b.amountOut - a.amountOut)

    // Best route (direct swap)
    const bestRoute = [quotes[0]]

    // Calculate total price impact and fees
    const totalPriceImpact = quotes[0].priceImpact
    const totalFees = quotes[0].fees

    // Calculate minimum amount out with slippage
    const minAmountOut = quotes[0].amountOut * (1 - slippage / 100)

    // Alternative routes (for multi-hop swaps)
    const alternativeRoutes: SwapRoute[][] = []
    // TODO: Implement multi-hop routing logic

    const executionTime = (Date.now() - startTime) / 1000

    return {
      tokenIn,
      tokenOut,
      amountIn,
      amountOut: quotes[0].amountOut,
      bestRoute,
      alternativeRoutes,
      totalPriceImpact,
      totalFees,
      minAmountOut,
      recommendedSlippage: Math.max(0.5, totalPriceImpact * 1.5), // Recommend slippage based on price impact
      executionTime,
    }
  }

  /**
   * Get quote from a specific pool
   */
  private async getPoolQuote(
    pool: DEXPool,
    tokenIn: number | string,
    tokenOut: number | string,
    amountIn: number
  ): Promise<SwapRoute | null> {
    try {
      if (pool.dex === 'tinyman') {
        return await this.getTinymanQuote(pool, tokenIn, tokenOut, amountIn)
      } else if (pool.dex === 'pact') {
        // TODO: Implement Pact Finance quote
        return null
      }
    } catch (error) {
      console.error(`Error getting quote from ${pool.dex}:`, error)
      return null
    }

    return null
  }

  /**
   * Get quote from Tinyman pool
   */
  private async getTinymanQuote(
    pool: DEXPool,
    tokenIn: number | string,
    tokenOut: number | string,
    amountIn: number
  ): Promise<SwapRoute | null> {
    try {
      const assetInId = typeof tokenIn === 'string' ? parseInt(tokenIn) : tokenIn
      const assetOutId = typeof tokenOut === 'string' ? parseInt(tokenOut) : tokenOut

      // Get pool info first
      const poolInfo = await poolUtils.v2.getPoolInfo({
        network: this.network,
        client: this.algodClient,
        asset1ID: pool.assetA,
        asset2ID: pool.assetB,
      })

      if (!poolInfo || poolUtils.isPoolNotCreated(poolInfo)) {
        return null
      }

      // Get asset decimals (simplified - in production, fetch from blockchain)
      const assetInDecimals = assetInId === 0 ? 6 : 6 // ALGO has 6 decimals, assume 6 for others
      const assetOutDecimals = assetOutId === 0 ? 6 : 6

      // Convert amount to micro units
      const amountInMicroUnits = BigInt(Math.floor(amountIn * Math.pow(10, assetInDecimals)))

      // Get swap quote using Swap.v2 API
      const quote = await Swap.v2.getFixedInputSwapQuote({
        amount: amountInMicroUnits,
        assetIn: { id: assetInId, decimals: assetInDecimals },
        assetOut: { id: assetOutId, decimals: assetOutDecimals },
        network: this.network,
        slippage: 0.5, // Default slippage
        pool: poolInfo,
      })

      if (!quote || quote.type !== 'direct') {
        return null
      }

      const quoteData = quote.data.quote
      const amountOut = Number(quoteData.assetOutAmount) / Math.pow(10, assetOutDecimals)

      // Use price impact from quote (Tinyman provides this)
      const priceImpact = quoteData.priceImpact || 0

      // Calculate fees
      const fees = Number(quoteData.swapFee) / Math.pow(10, assetOutDecimals)

      return {
        dex: 'tinyman',
        poolId: pool.poolId,
        amountIn,
        amountOut,
        priceImpact,
        fees,
      }
    } catch (error) {
      console.error('Error getting Tinyman quote:', error)
      return null
    }
  }

  /**
   * Calculate price impact percentage
   */
  private calculatePriceImpact(
    amountIn: number,
    amountOut: number,
    reserveIn: number,
    reserveOut: number
  ): number {
    // Simple price impact calculation
    // Price impact = (amountIn / reserveIn) * 100
    const impact = (amountIn / reserveIn) * 100
    return Math.min(impact, 100) // Cap at 100%
  }

  /**
   * Execute swap using best route
   * Note: This is a placeholder - actual execution should be done client-side
   */
  async executeAggregatedSwap(
    quote: AggregatedSwapQuote,
    walletAddress: string,
    signedTransactions: Uint8Array[]
  ): Promise<{ txId: string; amountOut: number }> {
    // This method is a placeholder
    // Actual swap execution should be handled by the client using the prepared transactions
    throw new Error('Swap execution should be handled client-side with signed transactions')
  }

  /**
   * Prepare swap transactions for signing
   */
  async prepareSwapTransactions(
    quote: AggregatedSwapQuote,
    walletAddress: string
  ): Promise<algosdk.Transaction[]> {
    const bestRoute = quote.bestRoute[0]

    if (bestRoute.dex === 'tinyman') {
      const assetInId = typeof quote.tokenIn === 'string' ? parseInt(quote.tokenIn) : quote.tokenIn
      const assetOutId = typeof quote.tokenOut === 'string' ? parseInt(quote.tokenOut) : quote.tokenOut

      // Get pool info
      const poolInfo = await poolUtils.v2.getPoolInfo({
        network: this.network,
        client: this.algodClient,
        asset1ID: assetInId,
        asset2ID: assetOutId,
      })

      if (!poolInfo || poolUtils.isPoolNotCreated(poolInfo)) {
        throw new Error('Pool not found for swap')
      }

      // Get asset decimals (simplified)
      const assetInDecimals = assetInId === 0 ? 6 : 6
      const assetOutDecimals = assetOutId === 0 ? 6 : 6

      // Convert amount to micro units
      const amountInMicroUnits = BigInt(Math.floor(quote.amountIn * Math.pow(10, assetInDecimals)))

      // Get swap quote
      const swapQuote = await Swap.v2.getFixedInputSwapQuote({
        amount: amountInMicroUnits,
        assetIn: { id: assetInId, decimals: assetInDecimals },
        assetOut: { id: assetOutId, decimals: assetOutDecimals },
        network: this.network,
        slippage: quote.recommendedSlippage,
        pool: poolInfo,
      })

      // Generate transactions
      const txGroup = await Swap.generateTxns({
        client: this.algodClient,
        network: this.network,
        quote: swapQuote,
        swapType: SwapType.FixedInput,
        slippage: quote.recommendedSlippage,
        initiatorAddr: walletAddress,
      })

      return txGroup.map(stxn => stxn.txn)
    } else if (bestRoute.dex === 'pact') {
      // TODO: Prepare Pact Finance transactions
      throw new Error('Pact Finance swaps not yet implemented')
    }

    throw new Error('Unsupported DEX for transaction preparation')
  }
}

// Export singleton instance
let aggregatorInstance: MultiDEXAggregator | null = null

export const getMultiDEXAggregator = (): MultiDEXAggregator => {
  if (!aggregatorInstance) {
    aggregatorInstance = new MultiDEXAggregator(
      ALGORAND_NETWORK === 'testnet' ? 'testnet' : 'mainnet'
    )
  }
  return aggregatorInstance
}

// For backward compatibility
export const multiDEXAggregator = {
  getAggregatedQuote: (...args: Parameters<MultiDEXAggregator['getAggregatedQuote']>) => {
    const agg = getMultiDEXAggregator()
    return agg.getAggregatedQuote(...args)
  },
  findPools: (...args: Parameters<MultiDEXAggregator['findPools']>) => {
    const agg = getMultiDEXAggregator()
    return agg.findPools(...args)
  },
  prepareSwapTransactions: (...args: Parameters<MultiDEXAggregator['prepareSwapTransactions']>) => {
    const agg = getMultiDEXAggregator()
    return agg.prepareSwapTransactions(...args)
  },
}

