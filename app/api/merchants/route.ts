import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"

// GET /api/merchants - Get merchants with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const approved = searchParams.get("approved")
    const pending = searchParams.get("pending")

    let merchants = []

    if (approved === "true") {
      merchants = await FirebaseService.getApprovedMerchants()
    } else if (pending === "true") {
      merchants = await FirebaseService.getPendingMerchants()
    } else {
      // Get all merchants
      const [approvedMerchants, pendingMerchants] = await Promise.all([
        FirebaseService.getApprovedMerchants(),
        FirebaseService.getPendingMerchants(),
      ])
      merchants = [...approvedMerchants, ...pendingMerchants]
    }

    return NextResponse.json({ merchants })
  } catch (error: any) {
    console.error("Error fetching merchants:", error)
    return NextResponse.json({ error: "Failed to fetch merchants" }, { status: 500 })
  }
}
