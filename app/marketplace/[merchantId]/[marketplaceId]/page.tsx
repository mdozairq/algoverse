"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Heart, 
  Share2, 
  ExternalLink, 
  Store, 
  Star, 
  Users, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  RefreshCw, 
  ArrowLeftRight,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Grid3X3,
  List,
  SlidersHorizontal,
  TrendingUp,
  Award,
  Clock,
  Eye,
  MessageCircle,
  Bookmark,
  Download,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Settings,
  Bell,
  User,
  LogOut,
  Home,
  Package,
  BarChart3,
  HelpCircle,
  Info,
  CheckCircle,
  AlertCircle,
  Zap,
  Shield,
  Lock,
  Unlock,
  Globe,
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
  DollarSign,
  CreditCard,
  Wallet,
  Banknote,
  Coins,
  TrendingDown,
  Activity,
  Target,
  PieChart,
  LineChart,
  BarChart,
  MousePointer,
  Hand,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Edit,
  Trash2,
  Copy,
  Save,
  Upload,
  Download as DownloadIcon,
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
  Plus
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/page-transition"
import { useParams } from "next/navigation"
import Image from "next/image"
import TemplateEngine from "@/lib/marketplace/template-engine"
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button"
import { useWallet } from "@/hooks/use-wallet"
import { useAuth } from "@/lib/auth/auth-context"
import MarketplaceHeader from "@/components/marketplace/marketplace-header"
import MarketplaceFooter from "@/components/marketplace/marketplace-footer"

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

interface MarketplaceTemplate {
  id: string
  name: string
  description: string
  preview: string
  category: string
  configuration: {
    layout: {
      headerStyle: 'fixed' | 'static'
      navigationStyle: 'horizontal' | 'vertical' | 'minimal'
      footerStyle: 'full' | 'minimal' | 'hidden'
    }
    theme: {
      primaryColor: string
      secondaryColor: string
      accentColor: string
      backgroundColor: string
      textColor: string
      cardStyle: 'flat' | 'elevated' | 'outlined'
      borderRadius: 'none' | 'small' | 'medium' | 'large'
    }
    features: {
      heroSection: boolean
      featuredProducts: boolean
      categories: boolean
      testimonials: boolean
      newsletter: boolean
      socialLinks: boolean
    }
    sections: {
      hero: {
        type: 'image' | 'video' | 'gradient'
        height: 'small' | 'medium' | 'large' | 'full'
        overlay: boolean
      }
      products: {
        layout: 'grid' | 'list' | 'carousel'
        itemsPerRow: number
        showFilters: boolean
        showSorting: boolean
      }
      footer: {
        showLinks: boolean
        showSocial: boolean
        showNewsletter: boolean
      }
    }
  }
  isActive: boolean
  createdAt: Date
  updatedAt?: Date
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
  nftData?: {
    assetId: number
    totalSupply: number
    availableSupply: number
    royaltyPercentage: number
  }
  eventData?: {
    date: string
    location: string
    totalSupply: number
    availableSupply: number
    nftAssetId?: number
  }
}

