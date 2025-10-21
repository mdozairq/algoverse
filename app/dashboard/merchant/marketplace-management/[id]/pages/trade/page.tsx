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
  TrendingUp, 
  Settings, 
  Save, 
  Plus,
  Trash2,
  Edit,
  Loader2,
  RefreshCw,
  Gavel,
  Zap,
  Clock,
  DollarSign,
  Users,
  Timer
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import AuthGuard from "@/components/auth-guard"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-context"

interface TradePageContent {
  title: string
  description: string
  featuredImage?: string
  layout: 'grid' | 'list' | 'timeline'
  showFeatured: boolean
  showCategories: boolean
  showFilters: boolean
  itemsPerPage: number
  auctionSettings: {
    enabled: boolean
    defaultDuration: number
    minBidIncrement: number
    reservePriceEnabled: boolean
    autoExtend: boolean
    extendTime: number
    showBidHistory: boolean
    allowBuyNow: boolean
    buyNowMultiplier: number
  }
  flashSaleSettings: {
    enabled: boolean
    defaultDuration: number
    maxDiscount: number
    minDiscount: number
    showCountdown: boolean
    showProgress: boolean
    allowEarlyEnd: boolean
    notificationEnabled: boolean
  }
  tradingSettings: {
    allowInstantBuy: boolean
    allowOffers: boolean
    offerExpiry: number
    requireKYC: boolean
    showPriceHistory: boolean
    showVolume: boolean
  }
  styling: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    fontFamily: string
    borderRadius: string
  }
}

