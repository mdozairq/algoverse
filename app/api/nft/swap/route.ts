import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { AlgorandNFTService } from "@/lib/algorand/nft"
import { requireAuth } from "@/lib/auth/middleware"

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const auth = (request as any).auth
    const { nft1Id, nft2Id, user2WalletAddress } = await request.json()

    // Get user info
    const user1 = await FirebaseService.getUserByUid(auth.uid)
    if (!user1 || !user1.walletAddress) {
      return NextResponse.json({ error: "User wallet not configured" }, { status: 400 })
    }

    // Get NFT info
    const nft1 = await FirebaseService.getNFTById(nft1Id)
    const nft2 = await FirebaseService.getNFTById(nft2Id)

    if (!nft1 || !nft2) {
      return NextResponse.json({ error: "NFTs not found" }, { status: 404 })
    }

    // Verify ownership
    if (nft1.ownerId !== user1.id) {
      return NextResponse.json({ error: "You do not own the first NFT" }, { status: 403 })
    }

    // Create atomic swap transactions
    const swapTxns = await AlgorandNFTService.createAtomicSwap(
      user1.walletAddress,
      user2WalletAddress,
      nft1.assetId,
      nft2.assetId,
    )

    return NextResponse.json({
      success: true,
      transactions: swapTxns.map((txn) => Buffer.from(txn.toByte()).toString("base64")),
    })
  } catch (error: any) {
    console.error("Error creating swap transaction:", error)
    return NextResponse.json({ error: "Failed to create swap transaction" }, { status: 500 })
  }
})
