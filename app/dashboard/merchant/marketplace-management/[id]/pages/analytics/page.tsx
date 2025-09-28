"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, 
  Settings, 
  Save, 
  Loader2,
  RefreshCw,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  Download,
  Calendar,
  Filter
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import AuthGuard from "@/components/auth-guard"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-context"

interface AnalyticsPageContent {
  title: string
  description: string
  featuredImage?: string
  layout: 'dashboard' | 'charts' | 'reports'
  showFeatured: boolean
  showCategories: boolean
  showFilters: boolean
  itemsPerPage: number
  dashboardSettings: {
    showOverview: boolean
    showRevenue: boolean
    showVolume: boolean
    showUsers: boolean
    showTopNFTs: boolean
    showRecentActivity: boolean
    refreshInterval: number
    autoRefresh: boolean
  }
  chartSettings: {
    chartTypes: string[]
    timeRanges: string[]
    defaultTimeRange: string
    showTrends: boolean
    showComparisons: boolean
    allowExport: boolean
    showDataLabels: boolean
  }
  reportSettings: {
    enableReports: boolean
    reportTypes: string[]
    scheduleReports: boolean
    emailReports: boolean
    reportFrequency: string
    includeCharts: boolean
    includeRawData: boolean
  }
  privacySettings: {
    showPublicStats: boolean
    anonymizeData: boolean
    allowDataExport: boolean
    dataRetentionDays: number
  }
  styling: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    fontFamily: string
    borderRadius: string
  }
}

