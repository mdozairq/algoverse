import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { marketplaceTokensCollection, tokenTradingRulesCollection } from '@/lib/firebase/collections'
import { requireAuth } from '@/lib/auth/middleware'
import { TradingRulesAutomation } from '@/lib/algorand/trading-rules-automation'
import algosdk from 'algosdk'

/**
 * POST /api/marketplaces/[id]/tokens/[tokenId]/trading-rules/[ruleId]/execute
 * Manually execute a trading rule
 */
export const POST = requireAuth(async (
  request: NextRequest,
  { params }: { params: { id: string; tokenId: string; ruleId: string } }
) => {
  try {
    const auth = (request as any).auth
    const { id: marketplaceId, tokenId, ruleId } = params
    const body = await request.json()
    const { walletAddress, walletPrivateKey } = body

    // Verify token belongs to marketplace and merchant
    const token = await marketplaceTokensCollection.getById(tokenId)
    if (!token || token.marketplaceId !== marketplaceId || token.merchantId !== auth.uid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Get trading rule
    const rule = await tokenTradingRulesCollection.getById(ruleId)
    if (!rule || rule.tokenId !== tokenId) {
      return NextResponse.json(
        { error: 'Trading rule not found' },
        { status: 404 }
      )
    }

    if (!rule.enabled) {
      return NextResponse.json(
        { error: 'Trading rule is disabled' },
        { status: 400 }
      )
    }

    if (!walletAddress || !walletPrivateKey) {
      return NextResponse.json(
        { error: 'Wallet address and private key are required' },
        { status: 400 }
      )
    }

    // Convert private key from mnemonic if needed
    let privateKey: Uint8Array
    if (typeof walletPrivateKey === 'string' && walletPrivateKey.split(' ').length > 1) {
      // It's a mnemonic
      const account = algosdk.mnemonicToSecretKey(walletPrivateKey)
      privateKey = account.sk
    } else if (typeof walletPrivateKey === 'string') {
      // It's a base64 encoded key
      privateKey = new Uint8Array(Buffer.from(walletPrivateKey, 'base64'))
    } else {
      return NextResponse.json(
        { error: 'Invalid private key format' },
        { status: 400 }
      )
    }

    // Execute rule based on type
    let execution
    if (rule.type === 'dca') {
      execution = await TradingRulesAutomation.executeDCA(
        {
          id: rule.id,
          tokenId: rule.tokenId,
          marketplaceId: rule.marketplaceId,
          enabled: rule.enabled,
          interval: rule.config.interval || 24,
          amount: rule.config.amount || 10,
          assetIn: 0, // ALGO
          assetOut: token.assetId || 0,
          nextExecution: rule.nextExecution,
          lastExecuted: rule.lastExecuted,
          executionCount: rule.executionCount,
        },
        walletAddress,
        privateKey
      )
    } else if (rule.type === 'rebalancing') {
      // For rebalancing, we need current balance and portfolio value
      // This is a simplified version - in production, fetch from blockchain
      execution = await TradingRulesAutomation.executeRebalancing(
        {
          id: rule.id,
          tokenId: rule.tokenId,
          marketplaceId: rule.marketplaceId,
          enabled: rule.enabled,
          targetAllocation: rule.config.targetAllocation || 50,
          threshold: rule.config.threshold || 5,
          currentAllocation: rule.config.currentAllocation || 0,
          lastRebalanced: rule.lastExecuted,
          executionCount: rule.executionCount,
        },
        0, // currentBalance - would be fetched from blockchain
        0, // totalPortfolioValue - would be calculated
        walletAddress,
        privateKey
      )
    } else if (rule.type === 'rotation') {
      // For rotation, we need asset options
      execution = await TradingRulesAutomation.executeRotation(
        {
          id: rule.id,
          tokenId: rule.tokenId,
          marketplaceId: rule.marketplaceId,
          enabled: rule.enabled,
          strategy: rule.config.strategy || 'time',
          rotationInterval: rule.config.rotationInterval,
          performanceThreshold: rule.config.performanceThreshold,
          volumeThreshold: rule.config.volumeThreshold,
          lastRotated: rule.lastExecuted,
          executionCount: rule.executionCount,
        },
        [], // assetOptions - would be fetched
        walletAddress,
        privateKey
      )
    } else {
      return NextResponse.json(
        { error: 'Unsupported rule type' },
        { status: 400 }
      )
    }

    // Update rule execution data
    if (execution.status === 'completed') {
      const nextExecution = rule.type === 'dca' && rule.config.interval
        ? new Date(Date.now() + rule.config.interval * 60 * 60 * 1000)
        : undefined

      await tokenTradingRulesCollection.updateExecution(ruleId, {
        lastExecuted: new Date(),
        nextExecution,
        executionCount: rule.executionCount + 1,
      })
    }

    return NextResponse.json({
      success: true,
      execution,
      message: 'Trading rule executed successfully',
    })
  } catch (error: any) {
    console.error('Error executing trading rule:', error)
    return NextResponse.json(
      { error: `Failed to execute trading rule: ${error.message}` },
      { status: 500 }
    )
  }
})

