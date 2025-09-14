"use client"

import { useState } from "react"
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
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import AuthGuard from "@/components/auth-guard"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AtomicSwapModal } from "@/components/nft/atomic-swap-modal"

export default function UserDashboard() {
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false)

  const stats = [
    {
      title: "NFTs Owned",
      value: "12",
      change: "+3 this month",
      icon: Wallet,
      color: "text-blue-400",
    },
    {
      title: "Events Attended",
      value: "8",
      change: "+2 this month",
      icon: Calendar,
      color: "text-green-400",
    },
    {
      title: "Rewards Earned",
      value: "156",
      change: "+24 this week",
      icon: Trophy,
      color: "text-yellow-400",
    },
    {
      title: "Portfolio Value",
      value: "24.8 ALGO",
      change: "+15.2% this month",
      icon: TrendingUp,
      color: "text-purple-400",
    },
  ]

  const myNFTs = [
    {
      id: 1,
      title: "Summer Music Festival VIP",
      event: "Summer Music Festival 2024",
      date: "July 15, 2024",
      status: "active",
      value: "0.5 ALGO",
      image: "/placeholder.svg?height=100&width=100&text=NFT 1",
      isStaked: false,
    },
    {
      id: 2,
      title: "Tech Conference Premium",
      event: "Tech Conference 2024",
      date: "August 20, 2024",
      status: "upcoming",
      value: "1.2 ALGO",
      image: "/placeholder.svg?height=100&width=100&text=NFT 2",
      isStaked: true,
    },
    {
      id: 3,
      title: "Art Gallery Opening",
      event: "Modern Art Exhibition",
      date: "June 30, 2024",
      status: "used",
      value: "0.3 ALGO",
      image: "/placeholder.svg?height=100&width=100&text=NFT 3",
      isStaked: false,
    },
    {
      id: 4,
      title: "Wine Tasting Premium",
      event: "Vineyard Experience",
      date: "September 5, 2024",
      status: "upcoming",
      value: "2.1 ALGO",
      image: "/placeholder.svg?height=100&width=100&text=NFT 4",
      isStaked: false,
    },
  ]

  const upcomingEvents = [
    {
      id: 1,
      title: "Tech Conference 2024",
      date: "August 20, 2024",
      time: "9:00 AM",
      location: "Convention Center",
      nftId: 2,
    },
    {
      id: 2,
      title: "Wine Tasting Premium",
      date: "September 5, 2024",
      time: "6:00 PM",
      location: "Vineyard Estate",
      nftId: 4,
    },
  ]

  const recentActivity = [
    {
      id: 1,
      type: "purchase",
      title: "Purchased Wine Tasting Premium",
      amount: "2.1 ALGO",
      time: "2 days ago",
    },
    {
      id: 2,
      type: "reward",
      title: "Earned 25 loyalty points",
      amount: "+25 points",
      time: "3 days ago",
    },
    {
      id: 3,
      type: "checkin",
      title: "Checked in to Art Gallery Opening",
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
            {stats.map((stat) => (
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

          {/* Main Content */}
          <Tabs defaultValue="nfts" className="space-y-4">
            <TabsList className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <TabsTrigger
                value="nfts"
                className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
              >
                My NFTs
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
              >
                Upcoming Events
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
              >
                Activity
              </TabsTrigger>
              <TabsTrigger
                value="rewards"
                className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
              >
                Rewards
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
              >
                Profile Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="nfts" className="space-y-4">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">My NFT Collection</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    View and manage your event NFTs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {myNFTs.map((nft) => (
                      <Card key={nft.id} className="bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                        <div className="aspect-square bg-gray-200 dark:bg-gray-600 relative overflow-hidden rounded-t-lg">
                          <img
                            src={nft.image || "/placeholder.svg"}
                            alt={nft.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2">{getStatusBadge(nft.status)}</div>
                          {nft.isStaked && (
                            <Badge className="absolute top-2 left-2 bg-purple-500/10 text-purple-400 border-purple-500/20">
                              Staked
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-1">{nft.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{nft.event}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <Calendar className="w-4 h-4" />
                            {nft.date}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-900 dark:text-white">{nft.value}</span>
                            <div className="flex gap-2">
                              {nft.status === "active" && (
                                <Link href={`/user/event-checkin/${nft.id}`}>
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                    <QrCode className="w-4 h-4" />
                                  </Button>
                                </Link>
                              )}
                              <Link href={`/nft/${nft.id}`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 bg-transparent"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </Link>
                              {nft.status === "active" && !nft.isStaked && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 bg-transparent"
                                  >
                                    Sell
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 bg-transparent"
                                    onClick={() => setIsSwapModalOpen(true)}
                                  >
                                    Swap
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events" className="space-y-4">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Upcoming Events</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Events you have tickets for
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{event.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {event.date} at {event.time}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {event.location}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/user/event-checkin/${event.nftId}`}>
                            <Button
                              size="sm"
                              className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                            >
                              <QrCode className="w-4 h-4 mr-2" />
                              Check In
                            </Button>
                          </Link>
                          <Link href={`/nft/${event.nftId}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 bg-transparent"
                            >
                              Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Recent Activity</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Your latest transactions and interactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
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
            </TabsContent>

            <TabsContent value="rewards" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Loyalty Points</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Earn points by attending events
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4">
                      <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">156</div>
                      <p className="text-gray-600 dark:text-gray-400">Total Points Earned</p>
                      <Button className="w-full bg-yellow-600 text-white hover:bg-yellow-700 dark:bg-yellow-500 dark:text-black dark:hover:bg-yellow-600">
                        Redeem Rewards
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Achievements</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Unlock badges and special rewards
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-600 dark:bg-yellow-500 rounded-full flex items-center justify-center">
                          <Star className="w-4 h-4 text-white dark:text-black" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">First Event</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Attended your first event</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Social Butterfly</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Attended 5+ events</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-600 dark:text-gray-400">VIP Member</p>
                          <p className="text-sm text-gray-500">Attend 10+ events (3/10)</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="profile" className="space-y-4">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Profile Settings</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Manage your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20 border-2 border-gray-200 dark:border-gray-700">
                      <AvatarImage src="/placeholder.svg?height=80&width=80&text=Avatar" alt="User Avatar" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline" size="sm" className="rounded-full bg-transparent">
                        <Edit className="w-4 h-4 mr-2" />
                        Change Avatar
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="userName" className="text-gray-900 dark:text-white">
                        User Name
                      </Label>
                      <Input
                        id="userName"
                        defaultValue="John Doe"
                        className="mt-1 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="userEmail" className="text-gray-900 dark:text-white">
                        Email Address
                      </Label>
                      <Input
                        id="userEmail"
                        type="email"
                        defaultValue="john.doe@example.com"
                        className="mt-1 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="walletAddress" className="text-gray-900 dark:text-white">
                      Algorand Wallet Address
                    </Label>
                    <Input
                      id="walletAddress"
                      defaultValue="0x1234...abcd"
                      readOnly
                      className="mt-1 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Your connected Algorand wallet for transactions.</p>
                  </div>
                  <div className="flex justify-end">
                    <Button className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <AtomicSwapModal 
          isOpen={isSwapModalOpen} 
          onClose={() => setIsSwapModalOpen(false)}
          nftToSwap={myNFTs[0]}
          userNFTs={myNFTs}
        />
      </DashboardLayout>
    </AuthGuard>
  )
}
