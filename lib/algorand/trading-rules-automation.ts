/**
 * Trading Rules Automation Service
 * 
 * Handles automated trading strategies:
 * - DCA (Dollar Cost Averaging): Regular purchases at fixed intervals
 * - Rebalancing: Maintain target portfolio allocations
 * - Rotation: Rotate between assets based on performance
 */

import algosdk from 'algosdk'
import { getAlgodClient, algosToMicroAlgos, microAlgosToAlgos } from '@/lib/algorand/config'
import { multiDEXAggregator } from '@/lib/dex/multi-dex-aggregator'

const algodClient = getAlgodClient()

export interface DCARule {
  id: string
  tokenId: string
  marketplaceId: string
  enabled: boolean
  interval: number // hours
  amount: number // ALGO amount per purchase
  assetIn: number // Asset ID to spend (0 for ALGO)
  assetOut: number // Asset ID to buy (marketplace token)
  nextExecution?: Date
  lastExecuted?: Date
  executionCount: number
}

export interface RebalancingRule {
  id: string
  tokenId: string
  marketplaceId: string
  enabled: boolean
  targetAllocation: number // percentage (0-100)
  threshold: number // percentage deviation to trigger rebalancing
  currentAllocation: number
  lastRebalanced?: Date
  executionCount: number
}

export interface RotationRule {
  id: string
  tokenId: string
  marketplaceId: string
  enabled: boolean
  strategy: 'performance' | 'time' | 'volume'
  rotationInterval?: number // hours (for time strategy)
  performanceThreshold?: number // percentage (for performance strategy)
  volumeThreshold?: number // for volume strategy
  lastRotated?: Date
  executionCount: number
}

export interface TradingRuleExecution {
  id: string
  ruleId: string
  ruleType: 'dca' | 'rebalancing' | 'rotation'
  status: 'pending' | 'executing' | 'completed' | 'failed'
  transactionId?: string
  amountIn?: number
  amountOut?: number
  executedAt?: Date
  error?: string
}

export class TradingRulesAutomation {
  /**
   * Execute DCA rule - purchase tokens at regular intervals
   */
  static async executeDCA(
    rule: DCARule,
    walletAddress: string,
    walletPrivateKey: Uint8Array
  ): Promise<TradingRuleExecution> {
    try {
      // Get swap quote
      const quote = await multiDEXAggregator.getAggregatedQuote(
        rule.assetIn,
        rule.assetOut,
        rule.amount,
        0.5 // 0.5% slippage
      )

      // Prepare swap transactions
      const transactions = await multiDEXAggregator.prepareSwapTransactions(
        quote,
        walletAddress
      )

      // Sign transactions
      const signedTxns = transactions.map(txn => {
        return algosdk.signTransaction(txn, walletPrivateKey)
      })

      // Submit transactions
      const signedBytes = signedTxns.map(stxn => stxn.blob)
      const result = await algodClient.sendRawTransaction(signedBytes).do()
      const txId = result.txid

      // Wait for confirmation
      await algosdk.waitForConfirmation(algodClient, txId, 4)

      return {
        id: `exec_${Date.now()}`,
        ruleId: rule.id,
        ruleType: 'dca',
        status: 'completed',
        transactionId: txId,
        amountIn: quote.amountIn,
        amountOut: quote.amountOut,
        executedAt: new Date(),
      }
    } catch (error: any) {
      return {
        id: `exec_${Date.now()}`,
        ruleId: rule.id,
        ruleType: 'dca',
        status: 'failed',
        error: error.message,
        executedAt: new Date(),
      }
    }
  }

  /**
   * Execute rebalancing rule - adjust portfolio to target allocation
   */
  static async executeRebalancing(
    rule: RebalancingRule,
    currentBalance: number,
    totalPortfolioValue: number,
    walletAddress: string,
    walletPrivateKey: Uint8Array
  ): Promise<TradingRuleExecution> {
    try {
      const currentAllocation = (currentBalance / totalPortfolioValue) * 100
      const deviation = Math.abs(currentAllocation - rule.targetAllocation)

      // Only rebalance if deviation exceeds threshold
      if (deviation < rule.threshold) {
        return {
          id: `exec_${Date.now()}`,
          ruleId: rule.id,
          ruleType: 'rebalancing',
          status: 'completed',
          error: 'No rebalancing needed - within threshold',
          executedAt: new Date(),
        }
      }

      // Calculate amount to buy/sell
      const targetValue = (rule.targetAllocation / 100) * totalPortfolioValue
      const adjustment = targetValue - currentBalance

      if (Math.abs(adjustment) < 0.001) {
        return {
          id: `exec_${Date.now()}`,
          ruleId: rule.id,
          ruleType: 'rebalancing',
          status: 'completed',
          error: 'Adjustment too small',
          executedAt: new Date(),
        }
      }

      // Determine swap direction
      const assetIn = adjustment > 0 ? 0 : rule.tokenId as any // ALGO or token
      const assetOut = adjustment > 0 ? rule.tokenId as any : 0 // Token or ALGO
      const amount = Math.abs(adjustment)

      // Get swap quote
      const quote = await multiDEXAggregator.getAggregatedQuote(
        assetIn,
        assetOut,
        amount,
        0.5
      )

      // Prepare and execute swap
      const transactions = await multiDEXAggregator.prepareSwapTransactions(
        quote,
        walletAddress
      )

      const signedTxns = transactions.map(txn => {
        return algosdk.signTransaction(txn, walletPrivateKey)
      })

      const signedBytes = signedTxns.map(stxn => stxn.blob)
      const result = await algodClient.sendRawTransaction(signedBytes).do()
      const txId = result.txid

      await algosdk.waitForConfirmation(algodClient, txId, 4)

      return {
        id: `exec_${Date.now()}`,
        ruleId: rule.id,
        ruleType: 'rebalancing',
        status: 'completed',
        transactionId: txId,
        amountIn: quote.amountIn,
        amountOut: quote.amountOut,
        executedAt: new Date(),
      }
    } catch (error: any) {
      return {
        id: `exec_${Date.now()}`,
        ruleId: rule.id,
        ruleType: 'rebalancing',
        status: 'failed',
        error: error.message,
        executedAt: new Date(),
      }
    }
  }

