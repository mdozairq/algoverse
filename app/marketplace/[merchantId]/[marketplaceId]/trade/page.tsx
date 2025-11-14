"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  ArrowLeft, 
  TrendingUp,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Wallet,
  Package,
  Users,
  DollarSign,
  Eye,
  Heart,
  Share2,
  Star,
  Activity,
  BarChart3,
  LineChart,
  PieChart,
  Target,
  Award,
  ShoppingCart,
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
  HelpCircle,
  Info,
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
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  ExternalLink,
  Copy,
  RefreshCw,
  Zap,
  Crown,
  Shield,
  Verified,
  TrendingDown,
  Minus,
  Plus,
  X,
  Check,
  AlertTriangle,
  Info as InfoIcon
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { PageTransition, FadeIn } from "@/components/animations/page-transition"
import MarketplaceHeader from "@/components/marketplace/marketplace-header"
import MarketplaceFooter from "@/components/marketplace/marketplace-footer"
import TemplateLoader from "@/components/marketplace/template-loader"
import { CreatePageLoadingTemplate, SimpleLoadingTemplate } from "@/components/ui/loading-templates"
import Image from "next/image"
import { useWallet } from "@/hooks/use-wallet"

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
  allowMint?: boolean
  allowTrading?: boolean
  createdAt: Date
  updatedAt?: Date
}

interface Collection {
    id: string
    name: string
  description: string
    image: string
  floorPrice: number
  totalVolume: number
  marketCap: number
  topOffer: number
  floorChange1d: number
  volume1d: number
  volumeChange1d: number
  sales1d: number
  listed: number
  listedPercentage: number
  owners: number
  ownersPercentage: number
  verified: boolean
  chain: string
  category: string
  createdAt: Date
  allowMint?: boolean
}

interface NFT {
  id: string
  collectionId: string
  name: string
  image: string
  price: number
  currency: string
  floorPrice: number
  topOffer: number
  rarityScore?: number
  traits: {
    trait_type: string
    value: string
    rarity: number
  }[]
  owner: string
  listed: boolean
  lastSale?: {
    price: number
    currency: string
    date: Date
  }
  status: "minted" | "draft"
}

