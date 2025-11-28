import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { FirebaseService } from "@/lib/firebase/collections"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    if (session.role !== "merchant") {
      return NextResponse.json({ error: "Access denied. Merchant role required." }, { status: 403 })
    }

    // Get merchant by UID
    const merchant = await FirebaseService.getMerchantByUid(session.uid || session.userId)
    
    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      merchant: {
        ...merchant,
        permissions: merchant.permissions || {},
      },
    })
  } catch (error: any) {
    console.error("Error fetching merchant data:", error)
    return NextResponse.json({ error: "Failed to fetch merchant data" }, { status: 500 })
  }
}
