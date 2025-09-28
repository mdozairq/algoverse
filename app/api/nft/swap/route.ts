import { type NextRequest, NextResponse } from "next/server"
import { AlgorandNFTService, type NFTSwapParams } from "@/lib/algorand"
import { verifyAuthToken } from "@/lib/auth/middleware"
import { FirebaseService } from "@/lib/firebase/collections"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuthToken(request)
    if (!auth || !auth.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      assetId1,
      assetId2,
      fromAddress1,
      fromAddress2,
      amount1 = 1,
      amount2 = 1,
      expiryTime
    } = await request.json()

    // Validate required fields
    if (!assetId1 || !assetId2 || !fromAddress1 || !fromAddress2) {
      return NextResponse.json({ 
        error: "Missing required fields: assetId1, assetId2, fromAddress1, fromAddress2" 
      }, { status: 400 })
    }

    // Get user details
    const user = await FirebaseService.getUserByUid(auth.uid)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify user owns one of the addresses
    if (fromAddress1 !== user.walletAddress && fromAddress2 !== user.walletAddress) {
      return NextResponse.json({ 
        error: "User must be one of the swap participants" 
      }, { status: 403 })
    }

    // Prepare swap parameters
    const swapParams: NFTSwapParams = {
      assetId1,
      assetId2,
      fromAddress1,
      fromAddress2,
      amount1,
      amount2,
      expiryTime
    }

    // Create atomic swap
    const result = await AlgorandNFTService.createAtomicSwap(swapParams)

    return NextResponse.json({
      success: true,
      swapId: result.swapId,
      transactionId: result.transactionId,
      message: "Atomic swap created successfully"
    })

  } catch (error: any) {
    console.error("Error creating atomic swap:", error)
    return NextResponse.json({ 
      error: "Failed to create atomic swap",
      details: error.message 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuthToken(request)
    if (!auth || !auth.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { swapId, privateKey1, privateKey2 } = await request.json()

    // Validate required fields
    if (!swapId || !privateKey1 || !privateKey2) {
      return NextResponse.json({ 
        error: "Missing required fields: swapId, privateKey1, privateKey2" 
      }, { status: 400 })
    }

    // Execute atomic swap
    const result = await AlgorandNFTService.executeAtomicSwap(swapId, privateKey1, privateKey2)

    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
      message: "Atomic swap executed successfully"
    })

  } catch (error: any) {
    console.error("Error executing atomic swap:", error)
    return NextResponse.json({ 
      error: "Failed to execute atomic swap",
      details: error.message 
    }, { status: 500 })
  }
}