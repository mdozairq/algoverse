/**
 * TinymanSwapService
 * 
 * Service for handling Tinyman swap operations using the Tinyman JS SDK.
 * References:
 * - Tinyman Docs: https://docs.tinyman.org/
 * - Tinyman JS SDK: https://github.com/tinymanorg/tinyman-js-sdk
 * - Algorand JS SDK: https://developer.algorand.org/docs/sdks/javascript/
 */

import algosdk from 'algosdk'
import { 
  Swap, 
  type SupportedNetwork, 
  poolUtils, 
  SwapType
} from '@tinymanorg/tinyman-js-sdk'
import { getAlgodClient } from '@/lib/algorand/config'
import { Buffer } from 'buffer'

export interface AssetInfo {
  id: number
  name: string
  unitName: string
  decimals: number
}

export interface SwapQuote {
  input: {
    amount: number
    asset: AssetInfo
    amountInMicroUnits: number
  }
  output: {
    amount: number
    asset: AssetInfo
    amountInMicroUnits: number
  }
  fees: {
    swapFee: number
    priceImpact: number
  }
  minAmountOut: number
  slippage: number
  poolExists: boolean
  swapDirection: 'ASA_TO_ALGO' | 'ALGO_TO_ASA'
  quoteType?: 'direct' | 'router'
}

export interface SwapResult {
  txId: string
  inputAmount: number
  outputAmount: number
  inputAsset: string
  outputAsset: string
}

export class TinymanSwapService {
  private algodClient: algosdk.Algodv2
  private network: SupportedNetwork

  constructor() {
    this.algodClient = getAlgodClient()
    
    // Force testnet for now (can be changed via environment variable)
    const networkEnv = process.env.NEXT_PUBLIC_ALGORAND_NETWORK || 'testnet'
    // Explicitly use testnet for Tinyman swaps
    this.network = 'testnet' as SupportedNetwork
    
    console.log('Tinyman Swap Service initialized for:', this.network)
  }

  /**
   * Get asset information from Algorand using Tinyman SDK
   */
  async getAssetInfo(assetId: number): Promise<AssetInfo> {
    // Validate assetId
    if (assetId === undefined || assetId === null || isNaN(Number(assetId))) {
      throw new Error(`Invalid asset ID: ${assetId}`)
    }

    // ALGO (native currency)
    if (assetId === 0) {
      return {
        id: 0,
        name: 'Algorand',
        unitName: 'ALGO',
        decimals: 6
      }
    }

    try {
      const assetInfo = await this.algodClient.getAssetByID(Number(assetId)).do()
      
      return {
        id: Number(assetId),
        name: assetInfo.params.name || `ASA-${assetId}`,
        unitName: assetInfo.params.unitName || '',
        decimals: assetInfo.params.decimals || 0
      }
    } catch (error) {
      console.error(`Error fetching asset ${assetId}:`, error)
      throw new Error(`Failed to fetch asset information for ${assetId}`)
    }
  }

  /**
   * Check if a pool exists for the given asset pair
   */
  async checkPoolExists(assetInId: number, assetOutId: number): Promise<boolean> {
    try {
      // Ensure consistent ordering (smaller ID first)
      const asset1ID = Math.min(assetInId, assetOutId)
      const asset2ID = Math.max(assetInId, assetOutId)
      
      console.log(`Checking pool existence for assets: ${asset1ID} and ${asset2ID}`)
      
      const poolInfo = await poolUtils.v2.getPoolInfo({
        network: this.network,
        client: this.algodClient,
        asset1ID,
        asset2ID
      })
      
      const poolExists = poolInfo !== null && !poolUtils.isPoolNotCreated(poolInfo)
      console.log(`Pool exists: ${poolExists}`, poolInfo)
      
      return poolExists
    } catch (error) {
      console.error('Error checking pool existence:', error)
      return false
    }
  }

