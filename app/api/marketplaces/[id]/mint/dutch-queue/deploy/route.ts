import { NextRequest, NextResponse } from "next/server"
import { DutchMintContract } from "@/lib/algorand/dutch-mint-contract"
import { requireRole } from "@/lib/auth/middleware"
import { adminDb } from "@/lib/firebase/admin"
import algosdk from "algosdk"

// Deploy Dutch mint contract and configure marketplace
export const POST = requireRole(["admin", "merchant"])(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const auth = (request as any).auth
    const marketplaceId = params.id
    const body = await request.json()

    // Get marketplace
    const marketplaceDoc = await adminDb.collection('marketplaces').doc(marketplaceId).get()
    if (!marketplaceDoc.exists) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    const marketplace = marketplaceDoc.data()

    // Check if already configured
    if (marketplace?.dutchMintAppId) {
      return NextResponse.json({
        error: "Dutch mint contract already configured",
        appId: marketplace.dutchMintAppId,
      }, { status: 400 })
    }

    // Validate required fields
    const {
      creatorPrivateKey, // Mnemonic or private key
      threshold = 100,
      baseCost = 0.01, // ALGO
      effectiveCost = 0.007, // ALGO (30% discount)
      platformAddress,
      escrowAddress,
      timeWindow = 86400, // 24 hours in seconds
    } = body

    if (!creatorPrivateKey) {
      return NextResponse.json({ error: "Creator private key (mnemonic) is required" }, { status: 400 })
    }

    if (!platformAddress || !escrowAddress) {
      return NextResponse.json({ 
        error: "Platform address and escrow address are required" 
      }, { status: 400 })
    }

    // Validate addresses
    if (!algosdk.isValidAddress(platformAddress)) {
      return NextResponse.json({ error: "Invalid platform address" }, { status: 400 })
    }

    if (!algosdk.isValidAddress(escrowAddress)) {
      return NextResponse.json({ error: "Invalid escrow address" }, { status: 400 })
    }

    // Deploy contract
    const deployResult = await DutchMintContract.deployContract(creatorPrivateKey, {
      threshold,
      baseCost,
      effectiveCost,
      platformAddress,
      escrowAddress,
      timeWindow,
    })

    // Update marketplace with appId
    await adminDb.collection('marketplaces').doc(marketplaceId).update({
      dutchMintAppId: deployResult.appId,
      dutchMintConfig: {
        threshold,
        baseCost,
        effectiveCost,
        platformAddress,
        escrowAddress,
        timeWindow,
        deployedAt: new Date(),
        deployedBy: auth.uid,
      },
      updatedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      appId: deployResult.appId,
      transactionId: deployResult.transactionId,
      message: "Dutch mint contract deployed and configured successfully",
    })
  } catch (error: any) {
    console.error("Error deploying Dutch mint contract:", error)
    return NextResponse.json({
      error: error.message || "Failed to deploy Dutch mint contract",
      details: error.toString(),
    }, { status: 500 })
  }
})

// Get deployment status (public - no auth required for read-only)
export const GET = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const marketplaceId = params.id

    const marketplaceDoc = await adminDb.collection('marketplaces').doc(marketplaceId).get()
    if (!marketplaceDoc.exists) {
      return NextResponse.json({ error: "Marketplace not found" }, { status: 404 })
    }

    const marketplace = marketplaceDoc.data()
    const dutchMintAppId = marketplace?.dutchMintAppId
    const dutchMintConfig = marketplace?.dutchMintConfig

    if (!dutchMintAppId) {
      return NextResponse.json({
        configured: false,
        message: "Dutch mint contract not configured",
      })
    }

    // Get current queue status
    let queueStatus = null
    try {
      queueStatus = await DutchMintContract.getQueueStatus(dutchMintAppId)
    } catch (error) {
      console.error("Error getting queue status:", error)
    }

    return NextResponse.json({
      configured: true,
      appId: dutchMintAppId,
      config: dutchMintConfig,
      queueStatus,
    })
  } catch (error: any) {
    console.error("Error getting deployment status:", error)
    return NextResponse.json({
      error: error.message || "Failed to get deployment status",
    }, { status: 500 })
  }
}

