"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { 
  ArrowLeft, 
  ExternalLink, 
  Store, 
  Calendar, 
  MapPin, 
  Globe, 
  Wallet,
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  Share2,
  Star,
  Users,
  Activity,
  DollarSign,
  BarChart3,
  LineChart,
  PieChart,
  Target,
  Zap,
  Award,
  Clock,
  ShoppingCart,
  Filter,
  Search,
  Grid3X3,
  List,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Bell,
  User,
  LogOut,
  Home,
  Package,
  HelpCircle,
  Info,
  AlertCircle,
  Unlock,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Sun,
  Moon,
  Palette,
  Layout,
  Layers,
  Box,
  Tag,
  Percent,
  CreditCard,
  Banknote,
  Coins,
  MousePointer,
  Hand,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Edit,
  Trash2,
  Save,
  Upload,
  Send,
  Paperclip,
  Image as ImageIcon,
  Video,
  FileText,
  File,
  Folder,
  Archive,
  Database,
  Server,
  Cloud,
  CloudOff,
  Wrench,
  Hammer,
  Cog,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Power,
  PowerOff,
  PlayCircle,
  PauseCircle,
  StopCircle,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume1,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Headphones,
  Speaker,
  Radio,
  Tv,
  Gamepad2,
  Joystick,
  Keyboard,
  Mouse,
  Printer,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Voicemail,
  MessageSquare,
  MessageSquareText,
  MessageSquareReply,
  MessageSquareMore,
  MessageSquareX,
  MessageSquareWarning,
  MessageSquarePlus,
  MessageSquareShare,
  MessageSquareHeart,
  MessageSquareLock,
  QrCode,
  Copy,
  Check
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/page-transition"
import Header from "@/components/header"
import Footer from "@/components/footer"

interface Marketplace {
  id: string
  merchantId: string
  businessName: string
  description: string
  category: string
  website?: string
  logo?: string
  banner?: string | string[] // Support both single banner and banner array
  template: string
  primaryColor: string
  secondaryColor: string
  paymentMethod: string
  walletAddress: string
  status: "draft" | "pending" | "approved" | "rejected"
  isEnabled: boolean
  allowSwap: boolean
  createdAt: Date
  updatedAt?: Date
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  image: string
  category: string
  inStock: boolean
  rating: number
  reviews: number
  type: "nft" | "event" | "merchandise"
  isEnabled: boolean
  allowSwap: boolean
  nftData?: {
    assetId: number
    totalSupply: number
    availableSupply: number
    royaltyPercentage: number
    traits?: {
      trait_type: string
      value: string
      rarity: number
    }[]
    rarityScore?: number
    rarityRank?: number
  }
  floorPrice?: number
  volume?: number
  sales?: number
  listed?: number
  floorChange?: number
  topOffer?: number
  lastSale?: {
    price: number
    currency: string
    date: string
  }
}

interface Collection {
  id: string
  name: string
  description: string
  price: number
  currency: string
  image: string
  category: string
  inStock: boolean
  rating: number
  reviews: number
  type: "nft" | "event" | "merchandise"
  isEnabled: boolean
  allowSwap: boolean
  nftCount: number // Minimum 1 NFT required
  mintPrice?: number
  floorPrice?: number
  topOffer?: number
  volume?: number
  sales?: number
  listed?: number
  floorChange?: number
  nftData?: {
    assetId: number
    totalSupply: number
    availableSupply: number
    royaltyPercentage: number
    traits?: {
      trait_type: string
      value: string
      rarity: number
    }[]
    rarityScore?: number
    rarityRank?: number
  }
  eventData?: {
    date: string
    location: string
    totalSupply: number
    availableSupply: number
    nftAssetId?: number
  }
  lastSale?: {
    price: number
    currency: string
    date: string
  }
}

interface Analytics {
  totalProducts: number
  totalVolume: number
  totalSales: number
  averagePrice: number
  floorPrice: number
  topOffer: number
  listedPercentage: number
  uniqueHolders: number
  priceChange24h: number
  volumeChange24h: number
}

