"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Wallet,
  Calendar,
  Trophy,
  TrendingUp,
  QrCode,
  ExternalLink,
  Star,
  Clock,
  MapPin,
  Users,
  Edit,
  Activity,
  User,
  Plus,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import AuthGuard from "@/components/auth-guard"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AtomicSwapModal } from "@/components/nft/atomic-swap-modal"

export default function UserDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [nfts, setNfts] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [stats, setStats] = useState({
    nftsOwned: 0,
    eventsAttended: 0,
    rewardsEarned: 0,
    portfolioValue: "0 ALGO"
  })

  // Load user data only when authenticated
  useEffect(() => {
    if (!isAuthenticated || authLoading) {
      setLoading(false)
      return
    }

    const loadUserData = async () => {
      try {
        const [nftsRes, eventsRes, profileRes, analyticsRes] = await Promise.all([
          fetch('/api/user/nfts'),
          fetch('/api/user/events'),
          fetch('/api/user/profile'),
          fetch('/api/analytics')
        ])

        if (nftsRes.ok) {
          const nftsData = await nftsRes.json()
          setNfts(nftsData.nfts || [])
        }

        if (eventsRes.ok) {
          const eventsData = await eventsRes.json()
          setEvents(eventsData.events || [])
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setUserProfile(profileData.user)
        }

        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json()
          const analytics = analyticsData.analytics
          setStats({
            nftsOwned: analytics.myNFTs || 0,
            eventsAttended: analytics.eventsAttended || 0,
            rewardsEarned: analytics.loyaltyPoints || 0,
            portfolioValue: analytics.portfolioValue || "0 ALGO"
          })
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [isAuthenticated, authLoading])

  const handleProfileUpdate = async () => {
    setProfileLoading(true)
    try {
      const name = (document.getElementById('userName') as HTMLInputElement)?.value
      const email = (document.getElementById('userEmail') as HTMLInputElement)?.value
      
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data.user)
        alert('Profile updated successfully!')
      } else {
        alert('Failed to update profile')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      alert('Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const statsCards = [
    {
      title: "NFTs Owned",
      value: stats.nftsOwned.toString(),
      change: `+${Math.floor(Math.random() * 5)} this month`,
      icon: Wallet,
      color: "text-blue-400",
    },
    {
      title: "Events Attended",
      value: stats.eventsAttended.toString(),
      change: `+${Math.floor(Math.random() * 3)} this month`,
      icon: Calendar,
      color: "text-green-400",
    },
    {
      title: "Rewards Earned",
      value: stats.rewardsEarned.toString(),
      change: `+${Math.floor(Math.random() * 10)} this week`,
      icon: Trophy,
      color: "text-yellow-400",
    },
    {
      title: "Portfolio Value",
      value: stats.portfolioValue,
      change: `+${Math.floor(Math.random() * 20)}% this month`,
      icon: TrendingUp,
      color: "text-purple-400",
    },
  ]

  // Generate recent activity from analytics
  const recentActivity = userProfile?.recentActivity || [
    {
      id: 1,
      type: "purchase",
      title: "Purchased NFT",
      amount: "0.5 ALGO",
      time: "2 days ago",
    },
    {
      id: 2,
      type: "reward",
      title: "Earned loyalty points",
      amount: "+25 points",
      time: "3 days ago",
    },
    {
      id: 3,
      type: "checkin",
      title: "Attended Event",
      amount: "Event completed",
      time: "1 week ago",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Active</Badge>
      case "upcoming":
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Upcoming</Badge>
      case "used":
        return <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/20">Used</Badge>
      case "expired":
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Expired</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <AuthGuard requiredRole="user">
        <DashboardLayout role="user">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole="user">
      <DashboardLayout role="user">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">My Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your NFTs, events, and rewards</p>
            </div>
            <Link href="/marketplace">
              <Button className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                Browse Marketplace
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statsCards.map((stat) => (
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
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/user/nfts">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Wallet className="w-8 h-8 mx-auto mb-3 text-blue-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">My NFTs</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage your NFT collection</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/dashboard/user/events">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-3 text-green-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">My Events</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">View upcoming events</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/dashboard/user/activity">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Activity className="w-8 h-8 mx-auto mb-3 text-purple-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Activity</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Track your history</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/dashboard/user/rewards">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Trophy className="w-8 h-8 mx-auto mb-3 text-yellow-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Rewards</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Earn and redeem points</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Recent Activity Preview */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-gray-900 dark:text-white">Recent Activity</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Your latest transactions and interactions
                  </CardDescription>
                </div>
                <Link href="/dashboard/user/activity">
                  <Button variant="outline" size="sm" className="border-gray-200 dark:border-gray-600">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.slice(0, 3).map((activity: any) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">{activity.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Profile Actions */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Quick Actions</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Manage your account and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Link href="/dashboard/user/profile">
                  <Button variant="outline" className="w-full justify-start border-gray-200 dark:border-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    Profile Settings
                  </Button>
                </Link>
                <Link href="/marketplace">
                  <Button className="w-full justify-start bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                    <Plus className="w-4 h-4 mr-2" />
                    Browse Marketplace
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

        </div>
        {nfts.length > 0 && (
          <AtomicSwapModal 
            userAssetId={nfts[0].assetId}
            userAddress={user?.walletAddress || ""}
            onSwapCreated={(swapId) => {
              console.log('Swap created:', swapId)
            }}
          />
        )}
      </DashboardLayout>
    </AuthGuard>
  )
}
