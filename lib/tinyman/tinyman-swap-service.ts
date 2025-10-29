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
import { Swap, type SupportedNetwork, poolUtils, SwapType } from '@tinymanorg/tinyman-js-sdk'
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
   * Get asset information from Algorand
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
  async checkPoolExists(assetInId: number, assetOutId: number = 0): Promise<boolean> {
    try {
      const poolInfo = await poolUtils.v2.getPoolInfo({
        network: this.network,
        client: this.algodClient,
        asset1ID: assetInId,
        asset2ID: assetOutId
      })
      return poolInfo !== null && !poolUtils.isPoolNotCreated(poolInfo)
    } catch (error) {
      console.error('Error checking pool existence:', error)
      return false
    }
  }

  /**
   * Get swap quote for converting ASA to ALGO
   * @param assetInId - The ASA ID to swap from
   * @param amount - Amount in human-readable format (e.g., 100.5)
   * @param slippage - Slippage tolerance (default 0.01 = 1%)
   */
  async getSwapQuote(
    assetInId: number,
    amount: number,
    slippage: number = 0.01
  ): Promise<SwapQuote> {
    if (!amount || amount <= 0) {
      throw new Error('Amount must be greater than 0')
    }

    // Get asset information
    const assetIn = await this.getAssetInfo(assetInId)
    const assetOut = await this.getAssetInfo(0) // ALGO

    // Convert amount to micro-units (accounting for decimals)
    const amountInMicroUnits = BigInt(Math.floor(amount * Math.pow(10, assetIn.decimals)))

    try {
      // Fetch pool info
      const poolInfo = await poolUtils.v2.getPoolInfo({
        network: this.network,
        client: this.algodClient,
        asset1ID: assetInId,
        asset2ID: 0
      })

      if (!poolInfo || poolUtils.isPoolNotCreated(poolInfo)) {
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
          poolExists: false
        }
      }

      // Get quote with fixed input using Swap.v2 API
      const quote = await Swap.v2.getFixedInputSwapQuote({
        amount: amountInMicroUnits,
        assetIn: { id: assetInId, decimals: assetIn.decimals },
        assetOut: { id: 0, decimals: assetOut.decimals },
        network: this.network,
        slippage,
        pool: poolInfo
      })

      if (quote.type === 'direct') {
        const quoteData = quote.data.quote
        const amountOut = Number(quoteData.assetOutAmount) / Math.pow(10, assetOut.decimals)
        const minAmountOut = amountOut * (1 - slippage)
        const swapFee = Number(quoteData.swapFee) / Math.pow(10, assetOut.decimals)

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
          poolExists: true
        }
      }

      throw new Error('Router swaps not yet supported')
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
      // Fetch pool info
      const poolInfo = await poolUtils.v2.getPoolInfo({
        network: this.network,
        client: this.algodClient,
        asset1ID: quote.input.asset.id,
        asset2ID: 0
      })

      if (!poolInfo || poolUtils.isPoolNotCreated(poolInfo)) {
        throw new Error('Pool not found')
      }

      // Get quote again to use with generateTxns
      const swapQuote = await Swap.v2.getFixedInputSwapQuote({
        amount: BigInt(quote.input.amountInMicroUnits),
        assetIn: { id: quote.input.asset.id, decimals: quote.input.asset.decimals },
        assetOut: { id: 0, decimals: 6 },
        network: this.network,
        slippage: quote.slippage,
        pool: poolInfo
      })

      // Generate transactions
      const txGroup = await Swap.generateTxns({
        client: this.algodClient,
        network: this.network,
        quote: swapQuote,
        swapType: SwapType.FixedInput,
        slippage: quote.slippage,
        initiatorAddr: userAddress
      })

      // Convert SignerTransaction[] to Transaction[]
      return txGroup.map(stxn => stxn.txn)
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
      const poolInfo = await poolUtils.v2.getPoolInfo({
        network: this.network,
        client: this.algodClient,
        asset1ID: quote.input.asset.id,
        asset2ID: 0
      })

      if (!poolInfo || poolUtils.isPoolNotCreated(poolInfo)) {
        throw new Error('Pool not found')
      }

      // Get quote again
      const swapQuote = await Swap.v2.getFixedInputSwapQuote({
        amount: BigInt(quote.input.amountInMicroUnits),
        assetIn: { id: quote.input.asset.id, decimals: quote.input.asset.decimals },
        assetOut: { id: 0, decimals: 6 },
        network: this.network,
        slippage: quote.slippage,
        pool: poolInfo
      })

      // Generate transactions for execution
      const txGroup = await Swap.generateTxns({
        client: this.algodClient,
        network: this.network,
        quote: swapQuote,
        swapType: SwapType.FixedInput,
        slippage: quote.slippage,
        initiatorAddr: userAddress
      })

      // Execute swap
      const result = await Swap.execute({
        client: this.algodClient,
        contractVersion: 'v2',
        quote: swapQuote,
        txGroup,
        signedTxns: signedTxnsBytes
      })

      return {
        txId: result.txnID,
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
      if (assetId === 0) {
        // ALGO balance
        const accountInfo = await this.algodClient.accountInformation(address).do()
        return Number(accountInfo.amount)
      } else {
        // ASA balance
        const accountInfo = await this.algodClient.accountInformation(address).do()
        const asset = accountInfo.assets?.find((a: any) => a['asset-id'] === assetId)
        
        if (!asset) {
          return 0
        }

        const assetInfo = await this.getAssetInfo(assetId)
        return Number(asset.amount) / Math.pow(10, assetInfo.decimals)
      }
    } catch (error) {
      console.error('Error getting asset balance:', error)
      return 0
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

