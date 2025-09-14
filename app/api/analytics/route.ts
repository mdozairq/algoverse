import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth/middleware"

// Force dynamic rendering for this route
export const dynamic = "force-dynamic"

export const GET = requireRole(["admin", "merchant", "user"])(async (request: NextRequest) => {
  try {
    const auth = (request as any).auth
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("timeRange") || "30d"

    // Role-specific analytics data
    let analytics: any = {}

    if (auth.role === "admin") {
      // Platform-wide analytics for admins
      analytics = {
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
    } else if (auth.role === "merchant") {
      // Merchant-specific analytics
      analytics = {
        myEvents: "12",
        totalRevenue: "2.4 ALGO",
        nftsSold: "45",
        avgRating: "4.8/5",
        upcomingEvents: "3",
        recentActivity: [
          { event: "Tech Conference 2024", sales: "15 NFTs", revenue: "1.2 ALGO" },
          { event: "Music Festival", sales: "8 NFTs", revenue: "0.8 ALGO" },
        ],
      }
    } else {
      // User-specific analytics
      analytics = {
        myNFTs: "8",
        eventsAttended: "5",
        loyaltyPoints: "156",
        portfolioValue: "2.1 ALGO",
        recentActivity: [
          { action: "Purchased NFT", event: "Tech Conference", amount: "0.5 ALGO" },
          { action: "Attended Event", event: "Music Festival", points: "+25" },
        ],
      }
    }

    return NextResponse.json({ analytics })
  } catch (error: any) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
})