  /**
   * Execute rotation rule - rotate between assets based on strategy
   */
  static async executeRotation(
    rule: RotationRule,
    assetOptions: Array<{ assetId: number; performance?: number; volume?: number }>,
    walletAddress: string,
    walletPrivateKey: Uint8Array
  ): Promise<TradingRuleExecution> {
    try {
      // Select asset based on strategy
      let selectedAsset: number | null = null

      if (rule.strategy === 'performance') {
        // Select asset with best performance
        selectedAsset = assetOptions
          .sort((a, b) => (b.performance || 0) - (a.performance || 0))[0]?.assetId || null
      } else if (rule.strategy === 'volume') {
        // Select asset with highest volume
        selectedAsset = assetOptions
          .sort((a, b) => (b.volume || 0) - (a.volume || 0))[0]?.assetId || null
      } else if (rule.strategy === 'time') {
        // Rotate based on time interval
        const now = Date.now()
        const lastRotated = rule.lastRotated?.getTime() || 0
        const intervalMs = (rule.rotationInterval || 24) * 60 * 60 * 1000

        if (now - lastRotated >= intervalMs) {
          // Rotate to next asset in sequence
          const currentIndex = assetOptions.findIndex(a => a.assetId === rule.tokenId as any)
          const nextIndex = (currentIndex + 1) % assetOptions.length
          selectedAsset = assetOptions[nextIndex]?.assetId || null
        } else {
          return {
            id: `exec_${Date.now()}`,
            ruleId: rule.id,
            ruleType: 'rotation',
            status: 'completed',
            error: 'Rotation interval not reached',
            executedAt: new Date(),
          }
        }
      }

      if (!selectedAsset) {
        return {
          id: `exec_${Date.now()}`,
          ruleId: rule.id,
          ruleType: 'rotation',
          status: 'failed',
          error: 'No asset selected for rotation',
          executedAt: new Date(),
        }
      }

      // Execute swap from current token to selected asset
      // This is a simplified implementation - in production, you'd check current holdings
      const quote = await multiDEXAggregator.getAggregatedQuote(
        rule.tokenId as any,
        selectedAsset,
        1, // Amount to rotate - would be calculated from current holdings
        0.5
      )

      const transactions = await multiDEXAggregator.prepareSwapTransactions(
        quote,
        walletAddress
      )

      const signedTxns = transactions.map(txn => {
        return algosdk.signTransaction(txn, walletPrivateKey)
      })

      const signedBytes = signedTxns.map(stxn => stxn.blob)
      const result = await algodClient.sendRawTransaction(signedBytes).do()
      const txId = result.txid

      await algosdk.waitForConfirmation(algodClient, txId, 4)

      return {
        id: `exec_${Date.now()}`,
        ruleId: rule.id,
        ruleType: 'rotation',
        status: 'completed',
        transactionId: txId,
        amountIn: quote.amountIn,
        amountOut: quote.amountOut,
        executedAt: new Date(),
      }
    } catch (error: any) {
      return {
        id: `exec_${Date.now()}`,
        ruleId: rule.id,
        ruleType: 'rotation',
        status: 'failed',
        error: error.message,
        executedAt: new Date(),
      }
    }
  }

  /**
   * Check if a DCA rule should execute
   */
  static shouldExecuteDCA(rule: DCARule): boolean {
    if (!rule.enabled) return false
    if (!rule.nextExecution) return true

    const now = new Date()
    return now >= rule.nextExecution
  }

  /**
   * Check if a rebalancing rule should execute
   */
  static shouldExecuteRebalancing(
    rule: RebalancingRule,
    currentAllocation: number
  ): boolean {
    if (!rule.enabled) return false

    const deviation = Math.abs(currentAllocation - rule.targetAllocation)
    return deviation >= rule.threshold
  }

  /**
   * Check if a rotation rule should execute
   */
  static shouldExecuteRotation(rule: RotationRule): boolean {
    if (!rule.enabled) return false
    if (rule.strategy !== 'time') return true // Performance and volume strategies check on-demand

    if (!rule.lastRotated || !rule.rotationInterval) return true

    const now = Date.now()
    const lastRotated = rule.lastRotated.getTime()
    const intervalMs = rule.rotationInterval * 60 * 60 * 1000

    return now - lastRotated >= intervalMs
  }
}

