"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, BarChart3, PieChart, Users, DollarSign, Calendar, Globe } from "lucide-react"
import Link from "next/link"
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/page-transition"
import { FloatingCard } from "@/components/animations/card-hover"
import Header from "@/components/header"

export default function InsightsPage() {
  const marketStats = [
    {
      title: "Total Volume",
      value: "$2.4M",
      change: "+18.2%",
      trend: "up",
      icon: DollarSign,
      description: "30-day trading volume",
    },
    {
      title: "Active Users",
      value: "12,847",
      change: "+24.1%",
      trend: "up",
      icon: Users,
      description: "Monthly active users",
    },
    {
      title: "Events Listed",
      value: "1,234",
      change: "+12.5%",
      trend: "up",
      icon: Calendar,
      description: "Total events this month",
    },
    {
      title: "Global Reach",
      value: "45",
      change: "+3",
      trend: "up",
      icon: Globe,
      description: "Countries served",
    },
  ]

  const topCategories = [
    { name: "Concerts", volume: "$890K", share: "37%", growth: "+22%" },
    { name: "Conferences", volume: "$654K", share: "27%", growth: "+15%" },
    { name: "Sports", volume: "$432K", share: "18%", growth: "+31%" },
    { name: "Theater", volume: "$298K", share: "12%", growth: "+8%" },
    { name: "Art & Culture", volume: "$156K", share: "6%", growth: "+45%" },
  ]

  const trendingEvents = [
    {
      name: "Summer Music Festival 2024",
      merchant: "Festival Productions",
      volume: "$125K",
      sales: 2500,
      trend: "+45%",
      image: "/placeholder.svg?height=80&width=80&text=Event 1",
    },
    {
      name: "Tech Conference NYC",
      merchant: "TechEvents Inc",
      volume: "$89K",
      sales: 1200,
      trend: "+32%",
      image: "/placeholder.svg?height=80&width=80&text=Event 2",
    },
    {
      name: "Broadway Show Premium",
      merchant: "Theater Group",
      volume: "$67K",
      sales: 890,
      trend: "+28%",
      image: "/placeholder.svg?height=80&width=80&text=Event 3",
    },
    {
      name: "Art Gallery Opening",
      merchant: "Modern Art Museum",
      volume: "$45K",
      sales: 1500,
      trend: "+67%",
      image: "/placeholder.svg?height=80&width=80&text=Event 4",
    },
  ]

  const priceAnalysis = [
    {
      category: "VIP Concert Tickets",
      avgPrice: "0.8 ALGO",
      priceChange: "+12%",
      volume: "2,340 sold",
      trend: "up",
    },
    {
      category: "Conference Passes",
      avgPrice: "1.2 ALGO",
      priceChange: "+8%",
      volume: "1,890 sold",
      trend: "up",
    },
    {
      category: "Theater Premium",
      avgPrice: "2.1 ALGO",
      priceChange: "-3%",
      volume: "567 sold",
      trend: "down",
    },
    {
      category: "Sports Events",
      avgPrice: "1.5 ALGO",
      priceChange: "+25%",
      volume: "3,210 sold",
      trend: "up",
    },
  ]

  const marketInsights = [
    {
      title: "NFT Adoption Surge",
      description: "Event NFT adoption has increased by 340% in the last quarter, driven by major venue partnerships.",
      impact: "High",
      category: "Growth",
    },
    {
      title: "Secondary Market Growth",
      description: "Resale transactions now account for 35% of total volume, indicating healthy market liquidity.",
      impact: "Medium",
      category: "Trading",
    },
    {
      title: "Mobile Usage Dominance",
      description: "78% of NFT purchases now happen on mobile devices, highlighting the importance of mobile UX.",
      impact: "High",
      category: "Technology",
    },
    {
      title: "Geographic Expansion",
      description: "International markets now represent 42% of total volume, up from 28% last quarter.",
      impact: "Medium",
      category: "Global",
    },
  ]

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />

        <div className="container mx-auto px-6 py-8">
          {/* Hero Section */}
          <FadeIn>
            <div className="text-center mb-12">
              <h1 className="text-6xl font-black tracking-tight mb-4 text-gray-900 dark:text-white">MARKET INSIGHTS</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Real-time analytics and trends in the event NFT marketplace
              </p>
            </div>
          </FadeIn>

          {/* Market Stats */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {marketStats.map((stat, index) => (
              <StaggerItem key={index}>
                <FloatingCard>
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </CardTitle>
                      <stat.icon className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {stat.trend === "up" ? (
                          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                        <span
                          className={`text-sm font-medium ${stat.trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                        >
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{stat.description}</p>
                    </CardContent>
                  </Card>
                </FloatingCard>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Main Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
              >
                Market Overview
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
              >
                Categories
              </TabsTrigger>
              <TabsTrigger
                value="trending"
                className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
              >
                Trending
              </TabsTrigger>
              <TabsTrigger
                value="analysis"
                className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
              >
                Price Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <BarChart3 className="w-5 h-5" />
                      Trading Volume (30 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <p className="text-gray-600 dark:text-gray-400">Volume Chart Visualization</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <PieChart className="w-5 h-5" />
                      Market Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <p className="text-gray-600 dark:text-gray-400">Distribution Chart</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Market Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {marketInsights.map((insight, index) => (
                      <div key={index} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-gray-900 dark:text-white">{insight.title}</h3>
                          <div className="flex gap-2">
                            <Badge
                              variant="outline"
                              className="border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300"
                            >
                              {insight.category}
                            </Badge>
                            <Badge
                              className={`${
                                insight.impact === "High"
                                  ? "bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-900 dark:text-red-400"
                                  : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:bg-yellow-900 dark:text-yellow-400"
                              }`}
                            >
                              {insight.impact} Impact
                            </Badge>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{insight.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Top Categories by Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topCategories.map((category, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">{category.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Market share: {category.share}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900 dark:text-white">{category.volume}</div>
                          <div className="text-sm text-green-600 dark:text-green-400">{category.growth}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trending" className="space-y-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Trending Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trendingEvents.map((event, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden">
                          <img
                            src={event.image || "/placeholder.svg"}
                            alt={event.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white">{event.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">by {event.merchant}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-900 dark:text-gray-300">{event.sales} sold</span>
                            <span className="text-sm text-green-600 dark:text-green-400">{event.trend}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900 dark:text-white">{event.volume}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Volume</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Price Analysis by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {priceAnalysis.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg"
                      >
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">{item.category}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{item.volume}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900 dark:text-white">{item.avgPrice}</div>
                          <div className="flex items-center gap-1">
                            {item.trend === "up" ? (
                              <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                            )}
                            <span
                              className={`text-sm ${item.trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                            >
                              {item.priceChange}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  )
}
