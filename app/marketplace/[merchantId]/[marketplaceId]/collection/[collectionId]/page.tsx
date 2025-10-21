"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  Plus,
  Search,
  Package,
  Eye,
  Heart,
  Share2,
  Activity,
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
  Zap,
  RefreshCw,
  ExternalLink,
  Copy,
  Download,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Shield,
  Lock,
  Globe
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/page-transition"
import Image from "next/image"
import { useWallet } from "@/hooks/use-wallet"
import { useAuth } from "@/lib/auth/auth-context"
import { useToast } from "@/hooks/use-toast"
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
  allowCreate?: boolean
  createdAt: Date
  updatedAt?: Date
}

interface Collection {
  id: string
  name: string
  symbol: string
  description: string
  image: string
  metadataUrl: string
  artType: "same" | "unique"
  chain: string
  mintPrice: number
  royaltyFee: number
  maxSupply: number
  mintLimit: number
  mintStartDate: Date
  mintStages: any[]
  creatorAddress: string
  marketplaceId: string
  merchantId: string
  status: "draft" | "published" | "archived"
  createdAt: Date
  updatedAt: Date
}

interface NFT {
  id: string
  collectionId: string
  name: string
  description: string
  image: string
  metadata: any
  ownerAddress: string
  tokenId: number
  assetId: number
  mintedAt: Date
  price?: number
  forSale: boolean
}

