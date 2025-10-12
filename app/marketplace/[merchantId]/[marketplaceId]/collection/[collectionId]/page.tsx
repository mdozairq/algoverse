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
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Wallet,
  Package,
  TrendingUp,
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

  // Refresh data when page becomes visible (for newly created NFTs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchCollectionData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

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
      
      if (collectionRes.ok) {
        setCollection(collectionData.collection)
      }

      // Fetch NFTs in this collection
      const nftsRes = await fetch(`/api/collections/${params.collectionId}/nfts`)
      const nftsData = await nftsRes.json()
      
      if (nftsRes.ok) {
        setNfts(nftsData.nfts || [])
      }
    } catch (error) {
      console.error("Failed to fetch collection data:", error)
    } finally {
      setLoading(false)
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <MarketplaceHeader 
          marketplace={marketplace} 
          merchantId={params.merchantId} 
          marketplaceId={params.marketplaceId} 
        />

        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {/* Back Button */}
          <FadeIn>
            <div className="mb-4 sm:mb-6">
              <Link href={`/marketplace/${params.merchantId}/${params.marketplaceId}`}>
                <Button variant="outline" className="rounded-full text-sm sm:text-base">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Back to Marketplace</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
            </div>
          </FadeIn>

          {/* Collection Header */}
          <FadeIn>
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Collection Image */}
                <div className="w-full lg:w-1/3">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
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
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                        {collection.name}
                      </h1>
                      <Badge 
                        className="text-sm px-3 py-1"
                        style={{ 
                          backgroundColor: `${marketplace.primaryColor}20`,
                          color: marketplace.primaryColor
                        }}
                      >
                        {collection.symbol}
                      </Badge>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                      {collection.description}
                    </p>
                  </div>

                  {/* Collection Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {nfts.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Items</div>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {collection.maxSupply || '∞'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Max Supply</div>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {collection.mintPrice || 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Mint Price (ALGO)</div>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {collection.royaltyFee || 0}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Royalty</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      size="lg"
                      disabled={!isConnected || minting}
                      onClick={() => setShowMintDialog(true)}
                      style={{ 
                        backgroundColor: marketplace.primaryColor,
                        color: 'white'
                      }}
                      className="flex-1"
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
                        className="flex-1"
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
                      className="flex-1"
                    >
                      <Share2 className="w-5 h-5 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Collection Tabs */}
          <Tabs defaultValue="nfts" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="nfts">NFTs ({nfts.length})</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            <TabsContent value="nfts" className="space-y-6">
              {/* Search and Filters */}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search NFTs..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchCollectionData}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                      </Button>
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* NFTs Grid */}
              {sortedNfts.length > 0 ? (
                <StaggerContainer 
                  className={`grid gap-6 ${
                    viewMode === 'list' 
                      ? 'grid-cols-1' 
                      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  }`}
                >
                  {sortedNfts.map((nft, index) => (
                    <StaggerItem key={nft.id}>
                      <motion.div
                        whileHover={{ 
                          scale: 1.02,
                          y: -5
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="h-full"
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="overflow-hidden h-full group cursor-pointer">
                          <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                            <Image
                              src={nft.image}
                              alt={nft.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            
                            {/* NFT Badge */}
                            <div className="absolute top-3 left-3">
                              <Badge className="text-xs bg-black/80 text-white">
                                #{nft.tokenId}
                              </Badge>
                            </div>
                            
                            {/* Price Badge */}
                            {nft.forSale && nft.price && (
                              <div className="absolute top-3 right-3">
                                <Badge className="text-xs bg-green-600 text-white">
                                  {nft.price} ALGO
                                </Badge>
                              </div>
                            )}
                          </div>
                          
                          <CardHeader className="p-4">
                            <CardTitle className="text-lg line-clamp-2 mb-1">
                              {nft.name}
                            </CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {nft.description}
                            </p>
                          </CardHeader>
                          
                          <CardContent className="p-4 pt-0">
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>Minted {new Date(nft.mintedAt).toLocaleDateString()}</span>
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                <span>1.2k</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
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
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Mint First NFT
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Activity Coming Soon</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Track collection activity, sales, and minting history.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="about" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Collection Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Name</Label>
                      <p className="text-lg font-semibold">{collection.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Symbol</Label>
                      <p className="text-lg font-semibold">{collection.symbol}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Art Type</Label>
                      <p className="text-lg font-semibold capitalize">{collection.artType}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Chain</Label>
                      <p className="text-lg font-semibold capitalize">{collection.chain}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Creator</Label>
                      <p className="text-lg font-semibold font-mono text-sm">
                        {collection.creatorAddress ? 
                          (() => {
                            const address = String(collection.creatorAddress);
                            return address.length > 10 ? 
                              `${address.slice(0, 6)}...${address.slice(-4)}` : 
                              address;
                          })() : 
                          'Unknown'
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Minting Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Mint Price</Label>
                      <p className="text-lg font-semibold">{collection.mintPrice || 0} ALGO</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Max Supply</Label>
                      <p className="text-lg font-semibold">{collection.maxSupply || '∞'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Mint Limit per Wallet</Label>
                      <p className="text-lg font-semibold">{collection.mintLimit || 1}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Royalty Fee</Label>
                      <p className="text-lg font-semibold">{collection.royaltyFee || 0}%</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Mint Start Date</Label>
                      <p className="text-lg font-semibold">
                        {new Date(collection.mintStartDate).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Mint Dialog */}
        <Dialog open={showMintDialog} onOpenChange={setShowMintDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Mint NFT from {collection.name}</DialogTitle>
              <DialogDescription>
                Create a new NFT from this collection
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={collection.mintLimit || 1}
                  value={mintQuantity}
                  onChange={(e) => setMintQuantity(parseInt(e.target.value) || 1)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max {collection.mintLimit || 1} per wallet
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Mint Price:</span>
                  <span className="font-semibold">{collection.mintPrice || 0} ALGO</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Quantity:</span>
                  <span className="font-semibold">{mintQuantity}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span>{(collection.mintPrice || 0) * mintQuantity} ALGO</span>
                </div>
              </div>
              
              {minting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Minting NFT</span>
                    <span>{mintProgress}%</span>
                  </div>
                  <Progress value={mintProgress} className="h-2" />
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowMintDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleMint}
                  disabled={minting || !isConnected}
                  style={{ 
                    backgroundColor: marketplace.primaryColor,
                    color: 'white'
                  }}
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
