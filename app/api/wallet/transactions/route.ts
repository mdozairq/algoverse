import { type NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/auth/middleware"
import { SimpleWalletService } from "@/lib/wallet/wallet-simple"

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuthToken(request)
    if (!auth || !auth.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    // Validate address
    if (!SimpleWalletService.isValidAddress(address)) {
      return NextResponse.json({ error: "Invalid Algorand address" }, { status: 400 })
    }

    // For now, return empty transactions array
    // In a real implementation, you would fetch from Algorand indexer
    const transactions: any[] = []

    return NextResponse.json({
      success: true,
      transactions,
      address
    })

  } catch (error: any) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ 
      error: "Failed to fetch transactions",
      details: error.message 
    }, { status: 500 })
  }
}
