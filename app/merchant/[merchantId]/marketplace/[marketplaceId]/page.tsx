"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Store, 
  Mint, 
  ArrowRightLeft, 
  BarChart3, 
  Calendar,
  Zap,
  Gavel,
  TrendingUp,
  Users,
  DollarSign,
  Loader2,
  ExternalLink
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface Marketplace {
  id: string
  businessName: string
  description: string
  category: string
  primaryColor: string
  secondaryColor: string
  template: string
  isActive: boolean
  merchant: {
    id: string
    businessName: string
    email: string
    category: string
  }
  configuration?: {
    mintingConfig: any
    tradingConfig: any
    swapConfig: any
    nftConfig: any
    addressConfig: any
  }
}

interface MarketplacePage {
  id: string
  type: string
  title: string
  description?: string
  content: any
  isActive: boolean
  order: number
  slug: string
}

export default function MarketplacePage({
  params
}: {
  params: { merchantId: string; marketplaceId: string }
}) {
  const [marketplace, setMarketplace] = useState<Marketplace | null>(null)
  const [pages, setPages] = useState<MarketplacePage[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  
  const { toast } = useToast()

  useEffect(() => {
    fetchMarketplaceData()
  }, [params.marketplaceId])

  const fetchMarketplaceData = async () => {
    try {
      const [marketplaceRes, pagesRes] = await Promise.all([
        fetch(`/api/marketplaces/${params.marketplaceId}`),
        fetch(`/api/marketplaces/${params.marketplaceId}/pages`)
      ])

      if (marketplaceRes.ok) {
        const marketplaceData = await marketplaceRes.json()
        setMarketplace(marketplaceData.marketplace)
      }

      if (pagesRes.ok) {
        const pagesData = await pagesRes.json()
        setPages(pagesData.pages || [])
      }
    } catch (error) {
      console.error("Error fetching marketplace data:", error)
      toast({
        title: "Error",
        description: "Failed to load marketplace",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (!marketplace) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Marketplace Not Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The marketplace you're looking for doesn't exist or is not available.
              </p>
              <Button asChild>
                <Link href="/marketplace">
                  Browse All Marketplaces
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getPageByType = (type: string) => {
    return pages.find(page => page.type === type && page.isActive)
  }

  const renderPageContent = (page: MarketplacePage) => {
    switch (page.type) {
      case "mint":
        return <MintPageContent page={page} marketplace={marketplace} />
      case "trade":
        return <TradePageContent page={page} marketplace={marketplace} />
      case "swap":
        return <SwapPageContent page={page} marketplace={marketplace} />
      case "analytics":
        return <AnalyticsPageContent page={page} marketplace={marketplace} />
      case "events":
        return <EventsPageContent page={page} marketplace={marketplace} />
      default:
        return <CustomPageContent page={page} marketplace={marketplace} />
    }
  }

  return (
    <div 
      className="min-h-screen"
      style={{
        '--primary-color': marketplace.primaryColor,
        '--secondary-color': marketplace.secondaryColor,
      } as React.CSSProperties}
    >
      {/* Header */}
      <header 
        className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
        style={{ backgroundColor: marketplace.primaryColor + '10' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: marketplace.primaryColor }}
              >
                {marketplace.businessName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {marketplace.businessName}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  by {marketplace.merchant.businessName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="capitalize">
                {marketplace.category}
              </Badge>
              <Button variant="outline" size="sm" asChild>
                <Link href="/marketplace">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Browse All
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {getPageByType("mint") && (
              <TabsTrigger value="mint">
                <Mint className="w-4 h-4 mr-2" />
                Mint
              </TabsTrigger>
            )}
            {getPageByType("trade") && (
              <TabsTrigger value="trade">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trade
              </TabsTrigger>
            )}
            {getPageByType("swap") && (
              <TabsTrigger value="swap">
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Swap
              </TabsTrigger>
            )}
            {getPageByType("analytics") && (
              <TabsTrigger value="analytics">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            )}
            {getPageByType("events") && (
              <TabsTrigger value="events">
                <Calendar className="w-4 h-4 mr-2" />
                Events
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>About {marketplace.businessName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">
                      {marketplace.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <Mint className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-2xl font-bold">0</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">NFTs Minted</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-2xl font-bold">0</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="text-2xl font-bold">0</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total Volume</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-2xl font-bold">0</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Trades</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Merchant Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium">{marketplace.merchant.businessName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {marketplace.merchant.category}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Contact</p>
                        <p className="font-medium">{marketplace.merchant.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Dynamic Page Tabs */}
          {pages.map((page) => (
            <TabsContent key={page.id} value={page.type} className="mt-6">
              {renderPageContent(page)}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

// Page Content Components
function MintPageContent({ page, marketplace }: { page: MarketplacePage; marketplace: Marketplace }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mint className="w-5 h-5 mr-2" />
          {page.title}
        </CardTitle>
        {page.description && (
          <CardDescription>{page.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Mint className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Mint Page Coming Soon
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            This page is being configured by the merchant.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function TradePageContent({ page, marketplace }: { page: MarketplacePage; marketplace: Marketplace }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          {page.title}
        </CardTitle>
        {page.description && (
          <CardDescription>{page.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Trade Page Coming Soon
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            This page is being configured by the merchant.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function SwapPageContent({ page, marketplace }: { page: MarketplacePage; marketplace: Marketplace }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ArrowRightLeft className="w-5 h-5 mr-2" />
          {page.title}
        </CardTitle>
        {page.description && (
          <CardDescription>{page.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <ArrowRightLeft className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Swap Page Coming Soon
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            This page is being configured by the merchant.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function AnalyticsPageContent({ page, marketplace }: { page: MarketplacePage; marketplace: Marketplace }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          {page.title}
        </CardTitle>
        {page.description && (
          <CardDescription>{page.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Analytics Page Coming Soon
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            This page is being configured by the merchant.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function EventsPageContent({ page, marketplace }: { page: MarketplacePage; marketplace: Marketplace }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          {page.title}
        </CardTitle>
        {page.description && (
          <CardDescription>{page.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Events Page Coming Soon
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            This page is being configured by the merchant.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function CustomPageContent({ page, marketplace }: { page: MarketplacePage; marketplace: Marketplace }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{page.title}</CardTitle>
        {page.description && (
          <CardDescription>{page.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Custom Page
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            This page is being configured by the merchant.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
