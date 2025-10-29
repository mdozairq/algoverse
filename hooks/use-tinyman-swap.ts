/**
 * useTinymanSwap Hook
 * 
 * React hook for managing Tinyman swap state and operations.
 * Integrates with walletService for transaction signing.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { tinymanSwapService, SwapQuote, SwapResult, AssetInfo } from '@/lib/tinyman/tinyman-swap-service'
import { walletService } from '@/lib/wallet/wallet-service'
import algosdk from 'algosdk'
import { Buffer } from 'buffer'

export interface SwapState {
  quote: SwapQuote | null
  loading: boolean
  error: string | null
  txStatus: 'idle' | 'preparing' | 'signing' | 'submitting' | 'confirming' | 'confirmed' | 'failed'
  assetInfo: AssetInfo | null
  balance: number
}

export interface UseTinymanSwapReturn {
  // State
  quote: SwapQuote | null
  loading: boolean
  error: string | null
  txStatus: SwapState['txStatus']
  assetInfo: AssetInfo | null
  balance: number
  
  // Actions
  getQuote: (assetId: number, amount: number, slippage?: number) => Promise<SwapQuote | null>
  executeSwap: (quote: SwapQuote) => Promise<SwapResult | null>
  clearQuote: () => void
  clearError: () => void
  refreshBalance: (assetId: number, address: string) => Promise<void>
}

export function useTinymanSwap(
  merchantId: string,
  walletAddress: string | null
): UseTinymanSwapReturn {
  const [state, setState] = useState<SwapState>({
    quote: null,
    loading: false,
    error: null,
    txStatus: 'idle',
    assetInfo: null,
    balance: 0
  })

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const currentAssetIdRef = useRef<number | null>(null)

  /**
   * Clear quote from state
   */
  const clearQuote = useCallback(() => {
    setState(prev => ({ ...prev, quote: null }))
  }, [])

  /**
   * Clear error from state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  /**
   * Refresh asset balance
   */
  const refreshBalance = useCallback(async (assetId: number, address: string) => {
    try {
      const balance = await tinymanSwapService.getAssetBalance(address, assetId)
      setState(prev => ({ ...prev, balance }))
    } catch (error: any) {
      console.error('Error refreshing balance:', error)
    }
  }, [])

  /**
   * Get swap quote with debouncing
   */
  const getQuote = useCallback(async (
    assetId: number,
    amount: number,
    slippage: number = 0.01
  ): Promise<SwapQuote | null> => {
    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Validate input
    if (!assetId || !amount || amount <= 0) {
      setState(prev => ({ 
        ...prev, 
        quote: null,
        error: null,
        loading: false 
      }))
      return null
    }

    // Store current asset ID
    currentAssetIdRef.current = assetId

    // Set loading state
    setState(prev => ({ ...prev, loading: true, error: null }))

    // Return promise that resolves after debounce
    return new Promise((resolve) => {
      debounceTimerRef.current = setTimeout(async () => {
        try {
          // Check if assetId changed during debounce
          if (currentAssetIdRef.current !== assetId) {
            setState(prev => ({ ...prev, loading: false }))
            resolve(null)
            return
          }

          // Fetch asset info if not already loaded
          let assetInfo = state.assetInfo
          if (!assetInfo || assetInfo.id !== assetId) {
            assetInfo = await tinymanSwapService.getAssetInfo(assetId)
            setState(prev => ({ ...prev, assetInfo }))
          }

          // Get quote
          const quote = await tinymanSwapService.getSwapQuote(assetId, amount, slippage)

          // Check if assetId still matches (user might have changed it)
          if (currentAssetIdRef.current === assetId) {
            setState(prev => ({ 
              ...prev, 
              quote, 
              loading: false, 
              error: null,
              assetInfo 
            }))
            resolve(quote)
          } else {
            setState(prev => ({ ...prev, loading: false }))
            resolve(null)
          }
        } catch (error: any) {
          // Only update state if this is still the current request
          if (currentAssetIdRef.current === assetId) {
            setState(prev => ({ 
              ...prev, 
              error: error.message || 'Failed to get swap quote',
              loading: false,
              quote: null
            }))
          }
          resolve(null)
        }
      }, 600) // 600ms debounce
    })
  }, [state.assetInfo])

  /**
   * Execute swap transaction
   */
  const executeSwap = useCallback(async (quote: SwapQuote): Promise<SwapResult | null> => {
    if (!quote) {
      setState(prev => ({ ...prev, error: 'No quote available' }))
      return null
    }

    if (!walletAddress) {
      setState(prev => ({ ...prev, error: 'Wallet not connected' }))
      return null
    }

    if (!quote.poolExists) {
      setState(prev => ({ ...prev, error: 'No liquidity pool exists for this asset pair' }))
      return null
    }

    setState(prev => ({ ...prev, txStatus: 'preparing', error: null }))

    try {
      // Step 1: Prepare transactions
      const transactions = await tinymanSwapService.prepareSwapTransactions(quote, walletAddress)

      // Step 2: Convert transactions to base64 for wallet signing
      const unsignedTxns = transactions.map(txn => {
        const txnBytes = algosdk.encodeUnsignedTransaction(txn)
        return Buffer.from(txnBytes).toString('base64')
      })

      setState(prev => ({ ...prev, txStatus: 'signing' }))

      // Step 3: Sign transactions using wallet service
      const signedTxns = await walletService.signTransactions(unsignedTxns)

      if (!signedTxns || signedTxns.length === 0) {
        throw new Error('Transaction signing failed or was cancelled')
      }

      setState(prev => ({ ...prev, txStatus: 'submitting' }))

      // Step 4: Execute swap
      const result = await tinymanSwapService.executeSwap(quote, signedTxns, walletAddress)

      setState(prev => ({ ...prev, txStatus: 'confirming' }))

      // Step 5: Wait for confirmation
      await tinymanSwapService.waitForConfirmation(result.txId)

      setState(prev => ({ 
        ...prev, 
        txStatus: 'confirmed',
        quote: null // Clear quote after successful swap
      }))

      // Refresh balance
      if (currentAssetIdRef.current !== null) {
        await refreshBalance(currentAssetIdRef.current, walletAddress)
      }

      return result
    } catch (error: any) {
      console.error('Swap execution error:', error)
      
      let errorMessage = 'Swap failed'
      if (error.message?.includes('rejected') || error.message?.includes('cancelled')) {
        errorMessage = 'Transaction signing was cancelled'
      } else if (error.message?.includes('insufficient')) {
        errorMessage = 'Insufficient balance for this swap'
      } else if (error.message?.includes('pool')) {
        errorMessage = 'No liquidity pool available for this asset'
      } else if (error.message) {
        errorMessage = error.message
      }

      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        txStatus: 'failed'
      }))
      
      return null
    }
  }, [walletAddress, refreshBalance])

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  // Refresh balance when wallet address or asset changes
  useEffect(() => {
    if (walletAddress && state.assetInfo) {
      refreshBalance(state.assetInfo.id, walletAddress)
    }
  }, [walletAddress, state.assetInfo?.id, refreshBalance])

  return {
    // State
    quote: state.quote,
    loading: state.loading,
    error: state.error,
    txStatus: state.txStatus,
    assetInfo: state.assetInfo,
    balance: state.balance,
    
    // Actions
    getQuote,
    executeSwap,
    clearQuote,
    clearError,
    refreshBalance
  }
}

