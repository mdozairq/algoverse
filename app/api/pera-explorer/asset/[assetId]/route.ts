import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Proxy route to fetch asset data from Algorand Indexer API (Nodely)
// This avoids CORS issues when fetching from the frontend
export async function GET(
  request: NextRequest,
  { params }: { params: { assetId: string } }
) {
  try {
    const { assetId } = params

    if (!assetId) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      )
    }

    // Helper function to create timeout signal
    const createTimeoutSignal = (timeoutMs: number) => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), timeoutMs)
      return { signal: controller.signal, cleanup: () => clearTimeout(timeout) }
    }

    // Primary: Use Nodely API for asset details
    const assetUrl = `https://testnet-api.4160.nodely.dev/v2/assets/${assetId}`
    let assetData = null
    let transactions = []

    try {
      const { signal: assetSignal, cleanup: cleanupAsset } = createTimeoutSignal(10000)
      const assetResponse = await fetch(assetUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        },
        signal: assetSignal
      })
      cleanupAsset()

      if (assetResponse.ok) {
        assetData = await assetResponse.json()
      }
    } catch (assetError: any) {
      console.warn('Failed to fetch asset from Nodely API:', assetError.message)
    }

    // Fetch transactions from Nodely API
    const transactionsUrl = `https://testnet-api.4160.nodely.dev/v2/assets/${assetId}/transactions?limit=100`
    
    try {
      const { signal: txSignal, cleanup: cleanupTx } = createTimeoutSignal(10000)
      const txResponse = await fetch(transactionsUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        },
        signal: txSignal
      })
      cleanupTx()

      if (txResponse.ok) {
        const txData = await txResponse.json()
        // Handle both array and object with transactions property
        if (Array.isArray(txData)) {
          transactions = txData
        } else if (txData.transactions) {
          transactions = txData.transactions
        } else if (txData.transactions && Array.isArray(txData.transactions)) {
          transactions = txData.transactions
        }
      }
    } catch (txError: any) {
      console.warn('Failed to fetch transactions from Nodely API:', txError.message)
    }

    // If we have asset data, transform it to match expected format
    if (assetData) {
      const transformedData = {
        asset: {
          index: assetData.index || parseInt(assetId),
          id: assetData.index || parseInt(assetId),
          params: {
            name: assetData.params?.name || assetData.params?.['name-b64'] || null,
            unitName: assetData.params?.['unit-name'] || assetData.params?.['unit-name-b64'] || null,
            total: assetData.params?.total || 0,
            decimals: assetData.params?.decimals || 0,
            defaultFrozen: assetData.params?.['default-frozen'] || false,
            creator: assetData.params?.creator || null,
            manager: assetData.params?.manager || null,
            reserve: assetData.params?.reserve || null,
            freeze: assetData.params?.freeze || null,
            clawback: assetData.params?.clawback || null,
            url: assetData.params?.url || assetData.params?.['url-b64'] || null
          }
        },
        transactions: transactions.map((tx: any) => ({
          id: tx.id || tx['tx-id'] || tx.txid,
          type: tx['tx-type'] || tx.txType || tx.type || 'axfer',
          round: tx['confirmed-round'] || tx.confirmedRound || tx.round,
          timestamp: tx['round-time'] || tx.roundTime || tx.timestamp,
          sender: tx.sender || tx['from'] || null,
          receiver: tx['asset-transfer-transaction']?.receiver || tx.receiver || tx['to'] || null,
          amount: tx['asset-transfer-transaction']?.amount || tx.amount || 0,
          fee: tx.fee || 0,
          note: tx.note || null
        }))
      }

      return NextResponse.json({
        success: true,
        data: transformedData,
        source: 'nodely'
      })
    }

    // Fallback to Pera Wallet Explorer API
    const explorerUrl = `https://testnet.explorer.perawallet.app/asset/${assetId}/api`
    
    try {
      const { signal: explorerSignal, cleanup: cleanupExplorer } = createTimeoutSignal(10000)
      const explorerResponse = await fetch(explorerUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        },
        signal: explorerSignal
      })
      cleanupExplorer()

      if (explorerResponse.ok) {
        const data = await explorerResponse.json()
        return NextResponse.json({
          success: true,
          data,
          source: 'explorer'
        })
      }
    } catch (explorerError: any) {
      console.warn('Explorer endpoint also failed:', explorerError.message)
    }

    // If all fail, return error
    return NextResponse.json(
      { 
        error: 'Failed to fetch asset data',
        details: 'All API endpoints failed'
      },
      { status: 500 }
    )

  } catch (error: any) {
    console.error('Error fetching asset data from Pera Explorer:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch asset data',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