export default function AnalyticsPageManagement({
  params
}: {
  params: { id: string }
}) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pageContent, setPageContent] = useState<AnalyticsPageContent>({
    title: "Analytics Dashboard",
    description: "Track your marketplace performance and insights",
    layout: 'dashboard',
    showFeatured: true,
    showCategories: true,
    showFilters: true,
    itemsPerPage: 12,
    dashboardSettings: {
      showOverview: true,
      showRevenue: true,
      showVolume: true,
      showUsers: true,
      showTopNFTs: true,
      showRecentActivity: true,
      refreshInterval: 30,
      autoRefresh: true
    },
    chartSettings: {
      chartTypes: ['line', 'bar', 'pie', 'area'],
      timeRanges: ['1d', '7d', '30d', '90d', '1y'],
      defaultTimeRange: '30d',
      showTrends: true,
      showComparisons: true,
      allowExport: true,
      showDataLabels: true
    },
    reportSettings: {
      enableReports: true,
      reportTypes: ['daily', 'weekly', 'monthly', 'custom'],
      scheduleReports: true,
      emailReports: true,
      reportFrequency: 'weekly',
      includeCharts: true,
      includeRawData: true
    },
    privacySettings: {
      showPublicStats: false,
      anonymizeData: true,
      allowDataExport: true,
      dataRetentionDays: 365
    },
    styling: {
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      accentColor: '#10B981',
      fontFamily: 'Inter',
      borderRadius: '0.5rem'
    }
  })
  
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    fetchAnalyticsPage()
  }, [params.id])

  const fetchAnalyticsPage = async () => {
    try {
      const response = await fetch(`/api/marketplaces/${params.id}/pages?type=analytics`)
      if (response.ok) {
        const data = await response.json()
        if (data.pages && data.pages.length > 0) {
          setPageContent(data.pages[0].content)
        }
      }
    } catch (error) {
      console.error("Error fetching analytics page:", error)
      toast({
        title: "Error",
        description: "Failed to load analytics page configuration",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAnalyticsPage = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/marketplaces/${params.id}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: 'analytics',
          title: pageContent.title,
          description: pageContent.description,
          content: pageContent,
          isActive: true,
          order: 4,
          slug: 'analytics'
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Analytics page configuration saved successfully!",
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to save analytics page")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save analytics page",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AuthGuard allowedRoles={["merchant"]}>
        <DashboardLayout role="merchant">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard allowedRoles={["merchant"]}>
      <DashboardLayout role="merchant">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Page Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Configure your marketplace analytics and reporting features
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAnalyticsPage}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={handleSaveAnalyticsPage} disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Configuration
              </Button>
            </div>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="general">
                <Settings className="w-4 h-4 mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger value="dashboard">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="charts">
                <TrendingUp className="w-4 h-4 mr-2" />
                Charts
              </TabsTrigger>
              <TabsTrigger value="reports">
                <Download className="w-4 h-4 mr-2" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="privacy">
                <Eye className="w-4 h-4 mr-2" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="styling">
                <Settings className="w-4 h-4 mr-2" />
                Styling
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Configure basic page information and display options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="page-title">Page Title</Label>
                        <Input
                          id="page-title"
                          value={pageContent.title}
                          onChange={(e) => setPageContent(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Analytics Dashboard"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="page-description">Page Description</Label>
                        <Textarea
                          id="page-description"
                          value={pageContent.description}
                          onChange={(e) => setPageContent(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Track your marketplace performance and insights"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="featured-image">Featured Image URL</Label>
                        <Input
                          id="featured-image"
                          value={pageContent.featuredImage || ''}
                          onChange={(e) => setPageContent(prev => ({ ...prev, featuredImage: e.target.value }))}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-featured">Show Featured Section</Label>
                        <Switch
                          id="show-featured"
                          checked={pageContent.showFeatured}
                          onCheckedChange={(checked) => setPageContent(prev => ({ ...prev, showFeatured: checked }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-categories">Show Categories</Label>
                        <Switch
                          id="show-categories"
                          checked={pageContent.showCategories}
                          onCheckedChange={(checked) => setPageContent(prev => ({ ...prev, showCategories: checked }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-filters">Show Filters</Label>
                        <Switch
                          id="show-filters"
                          checked={pageContent.showFilters}
                          onCheckedChange={(checked) => setPageContent(prev => ({ ...prev, showFilters: checked }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="items-per-page">Items Per Page</Label>
                        <Input
                          id="items-per-page"
                          type="number"
                          value={pageContent.itemsPerPage}
                          onChange={(e) => setPageContent(prev => ({ ...prev, itemsPerPage: parseInt(e.target.value) }))}
                          placeholder="12"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Dashboard Settings */}
            <TabsContent value="dashboard">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Dashboard Settings
                  </CardTitle>
                  <CardDescription>
                    Configure what analytics widgets to display
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-overview">Show Overview</Label>
                        <Switch
                          id="show-overview"
                          checked={pageContent.dashboardSettings.showOverview}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              dashboardSettings: { ...prev.dashboardSettings, showOverview: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-revenue">Show Revenue</Label>
                        <Switch
                          id="show-revenue"
                          checked={pageContent.dashboardSettings.showRevenue}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              dashboardSettings: { ...prev.dashboardSettings, showRevenue: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-volume">Show Volume</Label>
                        <Switch
                          id="show-volume"
                          checked={pageContent.dashboardSettings.showVolume}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              dashboardSettings: { ...prev.dashboardSettings, showVolume: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-users">Show Users</Label>
                        <Switch
                          id="show-users"
                          checked={pageContent.dashboardSettings.showUsers}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              dashboardSettings: { ...prev.dashboardSettings, showUsers: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-top-nfts">Show Top NFTs</Label>
                        <Switch
                          id="show-top-nfts"
                          checked={pageContent.dashboardSettings.showTopNFTs}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              dashboardSettings: { ...prev.dashboardSettings, showTopNFTs: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-recent-activity">Show Recent Activity</Label>
                        <Switch
                          id="show-recent-activity"
                          checked={pageContent.dashboardSettings.showRecentActivity}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              dashboardSettings: { ...prev.dashboardSettings, showRecentActivity: checked }
                            }))
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-refresh">Auto Refresh</Label>
                        <Switch
                          id="auto-refresh"
                          checked={pageContent.dashboardSettings.autoRefresh}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              dashboardSettings: { ...prev.dashboardSettings, autoRefresh: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="refresh-interval">Refresh Interval (seconds)</Label>
                        <Input
                          id="refresh-interval"
                          type="number"
                          value={pageContent.dashboardSettings.refreshInterval}
                          onChange={(e) => 
                            setPageContent(prev => ({
                              ...prev,
                              dashboardSettings: { ...prev.dashboardSettings, refreshInterval: parseInt(e.target.value) }
                            }))
                          }
                          placeholder="30"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Chart Settings */}
            <TabsContent value="charts">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Chart Settings
                  </CardTitle>
                  <CardDescription>
                    Configure chart types and display options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="default-time-range">Default Time Range</Label>
                        <Select
                          value={pageContent.chartSettings.defaultTimeRange}
                          onValueChange={(value) => 
                            setPageContent(prev => ({
                              ...prev,
                              chartSettings: { ...prev.chartSettings, defaultTimeRange: value }
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1d">1 Day</SelectItem>
                            <SelectItem value="7d">7 Days</SelectItem>
                            <SelectItem value="30d">30 Days</SelectItem>
                            <SelectItem value="90d">90 Days</SelectItem>
                            <SelectItem value="1y">1 Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-trends">Show Trends</Label>
                        <Switch
                          id="show-trends"
                          checked={pageContent.chartSettings.showTrends}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              chartSettings: { ...prev.chartSettings, showTrends: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-comparisons">Show Comparisons</Label>
                        <Switch
                          id="show-comparisons"
                          checked={pageContent.chartSettings.showComparisons}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              chartSettings: { ...prev.chartSettings, showComparisons: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="allow-export">Allow Export</Label>
                        <Switch
                          id="allow-export"
                          checked={pageContent.chartSettings.allowExport}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              chartSettings: { ...prev.chartSettings, allowExport: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-data-labels">Show Data Labels</Label>
                        <Switch
                          id="show-data-labels"
                          checked={pageContent.chartSettings.showDataLabels}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              chartSettings: { ...prev.chartSettings, showDataLabels: checked }
                            }))
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Available Chart Types</Label>
                        <div className="space-y-2 mt-2">
                          {['line', 'bar', 'pie', 'area', 'scatter', 'doughnut'].map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`chart-${type}`}
                                checked={pageContent.chartSettings.chartTypes.includes(type)}
                                onChange={(e) => {
                                  const newTypes = e.target.checked
                                    ? [...pageContent.chartSettings.chartTypes, type]
                                    : pageContent.chartSettings.chartTypes.filter(t => t !== type)
                                  setPageContent(prev => ({
                                    ...prev,
                                    chartSettings: { ...prev.chartSettings, chartTypes: newTypes }
                                  }))
                                }}
                                className="rounded"
                              />
                              <Label htmlFor={`chart-${type}`} className="capitalize">{type}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Report Settings */}
            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Download className="w-5 h-5 mr-2" />
                    Report Settings
                  </CardTitle>
                  <CardDescription>
                    Configure automated reporting features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enable-reports">Enable Reports</Label>
                        <Switch
                          id="enable-reports"
                          checked={pageContent.reportSettings.enableReports}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              reportSettings: { ...prev.reportSettings, enableReports: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="schedule-reports">Schedule Reports</Label>
                        <Switch
                          id="schedule-reports"
                          checked={pageContent.reportSettings.scheduleReports}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              reportSettings: { ...prev.reportSettings, scheduleReports: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-reports">Email Reports</Label>
                        <Switch
                          id="email-reports"
                          checked={pageContent.reportSettings.emailReports}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              reportSettings: { ...prev.reportSettings, emailReports: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="include-charts">Include Charts</Label>
                        <Switch
                          id="include-charts"
                          checked={pageContent.reportSettings.includeCharts}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              reportSettings: { ...prev.reportSettings, includeCharts: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="include-raw-data">Include Raw Data</Label>
                        <Switch
                          id="include-raw-data"
                          checked={pageContent.reportSettings.includeRawData}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              reportSettings: { ...prev.reportSettings, includeRawData: checked }
                            }))
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="report-frequency">Report Frequency</Label>
                        <Select
                          value={pageContent.reportSettings.reportFrequency}
                          onValueChange={(value) => 
                            setPageContent(prev => ({
                              ...prev,
                              reportSettings: { ...prev.reportSettings, reportFrequency: value }
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Available Report Types</Label>
                        <div className="space-y-2 mt-2">
                          {['daily', 'weekly', 'monthly', 'custom'].map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`report-${type}`}
                                checked={pageContent.reportSettings.reportTypes.includes(type)}
                                onChange={(e) => {
                                  const newTypes = e.target.checked
                                    ? [...pageContent.reportSettings.reportTypes, type]
                                    : pageContent.reportSettings.reportTypes.filter(t => t !== type)
                                  setPageContent(prev => ({
                                    ...prev,
                                    reportSettings: { ...prev.reportSettings, reportTypes: newTypes }
                                  }))
                                }}
                                className="rounded"
                              />
                              <Label htmlFor={`report-${type}`} className="capitalize">{type}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    Privacy Settings
                  </CardTitle>
                  <CardDescription>
                    Configure data privacy and sharing options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-public-stats">Show Public Stats</Label>
                        <Switch
                          id="show-public-stats"
                          checked={pageContent.privacySettings.showPublicStats}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              privacySettings: { ...prev.privacySettings, showPublicStats: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="anonymize-data">Anonymize Data</Label>
                        <Switch
                          id="anonymize-data"
                          checked={pageContent.privacySettings.anonymizeData}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              privacySettings: { ...prev.privacySettings, anonymizeData: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="allow-data-export">Allow Data Export</Label>
                        <Switch
                          id="allow-data-export"
                          checked={pageContent.privacySettings.allowDataExport}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              privacySettings: { ...prev.privacySettings, allowDataExport: checked }
                            }))
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="data-retention-days">Data Retention (days)</Label>
                        <Input
                          id="data-retention-days"
                          type="number"
                          value={pageContent.privacySettings.dataRetentionDays}
                          onChange={(e) => 
                            setPageContent(prev => ({
                              ...prev,
                              privacySettings: { ...prev.privacySettings, dataRetentionDays: parseInt(e.target.value) }
                            }))
                          }
                          placeholder="365"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Styling Settings */}
            <TabsContent value="styling">
              <Card>
                <CardHeader>
                  <CardTitle>Styling Settings</CardTitle>
                  <CardDescription>
                    Customize the appearance of your analytics page
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="primary-color">Primary Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="primary-color"
                            type="color"
                            value={pageContent.styling.primaryColor}
                            onChange={(e) => 
                              setPageContent(prev => ({
                                ...prev,
                                styling: { ...prev.styling, primaryColor: e.target.value }
                              }))
                            }
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={pageContent.styling.primaryColor}
                            onChange={(e) => 
                              setPageContent(prev => ({
                                ...prev,
                                styling: { ...prev.styling, primaryColor: e.target.value }
                              }))
                            }
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="secondary-color">Secondary Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="secondary-color"
                            type="color"
                            value={pageContent.styling.secondaryColor}
                            onChange={(e) => 
                              setPageContent(prev => ({
                                ...prev,
                                styling: { ...prev.styling, secondaryColor: e.target.value }
                              }))
                            }
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={pageContent.styling.secondaryColor}
                            onChange={(e) => 
                              setPageContent(prev => ({
                                ...prev,
                                styling: { ...prev.styling, secondaryColor: e.target.value }
                              }))
                            }
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="accent-color">Accent Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="accent-color"
                            type="color"
                            value={pageContent.styling.accentColor}
                            onChange={(e) => 
                              setPageContent(prev => ({
                                ...prev,
                                styling: { ...prev.styling, accentColor: e.target.value }
                              }))
                            }
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={pageContent.styling.accentColor}
                            onChange={(e) => 
                              setPageContent(prev => ({
                                ...prev,
                                styling: { ...prev.styling, accentColor: e.target.value }
                              }))
                            }
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="font-family">Font Family</Label>
                        <Select
                          value={pageContent.styling.fontFamily}
                          onValueChange={(value) => 
                            setPageContent(prev => ({
                              ...prev,
                              styling: { ...prev.styling, fontFamily: value }
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Inter">Inter</SelectItem>
                            <SelectItem value="Roboto">Roboto</SelectItem>
                            <SelectItem value="Poppins">Poppins</SelectItem>
                            <SelectItem value="Open Sans">Open Sans</SelectItem>
                            <SelectItem value="Lato">Lato</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="border-radius">Border Radius</Label>
                        <Select
                          value={pageContent.styling.borderRadius}
                          onValueChange={(value) => 
                            setPageContent(prev => ({
                              ...prev,
                              styling: { ...prev.styling, borderRadius: value }
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0rem">None</SelectItem>
                            <SelectItem value="0.25rem">Small</SelectItem>
                            <SelectItem value="0.5rem">Medium</SelectItem>
                            <SelectItem value="0.75rem">Large</SelectItem>
                            <SelectItem value="1rem">Extra Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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
