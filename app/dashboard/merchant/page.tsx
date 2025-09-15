"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, DollarSign, Users, TrendingUp, Plus, Eye, Edit, MoreHorizontal, Loader2, RefreshCw } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import AuthGuard from "@/components/auth-guard"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-context"

export default function MerchantDashboard() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRevenue: 0,
    ticketsSold: 0,
    conversionRate: 0
  })
  const [events, setEvents] = useState<any[]>([])
  const [marketplaces, setMarketplaces] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuth()
  const fetchDashboardData = async (isRefresh = false) => {
    // Don't fetch if user is not authenticated
    if (!isAuthenticated || !user) {
      setLoading(false)
      return
    }

    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const [eventsRes, marketplacesRes, analyticsRes] = await Promise.all([
        fetch(`/api/events?merchantId=${user.userId}`),
        fetch(`/api/marketplaces?merchantId=${user.userId}`),
        fetch(`/api/analytics?merchantId=${user.userId}`)
      ])

      const [eventsData, marketplacesData, analyticsData] = await Promise.all([
        eventsRes.json(),
        marketplacesRes.json(),
        analyticsRes.json()
      ])

      if (eventsRes.ok) {
        setEvents(eventsData.events || [])
        setStats(prev => ({
          ...prev,
          totalEvents: eventsData.events?.length || 0
        }))
      }

      if (marketplacesRes.ok) {
        setMarketplaces(marketplacesData.marketplaces || [])
      }

      if (analyticsRes.ok) {
        setStats(prev => ({
          ...prev,
          totalRevenue: analyticsData.totalRevenue || 0,
          ticketsSold: analyticsData.ticketsSold || 0,
          conversionRate: analyticsData.conversionRate || 0
        }))
      }

      // Generate recent activity
      const activities = []
      if (eventsData.events && eventsData.events.length > 0) {
        activities.push({
          id: 1,
          action: "New event created",
          event: eventsData.events[0].title,
          time: "2 hours ago",
          type: "event"
        })
      }
      if (marketplacesData.marketplaces && marketplacesData.marketplaces.length > 0) {
        activities.push({
          id: 2,
          action: "Marketplace application submitted",
          marketplace: marketplacesData.marketplaces[0].businessName,
          time: "1 day ago",
          type: "marketplace"
        })
      }
      setRecentActivity(activities)

    } catch (error: any) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDashboardData()
    }
  }, [isAuthenticated, user])

  const statsData = [
    {
      title: "Total Events",
      value: stats.totalEvents.toString(),
      change: "+3 this month",
      icon: Calendar,
      color: "text-blue-400",
    },
    {
      title: "Total Revenue",
      value: `${stats.totalRevenue} ALGO`,
      change: "+12.5% from last month",
      icon: DollarSign,
      color: "text-green-400",
    },
    {
      title: "Tickets Sold",
      value: stats.ticketsSold.toString(),
      change: "+234 this week",
      icon: Users,
      color: "text-purple-400",
    },
    {
      title: "Conversion Rate",
      value: `${stats.conversionRate}%`,
      change: "+5.1% improvement",
      icon: TrendingUp,
      color: "text-yellow-400",
    },
  ]


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Active</Badge>
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Pending</Badge>
      case "draft":
        return <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/20">Draft</Badge>
      case "completed":
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Completed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <AuthGuard requiredRole="merchant">
      <DashboardLayout role="merchant">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Merchant Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your events and track performance</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchDashboardData(true)}
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Link href="/dashboard/merchant/create-event">
                <Button className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              statsData.map((stat) => (
              <Card key={stat.title} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{stat.change}</p>
                </CardContent>
              </Card>
              ))
            )}
          </div>

          {/* Main Content */}
          <Tabs defaultValue="events" className="space-y-4">
            <TabsList className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <TabsTrigger
                value="events"
                className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
              >
                My Events
              </TabsTrigger>
              <TabsTrigger
                value="sales"
                className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
              >
                Recent Sales
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
              >
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
              >
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="space-y-4">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Event Management</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    View and manage all your events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200 dark:border-gray-700">
                        <TableHead className="text-gray-600 dark:text-gray-400">Event</TableHead>
                        <TableHead className="text-gray-600 dark:text-gray-400">Date</TableHead>
                        <TableHead className="text-gray-600 dark:text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-600 dark:text-gray-400">Sales</TableHead>
                        <TableHead className="text-gray-600 dark:text-gray-400">Revenue</TableHead>
                        <TableHead className="text-gray-600 dark:text-gray-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow className="border-gray-200 dark:border-gray-700">
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-gray-500">Loading events...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : events.length === 0 ? (
                        <TableRow className="border-gray-200 dark:border-gray-700">
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            <div className="flex flex-col items-center gap-2">
                              <Calendar className="h-8 w-8 text-gray-400" />
                              <span>No events found</span>
                              <Link href="/dashboard/merchant/create-event">
                                <Button size="sm">
                                  <Plus className="w-4 h-4 mr-2" />
                                  Create Event
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        events.map((event) => (
                        <TableRow key={event.id} className="border-gray-200 dark:border-gray-700">
                          <TableCell>
                            <div className="font-medium text-gray-900 dark:text-white">{event.title}</div>
                          </TableCell>
                          <TableCell className="text-gray-900 dark:text-gray-300">{event.date}</TableCell>
                          <TableCell>{getStatusBadge(event.status)}</TableCell>
                          <TableCell className="text-gray-900 dark:text-gray-300">
                            {event.sold}/{event.total}
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                              <div
                                className="bg-blue-400 h-2 rounded-full"
                                style={{ width: `${(event.sold / event.total) * 100}%` }}
                              ></div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-900 dark:text-white font-medium">{event.revenue}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sales" className="space-y-4">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Recent Sales</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Latest ticket purchases from your events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                              <div className="space-y-2">
                                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                              </div>
                            </div>
                            <div className="text-right space-y-2">
                              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : recentActivity.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No recent activity
                      </div>
                    ) : (
                      recentActivity.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{activity.action}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {activity.event || activity.marketplace}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">{activity.time}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Revenue Breakdown</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Revenue by event category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Music Events</span>
                        <span className="text-gray-900 dark:text-white font-medium">75.0 ALGO (48%)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Food & Wine</span>
                        <span className="text-gray-900 dark:text-white font-medium">40.0 ALGO (26%)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Conferences</span>
                        <span className="text-gray-900 dark:text-white font-medium">25.8 ALGO (16%)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Art & Culture</span>
                        <span className="text-gray-900 dark:text-white font-medium">16.0 ALGO (10%)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Performance Metrics</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Key performance indicators
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Average Ticket Price</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">0.85 ALGO</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Sell-through Rate</span>
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">73.2%</span>
                        </div>
                        <Progress value={73.2} className="bg-gray-200 dark:bg-gray-700" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Customer Satisfaction</span>
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">4.8/5.0</span>
                        </div>
                        <Progress value={96} className="bg-gray-200 dark:bg-gray-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Merchant Settings</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Configure your merchant profile and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Business Information</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">Business Name</label>
                          <input
                            type="text"
                            defaultValue="Festival Productions LLC"
                            className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">Contact Email</label>
                          <input
                            type="email"
                            defaultValue="contact@festivalproductions.com"
                            className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Payment Settings</h3>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="rounded border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                          />
                          <span className="text-gray-900 dark:text-gray-300">Enable automatic payouts</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            className="rounded border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                          />
                          <span className="text-gray-900 dark:text-gray-300">Allow ticket resales</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                        Save Settings
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
