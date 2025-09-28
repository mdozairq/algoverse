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
  ArrowRightLeft, 
  Settings, 
  Save, 
  Loader2,
  RefreshCw,
  Shield,
  Clock,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import AuthGuard from "@/components/auth-guard"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-context"

interface SwapPageContent {
  title: string
  description: string
  featuredImage?: string
  layout: 'grid' | 'list' | 'split'
  showFeatured: boolean
  showCategories: boolean
  showFilters: boolean
  itemsPerPage: number
  swapSettings: {
    enabled: boolean
    allowPartialSwaps: boolean
    requireApproval: boolean
    maxSwapValue: number
    minSwapValue: number
    autoMatch: boolean
    showSwapHistory: boolean
    allowMultiAsset: boolean
    maxAssetsPerSwap: number
  }
  securitySettings: {
    requireKYC: boolean
    requireWalletVerification: boolean
    escrowEnabled: boolean
    escrowDuration: number
    allowCancelBeforeConfirm: boolean
    requireBothSignatures: boolean
  }
  matchingSettings: {
    algorithm: 'price' | 'rarity' | 'category' | 'manual'
    priceTolerance: number
    rarityWeight: number
    categoryWeight: number
    showSuggestions: boolean
    maxSuggestions: number
  }
  notificationSettings: {
    emailNotifications: boolean
    pushNotifications: boolean
    swapStatusUpdates: boolean
    priceAlerts: boolean
    matchNotifications: boolean
  }
  styling: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    fontFamily: string
    borderRadius: string
  }
}

