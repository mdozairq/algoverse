"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Store, TrendingUp, DollarSign, Activity, CheckCircle, XCircle, Clock, Eye, Loader2, Rocket } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import AuthGuard from "@/components/auth-guard"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-context"

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalMerchants: 0,
    activeMarketplaces: 0,
    totalRevenue: 0,
    platformGrowth: 0,
  })
  const [pendingMerchants, setPendingMerchants] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [settings, setSettings] = useState({
    platformFeePercentage: 2.5,
    creatorRoyaltyPercentage: 5.0,
    networkFeeAlgo: 0.001,
    requireManualMerchantApproval: true,
    autoApproveVerifiedMerchants: true,
  })
  const [savingSettings, setSavingSettings] = useState(false)
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuth()

  const fetchDashboardData = async () => {
    // Don't fetch if user is not authenticated
    if (!isAuthenticated || !user) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // Fetch all data in parallel
      const [merchantsRes, marketplacesRes, analyticsRes, settingsRes] = await Promise.all([
        fetch("/api/merchants"),
        fetch("/api/marketplaces"),
        fetch("/api/analytics"),
        fetch("/api/admin/settings"),
      ])

      const [merchantsData, marketplacesData, analyticsData, settingsData] = await Promise.all([
        merchantsRes.json(),
        marketplacesRes.json(),
        analyticsRes.json(),
        settingsRes.json(),
      ])

      if (merchantsData.merchants) {
        const approvedMerchants = merchantsData.merchants.filter((m: any) => m.isApproved)
        const pendingMerchants = merchantsData.merchants.filter((m: any) => !m.isApproved)
        
        setStats(prev => ({
          ...prev,
          totalMerchants: approvedMerchants.length,
        }))
        setPendingMerchants(pendingMerchants.slice(0, 5)) // Show latest 5
      }

      if (marketplacesData.marketplaces) {
        const approvedMarketplaces = marketplacesData.marketplaces.filter((m: any) => m.status === "approved")
        setStats(prev => ({
          ...prev,
          activeMarketplaces: approvedMarketplaces.length,
        }))
      }

      if (analyticsData.analytics) {
        setAnalytics(analyticsData.analytics)
        setStats(prev => ({
          ...prev,
          totalRevenue: analyticsData.analytics.totalVolume || 0,
          platformGrowth: 18.2, // This would come from analytics
        }))
      }

      if (settingsData.config) {
        setSettings(prev => ({
          ...prev,
          ...settingsData.config,
        }))
      }

      // Generate recent activity from the data
      const activities = []
      if (pendingMerchants.length > 0) {
        activities.push({
          id: 1,
          action: "New merchant application",
          merchant: pendingMerchants[0].businessName,
          time: "2 hours ago",
          type: "application",
        })
      }
      if (marketplacesData.marketplaces?.length > 0) {
        activities.push({
          id: 2,
          action: "Marketplace created",
          merchant: marketplacesData.marketplaces[0].businessName,
          time: "4 hours ago",
          type: "creation",
        })
      }
      setRecentActivity(activities)

    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMerchantApproval = async (merchantId: string, approved: boolean) => {
    // Don't update if user is not authenticated
    if (!isAuthenticated || !user) {
      return
    }

    try {
      const res = await fetch("/api/admin/merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantId, approved }),
      })

      if (res.ok) {
        toast({
          title: approved ? "Merchant approved" : "Merchant rejected",
          description: `Merchant has been ${approved ? "approved" : "rejected"} successfully`,
        })
        fetchDashboardData() // Refresh data
      } else {
        throw new Error("Failed to update merchant status")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update merchant status",
        variant: "destructive",
      })
    }
  }

  const handleSaveSettings = async () => {
    // Don't save if user is not authenticated
    if (!isAuthenticated || !user) {
      return
    }

    setSavingSettings(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (res.ok) {
        toast({
          title: "Settings saved",
          description: "Platform settings have been updated successfully",
        })
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSavingSettings(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDashboardData()
    }
  }, [isAuthenticated, user])

  const statsData = [
    {
      title: "Total Merchants",
      value: stats.totalMerchants.toString(),
      change: "+12%",
      icon: Users,
      color: "text-blue-400",
    },
    {
      title: "Active Marketplaces",
      value: stats.activeMarketplaces.toString(),
      change: "+8%",
      icon: Store,
      color: "text-green-400",
    },
    {
      title: "Total Revenue",
      value: analytics?.totalVolume || "$0",
      change: "+23%",
      icon: DollarSign,
      color: "text-yellow-400",
    },
    {
      title: "Platform Growth",
      value: `${stats.platformGrowth}%`,
      change: "+5%",
      icon: TrendingUp,
      color: "text-purple-400",
    },
  ]

  return (
    <AuthGuard requiredRole="admin">
      <DashboardLayout role="admin">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage merchants, marketplaces, and platform settings</p>
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
                    <p className="text-xs text-green-600 dark:text-green-400">{stat.change} from last month</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="merchants"
                className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
              >
                Merchant Approvals
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

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-gray-900 dark:text-white">Recent Activity</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                          Latest platform activities and merchant actions
                        </CardDescription>
                      </div>
                      <Link href="/dashboard/admin/tokens">
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <Rocket className="w-4 h-4" />
                          Token Approvals
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {activity.type === "approval" && <CheckCircle className="h-4 w-4 text-green-400" />}
                            {activity.type === "creation" && <Activity className="h-4 w-4 text-blue-400" />}
                            {activity.type === "update" && <Clock className="h-4 w-4 text-yellow-400" />}
                            {activity.type === "suspension" && <XCircle className="h-4 w-4 text-red-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{activity.merchant}</p>
                          </div>
                          <div className="text-sm text-gray-500">{activity.time}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="col-span-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Platform Health</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      System performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Server Uptime</span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">99.9%</span>
                      </div>
                      <Progress value={99.9} className="bg-gray-200 dark:bg-gray-700" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Transaction Success</span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">98.7%</span>
                      </div>
                      <Progress value={98.7} className="bg-gray-200 dark:bg-gray-700" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">User Satisfaction</span>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">94.2%</span>
                      </div>
                      <Progress value={94.2} className="bg-gray-200 dark:bg-gray-700" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="merchants" className="space-y-4">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Pending Merchant Approvals</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Review and approve new merchant applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      <span className="ml-2 text-gray-600 dark:text-gray-400">Loading merchants...</span>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-200 dark:border-gray-700">
                          <TableHead className="text-gray-600 dark:text-gray-400">Merchant</TableHead>
                          <TableHead className="text-gray-600 dark:text-gray-400">Category</TableHead>
                          <TableHead className="text-gray-600 dark:text-gray-400">Submitted</TableHead>
                          <TableHead className="text-gray-600 dark:text-gray-400">Status</TableHead>
                          <TableHead className="text-gray-600 dark:text-gray-400">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingMerchants.length === 0 ? (
                          <TableRow className="border-gray-200 dark:border-gray-700">
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                              No pending merchants
                            </TableCell>
                          </TableRow>
                        ) : (
                          pendingMerchants.map((merchant) => (
                            <TableRow key={merchant.id} className="border-gray-200 dark:border-gray-700">
                              <TableCell>
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">{merchant.businessName}</div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">{merchant.email}</div>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-900 dark:text-gray-300">{merchant.category}</TableCell>
                              <TableCell className="text-gray-900 dark:text-gray-300">
                                {merchant.createdAt ? new Date(merchant.createdAt.seconds ? merchant.createdAt.seconds * 1000 : merchant.createdAt).toLocaleDateString() : "—"}
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-500/20 dark:bg-yellow-900 dark:text-yellow-400">
                                  Pending
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleMerchantApproval(merchant.id, true)}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white bg-transparent"
                                    onClick={() => handleMerchantApproval(merchant.id, false)}
                                  >
                                    Reject
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              {loading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {Array.from({ length: 3 }).map((_, j) => (
                            <div key={j} className="flex justify-between items-center">
                              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-gray-900 dark:text-white">Revenue Analytics</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Platform revenue and fee collection
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Total Volume</span>
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.totalVolume || "$0"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Active Users</span>
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">{analytics?.activeUsers || "0"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Events Listed</span>
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">{analytics?.eventsListed || "0"}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-gray-900 dark:text-white">Platform Metrics</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        System performance and reliability
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Transaction Success</span>
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.platformMetrics?.transactionSuccessRate || "99.7%"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Avg Response Time</span>
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">{analytics?.platformMetrics?.averageResponseTime || "1.2s"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">User Satisfaction</span>
                          <span className="text-lg font-semibold text-green-600 dark:text-green-400">{analytics?.platformMetrics?.userSatisfaction || "4.8/5"}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Platform Settings</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Configure global platform parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {loading ? (
                    <div className="space-y-4">
                      <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Fee Configuration</h3>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div>
                            <label className="text-sm text-gray-600 dark:text-gray-400">Platform Fee (%)</label>
                            <input
                              type="number"
                              value={settings.platformFeePercentage}
                              step="0.1"
                              onChange={(e) => setSettings(prev => ({ ...prev, platformFeePercentage: Number(e.target.value) }))}
                              className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-600 dark:text-gray-400">Creator Royalty (%)</label>
                            <input
                              type="number"
                              value={settings.creatorRoyaltyPercentage}
                              step="0.1"
                              onChange={(e) => setSettings(prev => ({ ...prev, creatorRoyaltyPercentage: Number(e.target.value) }))}
                              className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-600 dark:text-gray-400">Network Fee (ALGO)</label>
                            <input
                              type="number"
                              value={settings.networkFeeAlgo}
                              step="0.001"
                              onChange={(e) => setSettings(prev => ({ ...prev, networkFeeAlgo: Number(e.target.value) }))}
                              className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Approval Settings</h3>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={settings.requireManualMerchantApproval}
                              onChange={(e) => setSettings(prev => ({ ...prev, requireManualMerchantApproval: e.target.checked }))}
                              className="rounded border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                            />
                            <span className="text-gray-900 dark:text-gray-300">
                              Require manual approval for new merchants
                            </span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={settings.autoApproveVerifiedMerchants}
                              onChange={(e) => setSettings(prev => ({ ...prev, autoApproveVerifiedMerchants: e.target.checked }))}
                              className="rounded border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                            />
                            <span className="text-gray-900 dark:text-gray-300">Auto-approve verified merchants</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          onClick={handleSaveSettings}
                          disabled={savingSettings}
                          className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                        >
                          {savingSettings ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Settings"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
