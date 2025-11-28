import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { marketplaceTokensCollection } from '@/lib/firebase/collections'
import { requireAuth } from '@/lib/auth/middleware'
import { AlgorandNFTService } from '@/lib/algorand/nft-service'
import algosdk from 'algosdk'
import { getAlgodClient } from '@/lib/algorand/config'

// Get platform wallet from environment
const getPlatformWallet = () => {
  const mnemonic = process.env.PLATFORM_WALLET_MNEMONIC
  if (!mnemonic) {
    throw new Error('PLATFORM_WALLET_MNEMONIC not set')
  }
  return algosdk.mnemonicToSecretKey(mnemonic)
}

/**
 * POST /api/marketplaces/[id]/tokens/[tokenId]/deploy
 * Deploy approved token to Algorand blockchain
 */
export const POST = requireAuth(async (
  request: NextRequest,
  { params }: { params: { id: string; tokenId: string } }
) => {
  try {
    const auth = (request as any).auth
    const { id: marketplaceId, tokenId } = params

    // Get token
    const token = await marketplaceTokensCollection.getById(tokenId)
    if (!token) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      )
    }

    // Verify token is approved
    if (token.status !== 'approved') {
      return NextResponse.json(
        { error: 'Token must be approved before deployment' },
        { status: 400 }
      )
    }

    // Verify merchant owns this token
    if (token.merchantId !== auth.userId) {
      return NextResponse.json(
        { error: 'Unauthorized: You do not own this token' },
        { status: 403 }
      )
    }

    // Get marketplace
    const marketplaceRef = adminDb.collection('marketplaces').doc(marketplaceId)
    const marketplaceDoc = await marketplaceRef.get()
    
    if (!marketplaceDoc.exists) {
      return NextResponse.json(
        { error: 'Marketplace not found' },
        { status: 404 }
      )
    }

    const marketplace = marketplaceDoc.data()

    // Get platform wallet for token creation
    const platformWallet = getPlatformWallet()
    const algodClient = getAlgodClient()

    // Create ASA (Algorand Standard Asset) for the token
    const assetParams = {
      total: token.totalSupply * Math.pow(10, token.decimals), // Convert to micro units
      decimals: token.decimals,
      defaultFrozen: false,
      unitName: token.symbol,
      assetName: token.name,
      manager: platformWallet.addr,
      reserve: platformWallet.addr,
      freeze: platformWallet.addr,
      clawback: platformWallet.addr,
      url: token.website || '',
      metadataHash: undefined, // Can add IPFS hash if needed
    }

    // Create asset creation transaction
    const suggestedParams = await algodClient.getTransactionParams().do()
    const assetCreationTxn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      from: platformWallet.addr,
      suggestedParams,
      ...assetParams,
    })

    // Sign and submit transaction
    const signedTxn = assetCreationTxn.signTxn(platformWallet.sk)
    const txId = assetCreationTxn.txID().toString()

    await algodClient.sendRawTransaction(signedTxn).do()

    // Wait for confirmation
    const confirmedTxn = await algosdk.waitForConfirmation(
      algodClient,
      txId,
      4
    )

    const assetId = confirmedTxn['asset-index']

    // Update token with asset ID and mark as deployed
    await marketplaceTokensCollection.deploy(tokenId, assetId)

    // Update marketplace to use this token
    await marketplaceRef.update({
      tokenAssetId: assetId,
      tokenSymbol: token.symbol,
      updatedAt: new Date(),
    })

    // After deployment, update liquidity pool records if pools exist
    // Note: Actual pool creation on DEXs would happen separately via merchant action
    // This just updates the records to reflect the token is now deployed
    if (token.liquidityPools) {
      const { tokenLiquidityPoolsCollection } = await import('@/lib/firebase/collections')
      const pools = await tokenLiquidityPoolsCollection.getByToken(tokenId)
      
      for (const pool of pools) {
        // Update pool status to indicate token is ready for liquidity
        await tokenLiquidityPoolsCollection.update(pool.id, {
          status: 'ready', // Token deployed, ready for liquidity provision
        })
      }
    }

    return NextResponse.json({
      success: true,
      assetId,
      txId,
      message: 'Token deployed successfully to Algorand blockchain',
    })
  } catch (error: any) {
    console.error('Error deploying token:', error)
    return NextResponse.json(
      { error: `Failed to deploy token: ${error.message}` },
      { status: 500 }
    )
  }
})

