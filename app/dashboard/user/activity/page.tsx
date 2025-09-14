"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Activity, 
  ShoppingCart, 
  Gift, 
  CheckCircle, 
  Clock, 
  Filter,
  Download,
  RefreshCw
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import AuthGuard from "@/components/auth-guard"

export default function UserActivityPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    if (!isAuthenticated || authLoading) {
      setLoading(false)
      return
    }

    const loadActivities = async () => {
      try {
        const response = await fetch('/api/user/activity')
        if (response.ok) {
          const data = await response.json()
          setActivities(data.activities || [])
        }
      } catch (error) {
        console.error('Error loading activities:', error)
      } finally {
        setLoading(false)
      }
    }
    loadActivities()
  }, [isAuthenticated, authLoading])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return <ShoppingCart className="w-5 h-5 text-blue-500" />
      case "reward":
        return <Gift className="w-5 h-5 text-yellow-500" />
      case "checkin":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "transfer":
        return <Activity className="w-5 h-5 text-purple-500" />
      default:
        return <Activity className="w-5 h-5 text-gray-500" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "purchase":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "reward":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      case "checkin":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "transfer":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  const filteredActivities = activities.filter(activity => {
    if (filter === "all") return true
    return activity.type === filter
  })

  const activityStats = {
    total: activities.length,
    purchases: activities.filter(a => a.type === "purchase").length,
    rewards: activities.filter(a => a.type === "reward").length,
    checkins: activities.filter(a => a.type === "checkin").length,
  }

  return (
    <AuthGuard requiredRole="user">
      <DashboardLayout role="user">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Activity History</h1>
              <p className="text-gray-600 dark:text-gray-400">Track your transactions and interactions</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-gray-200 dark:border-gray-600">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-200 dark:border-gray-600"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Activities</CardTitle>
                <Activity className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{activityStats.total}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">All activities</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Purchases</CardTitle>
                <ShoppingCart className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{activityStats.purchases}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">NFT purchases</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Rewards</CardTitle>
                <Gift className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{activityStats.rewards}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Points earned</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Check-ins</CardTitle>
                <CheckCircle className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{activityStats.checkins}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Events attended</p>
              </CardContent>
            </Card>
          </div>

          {/* Activity Tabs */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
                onClick={() => setFilter("all")}
              >
                All Activities
              </TabsTrigger>
              <TabsTrigger
                value="purchase"
                className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
                onClick={() => setFilter("purchase")}
              >
                Purchases
              </TabsTrigger>
              <TabsTrigger
                value="reward"
                className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
                onClick={() => setFilter("reward")}
              >
                Rewards
              </TabsTrigger>
              <TabsTrigger
                value="checkin"
                className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
                onClick={() => setFilter("checkin")}
              >
                Check-ins
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="space-y-4">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Activity Timeline</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Your recent transactions and interactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8 text-gray-500">Loading activities...</div>
                    ) : filteredActivities.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>No activities found</p>
                        <p className="text-sm text-gray-400 mt-2">Your activities will appear here</p>
                      </div>
                    ) : (
                      filteredActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                              {getActivityIcon(activity.type)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                                <Badge className={getActivityColor(activity.type)}>
                                  {activity.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <Clock className="w-3 h-3" />
                                {new Date(activity.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-white">{activity.amount}</p>
                            <p className="text-xs text-gray-500">{activity.status}</p>
                          </div>
                        </div>
                      ))
                    )}
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
