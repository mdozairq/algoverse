import { NextRequest, NextResponse } from 'next/server'
import { FirebaseService } from '@/lib/firebase/collections'
import { requireRole } from '@/lib/auth/middleware'

export const POST = requireRole(["user"])(async (request: NextRequest) => {
  try {
    const auth = (request as any).auth
    const { purchaseId, nftAssetId, totalSupply, nftAssetIds } = await request.json()

    if (!purchaseId) {
      return NextResponse.json({ error: "Purchase ID is required" }, { status: 400 })
    }

    // Support both old format (array) and new format (single asset with units)
    if (!nftAssetId && (!nftAssetIds || !Array.isArray(nftAssetIds))) {
      return NextResponse.json({ error: "NFT Asset ID or Asset IDs are required" }, { status: 400 })
    }

    // Get purchase details
    const purchase = await FirebaseService.getPurchaseById(purchaseId)
    if (!purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 })
    }

    // Verify the purchase belongs to the user
    if (purchase.userId !== auth.userId) {
      return NextResponse.json({ error: "Unauthorized access to purchase" }, { status: 403 })
    }

    let updatedNftTickets

    if (nftAssetId && totalSupply) {
      // New format: Single asset with multiple units
      updatedNftTickets = purchase.nftTickets.map((ticket, index) => ({
        ...ticket,
        assetId: nftAssetId,
        unitNumber: index + 1,
        totalSupply: totalSupply,
        status: 'minted' as const
      }))
    } else {
      // Old format: Multiple individual assets
      updatedNftTickets = purchase.nftTickets.map((ticket, index) => ({
        ...ticket,
        assetId: nftAssetIds[index] || null,
        status: (nftAssetIds[index] ? 'minted' as const : 'pending' as const)
      }))
    }

    await FirebaseService.updatePurchase(purchaseId, {
      nftTickets: updatedNftTickets,
      status: 'completed',
      updatedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      message: nftAssetId 
        ? `Updated purchase with NFT asset ID ${nftAssetId} containing ${totalSupply} units`
        : `Updated purchase with ${nftAssetIds.length} NFT asset IDs`,
      nftAssetId: nftAssetId,
      totalSupply: totalSupply,
      nftAssetIds: nftAssetIds
    })

  } catch (error: any) {
    console.error("Error updating purchase NFTs:", error)
    return NextResponse.json({ error: "Failed to update purchase NFTs" }, { status: 500 })
  }
})
