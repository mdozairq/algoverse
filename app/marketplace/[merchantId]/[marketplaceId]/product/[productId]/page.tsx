"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  ExternalLink, 
  Globe, 
  Twitter, 
  MessageCircle,
  Heart,
  Share2,
  Copy,
  CheckCircle,
  Lock,
  Star,
  Users,
  Activity,
  DollarSign,
  Clock,
  Eye,
  Maximize2,
  Minus,
  Plus,
  ShoppingCart,
  Wallet,
  Shield,
  Zap,
  Award,
  TrendingUp,
  BarChart3,
  PieChart,
  Target,
  Calendar,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Bookmark,
  Download,
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
  TrendingDown,
  LineChart,
  BarChart,
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
import { useParams } from "next/navigation"
import Image from "next/image"
import { CountdownTimer } from "@/components/launchpad/countdown-timer"
import { MintWidget } from "@/components/launchpad/mint-widget"
import { StatsCard, CollectionStatsCard } from "@/components/launchpad/stats-card"
import { ProgressBar, MintProgressBar } from "@/components/launchpad/progress-bar"

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
  eventData?: {
    date: string
    location: string
    totalSupply: number
    availableSupply: number
    nftAssetId?: number
  }
  mintData?: {
    phases: {
      id: string
      name: string
      startTime: string
      endTime: string
      price: number
      limit: number
      minted: number
      isActive: boolean
      isWhitelist: boolean
    }[]
    currentPhase?: {
      id: string
      name: string
      startTime: string
      endTime: string
      price: number
      limit: number
      minted: number
      isActive: boolean
      isWhitelist: boolean
    }
  }
}