export default function CollectionPage({ params }: { params: { merchantId: string; marketplaceId: string; collectionId: string } }) {
  const [marketplace, setMarketplace] = useState<Marketplace | null>(null)
  const [collection, setCollection] = useState<Collection | null>(null)
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)
  const [minting, setMinting] = useState(false)
  const [mintProgress, setMintProgress] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBy, setFilterBy] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showMintDialog, setShowMintDialog] = useState(false)
  const [mintQuantity, setMintQuantity] = useState(1)

  const { isConnected, account, connect, disconnect } = useWallet()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchCollectionData()
  }, [params.collectionId])

  // Remove auto-refresh on visibility change to prevent constant refreshing

  const fetchCollectionData = async () => {
    setLoading(true)
    try {
      // Fetch marketplace details
      const marketplaceRes = await fetch(`/api/marketplaces/${params.marketplaceId}`)
      const marketplaceData = await marketplaceRes.json()
      
      if (marketplaceRes.ok) {
        setMarketplace(marketplaceData.marketplace)
      }

      // Fetch collection details
      const collectionRes = await fetch(`/api/collections/${params.collectionId}`)
      const collectionData = await collectionRes.json()
      console.log("collectionData", collectionData);
      
      
      if (collectionRes.ok) {
        setCollection(collectionData.collection)
        // NFTs are now included in the collection data
        setNfts(collectionData.collection.nfts || [])
      }
    } catch (error) {
      console.error("Failed to fetch collection data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNFTs = async () => {
    try {
      // Refresh the entire collection data to get updated NFTs
      const collectionRes = await fetch(`/api/collections/${params.collectionId}`)
      const collectionData = await collectionRes.json()
      
      if (collectionRes.ok) {
        console.log("Collection refreshed:", collectionData.collection)
        setCollection(collectionData.collection)
        setNfts(collectionData.collection.nfts || [])
      } else {
        console.error("Failed to refresh collection:", collectionData.error)
      }
    } catch (error) {
      console.error("Failed to refresh collection:", error)
    }
  }

  const handleMint = async () => {
    if (!isConnected || !account) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to mint NFTs",
        variant: "destructive",
      })
      return
    }

    if (!collection) return

    setMinting(true)
    setMintProgress(0)

    try {
      // Simulate minting progress
      const progressInterval = setInterval(() => {
        setMintProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch(`/api/collections/${params.collectionId}/mint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress: account.address,
          quantity: mintQuantity,
          collectionId: params.collectionId
        }),
      })

      if (response.ok) {
        setMintProgress(100)
        setShowMintDialog(false)
        setMintQuantity(1)
        
        toast({
          title: "NFT Minted Successfully",
          description: `You have minted ${mintQuantity} NFT(s) from ${collection.name}`,
        })
        
        // Refresh NFTs
        fetchCollectionData()
      } else {
        const errorData = await response.json()
        toast({
          title: "Minting Failed",
          description: errorData.error || "Unknown error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to mint NFT:", error)
      toast({
        title: "Minting Failed",
        description: "Failed to mint NFT. Please try again.",
        variant: "destructive",
      })
    } finally {
      setMinting(false)
      setMintProgress(0)
    }
  }

  const filteredNfts = nfts.filter(nft => {
    const matchesSearch = nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nft.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const sortedNfts = [...filteredNfts].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name)
      case "price-low":
        return (a.price || 0) - (b.price || 0)
      case "price-high":
        return (b.price || 0) - (a.price || 0)
      case "recent":
      default:
        return new Date(b.mintedAt).getTime() - new Date(a.mintedAt).getTime()
    }
  })

  // NFT Operations
  const handleBuyNFT = async (nft: NFT) => {
    if (!isConnected || !account) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to buy NFTs",
        variant: "destructive",
      })
      return
    }

    try {
      // Implement NFT purchase logic
      toast({
        title: "Purchase Initiated",
        description: `Buying ${nft.name} for ${nft.price} ALGO`,
      })
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "Failed to purchase NFT",
        variant: "destructive",
      })
    }
  }

  const handleViewNFT = (nft: NFT) => {
    // Navigate to NFT detail page or open modal
    console.log("Viewing NFT:", nft)
  }

  const handleLikeNFT = (nft: NFT) => {
    // Implement like functionality
    console.log("Liking NFT:", nft)
  }

  const handleShareNFT = (nft: NFT) => {
    // Implement share functionality
    navigator.clipboard.writeText(`${window.location.origin}/nft/${nft.id}`)
    toast({
      title: "Link Copied",
      description: "NFT link copied to clipboard",
    })
  }

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading collection...</p>
          </div>
        </div>
      </PageTransition>
    )
  }

  if (!collection || !marketplace) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Collection Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400">The collection you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <MarketplaceHeader 
          marketplace={marketplace} 
          merchantId={params.merchantId} 
          marketplaceId={params.marketplaceId} 
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation Breadcrumb */}
          <FadeIn>
            <div className="py-4 border-b border-gray-200 dark:border-gray-700">
              <nav className="flex items-center space-x-2 text-sm">
                <Link 
                  href={`/marketplace/${params.merchantId}/${params.marketplaceId}`}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  {marketplace?.businessName || 'Marketplace'}
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 dark:text-white font-medium">{collection.name}</span>
              </nav>
            </div>
          </FadeIn>

          {/* Collection Hero Section */}
          <FadeIn>
            <div className="py-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Collection Image */}
                <div className="w-full lg:w-80 flex-shrink-0">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 shadow-xl">
                    {collection.image ? (
                      <Image
                        src={collection.image}
                        alt={collection.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="w-24 h-24 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Collection Info */}
                <div className="flex-1 space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                        {collection.name}
                      </h1>
                      <Badge 
                        className="text-sm px-3 py-1 font-medium"
                        style={{ 
                          backgroundColor: marketplace.primaryColor,
                          color: 'white'
                        }}
                      >
                        {collection.symbol}
                      </Badge>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                      {collection.description}
                    </p>
                  </div>

                  {/* Collection Stats - Magic Eden Style */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {nfts.length.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Items</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {collection.maxSupply ? collection.maxSupply.toLocaleString() : '∞'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Max Supply</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {collection.mintPrice || 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Mint Price</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {collection.royaltyFee || 0}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Royalty</div>
                    </div>
                  </div>

                  {/* Action Buttons - Magic Eden Style */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      size="lg"
                      disabled={!isConnected || minting}
                      onClick={() => setShowMintDialog(true)}
                      style={{ 
                        backgroundColor: marketplace.primaryColor,
                        color: 'white'
                      }}
                      className="flex-1 h-12 font-semibold rounded-xl"
                    >
                      {minting ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          Minting...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 mr-2" />
                          {!isConnected ? 'Connect to Mint' : 'Mint NFT'}
                        </>
                      )}
                    </Button>
                    
                    {isConnected && account && collection && account.address === collection.creatorAddress && (
                      <Button 
                        variant="outline" 
                        size="lg"
                        onClick={() => {
                          window.location.href = `/marketplace/${params.merchantId}/${params.marketplaceId}/collection/${params.collectionId}/create-nft`
                        }}
                        className="flex-1 h-12 font-semibold rounded-xl border-2"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Create NFT
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href)
                        toast({
                          title: "Link Copied",
                          description: "Collection link copied to clipboard",
                        })
                      }}
                      className="flex-1 h-12 font-semibold rounded-xl border-2"
                    >
                      <Share2 className="w-5 h-5 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Collection Tabs - Magic Eden Style */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              <button className="py-4 px-1 border-b-2 border-gray-900 dark:border-white font-medium text-gray-900 dark:text-white">
                Items ({nfts.length})
              </button>
              <button className="py-4 px-1 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                Activity
              </button>
              <button className="py-4 px-1 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                About
              </button>
            </nav>
          </div>

          {/* Search and Filters - Magic Eden Style */}
          <div className="py-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, token ID, or attributes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-2 focus:border-gray-400"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-sm font-medium focus:border-gray-400 focus:outline-none"
                >
                  <option value="recent">Recently Listed</option>
                  <option value="name">Name A-Z</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-12 px-4 rounded-xl"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-12 px-4 rounded-xl"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* NFTs Grid - Magic Eden Style */}
          {sortedNfts.length > 0 ? (
            <div className={`grid gap-4 ${
              viewMode === 'list' 
                ? 'grid-cols-1' 
                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
            }`}>
              {sortedNfts.map((nft, index) => (
                <motion.div
                  key={nft.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ 
                    scale: 1.02,
                    y: -2
                  }}
                  className="group cursor-pointer"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700">
                    <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                      <Image
                        src={nft.image}
                        alt={nft.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Token ID Badge */}
                      <div className="absolute top-2 left-2">
                        <div className="bg-black/80 text-white text-xs px-2 py-1 rounded-lg font-medium">
                          #{nft.tokenId}
                        </div>
                      </div>
                      
                      {/* Price Badge */}
                      {nft.forSale && nft.price && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-green-600 text-white text-xs px-2 py-1 rounded-lg font-medium">
                            {nft.price} ALGO
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1 mb-1">
                        {nft.name}
                      </h3>
                      
                      {viewMode === 'list' && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                          {nft.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>#{nft.tokenId}</span>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>1.2k</span>
                        </div>
                      </div>
                      
                      {nft.forSale && nft.price && (
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-green-600">
                              {nft.price} ALGO
                            </span>
                            <Button 
                              size="sm" 
                              className="text-xs h-7 px-3 rounded-lg"
                              style={{ 
                                backgroundColor: marketplace.primaryColor,
                                color: 'white'
                              }}
                              onClick={() => handleBuyNFT(nft)}
                            >
                              Buy
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">No NFTs yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                This collection doesn't have any NFTs yet. Be the first to mint one!
              </p>
              {isConnected && account && collection && account.address === collection.creatorAddress && (
                <Button 
                  onClick={() => setShowMintDialog(true)}
                  style={{ 
                    backgroundColor: marketplace.primaryColor,
                    color: 'white'
                  }}
                  className="h-12 px-6 rounded-xl font-semibold"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Mint First NFT
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Mint Dialog - Magic Eden Style */}
        <Dialog open={showMintDialog} onOpenChange={setShowMintDialog}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-bold">Mint NFT from {collection.name}</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Create a new NFT from this collection
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label htmlFor="quantity" className="text-sm font-semibold">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={collection.mintLimit || 1}
                  value={mintQuantity}
                  onChange={(e) => setMintQuantity(parseInt(e.target.value) || 1)}
                  className="mt-2 h-12 rounded-xl border-2 focus:border-gray-400"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Max {collection.mintLimit || 1} per wallet
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Mint Price:</span>
                  <span className="font-semibold">{collection.mintPrice || 0} ALGO</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                  <span className="font-semibold">{mintQuantity}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-gray-300 dark:border-gray-600 pt-2">
                  <span>Total:</span>
                  <span className="text-lg">{(collection.mintPrice || 0) * mintQuantity} ALGO</span>
                </div>
              </div>
              
              {minting && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Minting NFT</span>
                    <span className="font-semibold">{mintProgress}%</span>
                  </div>
                  <Progress value={mintProgress} className="h-3 rounded-full" />
                </div>
              )}
              
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowMintDialog(false)}
                  className="flex-1 h-12 rounded-xl border-2 font-semibold"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleMint}
                  disabled={minting || !isConnected}
                  style={{ 
                    backgroundColor: marketplace.primaryColor,
                    color: 'white'
                  }}
                  className="flex-1 h-12 rounded-xl font-semibold"
                >
                  {minting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Minting...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Mint NFT
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <MarketplaceFooter marketplace={marketplace} />
      </div>
    </PageTransition>
  )
}
