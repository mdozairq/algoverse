import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { marketplaceTokensCollection, tokenTradingRulesCollection, TokenTradingRule } from '@/lib/firebase/collections'
import { requireAuth } from '@/lib/auth/middleware'

/**
 * GET /api/marketplaces/[id]/tokens/[tokenId]/trading-rules
 * Get all trading rules for a token
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

    // Get trading rules using collection service
    const rules = await tokenTradingRulesCollection.getByToken(tokenId)

    return NextResponse.json({
      success: true,
      rules: rules.map(rule => ({
        ...rule,
        createdAt: rule.createdAt instanceof Date ? rule.createdAt.toISOString() : rule.createdAt,
        updatedAt: rule.updatedAt instanceof Date ? rule.updatedAt.toISOString() : rule.updatedAt,
        lastExecuted: rule.lastExecuted instanceof Date ? rule.lastExecuted.toISOString() : rule.lastExecuted,
        nextExecution: rule.nextExecution instanceof Date ? rule.nextExecution.toISOString() : rule.nextExecution,
      })),
    })
  } catch (error: any) {
    console.error('Error fetching trading rules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trading rules' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/marketplaces/[id]/tokens/[tokenId]/trading-rules
 * Create a new trading rule
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

    const { type, enabled, config } = body

    if (!type || !['dca', 'rebalancing', 'rotation'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid rule type' },
        { status: 400 }
      )
    }

    // Calculate next execution time for DCA
    let nextExecution: Date | undefined
    if (type === 'dca' && config.interval) {
      const now = new Date()
      nextExecution = new Date(now.getTime() + config.interval * 60 * 60 * 1000)
    }

    const ruleData: Omit<TokenTradingRule, 'id' | 'createdAt' | 'updatedAt'> = {
      tokenId,
      marketplaceId,
      type: type as 'dca' | 'rebalancing' | 'rotation',
      enabled: enabled !== false,
      config,
      executionCount: 0,
      nextExecution,
    }

    const ruleId = await tokenTradingRulesCollection.create(ruleData)

    return NextResponse.json({
      success: true,
      ruleId,
      message: 'Trading rule created successfully',
    })
  } catch (error: any) {
    console.error('Error creating trading rule:', error)
    return NextResponse.json(
      { error: 'Failed to create trading rule' },
      { status: 500 }
    )
  }
})

/**
 * PUT /api/marketplaces/[id]/tokens/[tokenId]/trading-rules/[ruleId]
 * Update a trading rule
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; tokenId: string; ruleId: string } }
) {
  try {
    const { ruleId } = params
    const body = await request.json()

    const updateData: Partial<TokenTradingRule> = {
      ...body,
    }

    // Recalculate next execution if DCA interval changed
    if (body.config?.interval && body.type === 'dca') {
      const now = new Date()
      updateData.nextExecution = new Date(now.getTime() + body.config.interval * 60 * 60 * 1000)
    }

    await tokenTradingRulesCollection.update(ruleId, updateData)

    return NextResponse.json({
      success: true,
      message: 'Trading rule updated successfully',
    })
  } catch (error: any) {
    console.error('Error updating trading rule:', error)
    return NextResponse.json(
      { error: 'Failed to update trading rule' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/marketplaces/[id]/tokens/[tokenId]/trading-rules/[ruleId]
 * Delete a trading rule
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; tokenId: string; ruleId: string } }
) {
  try {
    const { ruleId } = params

    await tokenTradingRulesCollection.delete(ruleId)

    return NextResponse.json({
      success: true,
      message: 'Trading rule deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting trading rule:', error)
    return NextResponse.json(
      { error: 'Failed to delete trading rule' },
      { status: 500 }
    )
  }
}