export default function TradePageManagement({
  params
}: {
  params: { id: string }
}) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pageContent, setPageContent] = useState<TradePageContent>({
    title: "Trade NFTs",
    description: "Buy, sell, and auction NFTs",
    layout: 'grid',
    showFeatured: true,
    showCategories: true,
    showFilters: true,
    itemsPerPage: 12,
    auctionSettings: {
      enabled: true,
      defaultDuration: 24,
      minBidIncrement: 0.1,
      reservePriceEnabled: true,
      autoExtend: true,
      extendTime: 5,
      showBidHistory: true,
      allowBuyNow: true,
      buyNowMultiplier: 2
    },
    flashSaleSettings: {
      enabled: true,
      defaultDuration: 1,
      maxDiscount: 50,
      minDiscount: 10,
      showCountdown: true,
      showProgress: true,
      allowEarlyEnd: false,
      notificationEnabled: true
    },
    tradingSettings: {
      allowInstantBuy: true,
      allowOffers: true,
      offerExpiry: 7,
      requireKYC: false,
      showPriceHistory: true,
      showVolume: true
    },
    styling: {
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      accentColor: '#F59E0B',
      fontFamily: 'Inter',
      borderRadius: '0.5rem'
    }
  })
  
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    fetchTradePage()
  }, [params.id])

  const fetchTradePage = async () => {
    try {
      const response = await fetch(`/api/marketplaces/${params.id}/pages?type=trade`)
      if (response.ok) {
        const data = await response.json()
        if (data.pages && data.pages.length > 0) {
          setPageContent(data.pages[0].content)
        }
      }
    } catch (error) {
      console.error("Error fetching trade page:", error)
      toast({
        title: "Error",
        description: "Failed to load trade page configuration",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTradePage = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/marketplaces/${params.id}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: 'trade',
          title: pageContent.title,
          description: pageContent.description,
          content: pageContent,
          isActive: true,
          order: 2,
          slug: 'trade'
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Trade page configuration saved successfully!",
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to save trade page")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save trade page",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AuthGuard requiredRole="merchant">
        <DashboardLayout role="merchant">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole="merchant">
      <DashboardLayout role="merchant">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trade Page Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Configure your NFT trading, auction, and flash sale features
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchTradePage}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={handleSaveTradePage} disabled={saving}>
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
              <TabsTrigger value="auctions">
                <Gavel className="w-4 h-4 mr-2" />
                Auctions
              </TabsTrigger>
              <TabsTrigger value="flash-sales">
                <Zap className="w-4 h-4 mr-2" />
                Flash Sales
              </TabsTrigger>
              <TabsTrigger value="trading">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trading
              </TabsTrigger>
              <TabsTrigger value="layout">
                <Settings className="w-4 h-4 mr-2" />
                Layout
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
                          placeholder="Trade NFTs"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="page-description">Page Description</Label>
                        <Textarea
                          id="page-description"
                          value={pageContent.description}
                          onChange={(e) => setPageContent(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Buy, sell, and auction NFTs"
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

            {/* Auction Settings */}
            <TabsContent value="auctions">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Gavel className="w-5 h-5 mr-2" />
                    Auction Settings
                  </CardTitle>
                  <CardDescription>
                    Configure auction behavior and user experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auction-enabled">Enable Auctions</Label>
                        <Switch
                          id="auction-enabled"
                          checked={pageContent.auctionSettings.enabled}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              auctionSettings: { ...prev.auctionSettings, enabled: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="reserve-price">Enable Reserve Price</Label>
                        <Switch
                          id="reserve-price"
                          checked={pageContent.auctionSettings.reservePriceEnabled}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              auctionSettings: { ...prev.auctionSettings, reservePriceEnabled: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-extend">Auto Extend Auctions</Label>
                        <Switch
                          id="auto-extend"
                          checked={pageContent.auctionSettings.autoExtend}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              auctionSettings: { ...prev.auctionSettings, autoExtend: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-bid-history">Show Bid History</Label>
                        <Switch
                          id="show-bid-history"
                          checked={pageContent.auctionSettings.showBidHistory}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              auctionSettings: { ...prev.auctionSettings, showBidHistory: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="allow-buy-now">Allow Buy Now</Label>
                        <Switch
                          id="allow-buy-now"
                          checked={pageContent.auctionSettings.allowBuyNow}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              auctionSettings: { ...prev.auctionSettings, allowBuyNow: checked }
                            }))
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="default-duration">Default Duration (hours)</Label>
                        <Input
                          id="default-duration"
                          type="number"
                          value={pageContent.auctionSettings.defaultDuration}
                          onChange={(e) => 
                            setPageContent(prev => ({
                              ...prev,
                              auctionSettings: { ...prev.auctionSettings, defaultDuration: parseInt(e.target.value) }
                            }))
                          }
                          placeholder="24"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="min-bid-increment">Minimum Bid Increment (ALGO)</Label>
                        <Input
                          id="min-bid-increment"
                          type="number"
                          step="0.01"
                          value={pageContent.auctionSettings.minBidIncrement}
                          onChange={(e) => 
                            setPageContent(prev => ({
                              ...prev,
                              auctionSettings: { ...prev.auctionSettings, minBidIncrement: parseFloat(e.target.value) }
                            }))
                          }
                          placeholder="0.1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="extend-time">Auto Extend Time (minutes)</Label>
                        <Input
                          id="extend-time"
                          type="number"
                          value={pageContent.auctionSettings.extendTime}
                          onChange={(e) => 
                            setPageContent(prev => ({
                              ...prev,
                              auctionSettings: { ...prev.auctionSettings, extendTime: parseInt(e.target.value) }
                            }))
                          }
                          placeholder="5"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="buy-now-multiplier">Buy Now Price Multiplier</Label>
                        <Input
                          id="buy-now-multiplier"
                          type="number"
                          step="0.1"
                          value={pageContent.auctionSettings.buyNowMultiplier}
                          onChange={(e) => 
                            setPageContent(prev => ({
                              ...prev,
                              auctionSettings: { ...prev.auctionSettings, buyNowMultiplier: parseFloat(e.target.value) }
                            }))
                          }
                          placeholder="2"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Flash Sale Settings */}
            <TabsContent value="flash-sales">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Flash Sale Settings
                  </CardTitle>
                  <CardDescription>
                    Configure flash sale behavior and features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="flash-sale-enabled">Enable Flash Sales</Label>
                        <Switch
                          id="flash-sale-enabled"
                          checked={pageContent.flashSaleSettings.enabled}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              flashSaleSettings: { ...prev.flashSaleSettings, enabled: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-countdown">Show Countdown Timer</Label>
                        <Switch
                          id="show-countdown"
                          checked={pageContent.flashSaleSettings.showCountdown}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              flashSaleSettings: { ...prev.flashSaleSettings, showCountdown: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-progress">Show Progress Bar</Label>
                        <Switch
                          id="show-progress"
                          checked={pageContent.flashSaleSettings.showProgress}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              flashSaleSettings: { ...prev.flashSaleSettings, showProgress: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="allow-early-end">Allow Early End</Label>
                        <Switch
                          id="allow-early-end"
                          checked={pageContent.flashSaleSettings.allowEarlyEnd}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              flashSaleSettings: { ...prev.flashSaleSettings, allowEarlyEnd: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notification-enabled">Enable Notifications</Label>
                        <Switch
                          id="notification-enabled"
                          checked={pageContent.flashSaleSettings.notificationEnabled}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              flashSaleSettings: { ...prev.flashSaleSettings, notificationEnabled: checked }
                            }))
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="flash-duration">Default Duration (hours)</Label>
                        <Input
                          id="flash-duration"
                          type="number"
                          step="0.1"
                          value={pageContent.flashSaleSettings.defaultDuration}
                          onChange={(e) => 
                            setPageContent(prev => ({
                              ...prev,
                              flashSaleSettings: { ...prev.flashSaleSettings, defaultDuration: parseFloat(e.target.value) }
                            }))
                          }
                          placeholder="1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="max-discount">Maximum Discount (%)</Label>
                        <Input
                          id="max-discount"
                          type="number"
                          min="0"
                          max="100"
                          value={pageContent.flashSaleSettings.maxDiscount}
                          onChange={(e) => 
                            setPageContent(prev => ({
                              ...prev,
                              flashSaleSettings: { ...prev.flashSaleSettings, maxDiscount: parseInt(e.target.value) }
                            }))
                          }
                          placeholder="50"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="min-discount">Minimum Discount (%)</Label>
                        <Input
                          id="min-discount"
                          type="number"
                          min="0"
                          max="100"
                          value={pageContent.flashSaleSettings.minDiscount}
                          onChange={(e) => 
                            setPageContent(prev => ({
                              ...prev,
                              flashSaleSettings: { ...prev.flashSaleSettings, minDiscount: parseInt(e.target.value) }
                            }))
                          }
                          placeholder="10"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trading Settings */}
            <TabsContent value="trading">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Trading Settings
                  </CardTitle>
                  <CardDescription>
                    Configure general trading features and options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="allow-instant-buy">Allow Instant Buy</Label>
                        <Switch
                          id="allow-instant-buy"
                          checked={pageContent.tradingSettings.allowInstantBuy}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              tradingSettings: { ...prev.tradingSettings, allowInstantBuy: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="allow-offers">Allow Offers</Label>
                        <Switch
                          id="allow-offers"
                          checked={pageContent.tradingSettings.allowOffers}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              tradingSettings: { ...prev.tradingSettings, allowOffers: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="require-kyc">Require KYC</Label>
                        <Switch
                          id="require-kyc"
                          checked={pageContent.tradingSettings.requireKYC}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              tradingSettings: { ...prev.tradingSettings, requireKYC: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-price-history">Show Price History</Label>
                        <Switch
                          id="show-price-history"
                          checked={pageContent.tradingSettings.showPriceHistory}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              tradingSettings: { ...prev.tradingSettings, showPriceHistory: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-volume">Show Volume</Label>
                        <Switch
                          id="show-volume"
                          checked={pageContent.tradingSettings.showVolume}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              tradingSettings: { ...prev.tradingSettings, showVolume: checked }
                            }))
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="offer-expiry">Offer Expiry (days)</Label>
                        <Input
                          id="offer-expiry"
                          type="number"
                          value={pageContent.tradingSettings.offerExpiry}
                          onChange={(e) => 
                            setPageContent(prev => ({
                              ...prev,
                              tradingSettings: { ...prev.tradingSettings, offerExpiry: parseInt(e.target.value) }
                            }))
                          }
                          placeholder="7"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Layout Settings */}
            <TabsContent value="layout">
              <Card>
                <CardHeader>
                  <CardTitle>Layout Settings</CardTitle>
                  <CardDescription>
                    Configure how trading items are displayed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="layout-type">Layout Type</Label>
                    <Select
                      value={pageContent.layout}
                      onValueChange={(value: 'grid' | 'list' | 'timeline') => 
                        setPageContent(prev => ({ ...prev, layout: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">Grid Layout</SelectItem>
                        <SelectItem value="list">List Layout</SelectItem>
                        <SelectItem value="timeline">Timeline Layout</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className={`cursor-pointer transition-all ${pageContent.layout === 'grid' ? 'ring-2 ring-blue-500' : ''}`}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-2 h-20">
                          <div className="bg-gray-200 rounded"></div>
                          <div className="bg-gray-200 rounded"></div>
                          <div className="bg-gray-200 rounded"></div>
                          <div className="bg-gray-200 rounded"></div>
                        </div>
                        <p className="text-sm font-medium mt-2">Grid Layout</p>
                      </CardContent>
                    </Card>
                    
                    <Card className={`cursor-pointer transition-all ${pageContent.layout === 'list' ? 'ring-2 ring-blue-500' : ''}`}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="bg-gray-200 rounded h-4"></div>
                          <div className="bg-gray-200 rounded h-4"></div>
                          <div className="bg-gray-200 rounded h-4"></div>
                        </div>
                        <p className="text-sm font-medium mt-2">List Layout</p>
                      </CardContent>
                    </Card>
                    
                    <Card className={`cursor-pointer transition-all ${pageContent.layout === 'timeline' ? 'ring-2 ring-blue-500' : ''}`}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <div className="bg-gray-200 rounded h-3 flex-1"></div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <div className="bg-gray-200 rounded h-3 flex-1"></div>
                          </div>
                        </div>
                        <p className="text-sm font-medium mt-2">Timeline Layout</p>
                      </CardContent>
                    </Card>
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
                    Customize the appearance of your trade page
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