  /**
   * Get swap quote for converting between assets
   * @param assetInId - The asset ID to swap from (0 for ALGO)
   * @param assetOutId - The asset ID to swap to (0 for ALGO)
   * @param amount - Amount in human-readable format (e.g., 100.5)
   * @param slippage - Slippage tolerance (default 0.01 = 1%)
   */
  async getSwapQuote(
    assetInId: number,
    assetOutId: number,
    amount: number,
    slippage: number = 0.01
  ): Promise<SwapQuote> {
    if (!amount || amount <= 0) {
      throw new Error('Amount must be greater than 0')
    }

    console.log(`Getting swap quote: ${assetInId} -> ${assetOutId}, amount: ${amount}, slippage: ${slippage}`)

    // Determine swap direction
    const swapDirection = assetInId === 0 ? 'ALGO_TO_ASA' : 'ASA_TO_ALGO'

    // Get asset information
    const assetIn = await this.getAssetInfo(assetInId)
    const assetOut = await this.getAssetInfo(assetOutId)

    console.log('Asset info:', { assetIn, assetOut })

    // Convert amount to micro-units (accounting for decimals)
    const amountInMicroUnits = BigInt(Math.floor(amount * Math.pow(10, assetIn.decimals)))
    console.log('Amount in micro-units:', amountInMicroUnits.toString())

    try {
      // Fetch pool info - ensure consistent ordering (smaller ID first)
      const asset1ID = Math.min(assetInId, assetOutId)
      const asset2ID = Math.max(assetInId, assetOutId)
      
      console.log(`Looking up pool for assets: ${asset1ID} and ${asset2ID}`)
      
      const poolInfo = await poolUtils.v2.getPoolInfo({
        network: this.network,
        client: this.algodClient,
        asset1ID,
        asset2ID
      })

      console.log('Pool info:', poolInfo)

      if (!poolInfo || poolUtils.isPoolNotCreated(poolInfo)) {
        console.log('Pool not found or not created')
        return {
          input: {
            amount,
            asset: assetIn,
            amountInMicroUnits: Number(amountInMicroUnits)
          },
          output: {
            amount: 0,
            asset: assetOut,
            amountInMicroUnits: 0
          },
          fees: {
            swapFee: 0,
            priceImpact: 0
          },
          minAmountOut: 0,
          slippage,
          poolExists: false,
          swapDirection
        }
      }

      console.log('Pool found, getting quote...')

      // Get quote with fixed input using Swap.v2 API
      const quote = await Swap.v2.getFixedInputSwapQuote({
        amount: amountInMicroUnits,
        assetIn: { id: assetInId, decimals: assetIn.decimals },
        assetOut: { id: assetOutId, decimals: assetOut.decimals },
        network: this.network,
        slippage,
        pool: poolInfo
      })

      console.log('Quote received:', quote)

      if (quote.type === 'direct') {
        const quoteData = quote.data.quote
        const amountOut = Number(quoteData.assetOutAmount) / Math.pow(10, assetOut.decimals)
        const minAmountOut = amountOut * (1 - slippage)
        const swapFee = Number(quoteData.swapFee) / Math.pow(10, assetOut.decimals)

        console.log('Direct quote details:', {
          amountOut,
          minAmountOut,
          swapFee,
          priceImpact: quoteData.priceImpact
        })

        return {
          input: {
            amount,
            asset: assetIn,
            amountInMicroUnits: Number(amountInMicroUnits)
          },
          output: {
            amount: amountOut,
            asset: assetOut,
            amountInMicroUnits: Number(quoteData.assetOutAmount)
          },
          fees: {
            swapFee,
            priceImpact: quoteData.priceImpact
          },
          minAmountOut,
          slippage,
          poolExists: true,
          swapDirection,
          quoteType: 'direct'
        }
      }

      if (quote.type === 'router') {
        const quoteData = quote.data
        const amountOut = Number(quoteData.output_amount) / Math.pow(10, assetOut.decimals)
        const minAmountOut = amountOut * (1 - slippage)
        const swapFee = Number(quoteData.swap_fee) / Math.pow(10, assetOut.decimals)
        const priceImpact = Number(quoteData.price_impact)

        console.log('Router quote details:', {
          amountOut,
          minAmountOut,
          swapFee,
          priceImpact,
          poolIds: quoteData.pool_ids,
          transactionCount: quoteData.transaction_count
        })

        return {
          input: {
            amount,
            asset: assetIn,
            amountInMicroUnits: Number(amountInMicroUnits)
          },
          output: {
            amount: amountOut,
            asset: assetOut,
            amountInMicroUnits: Number(quoteData.output_amount)
          },
          fees: {
            swapFee,
            priceImpact
          },
          minAmountOut,
          slippage,
          poolExists: true,
          swapDirection,
          quoteType: 'router'
        }
      }

      throw new Error(`Unsupported quote type: ${(quote as any).type}`)
    } catch (error: any) {
      console.error('Error getting swap quote:', error)
      throw new Error(`Failed to get swap quote: ${error.message || 'Unknown error'}`)
    }
  }