export default function SwapPageManagement({
  params
}: {
  params: { id: string }
}) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pageContent, setPageContent] = useState<SwapPageContent>({
    title: "Swap NFTs",
    description: "Trade NFTs with other users through atomic swaps",
    layout: 'split',
    showFeatured: true,
    showCategories: true,
    showFilters: true,
    itemsPerPage: 12,
    swapSettings: {
      enabled: true,
      allowPartialSwaps: false,
      requireApproval: true,
      maxSwapValue: 1000,
      minSwapValue: 1,
      autoMatch: true,
      showSwapHistory: true,
      allowMultiAsset: true,
      maxAssetsPerSwap: 5
    },
    securitySettings: {
      requireKYC: false,
      requireWalletVerification: true,
      escrowEnabled: true,
      escrowDuration: 24,
      allowCancelBeforeConfirm: true,
      requireBothSignatures: true
    },
    matchingSettings: {
      algorithm: 'price',
      priceTolerance: 10,
      rarityWeight: 0.3,
      categoryWeight: 0.2,
      showSuggestions: true,
      maxSuggestions: 5
    },
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      swapStatusUpdates: true,
      priceAlerts: false,
      matchNotifications: true
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
    fetchSwapPage()
  }, [params.id])

  const fetchSwapPage = async () => {
    try {
      const response = await fetch(`/api/marketplaces/${params.id}/pages?type=swap`)
      if (response.ok) {
        const data = await response.json()
        if (data.pages && data.pages.length > 0) {
          setPageContent(data.pages[0].content)
        }
      }
    } catch (error) {
      console.error("Error fetching swap page:", error)
      toast({
        title: "Error",
        description: "Failed to load swap page configuration",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSwapPage = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/marketplaces/${params.id}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: 'swap',
          title: pageContent.title,
          description: pageContent.description,
          content: pageContent,
          isActive: true,
          order: 3,
          slug: 'swap'
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Swap page configuration saved successfully!",
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to save swap page")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save swap page",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
    <AuthGuard>
      <DashboardLayout role="merchant">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      </DashboardLayout>
    </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout role="merchant">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Swap Page Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Configure NFT-to-NFT atomic swap features
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSwapPage}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={handleSaveSwapPage} disabled={saving}>
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
              <TabsTrigger value="swapping">
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Swapping
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="matching">
                <Users className="w-4 h-4 mr-2" />
                Matching
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Settings className="w-4 h-4 mr-2" />
                Notifications
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
                          placeholder="Swap NFTs"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="page-description">Page Description</Label>
                        <Textarea
                          id="page-description"
                          value={pageContent.description}
                          onChange={(e) => setPageContent(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Trade NFTs with other users through atomic swaps"
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

            {/* Swap Settings */}
            <TabsContent value="swapping">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ArrowRightLeft className="w-5 h-5 mr-2" />
                    Swap Settings
                  </CardTitle>
                  <CardDescription>
                    Configure swap behavior and limitations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="swap-enabled">Enable Swapping</Label>
                        <Switch
                          id="swap-enabled"
                          checked={pageContent.swapSettings.enabled}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              swapSettings: { ...prev.swapSettings, enabled: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="allow-partial-swaps">Allow Partial Swaps</Label>
                        <Switch
                          id="allow-partial-swaps"
                          checked={pageContent.swapSettings.allowPartialSwaps}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              swapSettings: { ...prev.swapSettings, allowPartialSwaps: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="require-approval">Require Approval</Label>
                        <Switch
                          id="require-approval"
                          checked={pageContent.swapSettings.requireApproval}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              swapSettings: { ...prev.swapSettings, requireApproval: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-match">Auto Match Swaps</Label>
                        <Switch
                          id="auto-match"
                          checked={pageContent.swapSettings.autoMatch}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              swapSettings: { ...prev.swapSettings, autoMatch: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-swap-history">Show Swap History</Label>
                        <Switch
                          id="show-swap-history"
                          checked={pageContent.swapSettings.showSwapHistory}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              swapSettings: { ...prev.swapSettings, showSwapHistory: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="allow-multi-asset">Allow Multi-Asset Swaps</Label>
                        <Switch
                          id="allow-multi-asset"
                          checked={pageContent.swapSettings.allowMultiAsset}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              swapSettings: { ...prev.swapSettings, allowMultiAsset: checked }
                            }))
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="max-swap-value">Maximum Swap Value (ALGO)</Label>
                        <Input
                          id="max-swap-value"
                          type="number"
                          value={pageContent.swapSettings.maxSwapValue}
                          onChange={(e) => 
                            setPageContent(prev => ({
                              ...prev,
                              swapSettings: { ...prev.swapSettings, maxSwapValue: parseInt(e.target.value) }
                            }))
                          }
                          placeholder="1000"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="min-swap-value">Minimum Swap Value (ALGO)</Label>
                        <Input
                          id="min-swap-value"
                          type="number"
                          value={pageContent.swapSettings.minSwapValue}
                          onChange={(e) => 
                            setPageContent(prev => ({
                              ...prev,
                              swapSettings: { ...prev.swapSettings, minSwapValue: parseInt(e.target.value) }
                            }))
                          }
                          placeholder="1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="max-assets-per-swap">Maximum Assets Per Swap</Label>
                        <Input
                          id="max-assets-per-swap"
                          type="number"
                          value={pageContent.swapSettings.maxAssetsPerSwap}
                          onChange={(e) => 
                            setPageContent(prev => ({
                              ...prev,
                              swapSettings: { ...prev.swapSettings, maxAssetsPerSwap: parseInt(e.target.value) }
                            }))
                          }
                          placeholder="5"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Configure security measures for swap transactions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="require-kyc">Require KYC</Label>
                        <Switch
                          id="require-kyc"
                          checked={pageContent.securitySettings.requireKYC}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              securitySettings: { ...prev.securitySettings, requireKYC: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="require-wallet-verification">Require Wallet Verification</Label>
                        <Switch
                          id="require-wallet-verification"
                          checked={pageContent.securitySettings.requireWalletVerification}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              securitySettings: { ...prev.securitySettings, requireWalletVerification: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="escrow-enabled">Enable Escrow</Label>
                        <Switch
                          id="escrow-enabled"
                          checked={pageContent.securitySettings.escrowEnabled}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              securitySettings: { ...prev.securitySettings, escrowEnabled: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="allow-cancel-before-confirm">Allow Cancel Before Confirm</Label>
                        <Switch
                          id="allow-cancel-before-confirm"
                          checked={pageContent.securitySettings.allowCancelBeforeConfirm}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              securitySettings: { ...prev.securitySettings, allowCancelBeforeConfirm: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="require-both-signatures">Require Both Signatures</Label>
                        <Switch
                          id="require-both-signatures"
                          checked={pageContent.securitySettings.requireBothSignatures}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              securitySettings: { ...prev.securitySettings, requireBothSignatures: checked }
                            }))
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="escrow-duration">Escrow Duration (hours)</Label>
                        <Input
                          id="escrow-duration"
                          type="number"
                          value={pageContent.securitySettings.escrowDuration}
                          onChange={(e) => 
                            setPageContent(prev => ({
                              ...prev,
                              securitySettings: { ...prev.securitySettings, escrowDuration: parseInt(e.target.value) }
                            }))
                          }
                          placeholder="24"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                          Security Recommendations
                        </h4>
                        <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                          <li>• Enable escrow for high-value swaps</li>
                          <li>• Require wallet verification for all users</li>
                          <li>• Use both signatures for maximum security</li>
                          <li>• Set appropriate escrow duration based on asset value</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Matching Settings */}
            <TabsContent value="matching">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Matching Settings
                  </CardTitle>
                  <CardDescription>
                    Configure how swap matches are found and suggested
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="matching-algorithm">Matching Algorithm</Label>
                        <Select
                          value={pageContent.matchingSettings.algorithm}
                          onValueChange={(value: 'price' | 'rarity' | 'category' | 'manual') => 
                            setPageContent(prev => ({
                              ...prev,
                              matchingSettings: { ...prev.matchingSettings, algorithm: value }
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="price">Price-based</SelectItem>
                            <SelectItem value="rarity">Rarity-based</SelectItem>
                            <SelectItem value="category">Category-based</SelectItem>
                            <SelectItem value="manual">Manual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-suggestions">Show Suggestions</Label>
                        <Switch
                          id="show-suggestions"
                          checked={pageContent.matchingSettings.showSuggestions}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              matchingSettings: { ...prev.matchingSettings, showSuggestions: checked }
                            }))
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="price-tolerance">Price Tolerance (%)</Label>
                        <Input
                          id="price-tolerance"
                          type="number"
                          min="0"
                          max="100"
                          value={pageContent.matchingSettings.priceTolerance}
                          onChange={(e) => 
                            setPageContent(prev => ({
                              ...prev,
                              matchingSettings: { ...prev.matchingSettings, priceTolerance: parseInt(e.target.value) }
                            }))
                          }
                          placeholder="10"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="rarity-weight">Rarity Weight (0-1)</Label>
                        <Input
                          id="rarity-weight"
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          value={pageContent.matchingSettings.rarityWeight}
                          onChange={(e) => 
                            setPageContent(prev => ({
                              ...prev,
                              matchingSettings: { ...prev.matchingSettings, rarityWeight: parseFloat(e.target.value) }
                            }))
                          }
                          placeholder="0.3"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="category-weight">Category Weight (0-1)</Label>
                        <Input
                          id="category-weight"
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          value={pageContent.matchingSettings.categoryWeight}
                          onChange={(e) => 
                            setPageContent(prev => ({
                              ...prev,
                              matchingSettings: { ...prev.matchingSettings, categoryWeight: parseFloat(e.target.value) }
                            }))
                          }
                          placeholder="0.2"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="max-suggestions">Maximum Suggestions</Label>
                        <Input
                          id="max-suggestions"
                          type="number"
                          value={pageContent.matchingSettings.maxSuggestions}
                          onChange={(e) => 
                            setPageContent(prev => ({
                              ...prev,
                              matchingSettings: { ...prev.matchingSettings, maxSuggestions: parseInt(e.target.value) }
                            }))
                          }
                          placeholder="5"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Configure how users are notified about swap activities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <Switch
                          id="email-notifications"
                          checked={pageContent.notificationSettings.emailNotifications}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              notificationSettings: { ...prev.notificationSettings, emailNotifications: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-notifications">Push Notifications</Label>
                        <Switch
                          id="push-notifications"
                          checked={pageContent.notificationSettings.pushNotifications}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              notificationSettings: { ...prev.notificationSettings, pushNotifications: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="swap-status-updates">Swap Status Updates</Label>
                        <Switch
                          id="swap-status-updates"
                          checked={pageContent.notificationSettings.swapStatusUpdates}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              notificationSettings: { ...prev.notificationSettings, swapStatusUpdates: checked }
                            }))
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="price-alerts">Price Alerts</Label>
                        <Switch
                          id="price-alerts"
                          checked={pageContent.notificationSettings.priceAlerts}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              notificationSettings: { ...prev.notificationSettings, priceAlerts: checked }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="match-notifications">Match Notifications</Label>
                        <Switch
                          id="match-notifications"
                          checked={pageContent.notificationSettings.matchNotifications}
                          onCheckedChange={(checked) => 
                            setPageContent(prev => ({
                              ...prev,
                              notificationSettings: { ...prev.notificationSettings, matchNotifications: checked }
                            }))
                          }
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
                    Customize the appearance of your swap page
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
