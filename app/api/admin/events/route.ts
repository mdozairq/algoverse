import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { requireRole } from "@/lib/auth/middleware"

// GET /api/admin/events - Get events with filtering and merchant details
export const GET = requireRole(["admin"])(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    let events = []

    if (status === "pending") {
      events = await FirebaseService.getPendingEvents()
    } else if (status === "approved") {
      events = await FirebaseService.getApprovedEvents()
    } else if (status === "rejected") {
      events = await FirebaseService.getRejectedEvents()
    } else {
      events = await FirebaseService.getAllEvents()
    }

    // Join event data with merchant information
    const eventsWithMerchants = await Promise.all(
      events.map(async (event) => {
        try {
          // Fetch merchant details if merchantId exists
          if (event.merchantId) {
            const merchant = await FirebaseService.getMerchantById(event.merchantId)
            if (merchant) {
              return {
                ...event,
                merchantName: merchant.businessName,
                merchantEmail: merchant.email,
                merchantId: event.merchantId,
              }
            }
          }
          
          // Return event without merchant details if merchant not found
          return {
            ...event,
            merchantName: 'Unknown Merchant',
            merchantEmail: null,
            merchantId: event.merchantId || null,
          }
        } catch (error) {
          console.error(`Error fetching merchant for event ${event.id}:`, error)
          return {
            ...event,
            merchantName: 'Unknown Merchant',
            merchantEmail: null,
            merchantId: event.merchantId || null,
          }
        }
      })
    )

    return NextResponse.json({ events: eventsWithMerchants })
  } catch (error: any) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
})