  /**
   * Prepare swap transactions
   * @param quote - The swap quote from getSwapQuote
   * @param userAddress - The user's Algorand address
   */
  async prepareSwapTransactions(
    quote: SwapQuote,
    userAddress: string
  ): Promise<algosdk.Transaction[]> {
    if (!quote.poolExists) {
      throw new Error('No liquidity pool exists for this asset pair')
    }

    try {
      // For router swaps, we need to use the router API
      // For now, let's try to find a direct pool first
      const poolInfo = await poolUtils.v2.getPoolInfo({
        network: this.network,
        client: this.algodClient,
        asset1ID: quote.input.asset.id,
        asset2ID: quote.output.asset.id
      })

      if (poolInfo && !poolUtils.isPoolNotCreated(poolInfo)) {
        // Direct pool exists, use it
        const swapQuote = await Swap.v2.getFixedInputSwapQuote({
          amount: BigInt(quote.input.amountInMicroUnits),
          assetIn: { id: quote.input.asset.id, decimals: quote.input.asset.decimals },
          assetOut: { id: quote.output.asset.id, decimals: quote.output.asset.decimals },
          network: this.network,
          slippage: quote.slippage,
          pool: poolInfo
        })

        const txGroup = await Swap.generateTxns({
          client: this.algodClient,
          network: this.network,
          quote: swapQuote,
          swapType: SwapType.FixedInput,
          slippage: quote.slippage,
          initiatorAddr: userAddress
        })

        return txGroup.map(stxn => stxn.txn)
      } else {
        // No direct pool, router swap required
        // For now, throw an error indicating router swaps need different handling
        throw new Error('Router swaps require a different transaction preparation method. Please use a direct pool swap.')
      }
    } catch (error: any) {
      console.error('Error preparing swap transactions:', error)
      throw new Error(`Failed to prepare swap transactions: ${error.message || 'Unknown error'}`)
    }
  }

  /**
   * Execute swap after transactions are signed
   * @param quote - The swap quote
   * @param signedTxns - Array of signed transactions (base64 encoded strings)
   * @param userAddress - The user's Algorand address
   */
  async executeSwap(
    quote: SwapQuote,
    signedTxns: string[],
    userAddress: string
  ): Promise<SwapResult> {
    try {
      // Convert base64 strings back to Uint8Array
      const signedTxnsBytes = signedTxns.map(txn => new Uint8Array(Buffer.from(txn, 'base64')))

      // Fetch pool info
      console.log('Executing swap with assets:', {
        inputAssetId: quote.input.asset.id,
        outputAssetId: quote.output.asset.id,
        inputAssetName: quote.input.asset.name,
        outputAssetName: quote.output.asset.name
      })
      
      const poolInfo = await poolUtils.v2.getPoolInfo({
        network: this.network,
        client: this.algodClient,
        asset1ID: quote.input.asset.id,
        asset2ID: quote.output.asset.id
      })

      if (!poolInfo || poolUtils.isPoolNotCreated(poolInfo)) {
        throw new Error('Pool not found')
      }

      console.log('Submitting signed transactions directly to Algorand network:', signedTxnsBytes.length, 'transactions')
      
      // Send signed transactions directly to the Algorand network
      // This avoids regenerating transactions and potential fee/signing mismatches
      const result = await this.algodClient.sendRawTransaction(signedTxnsBytes).do()
      const txId = result.txid
      
      console.log('Transaction submitted, txId:', txId)

      return {
        txId: txId,
        inputAmount: quote.input.amount,
        outputAmount: quote.output.amount,
        inputAsset: quote.input.asset.unitName || quote.input.asset.name,
        outputAsset: quote.output.asset.unitName || quote.output.asset.name
      }
    } catch (error: any) {
      console.error('Error executing swap:', error)
      throw new Error(`Swap execution failed: ${error.message || 'Unknown error'}`)
    }
  }

