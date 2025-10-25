import { NextRequest, NextResponse } from 'next/server'
import { FirebaseService } from '@/lib/firebase/collections'
import { requireRole } from '@/lib/auth/middleware'
import { convertObjectTimestamps } from '@/lib/utils/timestamp'

export const GET = requireRole(["user"])(async (request: NextRequest) => {
  try {
    const auth = (request as any).auth
    const userId = auth.userId

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get user's purchases
    const purchases = await FirebaseService.getPurchasesByUser(userId)

    // Convert Firebase Timestamps to ISO strings
    const purchasesWithStringDates = convertObjectTimestamps(purchases)

    return NextResponse.json({ 
      purchases: purchasesWithStringDates,
      total: purchases.length 
    })
  } catch (error: any) {
    console.error("Error fetching user purchases:", error)
    return NextResponse.json({ error: "Failed to fetch purchases" }, { status: 500 })
  }
})
