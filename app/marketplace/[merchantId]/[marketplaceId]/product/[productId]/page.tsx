"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  ArrowLeft,
  ShoppingCart, 
  Heart, 
  Share2, 
  ExternalLink, 
  Star, 
  Users, 
  Calendar, 
  MapPin, 
  RefreshCw,
  ArrowLeftRight,
  Zap,
  Eye,
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
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button"
import { useWallet } from "@/hooks/use-wallet"
import { useAuth } from "@/lib/auth/auth-context"

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
  images: string[]
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
  specifications?: {
    [key: string]: string
  }
  features?: string[]
  tags?: string[]
}

export default function ProductDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const merchantId = params.merchantId as string
  const marketplaceId = params.marketplaceId as string
  const productId = params.productId as string

  const [marketplace, setMarketplace] = useState<Marketplace | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [swapping, setSwapping] = useState(false)
  const [minting, setMinting] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Wallet and auth hooks
  const { isConnected, account, balance, connect, disconnect, sendTransaction } = useWallet()
  const { user, isAuthenticated } = useAuth()

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
        } else {
          // Fallback to mock data if API fails
          setProduct({
            id: productId,
            name: "Premium Event Ticket",
            description: "VIP access to exclusive event with backstage passes and meet & greet opportunities",
            price: 150,
            currency: "ALGO",
            images: ["/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg"],
            category: "event",
            inStock: true,
            rating: 4.8,
            reviews: 24,
            type: "event" as const,
            isEnabled: true,
            allowSwap: false,
            eventData: {
              date: "2024-12-25",
              location: "Madison Square Garden, NYC",
              totalSupply: 100,
              availableSupply: 75,
              nftAssetId: 12345
            },
            specifications: {
              "Event Type": "Concert",
              "Duration": "3 hours",
              "Age Restriction": "18+",
              "Dress Code": "Smart Casual"
            },
            features: [
              "VIP Backstage Access",
              "Meet & Greet with Artist",
              "Exclusive Merchandise",
              "Premium Seating"
            ],
            tags: ["VIP", "Exclusive", "Limited Edition", "Backstage"]
          })
        }
      }
    } catch (error) {
      console.error("Failed to fetch product data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!isConnected || !account) {
      alert("Please connect your wallet first")
      return
    }

    setPurchasing(true)
    try {
      if (!product) return

      // Send Algorand transaction
      const transaction = await sendTransaction(
        marketplace?.walletAddress || "",
        product.price,
        product.currency
      )

      // Record the purchase
      const response = await fetch(`/api/marketplaces/${marketplaceId}/products/${productId}/purchase`, {
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
        // Refresh product data
        fetchProductData()
      } else {
        alert(`Purchase failed: ${data.error}`)
      }
    } catch (error) {
      console.error("Purchase error:", error)
      alert("Purchase failed. Please try again.")
    } finally {
      setPurchasing(false)
    }
  }

  const handleSwap = async () => {
    if (!isConnected || !account) {
      alert("Please connect your wallet first")
      return
    }

    setSwapping(true)
    try {
      if (!product || !product.nftData) {
        throw new Error("Product not found or not an NFT")
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
        const swapResponse = await fetch(`/api/marketplaces/${marketplaceId}/products/${productId}/swap`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            offeredNftId,
            message: message || "",
            buyerAddress: account.address,
            productAssetId: product.nftData.assetId
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
      setSwapping(false)
    }
  }

  const handleMint = async () => {
    if (!isConnected || !account) {
      alert("Please connect your wallet first")
      return
    }

    setMinting(true)
    try {
      if (!product || !product.nftData) {
        throw new Error("Product not found or not an NFT")
      }

      // Mint NFT using Algorand
      const response = await fetch(`/api/marketplaces/${marketplaceId}/products/${productId}/mint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buyerAddress: account.address,
          assetId: product.nftData.assetId,
          amount: 1
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert(`NFT minted successfully! Transaction ID: ${data.transactionId}`)
        // Refresh product data
        fetchProductData()
      } else {
        alert(`Minting failed: ${data.error}`)
      }
    } catch (error) {
      console.error("Minting error:", error)
      alert("Minting failed. Please try again.")
    } finally {
      setMinting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (!product || !marketplace) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Product Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400">The product you're looking for doesn't exist or has been removed.</p>
          <Button 
            onClick={() => router.back()} 
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <motion.header 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white dark:bg-gray-800 shadow-sm border-b"
        >
          <div className="container mx-auto px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
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
                    <h1 className="text-lg font-bold">{marketplace.businessName}</h1>
                    <p className="text-sm text-gray-500">{marketplace.category}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Heart className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <WalletConnectButton variant="outline" size="sm" />
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="container mx-auto px-4 lg:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <Image
                  src={product.images[selectedImageIndex]}
                  alt={product.name}
                  fill
                  className="object-cover cursor-pointer"
                  onClick={() => setShowImageModal(true)}
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  {!product.inStock && (
                    <Badge variant="destructive">Out of Stock</Badge>
                  )}
                  {product.allowSwap && (
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
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-4 right-4"
                  onClick={() => setShowImageModal(true)}
                >
                  <Maximize2 className="w-4 h-4 mr-2" />
                  View Full Size
                </Button>
              </div>

              {/* Thumbnail Images */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      className={`relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer border-2 ${
                        selectedImageIndex === index ? 'border-blue-500' : 'border-transparent'
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Details */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {product.name}
                    </h1>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="font-medium">{product.rating}</span>
                        <span className="text-gray-500">({product.reviews} reviews)</span>
                      </div>
                      <Badge 
                        style={{ 
                          backgroundColor: `${marketplace.secondaryColor}20`,
                          color: marketplace.secondaryColor
                        }}
                      >
                        {product.type}
                      </Badge>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  {product.description}
                </p>

                {/* Price and Actions */}
                <div className="border-t pt-6 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <span className="text-4xl font-bold">{product.price}</span>
                      <span className="text-lg text-gray-500 ml-2">{product.currency}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Category</div>
                      <div className="font-medium">{product.category}</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      size="lg"
                      disabled={!product.inStock || purchasing || !isConnected}
                      style={{
                        backgroundColor: marketplace.primaryColor,
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        transition: 'all 0.3s ease',
                        boxShadow: `0 4px 14px 0 ${marketplace.primaryColor}40`
                      }}
                      onClick={() => {
                        if (!isConnected) {
                          connect()
                          return
                        }
                        handlePurchase()
                      }}
                      className="flex-1"
                    >
                      {purchasing ? (
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <ShoppingCart className="w-5 h-5 mr-2" />
                      )}
                      {!isConnected ? 'Connect to Buy' : purchasing ? 'Processing...' : !product.inStock ? 'Out of Stock' : 'Buy Now'}
                    </Button>
                    
                    {product.type === "nft" && marketplace.allowSwap && product.allowSwap && (
                      <Button 
                        size="lg"
                        variant="outline"
                        disabled={swapping || !isConnected}
                        style={{
                          backgroundColor: 'transparent',
                          color: marketplace.primaryColor,
                          border: `2px solid ${marketplace.primaryColor}`,
                          borderRadius: '12px',
                          transition: 'all 0.3s ease'
                        }}
                        onClick={() => {
                          if (!isConnected) {
                            connect()
                            return
                          }
                          handleSwap()
                        }}
                      >
                        {swapping ? (
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                          <ArrowLeftRight className="w-5 h-5 mr-2" />
                        )}
                        {!isConnected ? 'Connect to Swap' : swapping ? 'Processing...' : 'Swap'}
                      </Button>
                    )}

                    {product.type === "nft" && product.nftData && (
                      <Button 
                        size="lg"
                        variant="outline"
                        disabled={minting || !isConnected}
                        style={{
                          backgroundColor: 'transparent',
                          color: marketplace.secondaryColor,
                          border: `2px solid ${marketplace.secondaryColor}`,
                          borderRadius: '12px',
                          transition: 'all 0.3s ease'
                        }}
                        onClick={() => {
                          if (!isConnected) {
                            connect()
                            return
                          }
                          handleMint()
                        }}
                      >
                        {minting ? (
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                          <Zap className="w-5 h-5 mr-2" />
                        )}
                        {!isConnected ? 'Connect to Mint' : minting ? 'Processing...' : 'Mint'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="specifications">Specs</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Product Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Type</h4>
                          <p className="text-gray-600 dark:text-gray-400 capitalize">{product.type}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Category</h4>
                          <p className="text-gray-600 dark:text-gray-400 capitalize">{product.category}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Rating</h4>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-gray-600 dark:text-gray-400">{product.rating} ({product.reviews} reviews)</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Availability</h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="specifications" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Specifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {product.specifications ? (
                        <div className="space-y-3">
                          {Object.entries(product.specifications).map(([key, value]) => (
                            <div key={key} className="flex justify-between py-2 border-b">
                              <span className="font-medium text-gray-900 dark:text-white">{key}</span>
                              <span className="text-gray-600 dark:text-gray-400">{value}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No specifications available</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="features" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {product.features ? (
                        <ul className="space-y-2">
                          {product.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500">No features listed</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Reviews ({product.reviews})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No reviews yet</p>
                        <p className="text-sm text-gray-400">Be the first to review this product!</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </main>

        {/* Image Modal */}
        <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>{product.name}</DialogTitle>
            </DialogHeader>
            <div className="relative aspect-square">
              <Image
                src={product.images[selectedImageIndex]}
                alt={product.name}
                fill
                className="object-contain"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className={`relative w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer border-2 ${
                      selectedImageIndex === index ? 'border-blue-500' : 'border-transparent'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  )
}