  /**
   * Get user's asset balance
   * @param address - User's Algorand address
   * @param assetId - Asset ID (0 for ALGO)
   */
  async getAssetBalance(address: string, assetId: number): Promise<number> {
    try {
      console.log(`Getting balance for address: ${address}, asset: ${assetId}`)
      
      const accountInfo = await this.algodClient.accountInformation(address).do()
      console.log('Account info:', accountInfo)
      
      if (assetId === 0) {
        // ALGO balance
        const balance = Number(accountInfo.amount) / Math.pow(10, 6) // Convert from microAlgos to ALGO
        console.log(`ALGO balance: ${balance}`)
        return balance
      } else {
        // ASA balance
        const asset = accountInfo.assets?.find((a: any) => {
          const aId = a['asset-id'] !== undefined ? a['asset-id'] : a.assetId
          return aId === assetId
        })
        
        if (!asset) {
          console.log(`Asset ${assetId} not found in account`)
          return 0
        }

        const assetInfo = await this.getAssetInfo(assetId)
        const balance = Number(asset.amount) / Math.pow(10, assetInfo.decimals)
        console.log(`Asset ${assetId} balance: ${balance}`)
        return balance
      }
    } catch (error) {
      console.error('Error getting asset balance:', error)
      return 0
    }
  }

  /**
   * Get all user assets with balances
   * @param address - User's Algorand address
   */
  async getUserAssets(address: string): Promise<Array<{ assetId: number; name: string; unitName: string; balance: number; decimals: number }>> {
    try {
      console.log(`Getting all assets for address: ${address}`)
      
      const accountInfo = await this.algodClient.accountInformation(address).do()
      console.log('Account info:', accountInfo)
      
      const assets: Array<{ assetId: number; name: string; unitName: string; balance: number; decimals: number }> = []
      
      // Add ALGO if balance > 0
      const algoBalance = Number(accountInfo.amount) / Math.pow(10, 6)
      if (algoBalance > 0) {
        assets.push({
          assetId: 0,
          name: 'Algorand',
          unitName: 'ALGO',
          balance: algoBalance,
          decimals: 6
        })
      }
      
      // Process other assets
      if (accountInfo.assets && accountInfo.assets.length > 0) {
        for (const asset of accountInfo.assets) {
          // Handle both property name formats
          const assetId = (asset as any)['asset-id'] !== undefined ? (asset as any)['asset-id'] : (asset as any).assetId
          
          if (!asset || assetId === undefined || assetId === null) {
            console.warn('Invalid asset:', asset)
            continue
          }
          
          try {
            const numericAssetId = Number(assetId)
            const assetInfo = await this.getAssetInfo(numericAssetId)
            const balance = Number(asset.amount) / Math.pow(10, assetInfo.decimals)
            
            if (balance > 0) {
              assets.push({
                assetId: numericAssetId,
                name: assetInfo.name,
                unitName: assetInfo.unitName,
                balance,
                decimals: assetInfo.decimals
              })
            }
          } catch (error) {
            console.error(`Error processing asset ${assetId}:`, error)
          }
        }
      }
      
      console.log('Final assets list:', assets)
      return assets
    } catch (error) {
      console.error('Error getting user assets:', error)
      return []
    }
  }

  /**
   * Wait for transaction confirmation
   * @param txId - Transaction ID
   * @param timeout - Timeout in rounds (default 10)
   */
  async waitForConfirmation(txId: string, timeout: number = 10): Promise<void> {
    try {
      let lastRound = (await this.algodClient.status().do()).lastRound

      while (timeout > 0) {
        const pendingInfo = await this.algodClient.pendingTransactionInformation(txId).do()

        if (pendingInfo.confirmedRound !== null && pendingInfo.confirmedRound !== undefined && pendingInfo.confirmedRound > 0) {
          return
        }

        if (pendingInfo.poolError != null && pendingInfo.poolError.length > 0) {
          throw new Error(`Transaction rejected: ${pendingInfo.poolError}`)
        }

        await this.algodClient.statusAfterBlock(lastRound).do()
        lastRound++
        timeout--
      }

      throw new Error('Transaction confirmation timeout')
    } catch (error: any) {
      console.error('Error waiting for confirmation:', error)
      throw error
    }
  }
}

// Export singleton instance
export const tinymanSwapService = new TinymanSwapService()

