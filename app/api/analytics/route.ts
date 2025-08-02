import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth/middleware"

// Force dynamic rendering for this route
export const dynamic = "force-dynamic"

export const GET = requireRole(["admin", "merchant"])(async (request: NextRequest) => {
  try {
    const auth = (request as any).auth
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("timeRange") || "30d"

    // Mock analytics data - implement real analytics aggregation
    const analytics = {
      totalVolume: "$2.4M",
      activeUsers: "12,847",
      eventsListed: "1,234",
      avgNFTPrice: "0.85 ALGO",
      topCategories: [
        { name: "Concerts", volume: "$890K", share: "37%", growth: "+25%" },
        { name: "Sports", volume: "$650K", share: "27%", growth: "+18%" },
        { name: "Conferences", volume: "$420K", share: "17%", growth: "+12%" },
      ],
      platformMetrics: {
        transactionSuccessRate: "99.7%",
        averageResponseTime: "1.2s",
        smartContractUptime: "99.9%",
        userSatisfaction: "4.8/5",
      },
    }

    return NextResponse.json({ analytics })
  } catch (error: any) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
})