export default function TradePage({ params }: { params: { merchantId: string; marketplaceId: string } }) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("top")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [timeWindow, setTimeWindow] = useState("1d")
  const [sortBy, setSortBy] = useState("volume")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [showUSD, setShowUSD] = useState(false)
  const [showBadged, setShowBadged] = useState(true)
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [tradingOrders, setTradingOrders] = useState<any[]>([])
  const [showCreateOrder, setShowCreateOrder] = useState(false)
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null)

  const { isConnected, account, connect } = useWallet()

  const fetchCollections = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/marketplaces/${params.marketplaceId}/trading/collections`)
      if (response.ok) {
        const data = await response.json()
        setCollections(data.collections || [])
      } else {
        console.error("Failed to fetch trading collections")
        setCollections([])
      }
    } catch (error) {
      console.error("Error fetching trading collections:", error)
      setCollections([])
    } finally {
      setLoading(false)
    }
  }

  const fetchNFTs = async (collectionId?: string) => {
    try {
      setLoading(true)
      const url = collectionId 
        ? `/api/marketplaces/${params.marketplaceId}/trading/nfts?collectionId=${collectionId}`
        : `/api/marketplaces/${params.marketplaceId}/trading/nfts`
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setNfts(data.nfts || [])
      } else {
        console.error("Failed to fetch trading NFTs")
        setNfts([])
      }
    } catch (error) {
      console.error("Error fetching trading NFTs:", error)
      setNfts([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch trading orders
  const fetchTradingOrders = async () => {
    try {
      const response = await fetch(`/api/marketplaces/${params.marketplaceId}/trading/orders`)
      if (response.ok) {
        const data = await response.json()
        setTradingOrders(data.orders || [])
      } else {
        console.error("Failed to fetch trading orders")
        setTradingOrders([])
      }
    } catch (error) {
      console.error("Error fetching trading orders:", error)
      setTradingOrders([])
    }
  }

  // Create a trading order
  const createTradingOrder = async (nftId: string, type: "buy" | "sell", price: number) => {
    try {
      if (!account) {
        alert("Please connect your wallet first")
        return
      }

      const response = await fetch(`/api/marketplaces/${params.marketplaceId}/trading/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nftId,
          type,
          price,
          currency: "ALGO",
          userAddress: account,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Trading order created:", data)
        // Refresh orders
        fetchTradingOrders()
        setShowCreateOrder(false)
        setSelectedNFT(null)
      } else {
        const error = await response.json()
        alert(`Failed to create order: ${error.error}`)
      }
    } catch (error) {
      console.error("Error creating trading order:", error)
      alert("Failed to create trading order")
    }
  }

  useEffect(() => {
    fetchCollections()
    fetchNFTs()
    fetchTradingOrders()
  }, [params.marketplaceId])

  const handleCollectionSelect = (collection: Collection) => {
    setSelectedCollection(collection)
    fetchNFTs(collection.id)
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortDirection("desc")
    }
  }

  const formatPrice = (price: number | null | undefined, currency: string = "ALGO") => {
    if (price == null || isNaN(price)) {
      return `N/A ${currency}`
    }
    if (showUSD) {
      const usdPrice = price * 0.4 // Mock conversion rate
      return `$${(usdPrice / 1000).toFixed(1)}K`
    }
    return `${price.toFixed(2)} ${currency}`
  }

  const formatPercentage = (value: number | null | undefined) => {
    if (value == null || isNaN(value)) {
      return (
        <span className="flex items-center gap-1 text-gray-500">
          N/A
        </span>
      )
    }
    const isPositive = value >= 0
    return (
      <span className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
        {Math.abs(value).toFixed(1)}%
      </span>
    )
  }

  const filteredCollections = collections.filter(collection => {
    const matchesSearch = collection.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBadged = !showBadged || collection.verified
    // Only show collections that don't have allowMint as true
    const noMintAllowed = !collection.allowMint
    return matchesSearch && matchesBadged && noMintAllowed
  }).sort((a, b) => {
    let aValue, bValue
    switch (sortBy) {
      case "volume":
        aValue = a.totalVolume
        bValue = b.totalVolume
        break
      case "floor":
        aValue = a.floorPrice
        bValue = b.floorPrice
        break
      case "marketCap":
        aValue = a.marketCap
        bValue = b.marketCap
        break
      default:
        aValue = a.totalVolume
        bValue = b.totalVolume
    }
    return sortDirection === "asc" ? aValue - bValue : bValue - aValue
  })

  const filteredNFTs = nfts.filter(nft => {
    const matchesSearch = nft.name.toLowerCase().includes(searchTerm.toLowerCase())
    // Only show minted NFTs
    const isMinted = nft.status === "minted"
    return matchesSearch && isMinted
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

  return (
    <TemplateLoader marketplaceId={params.marketplaceId}>
      {({ marketplace, template, loading, getButtonStyle, getCardStyle, getBadgeStyle, getThemeStyles }) => {
        if (loading) {
          return <CreatePageLoadingTemplate />
        }

        if (!marketplace) {
          return (
            <SimpleLoadingTemplate message="Marketplace not found. Redirecting..." />
          )
        }

        return (
          <PageTransition>
            <div 
              className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              style={getThemeStyles()}
            >
              <MarketplaceHeader 
                marketplace={marketplace} 
                merchantId={params.merchantId} 
                marketplaceId={params.marketplaceId} 
              />

        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {/* Back Button */}
          {/* <FadeIn>
            <div className="mb-4 sm:mb-6">
              <Link href={`/marketplace/${params.merchantId}/${params.marketplaceId}`}>
                <Button variant="outline" className="rounded-full text-sm sm:text-base">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Back to Marketplace</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
            </div>
          </FadeIn> */}

          {/* Header */}
          <FadeIn>
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Trading Floor
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Buy and sell NFTs in {marketplace.businessName}
                  </p>
                </div>
                {/* <div className="flex items-center gap-3">
                  <WalletConnectButton />
                </div> */}
              </div>
            </div>
          </FadeIn>

          {/* Magic Eden Style Interface - Using marketplace colors */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Magic Eden Header */}
            <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <div className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Top Collections</h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setActiveTab("top")}
                      className={`py-2 px-1 border-b-2 transition-colors ${
                        activeTab === "top" 
                          ? "border-blue-500 text-blue-500" 
                          : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      }`}
                    >
                      Top
                    </button>
                    <button
                      onClick={() => setActiveTab("trending")}
                      className={`py-2 px-1 border-b-2 transition-colors ${
                        activeTab === "trending" 
                          ? "border-blue-500 text-blue-500" 
                          : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      }`}
                    >
                      Trending
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <div className="px-4 py-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                  
                  <div className="flex-1 max-w-md">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                        placeholder="Search collections..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                      </div>
                    </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Badged</span>
                    <button
                      onClick={() => setShowBadged(!showBadged)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        showBadged ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          showBadged ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                          
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">USD</span>
                    <button
                      onClick={() => setShowUSD(!showUSD)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        showUSD ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          showUSD ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                            </div>
                            
                            <div className="flex items-center gap-2">
                    {["10M", "1H", "6H", "1D", "7D", "30D"].map((period) => (
                      <button
                        key={period}
                        onClick={() => setTimeWindow(period.toLowerCase())}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          timeWindow === period.toLowerCase()
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                            </div>
                          </div>
                        </div>
              </div>

            {/* Collections Table */}
            <div className="bg-white dark:bg-gray-800">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Chain</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                        <button
                          onClick={() => handleSort("floor")}
                          className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          Floor
                          {sortBy === "floor" && (
                            sortDirection === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                        <button
                          onClick={() => handleSort("volume")}
                          className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          Total Volume
                          {sortBy === "volume" && (
                            sortDirection === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                        <button
                          onClick={() => handleSort("marketCap")}
                          className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          Market Cap
                          {sortBy === "marketCap" && (
                            sortDirection === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300">Top Offer</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300">Floor 1d %</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300">Volume 1d</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300">Vol 1d %</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300">Sales 1d</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300">Listed</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300">Owners</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredCollections.map((collection, index) => (
                      <motion.tr
                        key={collection.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                        onClick={() => handleCollectionSelect(collection)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden">
                              <Image
                                src={collection.image}
                                alt={collection.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900 dark:text-white">{collection.name}</span>
                                {collection.verified && (
                                  <Verified className="w-4 h-4 text-blue-500" />
                                )}
                            </div>
                          </div>
                              </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">A</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-gray-900 dark:text-white font-medium">
                            {formatPrice(collection.floorPrice)}
                          </div>
                          {showUSD && collection.floorPrice != null && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ${((collection.floorPrice * 0.4) / 1000).toFixed(1)}K
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-gray-900 dark:text-white font-medium">
                            {formatPrice(collection.totalVolume)}
                              </div>
                          {showUSD && collection.totalVolume != null && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ${((collection.totalVolume * 0.4) / 1000).toFixed(1)}K
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-gray-900 dark:text-white font-medium">
                            {formatPrice(collection.marketCap)}
                          </div>
                          {showUSD && collection.marketCap != null && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ${((collection.marketCap * 0.4) / 1000).toFixed(1)}K
                </div>
              )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-gray-900 dark:text-white font-medium">
                            {formatPrice(collection.topOffer)}
                            </div>
                          {showUSD && collection.topOffer != null && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ${((collection.topOffer * 0.4) / 1000).toFixed(1)}K
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {formatPercentage(collection.floorChange1d)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-gray-900 dark:text-white font-medium">
                            {formatPrice(collection.volume1d)}
                          </div>
                          {showUSD && collection.volume1d != null && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ${((collection.volume1d * 0.4) / 1000).toFixed(1)}K
                          </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {formatPercentage(collection.volumeChange1d)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-gray-900 dark:text-white font-medium">
                            {collection.sales1d != null ? collection.sales1d.toLocaleString() : '0'}
                        </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-gray-900 dark:text-white font-medium">
                            {collection.listed != null ? collection.listed.toLocaleString() : '0'}
              </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ({collection.listedPercentage != null ? collection.listedPercentage.toFixed(1) : '0.0'}%)
                      </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-gray-900 dark:text-white font-medium">
                            {collection.owners != null ? collection.owners.toLocaleString() : '0'}
                      </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ({collection.ownersPercentage != null ? collection.ownersPercentage.toFixed(1) : '0.0'}%)
                    </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                    </div>
                            </div>
                            
            {/* NFT Grid View */}
            {selectedCollection && (
              <div className="border-t border-gray-200 dark:border-gray-700">
                <div className="px-4 py-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCollection.name}</h2>
                      <p className="text-gray-600 dark:text-gray-400">Browse NFTs in this collection</p>
                    </div>
                            <div className="flex items-center gap-2">
                    <Button 
                        variant={viewMode === "grid" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="border-gray-300 dark:border-gray-600"
                      >
                        <Grid3X3 className="w-4 h-4" />
                    </Button>
                                <Button
                        variant={viewMode === "list" ? "default" : "outline"}
                                  size="sm"
                        onClick={() => setViewMode("list")}
                        className="border-gray-300 dark:border-gray-600"
                                >
                        <List className="w-4 h-4" />
                                </Button>
                </div>
        </div>

                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {filteredNFTs.map((nft, index) => (
                        <motion.div
                          key={nft.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer border border-gray-200 dark:border-gray-600"
                        >
                          <div className="aspect-square relative">
                            <Image
                              src={nft.image}
                              alt={nft.name}
                              fill
                              className="object-cover"
                            />
                            {nft.rarityScore && (
                              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                #{nft.rarityScore}
              </div>
                              )}
                            </div>
                          <div className="p-3">
                            <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">{nft.name}</h3>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-blue-500 font-semibold">
                                {formatPrice(nft.price)}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400 text-xs">
                                {nft.currency}
                  </span>
                          </div>
                            {isConnected && (
                              <div className="flex gap-2 mt-3">
                  <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 text-xs"
                                  onClick={() => {
                                    setSelectedNFT(nft)
                                    setShowCreateOrder(true)
                                  }}
                                >
                                  Buy
                  </Button>
                  <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 text-xs"
                                  onClick={() => {
                                    setSelectedNFT(nft)
                                    setShowCreateOrder(true)
                                  }}
                                >
                                  Sell
                  </Button>
                        </div>
                            )}
              </div>
                  </motion.div>
                ))}
              </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredNFTs.map((nft, index) => (
                    <motion.div
                          key={nft.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer border border-gray-200 dark:border-gray-600"
                        >
                            <div className="flex items-center gap-4">
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                                <Image
                                src={nft.image}
                                alt={nft.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 dark:text-white">{nft.name}</h3>
                              <p className="text-gray-500 dark:text-gray-400 text-sm">#{nft.id.slice(-4)}</p>
                              </div>
                              <div className="text-right">
                              <div className="text-blue-500 font-semibold">
                                {formatPrice(nft.price)}
                              </div>
                              <div className="text-gray-500 dark:text-gray-400 text-sm">
                                {nft.currency}
                              </div>
                              {isConnected && (
                                <div className="flex gap-2 mt-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs"
                                    onClick={() => {
                                      setSelectedNFT(nft)
                                      setShowCreateOrder(true)
                                    }}
                                  >
                                    Buy
                </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs"
                                    onClick={() => {
                                      setSelectedNFT(nft)
                                      setShowCreateOrder(true)
                                    }}
                                  >
                                    Sell
                                  </Button>
              </div>
                                )}
                              </div>
                            </div>
                    </motion.div>
                  ))}
                </div>
              )}
                </div>
              </div>
            )}
              </div>
            </div>
        
        <MarketplaceFooter marketplace={marketplace} />

        {/* Create Order Dialog */}
        <Dialog open={showCreateOrder} onOpenChange={setShowCreateOrder}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Trading Order</DialogTitle>
              <DialogDescription>
                {selectedNFT ? `Create a buy or sell order for ${selectedNFT.name}` : "Create a trading order"}
              </DialogDescription>
            </DialogHeader>
            {selectedNFT && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                    <Image
                      src={selectedNFT.image}
                      alt={selectedNFT.name}
                      fill
                      className="object-cover"
                    />
                            </div>
                            <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{selectedNFT.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Current Price: {formatPrice(selectedNFT.price)}
                              </p>
                            </div>
                          </div>
                          
                <div className="space-y-4">
                      <div>
                        <Label htmlFor="orderType">Order Type</Label>
                    <Select defaultValue="buy">
                          <SelectTrigger>
                        <SelectValue placeholder="Select order type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="buy">Buy Order</SelectItem>
                            <SelectItem value="sell">Sell Order</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                    <Label htmlFor="price">Price (ALGO)</Label>
                        <Input
                      id="price"
                          type="number"
                      step="0.01"
                      placeholder="Enter price"
                      defaultValue={selectedNFT.price}
                    />
        </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                      onClick={() => {
                        const priceInput = document.getElementById('price') as HTMLInputElement
                        const price = parseFloat(priceInput.value)
                        if (price > 0) {
                          createTradingOrder(selectedNFT.id, "buy", price)
                        } else {
                          alert("Please enter a valid price")
                        }
                      }}
                    >
                      Create Buy Order
                  </Button>
                  <Button
                      variant="outline"
                    className="flex-1"
                      onClick={() => {
                        const priceInput = document.getElementById('price') as HTMLInputElement
                        const price = parseFloat(priceInput.value)
                        if (price > 0) {
                          createTradingOrder(selectedNFT.id, "sell", price)
                        } else {
                          alert("Please enter a valid price")
                        }
                      }}
                    >
                      Create Sell Order
                  </Button>
                </div>
              </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
        )
      }}
    </TemplateLoader>
  )
}