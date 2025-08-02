"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download, TrendingUp, TrendingDown, DollarSign, Calendar, Filter, BarChart3 } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function MerchantAnalytics() {
  const timeRanges = [
    { id: "today", label: "Today", active: false },
    { id: "week", label: "This Week", active: true },
    { id: "month", label: "This Month", active: false },
    { id: "all", label: "All Time", active: false },
  ]

  const metrics = [
    {
      title: "Total Revenue",
      value: "$12,450",
      change: "+15.3%",
      trend: "up",
      period: "vs last week",
    },
    {
      title: "NFTs Sold",
      value: "234",
      change: "+8.2%",
      trend: "up",
      period: "vs last week",
    },
    {
      title: "Active Buyers",
      value: "156",
      change: "-2.1%",
      trend: "down",
      period: "vs last week",
    },
    {
      title: "Conversion Rate",
      value: "3.2%",
      change: "+0.5%",
      trend: "up",
      period: "vs last week",
    },
  ]

  const topEvents = [
    { name: "Summer Concert Series", sales: 89, revenue: "$4,450", growth: "+12%" },
    { name: "Jazz Night", sales: 67, revenue: "$2,010", growth: "+8%" },
    { name: "Rock Festival", sales: 45, revenue: "$5,400", growth: "+25%" },
    { name: "Classical Evening", sales: 33, revenue: "$990", growth: "-5%" },
  ]

  const recentTransactions = [
    {
      id: 1,
      buyer: "0x1234...5678",
      event: "Summer Concert",
      amount: "0.5 ALGO",
      time: "2 mins ago",
      status: "completed",
    },
    {
      id: 2,
      buyer: "0x8765...4321",
      event: "Jazz Night",
      amount: "0.3 ALGO",
      time: "5 mins ago",
      status: "completed",
    },
    {
      id: 3,
      buyer: "0x9876...1234",
      event: "Rock Festival",
      amount: "1.2 ALGO",
      time: "8 mins ago",
      status: "pending",
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/merchant/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">ANALYTICS DASHBOARD</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Track your marketplace performance and insights
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" className="rounded-full bg-transparent">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" className="rounded-full bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Time Range Selector */}
        <div className="flex items-center gap-2 mb-8">
          {timeRanges.map((range) => (
            <Button key={range.id} variant={range.active ? "default" : "outline"} size="sm" className="rounded-full">
              {range.label}
            </Button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.title}</p>
                      <p className="text-2xl font-black text-gray-900 dark:text-white">{metric.value}</p>
                    </div>
                    <div
                      className={`flex items-center gap-1 text-sm ${
                        metric.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {metric.trend === "up" ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="font-medium">{metric.change}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{metric.period}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Analytics Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger value="sales" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700">
              Sales
            </TabsTrigger>
            <TabsTrigger
              value="buyers"
              className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
            >
              Buyers
            </TabsTrigger>
            <TabsTrigger
              value="payouts"
              className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
            >
              Payouts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Revenue Trends</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Daily revenue over the past week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                      <p>Revenue chart would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sales Chart */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Sales Volume</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">NFT sales over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                      <p>Sales chart would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Events */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Top Performing Events</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Your best selling events this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topEvents.map((event, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{event.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{event.sales} tickets sold</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-gray-900 dark:text-white">{event.revenue}</p>
                        <div
                          className={`flex items-center gap-1 text-sm ${
                            event.growth.startsWith("+") ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {event.growth.startsWith("+") ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span>{event.growth}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Sales Heatmap</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Sales activity by hour and day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    Sales heatmap would be displayed here
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{tx.buyer}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{tx.event}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">{tx.time}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{tx.amount}</p>
                          <Badge variant={tx.status === "completed" ? "default" : "secondary"} className="text-xs">
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="buyers" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Buyer Demographics</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Geographic distribution of your buyers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    Geographic chart would be displayed here
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Buyer Behavior</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Purchase patterns and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    Behavior analytics would be displayed here
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payouts" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-8 h-8" />
                    <div>
                      <p className="text-green-100">Available Balance</p>
                      <p className="text-2xl font-black">$8,450</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-8 h-8" />
                    <div>
                      <p className="text-blue-100">Pending Payout</p>
                      <p className="text-2xl font-black">$2,100</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8" />
                    <div>
                      <p className="text-purple-100">This Month</p>
                      <p className="text-2xl font-black">$1,900</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Payout History</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Track your earnings and payout schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  Payout history chart would be displayed here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
