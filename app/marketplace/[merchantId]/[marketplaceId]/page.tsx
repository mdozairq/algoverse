"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  MessageSquareLock
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/page-transition"
import { useParams } from "next/navigation"
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
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [swapping, setSwapping] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

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
        
        // Fetch marketplace products from API
        const productsRes = await fetch(`/api/marketplaces/${marketplaceId}/products`)
        const productsData = await productsRes.json()
        
        if (productsRes.ok) {
          setProducts(productsData.products || [])
        } else {
          // Fallback to mock data if API fails
          setProducts([
            {
              id: "1",
              name: "Premium Event Ticket",
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
              allowSwap: false
            },
            {
              id: "2",
              name: "Limited Edition NFT",
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
              allowSwap: true
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    const isEnabled = product.isEnabled
    return matchesSearch && matchesCategory && isEnabled
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "rating":
        return b.rating - a.rating
      case "reviews":
        return b.reviews - a.reviews
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

  const handlePurchase = async (productId: string) => {
    setPurchasing(productId)
    try {
      const response = await fetch(`/api/marketplaces/${marketplaceId}/products/${productId}/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: 1,
          paymentMethod: "algorand"
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert(`Purchase successful! Transaction ID: ${data.transactionId}`)
        // Refresh products to update availability
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

  const handleSwap = async (productId: string) => {
    setSwapping(productId)
    try {
      // For now, we'll show a simple prompt for demo
      const offeredNftId = prompt("Enter the ID of the NFT you want to offer for swap:")
      const message = prompt("Enter a message for the swap proposal (optional):")

      if (offeredNftId) {
        const response = await fetch(`/api/marketplaces/${marketplaceId}/products/${productId}/swap`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            offeredNftId,
            message: message || ""
          })
        })

        const data = await response.json()

        if (response.ok) {
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

  return (
    <PageTransition>
      <div 
        className="min-h-screen transition-all duration-500"
        style={getThemeStyles()}
      >
        {/* Dynamic Header */}
        <motion.header 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={getHeaderStyle()}
          className="w-full"
        >
          <div className="container mx-auto px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo and Brand */}
              <motion.div 
                className="flex items-center gap-4"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                {marketplace.logo ? (
                  <div className="relative">
                    <Image
                      src={marketplace.logo}
                      alt={marketplace.businessName}
                      width={48}
                      height={48}
                      className="rounded-xl shadow-lg"
                    />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                  </div>
                ) : (
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${marketplace.primaryColor}, ${marketplace.secondaryColor})` 
                    }}
                  >
                    {marketplace.businessName.charAt(0)}
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
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
              </motion.div>
              
              {/* Navigation */}
              <div className="hidden md:flex items-center gap-4">
                <nav className="flex items-center gap-6">
                  <Link href="#products" className="text-sm font-medium hover:opacity-80 transition-opacity">
                    Products
                  </Link>
                  <Link href="#about" className="text-sm font-medium hover:opacity-80 transition-opacity">
                    About
                  </Link>
                  <Link href="#contact" className="text-sm font-medium hover:opacity-80 transition-opacity">
                    Contact
                  </Link>
                </nav>
                
                <div className="flex items-center gap-2">
                  {marketplace.website && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                      style={getButtonStyle('outline')}
                    >
                      <Link href={marketplace.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Website
                      </Link>
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    style={getButtonStyle('outline')}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button 
                    size="sm"
                    style={getButtonStyle('primary')}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Cart
                  </Button>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="md:hidden overflow-hidden"
                >
                  <div className="py-4 space-y-4 border-t border-gray-200 mt-4">
                    <nav className="flex flex-col gap-3">
                      <Link href="#products" className="text-sm font-medium hover:opacity-80 transition-opacity">
                        Products
                      </Link>
                      <Link href="#about" className="text-sm font-medium hover:opacity-80 transition-opacity">
                        About
                      </Link>
                      <Link href="#contact" className="text-sm font-medium hover:opacity-80 transition-opacity">
                        Contact
                      </Link>
                    </nav>
                    <div className="flex flex-col gap-2">
                      {marketplace.website && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          asChild
                          style={getButtonStyle('outline')}
                        >
                          <Link href={marketplace.website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Website
                          </Link>
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        style={getButtonStyle('outline')}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <Button 
                        size="sm"
                        style={getButtonStyle('primary')}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Cart
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.header>

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
                        {products.length}+
                      </div>
                      <div className="text-sm text-white/70">Products</div>
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

        {/* Main Content */}
        <main className="container mx-auto px-4 lg:px-6 py-8">
          {/* Dynamic Search and Filters */}
          {template?.configuration.sections.products.showFilters && (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="mb-8 shadow-lg" style={getCardStyle()}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search products..."
                        className="pl-10 pr-4 py-3"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ borderRadius: template?.configuration.theme.borderRadius === 'large' ? '12px' : '8px' }}
                      />
                    </div>
                    
                    {/* Filter Controls */}
                    <div className="flex flex-wrap gap-3 items-center">
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-48">
                          <Filter className="h-4 w-4 mr-2 text-gray-500" />
                          <SelectValue placeholder="Filter by Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="event">Events</SelectItem>
                          <SelectItem value="nft">NFTs</SelectItem>
                          <SelectItem value="merchandise">Merchandise</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-48">
                          <SlidersHorizontal className="h-4 w-4 mr-2 text-gray-500" />
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="price-low">Price: Low to High</SelectItem>
                          <SelectItem value="price-high">Price: High to Low</SelectItem>
                          <SelectItem value="rating">Rating</SelectItem>
                          <SelectItem value="reviews">Reviews</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {/* View Mode Toggle */}
                      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                        <Button
                          variant={viewMode === 'grid' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('grid')}
                          style={viewMode === 'grid' ? getButtonStyle('primary') : {}}
                        >
                          <Grid3X3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={viewMode === 'list' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('list')}
                          style={viewMode === 'list' ? getButtonStyle('primary') : {}}
                        >
                          <List className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Active Filters */}
                  {(searchTerm || categoryFilter !== 'all') && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <div className="flex flex-wrap gap-2">
                        {searchTerm && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            Search: "{searchTerm}"
                            <X 
                              className="w-3 h-3 cursor-pointer" 
                              onClick={() => setSearchTerm('')}
                            />
                          </Badge>
                        )}
                        {categoryFilter !== 'all' && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            Category: {categoryFilter}
                            <X 
                              className="w-3 h-3 cursor-pointer" 
                              onClick={() => setCategoryFilter('all')}
                            />
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Dynamic Products Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Products & NFTs
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Package className="w-4 h-4" />
                <span>{sortedProducts.length} items</span>
              </div>
            </div>
            
            <StaggerContainer 
              className={`grid gap-6 ${
                viewMode === 'list' 
                  ? 'grid-cols-1' 
                  : getGridLayout()
              }`}
            >
              {sortedProducts.map((product, index) => (
                <StaggerItem key={product.id}>
                  <motion.div
                    whileHover={{ 
                      scale: 1.02,
                      y: -5
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="h-full"
                    transition={{ duration: 0.2 }}
                  >
                    <Card 
                      className={`overflow-hidden h-full group cursor-pointer ${
                        viewMode === 'list' ? 'flex flex-row' : ''
                      }`}
                      style={{
                        ...getCardStyle(),
                        borderColor: `${marketplace.primaryColor}20`
                      }}
                      onClick={() => setSelectedProduct(product)}
                    >
                      {/* Product Image */}
                      <div className={`relative ${
                        viewMode === 'list' 
                          ? 'w-48 h-32 flex-shrink-0' 
                          : 'aspect-square'
                      } bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900`}>
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Overlay Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {!product.inStock && (
                            <Badge variant="destructive" className="text-xs">
                              Out of Stock
                            </Badge>
                          )}
                          {product.allowSwap && (
                            <Badge 
                              className="text-xs"
                              style={{ 
                                backgroundColor: `${marketplace.secondaryColor}90`,
                                color: 'white'
                              }}
                            >
                              <ArrowLeftRight className="w-3 h-3 mr-1" />
                              Swappable
                            </Badge>
                          )}
                        </div>
                        
                        {/* Quick Actions Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="bg-white/90 hover:bg-white"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="bg-white/90 hover:bg-white"
                            >
                              <Heart className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="bg-white/90 hover:bg-white"
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                        <CardHeader className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg line-clamp-2 mb-1">
                                {product.name}
                              </CardTitle>
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {product.description}
                              </p>
                            </div>
                            <Badge 
                              className="text-xs ml-2 flex-shrink-0"
                              style={{ 
                                backgroundColor: `${marketplace.secondaryColor}20`,
                                color: marketplace.secondaryColor
                              }}
                            >
                              {product.type}
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="p-4 pt-0">
                          {/* Rating and Reviews */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium">{product.rating}</span>
                              <span className="text-xs text-gray-500">({product.reviews})</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Eye className="w-3 h-3" />
                              <span>1.2k views</span>
                            </div>
                          </div>
                          
                          {/* Price and Actions */}
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-2xl font-bold">{product.price}</span>
                              <span className="text-sm text-gray-500 ml-1">{product.currency}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm"
                                disabled={!product.inStock || purchasing === product.id}
                                style={getButtonStyle('primary')}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handlePurchase(product.id)
                                }}
                              >
                                {purchasing === product.id ? (
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <ShoppingCart className="w-4 h-4 mr-2" />
                                )}
                                Buy
                              </Button>
                              
                              {product.type === "nft" && marketplace.allowSwap && product.allowSwap && (
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  disabled={swapping === product.id}
                                  style={getButtonStyle('outline')}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleSwap(product.id)
                                  }}
                                >
                                  {swapping === product.id ? (
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                  ) : (
                                    <ArrowLeftRight className="w-4 h-4 mr-2" />
                                  )}
                                  Swap
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </motion.div>

          {sortedProducts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Store className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">No products found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Try adjusting your search or filter criteria to find what you're looking for.
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setCategoryFilter('all')
                }}
                style={getButtonStyle('outline')}
              >
                Clear Filters
              </Button>
            </motion.div>
          )}
        </main>

        {/* Product Detail Modal */}
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedProduct && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {!selectedProduct.inStock && (
                        <Badge variant="destructive">Out of Stock</Badge>
                      )}
                      {selectedProduct.allowSwap && (
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
                    </div>
                  </div>
                  
                  {/* Product Details */}
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">{selectedProduct.name}</h2>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                          <span className="font-medium">{selectedProduct.rating}</span>
                          <span className="text-gray-500">({selectedProduct.reviews} reviews)</span>
                        </div>
                        <Badge 
                          style={{ 
                            backgroundColor: `${marketplace.secondaryColor}20`,
                            color: marketplace.secondaryColor
                          }}
                        >
                          {selectedProduct.type}
                        </Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {selectedProduct.description}
                      </p>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-4xl font-bold">{selectedProduct.price}</span>
                          <span className="text-lg text-gray-500 ml-2">{selectedProduct.currency}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Category</div>
                          <div className="font-medium">{selectedProduct.category}</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button 
                          size="lg"
                          disabled={!selectedProduct.inStock || purchasing === selectedProduct.id}
                          style={getButtonStyle('primary')}
                          onClick={() => handlePurchase(selectedProduct.id)}
                          className="flex-1"
                        >
                          {purchasing === selectedProduct.id ? (
                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          ) : (
                            <ShoppingCart className="w-5 h-5 mr-2" />
                          )}
                          {!selectedProduct.inStock ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                        
                        {selectedProduct.type === "nft" && marketplace.allowSwap && selectedProduct.allowSwap && (
                          <Button 
                            size="lg"
                            variant="outline"
                            disabled={swapping === selectedProduct.id}
                            style={getButtonStyle('outline')}
                            onClick={() => handleSwap(selectedProduct.id)}
                          >
                            {swapping === selectedProduct.id ? (
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
                    <Link href="#products" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      Products
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
      </div>
    </PageTransition>
  )
}