export default function ProductPage() {
  const params = useParams()
  const merchantId = params.merchantId as string
  const marketplaceId = params.marketplaceId as string
  const productId = params.productId as string

  const [marketplace, setMarketplace] = useState<Marketplace | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [mintQuantity, setMintQuantity] = useState(1)
  const [isLiked, setIsLiked] = useState(false)
  const [copied, setCopied] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [isEligible, setIsEligible] = useState(false)
  const [mintProgress, setMintProgress] = useState(0)
  const [totalMinted, setTotalMinted] = useState(0)
  const [totalSupply, setTotalSupply] = useState(0)
  const [floorPrice, setFloorPrice] = useState(0)
  const [volume, setVolume] = useState(0)
  const [holders, setHolders] = useState(0)
  const [listed, setListed] = useState(0)

  useEffect(() => {
    fetchProductData()
  }, [merchantId, marketplaceId, productId])

  const fetchProductData = async () => {
    setLoading(true)
    try {
      // Fetch marketplace details
      const marketplaceRes = await fetch(`/api/marketplaces/${marketplaceId}`)
      const marketplaceData = await marketplaceRes.json()
      
      if (marketplaceRes.ok) {
        setMarketplace(marketplaceData.marketplace)
        
        // Fetch product details
        const productRes = await fetch(`/api/marketplaces/${marketplaceId}/products/${productId}`)
        const productData = await productRes.json()
        
        if (productRes.ok) {
          setProduct(productData.product)
          
          // Set mint progress data
          if (productData.product.nftData) {
            setTotalMinted(productData.product.nftData.totalSupply - productData.product.nftData.availableSupply)
            setTotalSupply(productData.product.nftData.totalSupply)
            setMintProgress(((productData.product.nftData.totalSupply - productData.product.nftData.availableSupply) / productData.product.nftData.totalSupply) * 100)
          }
          
          // Mock stats data
          setFloorPrice(productData.product.price)
          setVolume(productData.product.price * 150)
          setHolders(1200)
          setListed(45)
        }
      }
    } catch (error) {
      console.error("Failed to fetch product data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMint = async () => {
    if (!walletConnected) {
      // Connect wallet logic
      setWalletConnected(true)
      setWalletAddress("0x1234...5678")
      setIsEligible(true)
      return
    }

    try {
      const response = await fetch(`/api/marketplaces/${marketplaceId}/products/${productId}/mint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: mintQuantity,
          walletAddress: walletAddress
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert(`Mint successful! Transaction ID: ${data.transactionId}`)
        // Refresh product data
        fetchProductData()
      } else {
        alert(`Mint failed: ${data.error}`)
      }
    } catch (error) {
      console.error("Mint error:", error)
      alert("Mint failed. Please try again.")
    }
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const copyProductId = () => {
    if (product) {
      navigator.clipboard.writeText(product.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!marketplace || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Product Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400">The product you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  const currentPhase = product.mintData?.currentPhase
  const isMintActive = currentPhase?.isActive || false
  const mintEndTime = currentPhase?.endTime ? new Date(currentPhase.endTime) : null

  return (
    <PageTransition>
      <div 
        className="min-h-screen bg-gray-50 dark:bg-gray-900"
        style={{
          '--primary-color': marketplace.primaryColor,
          '--secondary-color': marketplace.secondaryColor,
        } as React.CSSProperties}
      >
        {/* Header */}
        <motion.header 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50"
        >
          <div className="container mx-auto px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Back Button and Brand */}
              <div className="flex items-center gap-4">
                <Link href={`/marketplace/${merchantId}/${marketplaceId}`}>
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </Link>
                
                <div className="flex items-center gap-3">
                  {marketplace.logo ? (
                    <Image
                      src={marketplace.logo}
                      alt={marketplace.businessName}
                      width={32}
                      height={32}
                      className="rounded-lg"
                    />
                  ) : (
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ 
                        background: `linear-gradient(135deg, ${marketplace.primaryColor}, ${marketplace.secondaryColor})` 
                      }}
                    >
                      {marketplace.businessName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                      {marketplace.businessName}
                    </h1>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ 
                          borderColor: marketplace.primaryColor,
                          color: marketplace.primaryColor 
                        }}
                      >
                        {marketplace.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-gray-500">Live</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyProductId}
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="container mx-auto px-4 lg:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Product Image */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              {/* Main Product Image */}
              <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden group">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Fullscreen Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white border-0"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
                
                {/* Overlay Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.nftData?.rarityRank && (
                    <Badge 
                      className="text-xs"
                      style={{ 
                        backgroundColor: `${marketplace.primaryColor}90`,
                        color: 'white'
                      }}
                    >
                      #{product.nftData.rarityRank}
                    </Badge>
                  )}
                  {!product.inStock && (
                    <Badge variant="destructive" className="text-xs">
                      Out of Stock
                    </Badge>
                  )}
                </div>
              </div>

              {/* Product Title */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {product.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Collection Stats */}
              {product.type === "nft" && (
                <CollectionStatsCard
                  floorPrice={floorPrice}
                  volume={volume}
                  holders={holders}
                  listed={listed}
                  change={5.2}
                />
              )}
            </motion.div>

            {/* Right Column - Minting Details */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              {/* Contract and Social Links */}
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Contract
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Globe className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Eligibility and Phase Status */}
              <div className="flex items-center gap-3">
                {isEligible && (
                  <Badge className="bg-green-500 text-white">
                    Eligible
                  </Badge>
                )}
                <Badge 
                  className="flex items-center gap-2"
                  style={{ 
                    backgroundColor: isMintActive ? `${marketplace.primaryColor}20` : '#6B7280',
                    color: isMintActive ? marketplace.primaryColor : 'white'
                  }}
                >
                  <div className={`w-2 h-2 rounded-full ${isMintActive ? 'bg-green-500' : 'bg-gray-500'}`} />
                  {currentPhase?.name || 'PUBLIC'}
                </Badge>
              </div>

              {/* Mint Progress */}
              {product.type === "nft" && (
                <MintProgressBar
                  minted={totalMinted}
                  totalSupply={totalSupply}
                />
              )}

              {/* Price */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Price</h3>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {product.price} {product.currency}
                  <span className="text-lg text-gray-500 ml-2">
                    (${(product.price * 38.71).toFixed(2)})
                  </span>
                </div>
              </div>

              {/* Mint Widget */}
              {product.type === "nft" && (
                <MintWidget
                  currentPhase={currentPhase}
                  price={product.price}
                  currency={product.currency}
                  quantity={mintQuantity}
                  onQuantityChange={setMintQuantity}
                  onMint={handleMint}
                  walletConnected={walletConnected}
                  isEligible={isEligible}
                  isActive={isMintActive}
                  mintFee={0.00025}
                  style={{
                    primaryColor: marketplace.primaryColor,
                    secondaryColor: marketplace.secondaryColor
                  }}
                />
              )}

              {/* Countdown Timer */}
              {mintEndTime && isMintActive && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sale Ends In</h3>
                  <CountdownTimer targetDate={mintEndTime} />
                </div>
              )}

              {/* Terms and Conditions */}
              <div className="flex items-start gap-2">
                <Checkbox id="terms" />
                <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                  By clicking 'mint', you agree to the {marketplace.businessName} Terms of Service.
                </label>
              </div>

              {/* Trading Lock Notice */}
              {product.type === "nft" && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <Lock className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-700 dark:text-red-400">
                    Collection is locked from trading until all items have been minted.
                  </span>
                </div>
              )}

              {/* Past Mint Phases */}
              {product.mintData?.phases && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mint Phases</h3>
                  {product.mintData.phases.map((phase) => (
                    <div
                      key={phase.id}
                      className={`p-4 rounded-lg border ${
                        phase.isActive 
                          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                          : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {phase.name}
                          </span>
                        </div>
                        <Badge variant={phase.isActive ? "default" : "secondary"}>
                          {phase.isActive ? "ACTIVE" : "ENDED"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="font-medium">Mint Limit:</span> {phase.limit}
                        </div>
                        <div>
                          <span className="font-medium">Price:</span> {phase.price} {product.currency}
                        </div>
                        <div>
                          <span className="font-medium">Minted:</span> {phase.minted}
                        </div>
                        <div>
                          <span className="font-medium">Progress:</span> {((phase.minted / phase.limit) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Product Details Section */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 space-y-8"
          >
            {/* Traits Section */}
            {product.nftData?.traits && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Traits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {product.nftData.traits.map((trait, index) => (
                      <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          {trait.trait_type}
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white mb-1">
                          {trait.value}
                        </div>
                        <div className="text-xs text-gray-500">
                          {trait.rarity.toFixed(1)}% rarity
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">About This Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {product.description}
                  </p>
                  
                  {product.type === "nft" && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Collection Details</h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <li>Total Supply: {product.nftData?.totalSupply || 'N/A'}</li>
                          <li>Available: {product.nftData?.availableSupply || 'N/A'}</li>
                          <li>Royalty: {product.nftData?.royaltyPercentage || 0}%</li>
                          <li>Blockchain: Ethereum</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Utility</h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <li>• Exclusive access to community events</li>
                          <li>• Special merchandise discounts</li>
                          <li>• Voting rights in project decisions</li>
                          <li>• Future airdrops and rewards</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </PageTransition>
  )
}
