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
  ChevronLeft,
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
  Globe,
  ArrowRight,
  ArrowLeft as ArrowLeftIcon,
  Circle,
  X
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/page-transition"
import Image from "next/image"
import { useWallet } from "@/hooks/use-wallet"
import { useAuth } from "@/lib/auth/auth-context"
import { useToast } from "@/hooks/use-toast"
import { transactionSigner } from "@/lib/wallet/transaction-signer"
import { WalletMintService } from "@/lib/algorand/wallet-mint-service"
import MarketplaceHeader from "@/components/marketplace/marketplace-header"
import MarketplaceFooter from "@/components/marketplace/marketplace-footer"
import TemplateLoader from "@/components/marketplace/template-loader"
import { CreatePageLoadingTemplate, SimpleLoadingTemplate } from "@/components/ui/loading-templates"

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
  availableSupply: number
  mintLimit: number
  mintStartDate: Date
  mintStages: any[]
  creatorAddress: string
  marketplaceId: string
  merchantId: string
  status: "draft" | "published" | "archived"
  createdAt: Date
  updatedAt: Date
  allowMint: boolean
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
  forSale: boolean,
  status: "draft" | "minted",
  transactionId?: string
  isEnabled: boolean
  allowSwap: boolean
  createdAt: Date
  updatedAt: Date
  // Quantity tracking
  maxSupply?: number
  availableSupply?: number
}

