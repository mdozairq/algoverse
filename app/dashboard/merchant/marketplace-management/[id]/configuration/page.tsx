"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  Coins, 
  TrendingUp, 
  ArrowRightLeft, 
  Shield, 
  MapPin,
  Loader2,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import AuthGuard from "@/components/auth-guard"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-context"
import Link from "next/link"

interface MarketplaceConfiguration {
  mintingConfig: {
    enabled: boolean
    autoApprove: boolean
    requireKYC: boolean
    maxSupply: number
    defaultPrice: number
    currency: 'ALGO' | 'USDC'
  }
  tradingConfig: {
    auctionEnabled: boolean
    flashSaleEnabled: boolean
    auctionDuration: number
    flashSaleDuration: number
    minBidIncrement: number
    reservePrice: boolean
  }
  swapConfig: {
    enabled: boolean
    allowPartialSwaps: boolean
    requireApproval: boolean
    maxSwapValue: number
  }
  nftConfig: {
    transferable: boolean
    burnable: boolean
    pausable: boolean
    royaltyPercentage: number
  }
  addressConfig: {
    managerAddress: string
    reserveAddress: string
    freezeAddress: string
    clawbackAddress: string
  }
}

export default function MarketplaceConfigurationPage({
  params
}: {
  params: { id: string }
}) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [configuration, setConfiguration] = useState<MarketplaceConfiguration>({
    mintingConfig: {
      enabled: true,
      autoApprove: false,
      requireKYC: false,
      maxSupply: 1000,
      defaultPrice: 1,
      currency: 'ALGO'
    },
    tradingConfig: {
      auctionEnabled: true,
      flashSaleEnabled: true,
      auctionDuration: 24,
      flashSaleDuration: 1,
      minBidIncrement: 0.1,
      reservePrice: true
    },
    swapConfig: {
      enabled: true,
      allowPartialSwaps: false,
      requireApproval: true,
      maxSwapValue: 1000
    },
    nftConfig: {
      transferable: true,
      burnable: true,
      pausable: true,
      royaltyPercentage: 2.5
    },
    addressConfig: {
      managerAddress: '',
      reserveAddress: '',
      freezeAddress: '',
      clawbackAddress: ''
    }
  })
  
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    fetchConfiguration()
  }, [params.id])

  const fetchConfiguration = async () => {
    try {
      const response = await fetch(`/api/marketplaces/${params.id}/configuration`)
      if (response.ok) {
        const data = await response.json()
        setConfiguration(data.configuration)
      }
    } catch (error) {
      console.error("Error fetching configuration:", error)
      toast({
        title: "Error",
        description: "Failed to load configuration",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveConfiguration = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/marketplaces/${params.id}/configuration`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configuration),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Configuration saved successfully!",
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to save configuration")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save configuration",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const updateConfiguration = (section: keyof MarketplaceConfiguration, updates: any) => {
    setConfiguration(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }))
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Marketplace Configuration</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Configure your marketplace settings and features
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchConfiguration}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={handleSaveConfiguration} disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Configuration
              </Button>
            </div>
          </div>

          <Tabs defaultValue="minting" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="minting">
                <Coins className="w-4 h-4 mr-2" />
                Coinsing
              </TabsTrigger>
              <TabsTrigger value="trading">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trading
              </TabsTrigger>
              <TabsTrigger value="swapping">
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Swapping
              </TabsTrigger>
              <TabsTrigger value="nft">
                <Shield className="w-4 h-4 mr-2" />
                NFT Settings
              </TabsTrigger>
              <TabsTrigger value="addresses">
                <MapPin className="w-4 h-4 mr-2" />
                Addresses
              </TabsTrigger>
            </TabsList>

            {/* Coinsing Configuration */}
            <TabsContent value="minting">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Coins className="w-5 h-5 mr-2" />
                    Coinsing Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure how NFTs are minted in your marketplace
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="minting-enabled">Enable Coinsing</Label>
                        <Switch
                          id="minting-enabled"
                          checked={configuration.mintingConfig.enabled}
                          onCheckedChange={(checked) => 
                            updateConfiguration('mintingConfig', { enabled: checked })
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-approve">Auto Approve Coinss</Label>
                        <Switch
                          id="auto-approve"
                          checked={configuration.mintingConfig.autoApprove}
                          onCheckedChange={(checked) => 
                            updateConfiguration('mintingConfig', { autoApprove: checked })
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="require-kyc">Require KYC</Label>
                        <Switch
                          id="require-kyc"
                          checked={configuration.mintingConfig.requireKYC}
                          onCheckedChange={(checked) => 
                            updateConfiguration('mintingConfig', { requireKYC: checked })
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="max-supply">Maximum Supply</Label>
                        <Input
                          id="max-supply"
                          type="number"
                          value={configuration.mintingConfig.maxSupply}
                          onChange={(e) => 
                            updateConfiguration('mintingConfig', { maxSupply: parseInt(e.target.value) })
                          }
                          placeholder="1000"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="default-price">Default Price</Label>
                        <Input
                          id="default-price"
                          type="number"
                          step="0.01"
                          value={configuration.mintingConfig.defaultPrice}
                          onChange={(e) => 
                            updateConfiguration('mintingConfig', { defaultPrice: parseFloat(e.target.value) })
                          }
                          placeholder="1.0"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="currency">Default Currency</Label>
                        <Select
                          value={configuration.mintingConfig.currency}
                          onValueChange={(value: 'ALGO' | 'USDC') => 
                            updateConfiguration('mintingConfig', { currency: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALGO">ALGO</SelectItem>
                            <SelectItem value="USDC">USDC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trading Configuration */}
            <TabsContent value="trading">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Trading Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure auction and flash sale settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auction-enabled">Enable Auctions</Label>
                        <Switch
                          id="auction-enabled"
                          checked={configuration.tradingConfig.auctionEnabled}
                          onCheckedChange={(checked) => 
                            updateConfiguration('tradingConfig', { auctionEnabled: checked })
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="flash-sale-enabled">Enable Flash Sales</Label>
                        <Switch
                          id="flash-sale-enabled"
                          checked={configuration.tradingConfig.flashSaleEnabled}
                          onCheckedChange={(checked) => 
                            updateConfiguration('tradingConfig', { flashSaleEnabled: checked })
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="reserve-price">Enable Reserve Price</Label>
                        <Switch
                          id="reserve-price"
                          checked={configuration.tradingConfig.reservePrice}
                          onCheckedChange={(checked) => 
                            updateConfiguration('tradingConfig', { reservePrice: checked })
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="auction-duration">Auction Duration (hours)</Label>
                        <Input
                          id="auction-duration"
                          type="number"
                          value={configuration.tradingConfig.auctionDuration}
                          onChange={(e) => 
                            updateConfiguration('tradingConfig', { auctionDuration: parseInt(e.target.value) })
                          }
                          placeholder="24"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="flash-sale-duration">Flash Sale Duration (hours)</Label>
                        <Input
                          id="flash-sale-duration"
                          type="number"
                          step="0.1"
                          value={configuration.tradingConfig.flashSaleDuration}
                          onChange={(e) => 
                            updateConfiguration('tradingConfig', { flashSaleDuration: parseFloat(e.target.value) })
                          }
                          placeholder="1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="min-bid-increment">Minimum Bid Increment</Label>
                        <Input
                          id="min-bid-increment"
                          type="number"
                          step="0.01"
                          value={configuration.tradingConfig.minBidIncrement}
                          onChange={(e) => 
                            updateConfiguration('tradingConfig', { minBidIncrement: parseFloat(e.target.value) })
                          }
                          placeholder="0.1"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Swap Configuration */}
            <TabsContent value="swapping">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ArrowRightLeft className="w-5 h-5 mr-2" />
                    Swap Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure NFT-to-NFT atomic swap settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="swap-enabled">Enable Swapping</Label>
                        <Switch
                          id="swap-enabled"
                          checked={configuration.swapConfig.enabled}
                          onCheckedChange={(checked) => 
                            updateConfiguration('swapConfig', { enabled: checked })
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="partial-swaps">Allow Partial Swaps</Label>
                        <Switch
                          id="partial-swaps"
                          checked={configuration.swapConfig.allowPartialSwaps}
                          onCheckedChange={(checked) => 
                            updateConfiguration('swapConfig', { allowPartialSwaps: checked })
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="require-approval">Require Approval</Label>
                        <Switch
                          id="require-approval"
                          checked={configuration.swapConfig.requireApproval}
                          onCheckedChange={(checked) => 
                            updateConfiguration('swapConfig', { requireApproval: checked })
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
                          value={configuration.swapConfig.maxSwapValue}
                          onChange={(e) => 
                            updateConfiguration('swapConfig', { maxSwapValue: parseInt(e.target.value) })
                          }
                          placeholder="1000"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* NFT Configuration */}
            <TabsContent value="nft">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    NFT Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure NFT properties and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="transferable">Transferable</Label>
                        <Switch
                          id="transferable"
                          checked={configuration.nftConfig.transferable}
                          onCheckedChange={(checked) => 
                            updateConfiguration('nftConfig', { transferable: checked })
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="burnable">Burnable</Label>
                        <Switch
                          id="burnable"
                          checked={configuration.nftConfig.burnable}
                          onCheckedChange={(checked) => 
                            updateConfiguration('nftConfig', { burnable: checked })
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="pausable">Pausable</Label>
                        <Switch
                          id="pausable"
                          checked={configuration.nftConfig.pausable}
                          onCheckedChange={(checked) => 
                            updateConfiguration('nftConfig', { pausable: checked })
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="royalty-percentage">Royalty Percentage (%)</Label>
                        <Input
                          id="royalty-percentage"
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={configuration.nftConfig.royaltyPercentage}
                          onChange={(e) => 
                            updateConfiguration('nftConfig', { royaltyPercentage: parseFloat(e.target.value) })
                          }
                          placeholder="2.5"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Address Configuration */}
            <TabsContent value="addresses">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Address Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure Algorand addresses for NFT management
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="manager-address">Manager Address</Label>
                        <Input
                          id="manager-address"
                          value={configuration.addressConfig.managerAddress}
                          onChange={(e) => 
                            updateConfiguration('addressConfig', { managerAddress: e.target.value })
                          }
                          placeholder="Enter Algorand address"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Address that can update asset parameters
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="reserve-address">Reserve Address</Label>
                        <Input
                          id="reserve-address"
                          value={configuration.addressConfig.reserveAddress}
                          onChange={(e) => 
                            updateConfiguration('addressConfig', { reserveAddress: e.target.value })
                          }
                          placeholder="Enter Algorand address"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Address that holds non-minted assets
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="freeze-address">Freeze Address</Label>
                        <Input
                          id="freeze-address"
                          value={configuration.addressConfig.freezeAddress}
                          onChange={(e) => 
                            updateConfiguration('addressConfig', { freezeAddress: e.target.value })
                          }
                          placeholder="Enter Algorand address"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Address that can freeze/unfreeze assets
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="clawback-address">Clawback Address</Label>
                        <Input
                          id="clawback-address"
                          value={configuration.addressConfig.clawbackAddress}
                          onChange={(e) => 
                            updateConfiguration('addressConfig', { clawbackAddress: e.target.value })
                          }
                          placeholder="Enter Algorand address"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Address that can clawback assets
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Address Configuration Tips
                        </h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                          <li>• Manager address can update asset parameters</li>
                          <li>• Reserve address holds unminted assets</li>
                          <li>• Freeze address can freeze/unfreeze asset holdings</li>
                          <li>• Clawback address can reclaim assets from users</li>
                          <li>• All addresses should be valid Algorand addresses</li>
                        </ul>
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
