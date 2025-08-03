"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Store, TrendingUp, DollarSign, Activity, CheckCircle, XCircle, Clock, Eye } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import AuthGuard from "@/components/auth-guard"

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Merchants",
      value: "1,234",
      change: "+12%",
      icon: Users,
      color: "text-blue-400",
    },
    {
      title: "Active Marketplaces",
      value: "856",
      change: "+8%",
      icon: Store,
      color: "text-green-400",
    },
    {
      title: "Total Revenue",
      value: "$45,231",
      change: "+23%",
      icon: DollarSign,
      color: "text-yellow-400",
    },
    {
      title: "Platform Growth",
      value: "18.2%",
      change: "+5%",
      icon: TrendingUp,
      color: "text-purple-400",
    },
  ]

  const pendingMerchants = [
    {
      id: 1,
      name: "Festival Productions LLC",
      email: "contact@festivalproductions.com",
      type: "Event Organizer",
      submitted: "2024-01-15",
      status: "pending",
    },
    {
      id: 2,
      name: "Resort Paradise Group",
      email: "admin@resortparadise.com",
      type: "Hotel Chain",
      submitted: "2024-01-14",
      status: "pending",
    },
    {
      id: 3,
      name: "Cinema Network",
      email: "business@cinemanetwork.com",
      type: "Entertainment",
      submitted: "2024-01-13",
      status: "review",
    },
  ]

  const recentActivity = [
    {
      id: 1,
      action: "New merchant approved",
      merchant: "Tech Conference Co.",
      time: "2 hours ago",
      type: "approval",
    },
    {
      id: 2,
      action: "Marketplace created",
      merchant: "Music Festival Group",
      time: "4 hours ago",
      type: "creation",
    },
    {
      id: 3,
      action: "Fee structure updated",
      merchant: "Global Events Inc.",
      time: "6 hours ago",
      type: "update",
    },
    {
      id: 4,
      action: "Merchant suspended",
      merchant: "Suspicious Events LLC",
      time: "1 day ago",
      type: "suspension",
    },
  ]

  return (
    <AuthGuard requiredRole="admin">
      <DashboardLayout role="admin">
        <div className="space-y-8 bg-gray-50 dark:bg-gray-900 p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage merchants, marketplaces, and platform settings</p>
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
                <p className="text-xs text-green-600 dark:text-green-400">{stat.change} from last month</p>
              </CardContent>
            </Card>
          ))}
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
                  <CardTitle className="text-gray-900 dark:text-white">Recent Activity</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Latest platform activities and merchant actions
                  </CardDescription>
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
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 dark:border-gray-700">
                      <TableHead className="text-gray-600 dark:text-gray-400">Merchant</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">Type</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">Submitted</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingMerchants.map((merchant) => (
                      <TableRow key={merchant.id} className="border-gray-200 dark:border-gray-700">
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{merchant.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{merchant.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-300">{merchant.type}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-300">{merchant.submitted}</TableCell>
                        <TableCell>
                          <Badge
                            variant={merchant.status === "pending" ? "secondary" : "outline"}
                            className={
                              merchant.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-500/20 dark:bg-yellow-900 dark:text-yellow-400"
                                : "bg-blue-100 text-blue-800 border-blue-500/20 dark:bg-blue-900 dark:text-blue-400"
                            }
                          >
                            {merchant.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white bg-transparent"
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
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
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
                      <span className="text-gray-600 dark:text-gray-400">Total Fees Collected</span>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">$12,456</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Average Fee Rate</span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">2.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Monthly Growth</span>
                      <span className="text-lg font-semibold text-green-600 dark:text-green-400">+18.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">User Metrics</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Platform user engagement statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Active Users</span>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">8,924</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">New Signups (30d)</span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">1,234</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Retention Rate</span>
                      <span className="text-lg font-semibold text-green-600 dark:text-green-400">87.3%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Fee Configuration</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400">Platform Fee (%)</label>
                        <input
                          type="number"
                          defaultValue="2.5"
                          className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400">Transaction Fee (ALGO)</label>
                        <input
                          type="number"
                          defaultValue="0.001"
                          step="0.001"
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
                          defaultChecked
                          className="rounded border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                        />
                        <span className="text-gray-900 dark:text-gray-300">
                          Require manual approval for new merchants
                        </span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                        />
                        <span className="text-gray-900 dark:text-gray-300">Auto-approve verified merchants</span>
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