export default function CollectionPage({ params }: { params: { merchantId: string; marketplaceId: string; collectionId: string } }) {
  const [collection, setCollection] = useState<Collection | null>(null)
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)
  const [minting, setMinting] = useState(false)
  const [mintProgress, setMintProgress] = useState(0)
  const [mintStatus, setMintStatus] = useState<'idle' | 'creating' | 'signing' | 'submitting' | 'success' | 'error'>('idle')
  const [mintResult, setMintResult] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBy, setFilterBy] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showMintDialog, setShowMintDialog] = useState(false)
  const [mintQuantity, setMintQuantity] = useState(1)
  const [selectedNFTIndex, setSelectedNFTIndex] = useState(0)
  const [sliderDirection, setSliderDirection] = useState<'next' | 'prev' | null>(null)
  const [activeTab, setActiveTab] = useState('items')

  const { isConnected, account, connect, disconnect } = useWallet()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()


  useEffect(() => {
    fetchCollectionData()
  }, [params.collectionId])

  // Set up the transaction signer
  useEffect(() => {
    transactionSigner.setUseWalletHook({ isConnected, account, connect, disconnect })
  }, [isConnected, account, connect, disconnect])

  // Remove auto-refresh on visibility change to prevent constant refreshing

  const fetchCollectionData = async () => {
    setLoading(true)
    try {
      // Fetch collection details
      const collectionRes = await fetch(`/api/collections/${params.collectionId}`)
      const collectionData = await collectionRes.json()

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

  const handleMint = async (nftId: string) => {
    if (!isConnected || !account) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to mint NFTs",
        variant: "destructive",
      })
      return
    }

    if (!collection) return

    setMintStatus('creating')
    setMinting(true)
    setMintProgress(0)

    try {
      // Step 1: Create NFTs from collection
      // const createResponse = await fetch(`/api/collections/${params.collectionId}/mint`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     userAddress: account.address,
      //     quantity: mintQuantity
      //   }),
      // })

      // if (!createResponse.ok) {
      //   const error = await createResponse.json()
      //   throw new Error(error.error || "Failed to create NFTs from collection")
      // }

      // const { nftIds } = await createResponse.json()
      
      // Step 2: Mint each NFT on the blockchain
      setMintStatus('signing')
      const mintResult = []
      
      // for (let i = 0; i < nftIds.length; i++) {
        // const nftId = nftIds[i]
        
        // Create mint transaction for this NFT
        const mintResponse = await fetch(`/api/nfts/mint-wallet`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nftId: nftId,
            userAddress: account.address
          }),
        })

        if (!mintResponse.ok) {
          const error = await mintResponse.json()
          throw new Error(error.error || "Failed to create mint transaction")
        }

        const { transaction } = await mintResponse.json()

        // Sign transaction with wallet
        const signedTransaction = await transactionSigner.signTransaction(transaction.txn, account.address)
        console.log(`Transaction signed successfully for NFT ${nftId}`)

        // Submit signed transaction
        setMintStatus('submitting')
        const submitResponse = await fetch(`/api/nfts/mint-wallet`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nftId: nftId,
            signedTransaction,
            userAddress: account.address
          }),
        })

        if (submitResponse.ok) {
          const result = await submitResponse.json()
          mintResult.push(result)
        } else {
          const error = await submitResponse.json()
          throw new Error(error.error || "Failed to submit mint transaction")
        }
      // }

      setMintResult(mintResult)
      setMintStatus('success')
      setMintProgress(100)
      setShowMintDialog(false)
      setMintQuantity(1)
      
      toast({
        title: "Success",
        description: `Successfully minted ${mintResult.length} NFT(s) on the blockchain!`,
      })
      
      // Refresh collection data to get updated NFTs
      fetchCollectionData()
    } catch (error: any) {
      setMintStatus('error')
      console.error("Failed to mint NFT:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to mint NFT",
        variant: "destructive",
      })
    } finally {
      setMinting(false)
      setMintProgress(0)
    }
  }

  // Slider navigation functions
  const nextSlide = () => {
    if (nfts.length > 0) {
      setSliderDirection('next')
      setSelectedNFTIndex((prev) => (prev + 1) % nfts.length)
    }
  }

  const prevSlide = () => {
    if (nfts.length > 0) {
      setSliderDirection('prev')
      setSelectedNFTIndex((prev) => (prev - 1 + nfts.length) % nfts.length)
    }
  }

  const goToSlide = (index: number) => {
    setSliderDirection(index > selectedNFTIndex ? 'next' : 'prev')
    setSelectedNFTIndex(index)
  }

  const filteredNfts = nfts.filter(nft => {
    const matchesSearch = nft.metadata.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nft.metadata.description.toLowerCase().includes(searchTerm.toLowerCase())
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

  // NFT Operations - Create and Mint NFT using proper APIs
  const handleBuyNFT = async (nft: NFT) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase NFTs.",
        variant: "destructive"
      })
      return
    }

    if (!isConnected || !account) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to buy NFTs",
        variant: "destructive",
      })
      return
    }

    // Check if NFT is available for purchase
    if (nft.availableSupply !== undefined && nft.availableSupply <= 0) {
      toast({
        title: "Not Available",
        description: "This NFT is no longer available for purchase.",
        variant: "destructive"
      })
      return
    }

    // Check if collection has available supply
    if (collection && collection.availableSupply !== undefined && collection.availableSupply <= 0) {
      toast({
        title: "Collection Sold Out",
        description: "This collection is sold out.",
        variant: "destructive"
      })
      return
    }

    try {
      // Step 1: Create NFT using NFT create API (like marketplace create page)
      toast({
        title: "Creating NFT",
        description: `Creating ${nft.metadata.name} NFT...`,
      })

      

      const nftId = nft.id
      
      // Step 2: Create mint transaction using mint-wallet API (like marketplace create page)
      toast({
        title: "Preparing Mint Transaction",
        description: "Creating blockchain transaction for your NFT...",
      })

      const mintResponse = await fetch('/api/nfts/mint-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nftId: nftId,
          userAddress: account.address
        })
      })

      if (!mintResponse.ok) {
        const errorData = await mintResponse.json()
        throw new Error(errorData.error || 'Failed to create mint transaction')
      }

      const mintData = await mintResponse.json()
      
      // Step 3: Sign transaction using transactionSigner (same as marketplace create)
      toast({
        title: "Signing Transaction",
        description: "Please sign the NFT minting transaction in your wallet.",
      })
      
      const signedTransaction = await transactionSigner.signTransaction(mintData.transaction.txn, account.address)
      
      // Step 4: Submit signed transaction using mint-wallet PUT endpoint
      toast({
        title: "Submitting Transaction",
        description: "Submitting NFT minting transaction to the blockchain...",
      })
      
      const submitResponse = await fetch('/api/nfts/mint-wallet', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nftId: nftId,
          signedTransaction: signedTransaction
        })
      })

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json()
        throw new Error(errorData.error || 'Failed to submit mint transaction')
      }

      const result = await submitResponse.json()
      
      toast({
        title: "NFT Minted Successfully!",
        description: `Successfully minted ${nft.metadata.name}. Asset ID: ${result.assetId}. Check your wallet!`,
      })

      // Refresh collection data to get updated supply information
      fetchCollectionData()
      
    } catch (error: any) {
      console.error('Buy NFT error:', error)
      toast({
        title: "NFT Creation Failed",
        description: error.message || "Failed to create NFT. Please try again.",
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

  return (
    <TemplateLoader marketplaceId={params.marketplaceId}>
      {({ marketplace, template, loading, getButtonStyle, getCardStyle, getBadgeStyle, getThemeStyles }) => {
        if (loading) {
          return <CreatePageLoadingTemplate />
        }

        if (!marketplace || !collection) {
          return (
            <SimpleLoadingTemplate message="Collection not found. Redirecting..." />
          )
        }

        return (
          <PageTransition>
            <div 
              className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              style={getThemeStyles()}
            >
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

          {/* Collection Hero Section with NFT Slider */}
          <FadeIn>
            <div className="py-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* NFT Image Slider */}
                <div className="w-full lg:w-80 flex-shrink-0">
                  <div className="relative">
                    {/* Main Image Display */}
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 shadow-xl">
                      {nfts.length > 0 ? (
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={selectedNFTIndex}
                            initial={{
                              opacity: 0,
                              x: sliderDirection === 'next' ? 100 : sliderDirection === 'prev' ? -100 : 0
                            }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{
                              opacity: 0,
                              x: sliderDirection === 'next' ? -100 : sliderDirection === 'prev' ? 100 : 0
                            }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="w-full h-full"
                          >
                            <Image
                              src={nfts[selectedNFTIndex]?.metadata.image || collection.image}
                              alt={nfts[selectedNFTIndex]?.metadata.name || collection.name}
                              fill
                              className="object-cover"
                            />
                          </motion.div>
                        </AnimatePresence>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="w-24 h-24 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Navigation Arrows */}
                    {nfts.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={prevSlide}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={nextSlide}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </>
                    )}

                    {/* NFT Counter */}
                    {nfts.length > 0 && (
                      <div className="absolute bottom-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded-lg">
                        {selectedNFTIndex + 1} / {nfts.length}
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Slider */}
                  {nfts.length > 1 && (
                    <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                      {nfts.map((nft, index) => (
                        <button
                          key={nft.id}
                          onClick={() => goToSlide(index)}
                          className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200 ${index === selectedNFTIndex
                              ? 'ring-2 ring-blue-500 scale-105'
                              : 'opacity-60 hover:opacity-100'
                            }`}
                        >
                          <Image
                            src={nft.metadata.image}
                            alt={nft.metadata.name}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
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

                  {/* Selected NFT Details */}
                  {nfts.length > 0 && (
                    <FadeIn>
                      <div className="py-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
                          <div className="flex flex-col lg:flex-row gap-6">
                            {/* NFT Info */}
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-4">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                  {nfts[selectedNFTIndex]?.metadata.name || 'NFT #' + (selectedNFTIndex + 1)}
                                </h2>
                                <Badge
                                  className="text-sm px-3 py-1 font-medium"
                                  style={{
                                    backgroundColor: marketplace.primaryColor,
                                    color: 'white'
                                  }}
                                >
                                  #{nfts[selectedNFTIndex]?.tokenId || selectedNFTIndex + 1}
                                </Badge>
                              </div>

                              <p className="text-gray-600 dark:text-gray-400 mb-4">
                                {nfts[selectedNFTIndex].metadata?.description || 'No description available'}
                              </p>

                              {/* NFT Stats */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white dark:bg-gray-700 rounded-xl p-3 text-center">
                                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                                    {nfts[selectedNFTIndex]?.tokenId || selectedNFTIndex + 1}
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">Token ID</div>
                                </div>
                                <div className="bg-white dark:bg-gray-700 rounded-xl p-3 text-center">
                                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                                    {nfts[selectedNFTIndex]?.assetId || '--'}
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">Asset ID</div>
                                </div>
                                <div className="bg-white dark:bg-gray-700 rounded-xl p-3 text-center">
                                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                                    {nfts[selectedNFTIndex]?.forSale ? 'No' : 'Yes'}
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">For Sale</div>
                                </div>
                                <div className="bg-white dark:bg-gray-700 rounded-xl p-3 text-center">
                                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                                    {nfts[selectedNFTIndex]?.price || '--'} ALGO
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">Price</div>
                                </div>
                              </div>
                            </div>

                            {/* NFT Actions */}
                            <div className="lg:w-80">
                              <div className="space-y-4">
                                {nfts[selectedNFTIndex]?.assetId && nfts[selectedNFTIndex]?.price ? (
                                  <Button
                                    size="lg"
                                    disabled={
                                      (nfts[selectedNFTIndex]?.availableSupply !== undefined && nfts[selectedNFTIndex]?.availableSupply <= 0) ||
                                      (collection?.availableSupply !== undefined && collection?.availableSupply <= 0)
                                    }
                                    className="w-full h-12 font-semibold rounded-xl"
                                    style={{
                                      backgroundColor: marketplace.primaryColor,
                                      color: 'white'
                                    }}
                                    onClick={() => handleBuyNFT(nfts[selectedNFTIndex])}
                                  >
                                    <ShoppingCart className="w-5 h-5 mr-2" />
                                    {nfts[selectedNFTIndex]?.availableSupply !== undefined && nfts[selectedNFTIndex]?.availableSupply <= 0 ? 
                                      'Sold Out' : 
                                      `Buy for ${nfts[selectedNFTIndex].price} ALGO`
                                    }
                                  </Button>
                                ) : (
                                  <Button
                                    size="lg"
                                    disabled={
                                      !isConnected || 
                                      minting || 
                                      (collection?.availableSupply !== undefined && collection?.availableSupply <= 0)
                                    }
                                    onClick={() => setShowMintDialog(true)}
                                    style={{
                                      backgroundColor: marketplace.primaryColor,
                                      color: 'white'
                                    }}
                                    className="w-full h-12 font-semibold rounded-xl"
                                  >
                                    {minting ? (
                                      <>
                                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                        Minting...
                                      </>
                                    ) : collection?.availableSupply !== undefined && collection?.availableSupply <= 0 ? (
                                      <>
                                        <X className="w-5 h-5 mr-2" />
                                        Collection Sold Out
                                      </>
                                    ) : (
                                      <>
                                        <Zap className="w-5 h-5 mr-2" />
                                        {!isConnected ? 'Connect to Mint' : nfts[selectedNFTIndex]?.status === 'draft' && collection?.allowMint ? 'Mint This NFT' : 'Buy This NFT'}
                                      </>
                                    )}
                                  </Button>
                                )}

                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewNFT(nfts[selectedNFTIndex])}
                                    className="flex-1 h-10 rounded-xl"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleLikeNFT(nfts[selectedNFTIndex])}
                                    className="flex-1 h-10 rounded-xl"
                                  >
                                    <Heart className="w-4 h-4 mr-2" />
                                    Like
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleShareNFT(nfts[selectedNFTIndex])}
                                    className="flex-1 h-10 rounded-xl"
                                  >
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </FadeIn>
                  )}
                </div>
              </div>
            </div>
          </FadeIn>


          {/* Collection Tabs - Magic Eden Style */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              <button 
                onClick={() => setActiveTab('items')}
                className={`py-4 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === 'items' 
                    ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Items ({nfts.length})
              </button>
              <button 
                onClick={() => setActiveTab('activity')}
                className={`py-4 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === 'activity' 
                    ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Activity
              </button>
              <button 
                onClick={() => setActiveTab('about')}
                className={`py-4 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === 'about' 
                    ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                About
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'items' && (
            <>
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
                <div className={`grid gap-4 ${viewMode === 'list'
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
                            src={nft.metadata.image}
                            alt={nft.metadata.name}
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
                            {nft.metadata.name}
                          </h3>

                          {viewMode === 'list' && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                              {nft.metadata.description}
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
                                  disabled={
                                    (nft.availableSupply !== undefined && nft.availableSupply <= 0) ||
                                    (collection?.availableSupply !== undefined && collection?.availableSupply <= 0)
                                  }
                                  className="text-xs h-7 px-3 rounded-lg"
                                  style={{
                                    backgroundColor: marketplace.primaryColor,
                                    color: 'white'
                                  }}
                                  onClick={() => handleBuyNFT(nft)}
                                >
                                  {nft.availableSupply !== undefined && nft.availableSupply <= 0 ? 'Sold Out' : 'Buy'}
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
            </>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="py-8">
              <div className="text-center">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Activity Coming Soon</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Track collection activity, sales, and minting history.
                </p>
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="py-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Collection Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Collection Details</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="font-medium text-gray-600 dark:text-gray-400">Name</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{collection.name}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="font-medium text-gray-600 dark:text-gray-400">Symbol</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{collection.symbol}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="font-medium text-gray-600 dark:text-gray-400">Art Type</span>
                        <span className="font-semibold text-gray-900 dark:text-white capitalize">{collection.artType}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="font-medium text-gray-600 dark:text-gray-400">Chain</span>
                        <span className="font-semibold text-gray-900 dark:text-white capitalize">{collection.chain}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="font-medium text-gray-600 dark:text-gray-400">Creator</span>
                        <span className="font-semibold text-gray-900 dark:text-white font-mono text-sm">
                          {collection.creatorAddress ? 
                            (() => {
                              const address = String(collection.creatorAddress);
                              return address.length > 10 ? 
                                `${address.slice(0, 6)}...${address.slice(-4)}` : 
                                address;
                            })() : 
                            'Unknown'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Minting Information</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="font-medium text-gray-600 dark:text-gray-400">Mint Price</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{collection.mintPrice || 0} ALGO</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="font-medium text-gray-600 dark:text-gray-400">Max Supply</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{collection.maxSupply || '∞'}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="font-medium text-gray-600 dark:text-gray-400">Mint Limit per Wallet</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{collection.mintLimit || 1}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="font-medium text-gray-600 dark:text-gray-400">Royalty Fee</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{collection.royaltyFee || 0}%</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="font-medium text-gray-600 dark:text-gray-400">Mint Start Date</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {new Date(collection.mintStartDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Collection Stats */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Collection Stats</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {nfts.length.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Items</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {collection.maxSupply ? collection.maxSupply.toLocaleString() : '∞'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Max Supply</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {collection.availableSupply !== undefined ? collection.availableSupply.toLocaleString() : '∞'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Available Supply</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {collection.mintPrice || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Mint Price (ALGO)</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {collection.royaltyFee || 0}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Royalty Fee</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Description</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {collection.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mint Dialog - Magic Eden Style */}
        <Dialog open={showMintDialog} onOpenChange={setShowMintDialog}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-bold">
                Mint NFT from {collection.name}
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                {nfts.length > 0 ?
                  `Minting: ${nfts[selectedNFTIndex].metadata?.name || 'NFT #' + (selectedNFTIndex + 1)}` :
                  'Create a new NFT from this collection'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* NFT Preview */}
              {nfts.length > 0 && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                    <Image
                      src={nfts[selectedNFTIndex].metadata?.image || collection.image}
                      alt={nfts[selectedNFTIndex].metadata?.name || collection.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {nfts[selectedNFTIndex].metadata?.name || 'NFT #' + (selectedNFTIndex + 1)}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Token ID: {nfts[selectedNFTIndex]?.tokenId || selectedNFTIndex + 1}
                    </p>
                  </div>
                </div>
              )}

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
                {collection.availableSupply !== undefined && (
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Available:</span>
                    <span className="font-semibold">{collection.availableSupply} remaining</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold border-t border-gray-300 dark:border-gray-600 pt-2">
                  <span>Total:</span>
                  <span className="text-lg">{(collection.mintPrice || 0) * mintQuantity} ALGO</span>
                </div>
              </div>

              {minting && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {mintStatus === 'creating' && 'Creating Transaction...'}
                      {mintStatus === 'signing' && 'Signing Transaction...'}
                      {mintStatus === 'submitting' && 'Submitting to Blockchain...'}
                      {mintStatus === 'success' && 'Minting Complete!'}
                      {mintStatus === 'error' && 'Minting Failed'}
                    </span>
                    <span className="font-semibold">{mintProgress}%</span>
                  </div>
                  <Progress value={mintProgress} className="h-3 rounded-full" />
                  {mintStatus === 'signing' && (
                    <p className="text-xs text-gray-500 text-center">
                      Please check your wallet to sign the transaction
                    </p>
                  )}
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
                  onClick={() => handleMint(nfts[selectedNFTIndex].id)}
                  disabled={
                    minting || 
                    !isConnected || 
                    (collection?.availableSupply !== undefined && collection?.availableSupply <= 0)
                  }
                  style={{
                    backgroundColor: marketplace.primaryColor,
                    color: 'white'
                  }}
                  className="flex-1 h-12 rounded-xl font-semibold"
                >
                  {minting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      {mintStatus === 'creating' && 'Creating...'}
                      {mintStatus === 'signing' && 'Signing...'}
                      {mintStatus === 'submitting' && 'Submitting...'}
                      {mintStatus === 'success' && 'Complete!'}
                      {mintStatus === 'error' && 'Failed'}
                    </>
                  ) : collection?.availableSupply !== undefined && collection?.availableSupply <= 0 ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Collection Sold Out
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
      }}
    </TemplateLoader>
  )
}
