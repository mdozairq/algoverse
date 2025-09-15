"use client"

import { useEffect, useState } from "react"
import AuthGuard from "@/components/auth-guard"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Users, Store, DollarSign, Activity, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-context"

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<any>(null)
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuth()

  const fetchAnalytics = async () => {
    // Don't fetch if user is not authenticated
    if (!isAuthenticated || !user) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/analytics")
      const data = await res.json()
      if (res.ok) {
        setAnalytics(data.analytics)
      } else {
        throw new Error(data.error || "Failed to fetch analytics")
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchAnalytics()
    }
  }, [isAuthenticated, user])

  const statsCards = [
    {
      title: "Total Volume",
      value: analytics?.totalVolume || "$0",
      icon: DollarSign,
      color: "text-green-400",
      change: "+23%",
    },
    {
      title: "Active Users",
      value: analytics?.activeUsers || "0",
      icon: Users,
      color: "text-blue-400",
      change: "+12%",
    },
    {
      title: "Events Listed",
      value: analytics?.eventsListed || "0",
      icon: Store,
      color: "text-purple-400",
      change: "+8%",
    },
    {
      title: "Avg NFT Price",
      value: analytics?.avgNFTPrice || "0 ALGO",
      icon: TrendingUp,
      color: "text-yellow-400",
      change: "+5%",
    },
  ]

  return (
    <AuthGuard requiredRole="admin">
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400">Platform performance and user metrics</p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              statsCards.map((stat) => (
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

          {/* Detailed Analytics */}
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
              {/* Top Categories */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Top Categories</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Most popular event categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.topCategories?.map((category: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{category.volume}</span>
                            <Badge variant="outline" className="text-green-600 dark:text-green-400">
                              {category.growth}
                            </Badge>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: category.share }}
                          ></div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                        No category data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Platform Metrics */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Platform Health</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    System performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Transaction Success</span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {analytics?.platformMetrics?.transactionSuccessRate || "99.7%"}
                      </span>
                    </div>
                    <Progress value={99.7} className="bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</span>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {analytics?.platformMetrics?.averageResponseTime || "1.2s"}
                      </span>
                    </div>
                    <Progress value={85} className="bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">User Satisfaction</span>
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        {analytics?.platformMetrics?.userSatisfaction || "4.8/5"}
                      </span>
                    </div>
                    <Progress value={96} className="bg-gray-200 dark:bg-gray-700" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}