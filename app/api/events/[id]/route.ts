import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const event = await FirebaseService.getEventById(params.id)

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Get merchant info only if merchantId is valid
    let merchant = null
    if (event.merchantId && event.merchantId.trim() !== "") {
      try {
        merchant = await FirebaseService.getMerchantById(event.merchantId)
      } catch (merchantError) {
        console.warn("Failed to fetch merchant info:", merchantError)
        // Continue without merchant info
      }
    }

    return NextResponse.json({
      event: {
        ...event,
        merchant: merchant
          ? {
              id: merchant.id,
              businessName: merchant.businessName,
              verified: merchant.verified,
            }
          : null,
      },
    })
  } catch (error: any) {
    console.error("Error fetching event:", error)
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 })
  }
}
