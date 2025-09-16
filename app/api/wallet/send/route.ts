import { type NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/auth/middleware"
import { SimpleWalletService } from "@/lib/wallet/wallet-simple"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuthToken(request)
    if (!auth || !auth.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { to, amount, assetId, note, privateKey } = await request.json()

    // Validate required fields
    if (!to || !amount || !privateKey) {
      return NextResponse.json({ 
        error: "Missing required fields: to, amount, privateKey" 
      }, { status: 400 })
    }

    // Validate addresses
    if (!SimpleWalletService.isValidAddress(to)) {
      return NextResponse.json({ error: "Invalid recipient address" }, { status: 400 })
    }

    // For now, return a mock transaction ID
    // In a real implementation, you would create and send the transaction
    const mockTransactionId = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

    return NextResponse.json({
      success: true,
      transactionId: mockTransactionId,
      message: "Transaction sent successfully (mock)"
    })

  } catch (error: any) {
    console.error("Error sending transaction:", error)
    return NextResponse.json({ 
      error: "Failed to send transaction",
      details: error.message 
    }, { status: 500 })
  }
}