export default function MarketplacePage() {
  const params = useParams()
  const merchantId = params.merchantId as string
  const marketplaceId = params.marketplaceId as string

  const [marketplace, setMarketplace] = useState<Marketplace | null>(null)
  const [template, setTemplate] = useState<MarketplaceTemplate | null>(null)
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [swapping, setSwapping] = useState<string | null>(null)
  const [minting, setMinting] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [renderedComponents, setRenderedComponents] = useState<{
    header: JSX.Element
    hero: JSX.Element
    collections: JSX.Element
    footer: JSX.Element
    styles: React.CSSProperties
  } | null>(null)

  // Wallet and auth hooks
  const { isConnected, account, balance, connect, disconnect, sendTransaction } = useWallet()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    fetchMarketplaceData()
  }, [merchantId, marketplaceId])

  const fetchMarketplaceData = async () => {
    setLoading(true)
    try {
      // Fetch marketplace details
      const marketplaceRes = await fetch(`/api/marketplaces/${marketplaceId}`)
      const marketplaceData = await marketplaceRes.json()
      
      if (marketplaceRes.ok) {
        // Check if marketplace is enabled
        if (!marketplaceData.marketplace.isEnabled) {
          setMarketplace(null)
          return
        }
        setMarketplace(marketplaceData.marketplace)
        
        // Fetch template configuration
        const templateRes = await fetch(`/api/marketplace-templates/${marketplaceData.marketplace.template}`)
        const templateData = await templateRes.json()
        
        if (templateRes.ok) {
          setTemplate(templateData.template)
        }
        
        // Fetch marketplace collections from API
        const collectionsRes = await fetch(`/api/marketplaces/${marketplaceId}/collections`)
        const collectionsData = await collectionsRes.json()
        
        if (collectionsRes.ok) {
          setCollections(collectionsData.collections || [])
        } else {
          // Fallback to mock data if API fails
          setCollections([
            {
              id: "1",
              name: "Premium Event Collection",
              description: "VIP access to exclusive event",
              price: 150,
              currency: "ALGO",
              image: "/placeholder.jpg",
              category: "event",
              inStock: true,
              rating: 4.8,
              reviews: 24,
              type: "event" as const,
              isEnabled: true,
              allowSwap: false,
              nftCount: 1,
              mintPrice: 150,
              floorPrice: 140,
              topOffer: 160
            },
            {
              id: "2",
              name: "Limited Edition NFT Collection",
              description: "Rare digital collectible",
              price: 500,
              currency: "ALGO",
              image: "/placeholder.jpg",
              category: "nft",
              inStock: true,
              rating: 4.9,
              reviews: 12,
              type: "nft" as const,
              isEnabled: true,
              allowSwap: true,
              nftCount: 5,
              mintPrice: 500,
              floorPrice: 480,
              topOffer: 520
            }
          ])
        }
      }
    } catch (error) {
      console.error("Failed to fetch marketplace data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Render components using template engine
  useEffect(() => {
    if (marketplace && template) {
      try {
        const templateEngine = TemplateEngine.getInstance()
        const rendered = templateEngine.renderMarketplace(marketplace, template, collections)
        setRenderedComponents({
          ...rendered,
          collections: rendered.products // Map products to collections for compatibility
        })
      } catch (error) {
        console.error("Error rendering marketplace with template engine:", error)
      }
    }
  }, [marketplace, template, collections])

  const filteredCollections = collections.filter(collection => {
    const matchesSearch = collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collection.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || collection.category === categoryFilter
    const isEnabled = collection.isEnabled
    return matchesSearch && matchesCategory && isEnabled
  })

  const sortedCollections = [...filteredCollections].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "rating":
        return b.rating - a.rating
      case "reviews":
        return b.reviews - a.reviews
      case "nftCount":
        return b.nftCount - a.nftCount
      default:
        return a.name.localeCompare(b.name)
    }
  })

  // Dynamic styling functions based on template
  const getThemeStyles = () => {
    if (!template || !marketplace) return {}
    
    const theme = template.configuration.theme
    return {
      '--primary-color': theme.primaryColor,
      '--secondary-color': theme.secondaryColor,
      '--accent-color': theme.accentColor,
      '--background-color': theme.backgroundColor,
      '--text-color': theme.textColor,
    } as React.CSSProperties
  }

  const getCardStyle = () => {
    if (!template) return {}
    
    const cardStyle = template.configuration.theme.cardStyle
    const borderRadius = template.configuration.theme.borderRadius
    const primaryColor = template.configuration.theme.primaryColor
    
    const styles: any = {}
    
    if (cardStyle === "elevated") {
      styles.boxShadow = "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
      styles.transform = "translateY(0)"
      styles.transition = "all 0.3s ease"
    } else if (cardStyle === "outlined") {
      styles.border = `2px solid ${primaryColor}30`
      styles.backgroundColor = `${primaryColor}05`
    } else if (cardStyle === "flat") {
      styles.border = "1px solid rgba(0, 0, 0, 0.1)"
      styles.backgroundColor = "white"
    }
    
    if (borderRadius === "none") {
      styles.borderRadius = "0"
    } else if (borderRadius === "small") {
      styles.borderRadius = "6px"
    } else if (borderRadius === "medium") {
      styles.borderRadius = "12px"
    } else if (borderRadius === "large") {
      styles.borderRadius = "20px"
    }
    
    return styles
  }

  const getButtonStyle = (variant: 'primary' | 'secondary' | 'outline' = 'primary') => {
    if (!template) return {}
    
    const theme = template.configuration.theme
    
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.primaryColor,
          color: 'white',
          border: 'none',
          borderRadius: template.configuration.theme.borderRadius === 'large' ? '12px' : '8px',
          transition: 'all 0.3s ease',
          boxShadow: `0 4px 14px 0 ${theme.primaryColor}40`
        }
      case 'secondary':
        return {
          backgroundColor: theme.secondaryColor,
          color: 'white',
          border: 'none',
          borderRadius: template.configuration.theme.borderRadius === 'large' ? '12px' : '8px',
          transition: 'all 0.3s ease'
        }
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: theme.primaryColor,
          border: `2px solid ${theme.primaryColor}`,
          borderRadius: template.configuration.theme.borderRadius === 'large' ? '12px' : '8px',
          transition: 'all 0.3s ease'
        }
      default:
        return {}
    }
  }

  const getHeaderStyle = () => {
    if (!template) return {}
    
    const headerStyle = template.configuration.layout.headerStyle
    const theme = template.configuration.theme
    
    return {
      position: headerStyle === 'fixed' ? 'fixed' as const : 'static' as const,
      top: headerStyle === 'fixed' ? '0' : 'auto',
      left: headerStyle === 'fixed' ? '0' : 'auto',
      right: headerStyle === 'fixed' ? '0' : 'auto',
      zIndex: headerStyle === 'fixed' ? 50 : 'auto',
      backgroundColor: `${theme.backgroundColor}95`,
      backdropFilter: 'blur(10px)',
      borderBottom: `1px solid ${theme.primaryColor}20`
    }
  }

  const getHeroStyle = () => {
    if (!template || !marketplace) return {}
    
    const heroConfig = template.configuration.sections.hero
    const theme = template.configuration.theme
    
    const heightMap = {
      'small': '30vh',
      'medium': '50vh', 
      'large': '70vh',
      'full': '100vh'
    }
    
    return {
      height: heightMap[heroConfig.height],
      background: marketplace.banner 
        ? `url(${marketplace.banner}) center/cover`
        : `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
      position: 'relative' as const,
      display: 'flex' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const
    }
  }

  const getGridLayout = () => {
    if (!template) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    
    const itemsPerRow = template.configuration.sections.products.itemsPerRow
    const layout = template.configuration.sections.products.layout
    
    if (layout === 'list') return 'grid-cols-1'
    
    const gridMap: Record<number, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5',
      6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-6'
    }
    
    return gridMap[itemsPerRow] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  }

  const handlePurchase = async (collectionId: string) => {
    if (!isConnected || !account) {
      alert("Please connect your wallet first")
      return
    }

    setPurchasing(collectionId)
    try {
      const collection = collections.find(c => c.id === collectionId)
      if (!collection) {
        throw new Error("Collection not found")
      }

      // Send Algorand transaction
      const transaction = await sendTransaction(
        marketplace?.walletAddress || "",
        collection.price,
        collection.currency
      )

      // Record the purchase
      const response = await fetch(`/api/marketplaces/${marketplaceId}/collections/${collectionId}/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: 1,
          paymentMethod: "algorand",
          transactionId: transaction.id,
          buyerAddress: account.address
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert(`Purchase successful! Transaction ID: ${transaction.id}`)
        // Refresh collections to update availability
        fetchMarketplaceData()
      } else {
        alert(`Purchase failed: ${data.error}`)
      }
    } catch (error) {
      console.error("Purchase error:", error)
      alert("Purchase failed. Please try again.")
    } finally {
      setPurchasing(null)
    }
  }

  const handleSwap = async (collectionId: string) => {
    if (!isConnected || !account) {
      alert("Please connect your wallet first")
      return
    }

    setSwapping(collectionId)
    try {
      const collection = collections.find(c => c.id === collectionId)
      if (!collection || !collection.nftData) {
        throw new Error("Collection not found or not an NFT collection")
      }

      // Get user's NFTs for selection
      const response = await fetch(`/api/user/nfts?address=${account.address}`)
      const userNFTs = await response.json()

      if (!userNFTs.nfts || userNFTs.nfts.length === 0) {
        alert("You don't have any NFTs to swap")
        return
      }

      // For now, we'll show a simple prompt for demo
      const offeredNftId = prompt("Enter the ID of the NFT you want to offer for swap:")
      const message = prompt("Enter a message for the swap proposal (optional):")

      if (offeredNftId) {
        const swapResponse = await fetch(`/api/marketplaces/${marketplaceId}/collections/${collectionId}/swap`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            offeredNftId,
            message: message || "",
            buyerAddress: account.address,
            collectionAssetId: collection.nftData.assetId
          })
        })

        const data = await swapResponse.json()

        if (swapResponse.ok) {
          alert(`Swap proposal created successfully! Swap ID: ${data.swapId}`)
        } else {
          alert(`Swap proposal failed: ${data.error}`)
        }
      }
    } catch (error) {
      console.error("Swap error:", error)
      alert("Swap proposal failed. Please try again.")
    } finally {
      setSwapping(null)
    }
  }

  const handleMint = async (collectionId: string) => {
    if (!isConnected || !account) {
      alert("Please connect your wallet first")
      return
    }

    setMinting(collectionId)
    try {
      const collection = collections.find(c => c.id === collectionId)
      if (!collection || !collection.nftData) {
        throw new Error("Collection not found or not an NFT collection")
      }

      // Mint NFT using Algorand
      const response = await fetch(`/api/marketplaces/${marketplaceId}/collections/${collectionId}/mint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buyerAddress: account.address,
          assetId: collection.nftData.assetId,
          amount: 1
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert(`NFT minted successfully! Transaction ID: ${data.transactionId}`)
        // Refresh collections to update availability
        fetchMarketplaceData()
      } else {
        alert(`Minting failed: ${data.error}`)
      }
    } catch (error) {
      console.error("Minting error:", error)
      alert("Minting failed. Please try again.")
    } finally {
      setMinting(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading marketplace...</p>
        </div>
      </div>
    )
  }

  if (!marketplace) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Marketplace Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400">The marketplace you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  // Use template engine rendered components if available, otherwise fallback to original
  if (renderedComponents) {
    return (
      <PageTransition>
        <div 
          className="min-h-screen transition-all duration-500"
          style={renderedComponents.styles}
        >
          {renderedComponents.header}
          {renderedComponents.hero}
          {renderedComponents.collections}
          {renderedComponents.footer}
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div 
        className="min-h-screen transition-all duration-500"
        style={getThemeStyles()}
      >
        {/* Dynamic Header */}
        <MarketplaceHeader 
          marketplace={marketplace} 
          merchantId={merchantId} 
          marketplaceId={marketplaceId} 
        />

        {/* Dynamic Hero Section */}
        {template?.configuration.features.heroSection && (
          <motion.section 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`relative overflow-hidden ${template?.configuration.layout.headerStyle === 'fixed' ? 'pt-20' : ''}`}
            style={getHeroStyle()}
          >
            {/* Background */}
            {marketplace.banner ? (
              <div className="absolute inset-0">
                <Image
                  src={marketplace.banner}
                  alt={marketplace.businessName}
                  fill
                  className="object-cover"
                  priority
                />
                {template?.configuration.sections.hero.overlay && (
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
                )}
              </div>
            ) : (
              <div 
                className="absolute inset-0"
                style={{ 
                  background: `linear-gradient(135deg, ${marketplace.primaryColor}, ${marketplace.secondaryColor})` 
                }}
              />
            )}
            
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 20, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="absolute -top-1/2 -right-1/2 w-full h-full opacity-10"
                style={{
                  background: `conic-gradient(from 0deg, ${marketplace.primaryColor}, ${marketplace.secondaryColor}, ${marketplace.primaryColor})`
                }}
              />
            </div>
            
            <div className="relative container mx-auto px-4 lg:px-6 py-16 flex items-center min-h-full">
              <div className="max-w-4xl w-full">
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <Badge 
                    className="mb-4 text-sm px-4 py-2"
                    style={{ 
                      backgroundColor: `${marketplace.primaryColor}20`,
                      color: marketplace.primaryColor,
                      border: `1px solid ${marketplace.primaryColor}30`
                    }}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Premium Marketplace
                  </Badge>
                  
                  <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                    <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                      {marketplace.businessName}
                    </span>
                  </h1>
                  
                  <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl leading-relaxed">
                    {marketplace.description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        size="lg"
                        className="bg-white text-gray-900 hover:bg-gray-100 shadow-xl"
                        style={{ borderRadius: template?.configuration.theme.borderRadius === 'large' ? '16px' : '12px' }}
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Shop Now
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="border-white text-white hover:bg-white/10 backdrop-blur-sm"
                        style={{ borderRadius: template?.configuration.theme.borderRadius === 'large' ? '16px' : '12px' }}
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Watch Demo
                      </Button>
                    </motion.div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                        {collections.length}+
                      </div>
                      <div className="text-sm text-white/70">Collections</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                        4.9
                      </div>
                      <div className="text-sm text-white/70">Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                        24/7
                      </div>
                      <div className="text-sm text-white/70">Support</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                        100%
                      </div>
                      <div className="text-sm text-white/70">Secure</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
            
            {/* Scroll Indicator */}
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            >
              <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white/60 rounded-full mt-2" />
              </div>
            </motion.div>
          </motion.section>
        )}

        {/* Main Content - Details Page Layout with Magic Eden Style */}
        <main 
          className="min-h-screen"
          style={{ 
            backgroundColor: template?.configuration.theme.backgroundColor || '#ffffff',
            color: template?.configuration.theme.textColor || '#000000'
          }}
        >
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
            <div className="grid gap-4 sm:gap-6 lg:gap-8">
              {/* Main Content */}
              <div className="space-y-4 sm:space-y-6">
                {/* Featured Collections Section */}
                <Card 
                  className="border-gray-200 dark:border-gray-700"
                  style={{
                    backgroundColor: template?.configuration.theme.backgroundColor || '#ffffff',
                    borderColor: `${marketplace.primaryColor}20`
                  }}
                >
                  <CardHeader>
                    <CardTitle 
                      className="text-lg sm:text-xl"
                      style={{ color: template?.configuration.theme.textColor || '#000000' }}
                    >
                      Featured Collections
                    </CardTitle>
                    <CardDescription 
                      style={{ color: `${template?.configuration.theme.textColor || '#000000'}80` }}
                    >
                      Top collections from this marketplace
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {collections.length === 0 ? (
                      <div 
                        className="text-center py-8"
                        style={{ color: `${template?.configuration.theme.textColor || '#000000'}80` }}
                      >
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
                            <div 
                              className="block cursor-pointer"
                              onClick={() => {
                                window.location.href = `/marketplace/${merchantId}/${marketplaceId}/collection/${collection.id}`
                              }}
                            >
                              <Card 
                                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
                                style={{
                                  backgroundColor: `${marketplace.primaryColor}05`,
                                  borderColor: `${marketplace.primaryColor}20`
                                }}
                              >
                                <div className="relative aspect-square">
                                  {collection.image ? (
                                    <Image
                                      src={collection.image}
                                      alt={collection.name}
                                      fill
                                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
                                      <Package className="w-16 h-16 text-gray-400" />
                                    </div>
                                  )}
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
                                  <h3 
                                    className="font-semibold mb-1 text-sm sm:text-base"
                                    style={{ color: template?.configuration.theme.textColor || '#000000' }}
                                  >
                                    {collection.name}
                                  </h3>
                                  <p 
                                    className="text-xs sm:text-sm mb-2 line-clamp-2"
                                    style={{ color: `${template?.configuration.theme.textColor || '#000000'}80` }}
                                  >
                                    {collection.description}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <span 
                                      className="text-sm sm:text-lg font-bold"
                                      style={{ color: template?.configuration.theme.textColor || '#000000' }}
                                    >
                                      {collection.mintPrice || 0} ALGO
                                    </span>
                                    <Button 
                                      size="sm" 
                                      className="h-8 w-8 p-0" 
                                      style={{ backgroundColor: marketplace.primaryColor }}
                                    >
                                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Analytics Section */}
                <Card 
                  className="border-gray-200 dark:border-gray-700"
                  style={{
                    backgroundColor: template?.configuration.theme.backgroundColor || '#ffffff',
                    borderColor: `${marketplace.primaryColor}20`
                  }}
                >
                  <CardHeader>
                    <CardTitle 
                      className="text-lg sm:text-xl"
                      style={{ color: template?.configuration.theme.textColor || '#000000' }}
                    >
                      Marketplace Analytics
                    </CardTitle>
                    <CardDescription 
                      style={{ color: `${template?.configuration.theme.textColor || '#000000'}80` }}
                    >
                      Key metrics and performance data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
                      <div 
                        className="text-center p-3 sm:p-4 rounded-lg"
                        style={{
                          backgroundColor: `${marketplace.primaryColor}10`,
                          borderColor: `${marketplace.primaryColor}20`
                        }}
                      >
                        <div 
                          className="text-lg sm:text-2xl font-bold mb-1"
                          style={{ color: template?.configuration.theme.textColor || '#000000' }}
                        >
                          {collections.length}
                        </div>
                        <div 
                          className="text-xs sm:text-sm"
                          style={{ color: `${template?.configuration.theme.textColor || '#000000'}80` }}
                        >
                          Total Collections
                        </div>
                      </div>
                      <div 
                        className="text-center p-3 sm:p-4 rounded-lg"
                        style={{
                          backgroundColor: `${marketplace.primaryColor}10`,
                          borderColor: `${marketplace.primaryColor}20`
                        }}
                      >
                        <div 
                          className="text-lg sm:text-2xl font-bold mb-1"
                          style={{ color: template?.configuration.theme.textColor || '#000000' }}
                        >
                          {collections.length}
                        </div>
                        <div 
                          className="text-xs sm:text-sm"
                          style={{ color: `${template?.configuration.theme.textColor || '#000000'}80` }}
                        >
                          Collections
                        </div>
                      </div>
                      <div 
                        className="text-center p-3 sm:p-4 rounded-lg"
                        style={{
                          backgroundColor: `${marketplace.primaryColor}10`,
                          borderColor: `${marketplace.primaryColor}20`
                        }}
                      >
                        <div 
                          className="text-lg sm:text-2xl font-bold mb-1"
                          style={{ color: template?.configuration.theme.textColor || '#000000' }}
                        >
                          {Math.floor(Math.random() * 1000 + 100)}
                        </div>
                        <div 
                          className="text-xs sm:text-sm"
                          style={{ color: `${template?.configuration.theme.textColor || '#000000'}80` }}
                        >
                          Total Sales
                        </div>
                      </div>
                      <div 
                        className="text-center p-3 sm:p-4 rounded-lg"
                        style={{
                          backgroundColor: `${marketplace.primaryColor}10`,
                          borderColor: `${marketplace.primaryColor}20`
                        }}
                      >
                        <div 
                          className="text-lg sm:text-2xl font-bold mb-1"
                          style={{ color: template?.configuration.theme.textColor || '#000000' }}
                        >
                          {Math.floor(Math.random() * 100 + 1)}%
                        </div>
                        <div 
                          className="text-xs sm:text-sm"
                          style={{ color: `${template?.configuration.theme.textColor || '#000000'}80` }}
                        >
                          Listed
                        </div>
                      </div>
                      <div 
                        className="text-center p-3 sm:p-4 rounded-lg"
                        style={{
                          backgroundColor: `${marketplace.primaryColor}10`,
                          borderColor: `${marketplace.primaryColor}20`
                        }}
                      >
                        <div 
                          className="text-lg sm:text-2xl font-bold mb-1"
                          style={{ color: template?.configuration.theme.textColor || '#000000' }}
                        >
                          {Math.floor(Math.random() * 1000 + 500)}
                        </div>
                        <div 
                          className="text-xs sm:text-sm"
                          style={{ color: `${template?.configuration.theme.textColor || '#000000'}80` }}
                        >
                          Holders
                        </div>
                      </div>
                      <div 
                        className="text-center p-3 sm:p-4 rounded-lg"
                        style={{
                          backgroundColor: `${marketplace.primaryColor}10`,
                          borderColor: `${marketplace.primaryColor}20`
                        }}
                      >
                        <div 
                          className="text-lg sm:text-2xl font-bold mb-1"
                          style={{ color: template?.configuration.theme.textColor || '#000000' }}
                        >
                          {Math.floor(Math.random() * 20 + 1)}%
                        </div>
                        <div 
                          className="text-xs sm:text-sm"
                          style={{ color: `${template?.configuration.theme.textColor || '#000000'}80` }}
                        >
                          Floor Change
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Collections Table */}
                <Card 
                  className="border-gray-200 dark:border-gray-700"
                  style={{
                    backgroundColor: template?.configuration.theme.backgroundColor || '#ffffff',
                    borderColor: `${marketplace.primaryColor}20`
                  }}
                >
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                      <div>
                        <CardTitle 
                          className="text-lg sm:text-xl"
                          style={{ color: template?.configuration.theme.textColor || '#000000' }}
                        >
                          Collections
                        </CardTitle>
                        <CardDescription 
                          className="text-sm"
                          style={{ color: `${template?.configuration.theme.textColor || '#000000'}80` }}
                        >
                          Browse all collections in this marketplace
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value="ALGO" onValueChange={() => {}}>
                          <SelectTrigger className="w-20 h-8 sm:h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALGO">ALGO</SelectItem>
                            <SelectItem value="ETH">ETH</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {sortedCollections.length === 0 ? (
                      <div 
                        className="text-center py-8"
                        style={{ color: `${template?.configuration.theme.textColor || '#000000'}80` }}
                      >
                        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No collections available yet</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr 
                              className="border-b"
                              style={{ borderColor: `${marketplace.primaryColor}20` }}
                            >
                              <th 
                                className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm"
                                style={{ color: `${template?.configuration.theme.textColor || '#000000'}80` }}
                              >
                                #
                              </th>
                              <th 
                                className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm"
                                style={{ color: `${template?.configuration.theme.textColor || '#000000'}80` }}
                              >
                                Collection
                              </th>
                              <th 
                                className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm hidden sm:table-cell"
                                style={{ color: `${template?.configuration.theme.textColor || '#000000'}80` }}
                              >
                                Floor
                              </th>
                              <th 
                                className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm hidden lg:table-cell"
                                style={{ color: `${template?.configuration.theme.textColor || '#000000'}80` }}
                              >
                                Top Offer
                              </th>
                              <th 
                                className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm hidden lg:table-cell"
                                style={{ color: `${template?.configuration.theme.textColor || '#000000'}80` }}
                              >
                                Floor 1d %
                              </th>
                              <th 
                                className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm hidden sm:table-cell"
                                style={{ color: `${template?.configuration.theme.textColor || '#000000'}80` }}
                              >
                                Volume
                              </th>
                              <th 
                                className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm hidden lg:table-cell"
                                style={{ color: `${template?.configuration.theme.textColor || '#000000'}80` }}
                              >
                                Sales
                              </th>
                              <th 
                                className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm hidden lg:table-cell"
                                style={{ color: `${template?.configuration.theme.textColor || '#000000'}80` }}
                              >
                                Listed
                              </th>
                              <th 
                                className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm hidden xl:table-cell"
                                style={{ color: `${template?.configuration.theme.textColor || '#000000'}80` }}
                              >
                                Last 1d
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedCollections.map((collection, index) => (
                              <motion.tr
                                key={collection.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="border-b cursor-pointer hover:opacity-80 transition-opacity"
                                style={{
                                  borderColor: `${marketplace.primaryColor}10`
                                }}
                                onClick={() => {
                                  window.location.href = `/marketplace/${merchantId}/${marketplaceId}/collection/${collection.id}`
                                }}
                              >
                                <td 
                                  className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm"
                                  style={{ color: `${template?.configuration.theme.textColor || '#000000'}80` }}
                                >
                                  {index + 1}
                                </td>
                                <td className="py-2 sm:py-4 px-2 sm:px-4">
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="relative w-8 h-8 sm:w-12 sm:h-12 rounded-lg overflow-hidden">
                                      {collection.image ? (
                                        <Image
                                          src={collection.image}
                                          alt={collection.name}
                                          fill
                                          className="object-cover"
                                        />
                                      ) : (
                                        <div 
                                          className="w-full h-full flex items-center justify-center"
                                          style={{
                                            background: `linear-gradient(135deg, ${marketplace.primaryColor}, ${marketplace.secondaryColor})`
                                          }}
                                        >
                                          <Package className="w-4 h-4 text-white" />
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <div 
                                        className="font-medium text-xs sm:text-sm"
                                        style={{ color: template?.configuration.theme.textColor || '#000000' }}
                                      >
                                        {collection.name}
                                      </div>
                                      <div 
                                        className="text-xs sm:text-sm"
                                        style={{ color: `${template?.configuration.theme.textColor || '#000000'}80` }}
                                      >
                                        {collection.nftCount} NFTs
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2 sm:py-4 px-2 sm:px-4 hidden sm:table-cell">
                                  <div 
                                    className="font-medium text-xs sm:text-sm"
                                    style={{ color: template?.configuration.theme.textColor || '#000000' }}
                                  >
                                    {collection.floorPrice || collection.price} ALGO
                                  </div>
                                </td>
                                <td className="py-2 sm:py-4 px-2 sm:px-4 hidden lg:table-cell">
                                  <div 
                                    className="text-xs sm:text-sm"
                                    style={{ color: `${template?.configuration.theme.textColor || '#000000'}80` }}
                                  >
                                    {collection.topOffer ? `${collection.topOffer} ALGO` : '--'}
                                  </div>
                                </td>
                                <td className="py-2 sm:py-4 px-2 sm:px-4 hidden lg:table-cell">
                                  <div className="flex items-center gap-1 text-xs sm:text-sm text-green-600">
                                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="font-medium">
                                      {Math.abs(Math.random() * 20 - 10).toFixed(1)}%
                                    </span>
                                  </div>
                                </td>
                                <td className="py-2 sm:py-4 px-2 sm:px-4 hidden sm:table-cell">
                                  <div 
                                    className="font-medium text-xs sm:text-sm"
                                    style={{ color: template?.configuration.theme.textColor || '#000000' }}
                                  >
                                    {Math.floor(Math.random() * 1000 + 100)} ALGO
                                  </div>
                                </td>
                                <td className="py-2 sm:py-4 px-2 sm:px-4 hidden lg:table-cell">
                                  <div 
                                    className="text-xs sm:text-sm"
                                    style={{ color: `${template?.configuration.theme.textColor || '#000000'}80` }}
                                  >
                                    {Math.floor(Math.random() * 100 + 1)}
                                  </div>
                                </td>
                                <td className="py-2 sm:py-4 px-2 sm:px-4 hidden lg:table-cell">
                                  <div 
                                    className="text-xs sm:text-sm"
                                    style={{ color: `${template?.configuration.theme.textColor || '#000000'}80` }}
                                  >
                                    {Math.floor(Math.random() * 20 + 1)}%
                                  </div>
                                </td>
                                <td className="py-2 sm:py-4 px-2 sm:px-4 hidden xl:table-cell">
                                  <div 
                                    className="w-12 sm:w-16 h-6 sm:h-8 rounded flex items-center justify-center"
                                    style={{ backgroundColor: marketplace.primaryColor }}
                                  >
                                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                  </div>
                                </td>
                              </motion.tr>
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
        </main>

        {/* Collection Detail Modal */}
        <Dialog open={!!selectedCollection} onOpenChange={() => setSelectedCollection(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedCollection && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Collection Image */}
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={selectedCollection.image}
                      alt={selectedCollection.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {!selectedCollection.inStock && (
                        <Badge variant="destructive">Out of Stock</Badge>
                      )}
                      {selectedCollection.allowSwap && (
                        <Badge 
                          style={{ 
                            backgroundColor: `${marketplace.primaryColor}90`,
                            color: 'white'
                          }}
                        >
                          <ArrowLeftRight className="w-3 h-3 mr-1" />
                          Swappable
                        </Badge>
                      )}
                      <Badge 
                        style={{ 
                          backgroundColor: `${marketplace.primaryColor}90`,
                          color: 'white'
                        }}
                      >
                        {selectedCollection.nftCount} NFTs
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Collection Details */}
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">{selectedCollection.name}</h2>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                          <span className="font-medium">{selectedCollection.rating}</span>
                          <span className="text-gray-500">({selectedCollection.reviews} reviews)</span>
                        </div>
                        <Badge 
                          style={{ 
                            backgroundColor: `${marketplace.secondaryColor}20`,
                            color: marketplace.secondaryColor
                          }}
                        >
                          {selectedCollection.type}
                        </Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {selectedCollection.description}
                      </p>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-4xl font-bold">{selectedCollection.price}</span>
                          <span className="text-lg text-gray-500 ml-2">{selectedCollection.currency}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Category</div>
                          <div className="font-medium">{selectedCollection.category}</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button 
                          size="lg"
                          disabled={!selectedCollection.inStock || purchasing === selectedCollection.id}
                          style={getButtonStyle('primary')}
                          onClick={() => handlePurchase(selectedCollection.id)}
                          className="flex-1"
                        >
                          {purchasing === selectedCollection.id ? (
                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          ) : (
                            <ShoppingCart className="w-5 h-5 mr-2" />
                          )}
                          {!selectedCollection.inStock ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                        
                        {selectedCollection.type === "nft" && marketplace.allowSwap && selectedCollection.allowSwap && (
                          <Button 
                            size="lg"
                            variant="outline"
                            disabled={swapping === selectedCollection.id}
                            style={getButtonStyle('outline')}
                            onClick={() => handleSwap(selectedCollection.id)}
                          >
                            {swapping === selectedCollection.id ? (
                              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                            ) : (
                              <ArrowLeftRight className="w-5 h-5 mr-2" />
                            )}
                            Swap
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dynamic Footer */}
        {template?.configuration.features.socialLinks && (
          <motion.footer 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="border-t border-gray-200 dark:border-gray-700 py-12 mt-16"
            style={{ backgroundColor: template?.configuration.theme.backgroundColor || "#F9FAFB" }}
          >
            <div className="container mx-auto px-4 lg:px-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Brand Section */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                    {marketplace.logo ? (
                      <Image
                        src={marketplace.logo}
                        alt={marketplace.businessName}
                        width={40}
                        height={40}
                        className="rounded-lg"
                      />
                    ) : (
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ 
                          background: `linear-gradient(135deg, ${marketplace.primaryColor}, ${marketplace.secondaryColor})` 
                        }}
                      >
                        {marketplace.businessName.charAt(0)}
                      </div>
                    )}
                    <h3 className="font-bold text-xl">{marketplace.businessName}</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                    {marketplace.description}
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      style={getButtonStyle('outline')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      style={getButtonStyle('outline')}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      style={getButtonStyle('outline')}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Quick Links */}
                <div>
                  <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Quick Links</h4>
                  <div className="space-y-3">
                    <Link href="#collections" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      Collections
                    </Link>
                    <Link href="#about" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      About Us
                    </Link>
                    <Link href="#contact" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      Contact
                    </Link>
                    <Link href="#support" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      Support
                    </Link>
                  </div>
                </div>
                
                {/* Contact Info */}
                <div>
                  <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Contact Info</h4>
                  <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>info@{marketplace.businessName.toLowerCase().replace(/\s+/g, '')}.com</span>
                    </div>
                    {marketplace.website && (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        <Link href={marketplace.website} target="_blank" className="hover:underline">
                          Visit Website
                        </Link>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>Secure Payments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>24/7 Support</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bottom Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>&copy; 2024 {marketplace.businessName}. All rights reserved.</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <Link href="#privacy" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      Privacy Policy
                    </Link>
                    <Link href="#terms" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      Terms of Service
                    </Link>
                    <Link href="#cookies" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      Cookie Policy
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.footer>
        )}
        
        {/* Dynamic Footer */}
        <MarketplaceFooter marketplace={marketplace} />
      </div>
    </PageTransition>
  )
}
