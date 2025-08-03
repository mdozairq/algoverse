"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ThemeToggle } from "@/components/theme-toggle"
import Header from "@/components/header"
import AuthGuard from "@/components/auth-guard"
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  Store,
  BarChart3,
  Download,
  Filter,
  Search,
  Bell,
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function MerchantDashboard() {
  const stats = [
    { title: "Total Revenue", value: "$12,450", change: "+15%", icon: DollarSign, color: "text-green-600" },
    { title: "Active Events", value: "8", change: "+2", icon: Calendar, color: "text-blue-600" },
    { title: "Total Sales", value: "234", change: "+18%", icon: TrendingUp, color: "text-purple-600" },
    { title: "Customers", value: "156", change: "+12%", icon: Users, color: "text-orange-600" },
  ]

  const events = [
    {
      id: 1,
      name: "Summer Concert Series",
      date: "2024-07-15",
      price: "0.5 ALGO",
      sold: 45,
      total: 100,
      status: "active",
      revenue: "$2,250",
    },
    {
      id: 2,
      name: "Jazz Night",
      date: "2024-08-20",
      price: "0.3 ALGO",
      sold: 23,
      total: 50,
      status: "active",
      revenue: "$690",
    },
    {
      id: 3,
      name: "Rock Festival",
      date: "2024-09-10",
      price: "1.2 ALGO",
      sold: 89,
      total: 200,
      status: "draft",
      revenue: "$10,680",
    },
  ]

  const recentOrders = [
    {
      id: 1,
      customer: "john@example.com",
      event: "Summer Concert",
      amount: "0.5 ALGO",
      date: "2024-01-15",
      status: "completed",
    },
    {
      id: 2,
      customer: "sarah@example.com",
      event: "Jazz Night",
      amount: "0.3 ALGO",
      date: "2024-01-14",
      status: "completed",
    },
    {
      id: 3,
      customer: "mike@example.com",
      event: "Rock Festival",
      amount: "1.2 ALGO",
      date: "2024-01-13",
      status: "pending",
    },
  ]

  return (
    <AuthGuard requiredRole="merchant">
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">MERCHANT DASHBOARD</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Manage your events and marketplace</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="w-4 h-4" />
            </Button>
            <Link href="/merchant/create-marketplace">
              <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                CREATE MARKETPLACE
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="text-green-600 font-medium">{stat.change}</span> from last month
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/merchant/create-event">
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8" />
                  <div>
                    <h3 className="font-bold text-lg">Create Event</h3>
                    <p className="text-blue-100">Launch new NFT tickets</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/merchant/marketplace-settings">
            <Card className="bg-gradient-to-r from-green-500 to-teal-600 text-white hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Store className="w-8 h-8" />
                  <div>
                    <h3 className="font-bold text-lg">Marketplace</h3>
                    <p className="text-green-100">Customize your store</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/merchant/analytics">
            <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-8 h-8" />
                  <div>
                    <h3 className="font-bold text-lg">Analytics</h3>
                    <p className="text-orange-100">View performance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="events" className="space-y-4">
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger
              value="events"
              className="font-medium data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
            >
              My Events
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="font-medium data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
            >
              Orders
            </TabsTrigger>
            <TabsTrigger
              value="launchpad"
              className="font-medium data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
            >
              Launchpad
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="font-medium data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-black tracking-tight text-gray-900 dark:text-white">
                      Event Management
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Create and manage your event NFT collections
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-full bg-transparent">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full bg-transparent">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200 dark:border-gray-700">
                        <TableHead className="font-bold text-gray-900 dark:text-white">Event Name</TableHead>
                        <TableHead className="font-bold text-gray-900 dark:text-white">Date</TableHead>
                        <TableHead className="font-bold text-gray-900 dark:text-white">Price</TableHead>
                        <TableHead className="font-bold text-gray-900 dark:text-white">Sales</TableHead>
                        <TableHead className="font-bold text-gray-900 dark:text-white">Revenue</TableHead>
                        <TableHead className="font-bold text-gray-900 dark:text-white">Status</TableHead>
                        <TableHead className="font-bold text-gray-900 dark:text-white">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map((event, index) => (
                        <motion.tr
                          key={event.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-gray-200 dark:border-gray-700"
                        >
                          <TableCell className="font-medium text-gray-900 dark:text-white">{event.name}</TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400">{event.date}</TableCell>
                          <TableCell className="font-bold text-gray-900 dark:text-white">{event.price}</TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            <div className="flex flex-col">
                              <span>
                                {event.sold}/{event.total}
                              </span>
                              <Progress value={(event.sold / event.total) * 100} className="w-16 h-2 mt-1" />
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-green-600">{event.revenue}</TableCell>
                          <TableCell>
                            <Badge
                              variant={event.status === "active" ? "default" : "secondary"}
                              className="rounded-full"
                            >
                              {event.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="rounded-full bg-transparent">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="rounded-full bg-transparent">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full text-red-600 hover:text-red-700 bg-transparent"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-black tracking-tight text-gray-900 dark:text-white">
                      Recent Orders
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Track customer purchases and transactions
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        placeholder="Search orders..."
                        className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full bg-transparent">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                    >
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{order.customer}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{order.event}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-gray-900 dark:text-white">{order.amount}</p>
                        <Badge
                          variant={order.status === "completed" ? "default" : "secondary"}
                          className="rounded-full"
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="launchpad" className="space-y-4">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="font-black tracking-tight text-gray-900 dark:text-white">NFT Launchpad</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Manage your NFT collections and submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Pending Review */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-orange-600 flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      Pending Review (2)
                    </h3>
                    <div className="space-y-2">
                      <div className="p-3 border border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                        <h4 className="font-medium text-gray-900 dark:text-white">Jazz Festival</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Submitted 2 days ago</p>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          Under Review
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Approved */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-green-600 flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      Approved (3)
                    </h3>
                    <div className="space-y-2">
                      <div className="p-3 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/20">
                        <h4 className="font-medium text-gray-900 dark:text-white">Summer Concert</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Ready to launch</p>
                        <Badge variant="default" className="mt-2 text-xs bg-green-600">
                          Approved
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Live */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-blue-600 flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      Live (1)
                    </h3>
                    <div className="space-y-2">
                      <div className="p-3 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <h4 className="font-medium text-gray-900 dark:text-white">Rock Festival</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">45/100 sold</p>
                        <Badge variant="default" className="mt-2 text-xs bg-blue-600">
                          Live
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Ended */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-600 flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      Ended (2)
                    </h3>
                    <div className="space-y-2">
                      <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <h4 className="font-medium text-gray-900 dark:text-white">Winter Gala</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Sold out</p>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          Ended
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="font-black tracking-tight text-gray-900 dark:text-white">
                    Sales Overview
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Revenue trends over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    Sales chart would be displayed here
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="font-black tracking-tight text-gray-900 dark:text-white">Top Events</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Best performing events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {events.slice(0, 3).map((event, index) => (
                      <div key={event.id} className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{event.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{event.sold} tickets sold</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">{event.revenue}</p>
                          <Progress value={(event.sold / event.total) * 100} className="w-20 h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payout Tracker */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="font-black tracking-tight text-gray-900 dark:text-white">
                  Payout Tracker
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Track your earnings and payouts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h3 className="text-2xl font-black text-green-600">$8,450</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Available Balance</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="text-2xl font-black text-blue-600">$2,100</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending Payout</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h3 className="text-2xl font-black text-purple-600">$1,900</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </AuthGuard>
  )
}
