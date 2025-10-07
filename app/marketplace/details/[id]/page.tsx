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
  MessageSquareLock
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/page-transition"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Image from "next/image"

interface Marketplace {
  id: string
  merchantId: string
  businessName: string
  description: string
  category: string
  website?: string
  logo?: string
  banner?: string
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
  const [products, setProducts] = useState<Product[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("top")
  const [timeFilter, setTimeFilter] = useState("1d")
  const [currency, setCurrency] = useState("USD")
  const [badged, setBadged] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("volume")

  const fetchMarketplaceData = async () => {
    setLoading(true)
    try {
      // Fetch marketplace details
      const marketplaceRes = await fetch(`/api/marketplaces/${params.id}`)
      const marketplaceData = await marketplaceRes.json()
      
      if (marketplaceRes.ok) {
        setMarketplace(marketplaceData.marketplace)
        
        // Fetch products
        const productsRes = await fetch(`/api/marketplaces/${params.id}/products`)
        const productsData = await productsRes.json()
        
        if (productsRes.ok) {
          setProducts(productsData.products || [])
          
          // Calculate analytics
          const analyticsData = calculateAnalytics(productsData.products || [])
          setAnalytics(analyticsData)
        }
      }
    } catch (error) {
      console.error("Failed to fetch marketplace data:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAnalytics = (products: Product[]): Analytics => {
    const totalProducts = products.length
    const totalVolume = products.reduce((sum, product) => sum + (product.volume || 0), 0)
    const totalSales = products.reduce((sum, product) => sum + (product.sales || 0), 0)
    const averagePrice = products.reduce((sum, product) => sum + product.price, 0) / totalProducts
    const floorPrice = Math.min(...products.map(p => p.floorPrice || p.price))
    const topOffer = Math.max(...products.map(p => p.topOffer || 0))
    const listedPercentage = (products.filter(p => p.listed && p.listed > 0).length / totalProducts) * 100
    const uniqueHolders = Math.floor(Math.random() * 1000) + 500 // Mock data
    const priceChange24h = Math.random() * 20 - 10 // Mock data
    const volumeChange24h = Math.random() * 30 - 15 // Mock data

    return {
      totalProducts,
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "floor":
        return (a.floorPrice || a.price) - (b.floorPrice || b.price)
      case "volume":
        return (b.volume || 0) - (a.volume || 0)
      case "sales":
        return (b.sales || 0) - (a.sales || 0)
      case "listed":
        return (b.listed || 0) - (a.listed || 0)
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
                className="relative rounded-lg overflow-hidden mb-4 sm:mb-6"
                style={{ 
                  background: `linear-gradient(135deg, ${marketplace.primaryColor}20, ${marketplace.secondaryColor}20)` 
                }}
              >
                {marketplace.banner ? (
                  <img
                    src={marketplace.banner}
                    alt={marketplace.businessName}
                    className="w-full h-32 sm:h-48 md:h-56 lg:h-64 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 sm:h-48 md:h-56 lg:h-64 flex items-center justify-center">
                    <Store className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 md:bottom-6 md:left-6 text-white">
                  <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black mb-1 sm:mb-2">{marketplace.businessName}</h1>
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg opacity-90 line-clamp-2">{marketplace.description}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="flex-1 sm:flex-none text-xs sm:text-sm"
                  >
                    <Link href={`/marketplace/${marketplace.merchantId}/${marketplace.id}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Open Marketplace</span>
                      <span className="sm:hidden">Open</span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none text-xs sm:text-sm"
                  >
                    <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Share</span>
                    <span className="sm:hidden">Share</span>
                  </Button>
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
                  {products.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No collections available yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                      {products.slice(0, 4).map((product, index) => (
                        <motion.div
                          key={product.id}
                          initial={{ y: 30, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                          whileHover={{ y: -5 }}
                          className="group"
                        >
                          <Link 
                            href={`/marketplace/${marketplace.merchantId}/${marketplace.id}/product/${product.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300">
                            <div className="relative aspect-square">
                              <Image
                                src={product.image}
                                alt={product.name}
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
                                {product.name}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                {product.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
                                  {product.price} {product.currency}
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
                          {analytics.totalVolume.toFixed(1)} ETH
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
                          {analytics.averagePrice.toFixed(2)} ETH
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Avg Price</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {analytics.floorPrice.toFixed(2)} ETH
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
                        <SelectTrigger className="w-20 h-8 sm:h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="ETH">ETH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {sortedProducts.length === 0 ? (
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
                          {sortedProducts.map((product, index) => (
                            <Link 
                              href={`/marketplace/${marketplace.merchantId}/${marketplace.id}/product/${product.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="contents"
                            >
                              <motion.tr
                                key={product.id}
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
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                    <div>
                                      <div className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                                        {product.name}
                                      </div>
                                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                        {product.nftData?.totalSupply || 'N/A'} items
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2 sm:py-4 px-2 sm:px-4 hidden sm:table-cell">
                                  <div className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                                    {product.floorPrice || product.price} ETH
                                  </div>
                                </td>
                                <td className="py-2 sm:py-4 px-2 sm:px-4 hidden lg:table-cell">
                                  <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                                    {product.topOffer ? `${product.topOffer} ETH` : '--'}
                                  </div>
                                </td>
                                <td className="py-2 sm:py-4 px-2 sm:px-4 hidden lg:table-cell">
                                  <div className={`flex items-center gap-1 text-xs sm:text-sm ${
                                    (product.floorChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {(product.floorChange || 0) >= 0 ? (
                                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                                    ) : (
                                      <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                                    )}
                                    <span className="font-medium">
                                      {Math.abs(product.floorChange || 0).toFixed(1)}%
                                    </span>
                                  </div>
                                </td>
                                <td className="py-2 sm:py-4 px-2 sm:px-4 hidden sm:table-cell">
                                  <div className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                                    {product.volume || 0} ETH
                                  </div>
                                </td>
                                <td className="py-2 sm:py-4 px-2 sm:px-4 hidden lg:table-cell">
                                  <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                                    {product.sales || 0}
                                  </div>
                                </td>
                                <td className="py-2 sm:py-4 px-2 sm:px-4 hidden lg:table-cell">
                                  <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                                    {product.listed ? `${product.listed}%` : '0%'}
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
    </PageTransition>
  )
}