export default function MarketplaceDetailPage({ params }: { params: { id: string } }) {
  const [marketplace, setMarketplace] = useState<Marketplace | null>(null)
  const [collections, setCollections] = useState<Collection[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("top")
  const [timeFilter, setTimeFilter] = useState("1d")
  const [currency, setCurrency] = useState("USD")
  const [badged, setBadged] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("volume")
  const [showQRModal, setShowQRModal] = useState(false)
  const [copied, setCopied] = useState(false)

  // Helper function to get banner URL
  const getBannerUrl = (banner: string | string[] | undefined): string | null => {
    if (!banner) return null
    if (typeof banner === 'string') return banner
    if (Array.isArray(banner) && banner.length > 0) return banner[0]
    return null
  }

  const fetchMarketplaceData = async () => {
    setLoading(true)
    try {
      // Fetch marketplace details
      const marketplaceRes = await fetch(`/api/marketplaces/${params.id}`)
      const marketplaceData = await marketplaceRes.json()
      
      if (marketplaceRes.ok) {
        setMarketplace(marketplaceData.marketplace)
        
        // Fetch collections
        const collectionsRes = await fetch(`/api/marketplaces/${params.id}/collections`)
        const collectionsData = await collectionsRes.json()
        
        if (collectionsRes.ok) {
          setCollections(collectionsData.collections.filter((collection: Collection) => collection.isEnabled) || [])
          
          // Calculate analytics
          const analyticsData = calculateAnalytics(collectionsData.collections || [])
          setAnalytics(analyticsData)
        }
      }
    } catch (error) {
      console.error("Failed to fetch marketplace data:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAnalytics = (collections: Collection[]): Analytics => {
    const totalCollections = collections.length
    const totalVolume = collections.reduce((sum, collection) => sum + (collection.volume || 0), 0)
    const totalSales = collections.reduce((sum, collection) => sum + (collection.sales || 0), 0)
    const averagePrice = totalCollections > 0 ? collections.reduce((sum, collection) => sum + collection.price, 0) / totalCollections : 0
    const floorPrice = collections.length > 0 ? Math.min(...collections.map(c => c.floorPrice || c.price)) : 0
    const topOffer = collections.length > 0 ? Math.max(...collections.map(c => c.topOffer || 0)) : 0
    const listedPercentage = totalCollections > 0 ? (collections.filter(c => c.listed && c.listed > 0).length / totalCollections) * 100 : 0
    const uniqueHolders = Math.floor(Math.random() * 1000) + 500 // Mock data
    const priceChange24h = Math.random() * 20 - 10 // Mock data
    const volumeChange24h = Math.random() * 30 - 15 // Mock data

    return {
      totalProducts: totalCollections,
      totalVolume,
      totalSales,
      averagePrice,
      floorPrice,
      topOffer,
      listedPercentage,
      uniqueHolders,
      priceChange24h,
      volumeChange24h
    }
  }

  useEffect(() => {
    fetchMarketplaceData()
  }, [params.id])

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/marketplace/${marketplace?.merchantId}/${marketplace?.id}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: marketplace?.businessName,
          text: marketplace?.description,
          url: shareUrl,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback to copy to clipboard
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/marketplace/${marketplace?.merchantId}/${marketplace?.id}`
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filteredCollections = collections.filter(collection => {
    const matchesSearch = collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collection.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const sortedCollections = [...filteredCollections].sort((a, b) => {
    switch (sortBy) {
      case "floor":
        return (a.floorPrice || a.price) - (b.floorPrice || b.price)
      case "volume":
        return (b.volume || 0) - (a.volume || 0)
      case "sales":
        return (b.sales || 0) - (a.sales || 0)
      case "listed":
        return (b.listed || 0) - (a.listed || 0)
      case "nftCount":
        return b.nftCount - a.nftCount
      default:
        return a.name.localeCompare(b.name)
    }
  })

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading marketplace...</p>
          </div>
        </div>
      </PageTransition>
    )
  }

  if (!marketplace) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Marketplace Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400">The marketplace you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Header showSearch={false} />

        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {/* Back Button */}
          <FadeIn>
            <div className="mb-4 sm:mb-6">
              <Link href="/marketplace">
                <Button variant="outline" className="rounded-full text-sm sm:text-base">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Back to Marketplaces</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
            </div>
          </FadeIn>

          {/* Marketplace Header */}
          <FadeIn>
            <div className="mb-8">
              <div 
                className="relative rounded-lg overflow-hidden mb-4 sm:mb-6 h-32 sm:h-48 md:h-56 lg:h-64"
                style={{ 
                  background: `linear-gradient(135deg, ${marketplace.primaryColor}20, ${marketplace.secondaryColor}20)` 
                }}
              >
                {getBannerUrl(marketplace.banner) ? (
                  <Image
                    src={getBannerUrl(marketplace.banner)!}
                    alt={marketplace.businessName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Store className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 md:bottom-6 md:left-6 text-white">
                  <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black mb-1 sm:mb-2">{marketplace.businessName}</h1>
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg opacity-90 line-clamp-2">{marketplace.description}</p>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
                {/* Left side - Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    className="text-xs sm:text-sm px-2 sm:px-3 py-1"
                    style={{ 
                      backgroundColor: `${marketplace.primaryColor}20`,
                      color: marketplace.primaryColor,
                      borderColor: `${marketplace.primaryColor}40`
                    }}
                  >
                    {marketplace.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs sm:text-sm px-2 sm:px-3 py-1">
                    {marketplace.template} Template
                  </Badge>
                  <Badge variant="outline" className="text-xs sm:text-sm px-2 sm:px-3 py-1">
                    {marketplace.paymentMethod} Payments
                  </Badge>
                </div>

                {/* Right side - Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Primary Action - Open Marketplace */}
                  <Button
                    size="lg"
                    asChild
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <Link href={`/marketplace/${marketplace.merchantId}/${marketplace.id}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Open Marketplace
                    </Link>
                  </Button>

                  {/* Secondary Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleShare}
                      className="border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium px-4 py-3 rounded-lg transition-all duration-200"
                    >
                      <Share2 className="w-5 h-5 mr-2" />
                      Share
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setShowQRModal(true)}
                      className="border-2 border-gray-300 dark:border-gray-600 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 font-medium px-4 py-3 rounded-lg transition-all duration-200"
                    >
                      <QrCode className="w-5 h-5 mr-2" />
                      QR Code
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          <div className="grid gap-4 sm:gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="space-y-4 sm:space-y-6">
              {/* Featured Collections Section */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Featured Collections</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Top collections from this marketplace
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {collections.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No collections available yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                      {collections.slice(0, 4).map((collection, index) => (
                        <motion.div
                          key={collection.id}
                          initial={{ y: 30, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                          whileHover={{ y: -5 }}
                          className="group"
                        >
                          <Link 
                            href={`/marketplace/${marketplace.merchantId}/${marketplace.id}/collection/${collection.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300">
                            <div className="relative aspect-square">
                              <Image
                                src={collection.image}
                                alt={collection.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-3 left-3">
                                <Badge 
                                  className="text-xs"
                                  style={{ 
                                    backgroundColor: `${marketplace.primaryColor}90`,
                                    color: 'white'
                                  }}
                                >
                                  #{index + 1}
                                </Badge>
                              </div>
                            </div>
                            <CardContent className="p-3 sm:p-4">
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base">
                                {collection.name}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                {collection.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
                                  {collection.price} {collection.currency}
                                </span>
                                <Button size="sm" className="h-8 w-8 p-0" style={{ backgroundColor: marketplace.primaryColor }}>
                                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Analytics Section */}
              {analytics && (
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Marketplace Analytics</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Key metrics and performance data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
                      <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {analytics.totalProducts}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Products</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {analytics.totalVolume.toFixed(1)} ALGO
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Volume</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {analytics.totalSales}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Sales</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {analytics.averagePrice.toFixed(2)} ALGO
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Avg Price</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {analytics.floorPrice.toFixed(2)} ALGO
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Floor Price</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {analytics.uniqueHolders}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Holders</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Collections Table */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div>
                      <CardTitle className="text-gray-900 dark:text-white text-lg sm:text-xl">Collections</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">
                        Browse all collections in this marketplace
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="select-theme-currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="ALGO">ALGO</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {sortedCollections.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No collections available yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-600 dark:text-gray-400 text-xs sm:text-sm">#</th>
                            <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Collection</th>
                            <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-600 dark:text-gray-400 text-xs sm:text-sm hidden sm:table-cell">Floor</th>
                            <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-600 dark:text-gray-400 text-xs sm:text-sm hidden lg:table-cell">Top Offer</th>
                            <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-600 dark:text-gray-400 text-xs sm:text-sm hidden lg:table-cell">Floor 1d %</th>
                            <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-600 dark:text-gray-400 text-xs sm:text-sm hidden sm:table-cell">Volume</th>
                            <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-600 dark:text-gray-400 text-xs sm:text-sm hidden lg:table-cell">Sales</th>
                            <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-600 dark:text-gray-400 text-xs sm:text-sm hidden lg:table-cell">Listed</th>
                            <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-600 dark:text-gray-400 text-xs sm:text-sm hidden xl:table-cell">Last 1d</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedCollections.map((collection, index) => (
                            <Link 
                              href={`/marketplace/${marketplace.merchantId}/${marketplace.id}/collection/${collection.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="contents"
                            >
                              <motion.tr
                                key={collection.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                              >
                                <td className="py-2 sm:py-4 px-2 sm:px-4 text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                                  {index + 1}
                                </td>
                                <td className="py-2 sm:py-4 px-2 sm:px-4">
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="relative w-8 h-8 sm:w-12 sm:h-12 rounded-lg overflow-hidden">
                                      <Image
                                        src={collection.image}
                                        alt={collection.name}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                    <div>
                                      <div className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                                        {collection.name}
                                      </div>
                                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                        {collection.nftCount} NFTs
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2 sm:py-4 px-2 sm:px-4 hidden sm:table-cell">
                                  <div className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                                    {collection.floorPrice || collection.price} ALGO
                                  </div>
                                </td>
                                <td className="py-2 sm:py-4 px-2 sm:px-4 hidden lg:table-cell">
                                  <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                                    {collection.topOffer ? `${collection.topOffer} ALGO` : '--'}
                                  </div>
                                </td>
                                <td className="py-2 sm:py-4 px-2 sm:px-4 hidden lg:table-cell">
                                  <div className={`flex items-center gap-1 text-xs sm:text-sm ${
                                    (collection.floorChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {(collection.floorChange || 0) >= 0 ? (
                                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                                    ) : (
                                      <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                                    )}
                                    <span className="font-medium">
                                      {Math.abs(collection.floorChange || 0).toFixed(1)}%
                                    </span>
                                  </div>
                                </td>
                                <td className="py-2 sm:py-4 px-2 sm:px-4 hidden sm:table-cell">
                                  <div className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                                    {collection.volume || 0} ALGO
                                  </div>
                                </td>
                                <td className="py-2 sm:py-4 px-2 sm:px-4 hidden lg:table-cell">
                                  <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                                    {collection.sales || 0}
                                  </div>
                                </td>
                                <td className="py-2 sm:py-4 px-2 sm:px-4 hidden lg:table-cell">
                                  <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                                    {collection.listed ? `${collection.listed}%` : '0%'}
                                  </div>
                                </td>
                                <td className="py-2 sm:py-4 px-2 sm:px-4 hidden xl:table-cell">
                                  <div className="w-12 sm:w-16 h-6 sm:h-8 bg-gradient-to-r from-green-400 to-red-400 rounded opacity-60"></div>
                                </td>
                              </motion.tr>
                            </Link>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowQRModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Share Marketplace</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQRModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ×
                  </Button>
                </div>
                
                <div className="mb-6">
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 inline-block">
                    {/* QR Code Placeholder - In a real app, you'd use a QR code library */}
                    <div className="w-48 h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">QR Code</p>
                        <p className="text-xs text-gray-400 mt-1">Scan to visit marketplace</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Share URL:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded border text-left break-all">
                        {typeof window !== 'undefined' ? `${window.location.origin}/marketplace/${marketplace?.merchantId}/${marketplace?.id}` : ''}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopyLink}
                        className="shrink-0"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleShare}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowQRModal(false)}
                      className="flex-1"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}
