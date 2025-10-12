"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Zap
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/page-transition"
import Header from "@/components/header"
import Footer from "@/components/footer"
import MarketplaceHeader from "@/components/marketplace/marketplace-header"
import MarketplaceFooter from "@/components/marketplace/marketplace-footer"
import Image from "next/image"
import { useWallet } from "@/hooks/use-wallet"
import { useToast } from "@/hooks/use-toast"

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

interface CreateTemplate {
  id: string
  name: string
  description: string
  category: string
  type: "nft" | "event" | "merchandise"
  image: string
  price: number
  currency: string
  isEnabled: boolean
  createdAt: Date
}

interface CreateSession {
  id: string
  templateId: string
  userAddress: string
  status: "draft" | "published" | "archived"
  createdAt: Date
  publishedAt?: Date
}

export default function CreatePage({ params }: { params: { merchantId: string; marketplaceId: string } }) {
  const [marketplace, setMarketplace] = useState<Marketplace | null>(null)
  const [createTemplates, setCreateTemplates] = useState<CreateTemplate[]>([])
  const [userSessions, setUserSessions] = useState<CreateSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<CreateTemplate | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createProgress, setCreateProgress] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBy, setFilterBy] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [selectedArtType, setSelectedArtType] = useState<"same" | "unique">("unique")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedNFTImages, setUploadedNFTImages] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [availableCollections, setAvailableCollections] = useState<any[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string>("")

  // Form data for creating new items
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    type: "nft" as "nft" | "event" | "merchandise",
    image: "",
    price: "",
    currency: "ALGO",
    symbol: "",
    chain: "algorand",
    artType: "unique" as "same" | "unique",
    metadataUrl: "",
    mintPrice: "",
    royaltyFee: "",
    maxSupply: "",
    mintLimit: "",
    mintStartDate: "",
    mintStages: []
  })

  const { isConnected, account, connect, disconnect } = useWallet()
  const { toast } = useToast()

  const fetchMarketplaceData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/marketplaces/${params.marketplaceId}`)
      const data = await response.json()
      
      if (response.ok) {
        setMarketplace(data.marketplace)
      }
    } catch (error) {
      console.error("Failed to fetch marketplace data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCreateTemplates = async () => {
    try {
      const response = await fetch(`/api/marketplaces/${params.marketplaceId}/create-templates`)
      const data = await response.json()
      
      if (response.ok) {
        setCreateTemplates(data.templates || [])
      }
    } catch (error) {
      console.error("Failed to fetch create templates:", error)
    }
  }

  const fetchUserSessions = async () => {
    if (!isConnected || !account) return
    
    try {
      const response = await fetch(`/api/user/create-sessions?address=${account}`)
      const data = await response.json()
      
      if (response.ok) {
        setUserSessions(data.sessions || [])
      }
    } catch (error) {
      console.error("Failed to fetch user sessions:", error)
    }
  }

  const fetchAvailableCollections = async () => {
    try {
      const response = await fetch(`/api/marketplaces/${params.marketplaceId}/collections`)
      const data = await response.json()
      
      if (response.ok) {
        setAvailableCollections(data.collections || [])
      }
    } catch (error) {
      console.error("Failed to fetch collections:", error)
    }
  }

  useEffect(() => {
    fetchMarketplaceData()
    fetchCreateTemplates()
    fetchAvailableCollections()
  }, [params.marketplaceId])

  useEffect(() => {
    if (isConnected && account) {
      fetchUserSessions()
    }
  }, [isConnected, account])

  const uploadImageToServer = async (file: File, path: string): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('path', path)
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to upload image')
    }
    
    const data = await response.json()
    return data.url
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadingImages(true)
      setUploadProgress(0)
      
      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return prev
            }
            return prev + 10
          })
        }, 100)

        const imageUrl = await uploadImageToServer(file, `collections/${params.marketplaceId}/collection-image`)
        setUploadedImage(imageUrl)
        setFormData({ ...formData, image: imageUrl })
        setUploadProgress(100)
        
        toast({
          title: "Image Uploaded",
          description: "Collection image uploaded successfully",
        })
      } catch (error) {
        console.error("Failed to upload image:", error)
        toast({
          title: "Upload Failed",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        })
      } finally {
        setUploadingImages(false)
        setUploadProgress(0)
      }
    }
  }

  const handleNFTImagesUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setUploadingImages(true)
    setUploadProgress(0)
    
    try {
      const uploadPromises = files.map(async (file, index) => {
        const imageUrl = await uploadImageToServer(file, `collections/${params.marketplaceId}/nft-images/${Date.now()}-${index}`)
        return imageUrl
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setUploadedNFTImages(prev => [...prev, ...uploadedUrls])
      
      toast({
        title: "Images Uploaded",
        description: `${uploadedUrls.length} NFT images uploaded successfully`,
      })
    } catch (error) {
      console.error("Failed to upload NFT images:", error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload NFT images. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploadingImages(false)
      setUploadProgress(0)
    }
  }

  const validateForm = () => {
    const errors = []
    
    if (!formData.name.trim()) errors.push("Collection name is required")
    if (!formData.symbol.trim()) errors.push("Collection symbol is required")
    if (formData.mintPrice && parseFloat(formData.mintPrice) < 0) errors.push("Mint price must be positive")
    if (formData.royaltyFee && (parseFloat(formData.royaltyFee) < 0 || parseFloat(formData.royaltyFee) > 100)) {
      errors.push("Royalty fee must be between 0 and 100")
    }
    if (formData.maxSupply && parseInt(formData.maxSupply) < 1) errors.push("Max supply must be at least 1")
    if (formData.mintLimit && parseInt(formData.mintLimit) < 1) errors.push("Mint limit must be at least 1")
    
    return errors
  }

  const handleCreateItem = async () => {
    if (!isConnected || !account) return

    // Validate form
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join(', '),
        variant: "destructive",
      })
      return
    }

    setCreating(true)
    setCreateProgress(0)

    try {
      // Simulate creation progress
      const progressInterval = setInterval(() => {
        setCreateProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch("/api/marketplaces/create-collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          artType: selectedArtType,
          userAddress: account.address,
          marketplaceId: params.marketplaceId,
          merchantId: params.merchantId,
          mintPrice: parseFloat(formData.mintPrice || "0"),
          royaltyFee: parseFloat(formData.royaltyFee || "0"),
          maxSupply: parseInt(formData.maxSupply || "1000"),
          mintLimit: parseInt(formData.mintLimit || "1"),
          nftImages: uploadedNFTImages,
          creatorAddress: account
        }),
      })

      if (response.ok) {
        setCreateProgress(100)
        setShowCreateDialog(false)
        setFormData({
          name: "",
          description: "",
          category: "",
          type: "nft",
          image: "",
          price: "",
          currency: "ALGO",
          symbol: "",
          chain: "algorand",
          artType: "unique",
          metadataUrl: "",
          mintPrice: "",
          royaltyFee: "",
          maxSupply: "",
          mintLimit: "",
          mintStartDate: "",
          mintStages: []
        })
        setSelectedArtType("unique")
        setUploadedImage(null)
        setUploadedNFTImages([])
        fetchUserSessions()
        fetchCreateTemplates()
        
        // Show success message
        toast({
          title: "Collection Created",
          description: "Your NFT collection has been created successfully!",
        })
        
        // Refresh marketplace data to show the new collection
        setTimeout(() => {
          window.location.href = `/marketplace/${params.merchantId}/${params.marketplaceId}`
        }, 2000)
      } else {
        const errorData = await response.json()
        toast({
          title: "Creation Failed",
          description: errorData.error || "Unknown error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to create collection:", error)
      toast({
        title: "Creation Failed",
        description: "Failed to create collection. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
      setCreateProgress(0)
    }
  }

  const filteredTemplates = createTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading create marketplace...</p>
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
            <Plus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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

          {/* Header */}
          <FadeIn>
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Creator Studio
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Create and publish content in {marketplace.businessName}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Wallet connection is handled in the header */}
                </div>
              </div>
            </div>
          </FadeIn>

          <Tabs defaultValue="templates" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="my-creations">My Creations</TabsTrigger>
              <TabsTrigger value="create">Create Collection</TabsTrigger>
              <TabsTrigger value="create-nft">Create NFT</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-6">
              {/* Search and Filters */}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search templates..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={filterBy} onValueChange={setFilterBy}>
                      <SelectTrigger className="w-40">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Templates</SelectItem>
                        <SelectItem value="nft">NFTs</SelectItem>
                        <SelectItem value="event">Events</SelectItem>
                        <SelectItem value="merchandise">Merchandise</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Recent</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="popular">Popular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Template Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="group hover:shadow-lg transition-all duration-200">
                      <div className="relative aspect-square overflow-hidden rounded-t-lg">
                        <Image
                          src={template.image}
                          alt={template.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            {template.type}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                              {template.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {template.description}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                              {template.price} {template.currency}
                            </span>
                            <Button
                              onClick={() => {
                                setSelectedTemplate(template)
                                setShowCreateDialog(true)
                              }}
                              disabled={!isConnected}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Use Template
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="my-creations" className="space-y-6">
              {!isConnected ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Wallet className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Connect Your Wallet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                      Please connect your wallet using the button in the header to view your creations
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {userSessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                <Plus className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  Creation #{session.id.slice(0, 8)}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {new Date(session.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge 
                                className={`text-xs ${
                                  session.status === 'published' ? 'bg-green-100 text-green-800' :
                                  session.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {session.status}
                              </Badge>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="create" className="space-y-6">
              {!isConnected ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Wallet className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Connect Your Wallet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                      Please connect your wallet using the button in the header to create new content
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">Create NFT Collection</CardTitle>
                    <CardDescription>
                      Launch your NFT collection on Algorand blockchain
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Chain Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="chain" className="text-sm font-medium">Algorand Chain</Label>
                      <Select defaultValue="algorand">
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="algorand">Algorand Mainnet</SelectItem>
                          <SelectItem value="testnet">Algorand Testnet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Collection Name */}
                    <div className="space-y-2">
                      <Label htmlFor="collectionName" className="text-sm font-medium">Name *</Label>
                      <Input
                        id="collectionName"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter collection name"
                        className="w-full"
                        required
                      />
                    </div>

                    {/* Symbol */}
                    <div className="space-y-2">
                      <Label htmlFor="symbol" className="text-sm font-medium">Symbol *</Label>
                      <Input
                        id="symbol"
                        value={formData.symbol}
                        onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                        placeholder="e.g., MYNFT"
                        className="w-full"
                        required
                      />
                    </div>

                    {/* Collection Image Upload */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Collection Image *</Label>
                      <p className="text-xs text-gray-500">Image that will be shown as the main image for the collection. Recommended: 800×800px jpg</p>
                      {uploadedImage ? (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                          <Image
                            src={uploadedImage}
                            alt="Collection preview"
                            fill
                            className="object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setUploadedImage(null)
                              setFormData({ ...formData, image: "" })
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                          <div className="space-y-4">
                            {uploadingImages ? (
                              <div className="space-y-2">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  Uploading... {uploadProgress}%
                                </div>
                                <Progress value={uploadProgress} className="h-2" />
                              </div>
                            ) : (
                              <>
                                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    Drop your artwork here to upload
                                  </p>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="image-upload"
                                  />
                                  <Button variant="outline" size="sm" asChild>
                                    <label htmlFor="image-upload" className="cursor-pointer">
                                      Choose Image...
                                    </label>
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe your collection"
                        rows={4}
                        className="w-full"
                      />
                    </div>

                    {/* NFT Art Type */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">NFT Art Type</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card 
                          className={`cursor-pointer transition-colors ${
                            selectedArtType === "same" 
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                              : "hover:border-blue-500"
                          }`}
                          onClick={() => setSelectedArtType("same")}
                        >
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <h4 className="font-semibold">Same Artwork</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                An ASA collection where everyone mints the same artwork
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card 
                          className={`cursor-pointer transition-colors ${
                            selectedArtType === "unique" 
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                              : "hover:border-blue-500"
                          }`}
                          onClick={() => setSelectedArtType("unique")}
                        >
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <h4 className="font-semibold">Unique Artwork</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                An ASA collection where everyone mints a unique artwork
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Unique Artwork Upload */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Upload Artwork Files</Label>
                      <p className="text-xs text-gray-500">File types allowed: .jpg,.png. Max file size: 10MB</p>
                      
                      {/* Uploaded Images Grid */}
                      {uploadedNFTImages.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          {uploadedNFTImages.map((imageUrl, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                              <Image
                                src={imageUrl}
                                alt={`NFT ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 h-6 w-6 p-0"
                                onClick={() => {
                                  setUploadedNFTImages(prev => prev.filter((_, i) => i !== index))
                                }}
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                        <div className="space-y-4">
                          {uploadingImages ? (
                            <div className="space-y-2">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Uploading {uploadedNFTImages.length} images... {uploadProgress}%
                              </div>
                              <Progress value={uploadProgress} className="h-2" />
                            </div>
                          ) : (
                            <>
                              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  Drop your artwork here to upload
                                </p>
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={handleNFTImagesUpload}
                                  className="hidden"
                                  id="nft-images-upload"
                                />
                                <Button variant="outline" size="sm" asChild>
                                  <label htmlFor="nft-images-upload" className="cursor-pointer">
                                    Choose Files...
                                  </label>
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Metadata URL */}
                    <div className="space-y-2">
                      <Label htmlFor="metadataUrl" className="text-sm font-medium">Metadata URL</Label>
                      <Input
                        id="metadataUrl"
                        value={formData.metadataUrl}
                        onChange={(e) => setFormData({ ...formData, metadataUrl: e.target.value })}
                        placeholder="https://your-metadata-url.com"
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500">
                        Check our step-by-step guide on how to generate and upload your collection assets and metadata.
                      </p>
                    </div>

                    {/* Pricing and Supply */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="mintPrice" className="text-sm font-medium">Mint Price</Label>
                        <div className="flex">
                          <Input
                            id="mintPrice"
                            type="number"
                            value={formData.mintPrice}
                            onChange={(e) => setFormData({ ...formData, mintPrice: e.target.value })}
                            placeholder="0.1"
                            className="rounded-r-none"
                          />
                          <Select 
                            value={formData.currency} 
                            onValueChange={(value) => setFormData({ ...formData, currency: value })}
                          >
                            <SelectTrigger className="w-20 rounded-l-none border-l-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ALGO">ALGO</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="royaltyFee" className="text-sm font-medium">Royalty Fee</Label>
                        <div className="flex">
                          <Input
                            id="royaltyFee"
                            type="number"
                            value={formData.royaltyFee}
                            onChange={(e) => setFormData({ ...formData, royaltyFee: e.target.value })}
                            placeholder="5"
                            className="rounded-r-none"
                          />
                          <span className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md text-sm flex items-center">
                            %
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxSupply" className="text-sm font-medium">Max Supply</Label>
                        <Input
                          id="maxSupply"
                          type="number"
                          value={formData.maxSupply}
                          onChange={(e) => setFormData({ ...formData, maxSupply: e.target.value })}
                          placeholder="1000"
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Mint Limit */}
                    <div className="space-y-2">
                      <Label htmlFor="mintLimit" className="text-sm font-medium">Mint Limit per Wallet</Label>
                      <Input
                        id="mintLimit"
                        type="number"
                        value={formData.mintLimit}
                        onChange={(e) => setFormData({ ...formData, mintLimit: e.target.value })}
                        placeholder="1"
                        className="w-full"
                      />
                    </div>

                    {/* Mint Start Date */}
                    <div className="space-y-2">
                      <Label htmlFor="mintStart" className="text-sm font-medium">Mint Start Date & Time</Label>
                      <Input
                        id="mintStart"
                        type="datetime-local"
                        value={formData.mintStartDate}
                        onChange={(e) => setFormData({ ...formData, mintStartDate: e.target.value })}
                        className="w-full"
                      />
                    </div>

                    {/* Mint Stages */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Mint Stages</Label>
                        <Button variant="outline" size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Allowlist Stage
                        </Button>
                      </div>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">Public Mint</h4>
                              <Badge variant="secondary">FREE</Badge>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Oct 11 2025, 11:28 AM - Oct 12 2025, 11:28 AM
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 space-y-4">
                      <div className="flex gap-3">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setFormData({
                              name: "",
                              description: "",
                              category: "",
                              type: "nft",
                              image: "",
                              price: "",
                              currency: "ALGO",
                              symbol: "",
                              chain: "algorand",
                              artType: "unique",
                              metadataUrl: "",
                              mintPrice: "",
                              royaltyFee: "",
                              maxSupply: "",
                              mintLimit: "",
                              mintStartDate: "",
                              mintStages: []
                            })
                            setSelectedArtType("unique")
                            setUploadedImage(null)
                            setUploadedNFTImages([])
                          }}
                          className="flex-1"
                        >
                          Clear Form
                        </Button>
                        <Button 
                          onClick={() => setShowCreateDialog(true)}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
                          size="lg"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Publish on Algorand
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        By clicking "publish on algorand", you agree to the Marketplace Terms of Service.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="create-nft" className="space-y-6">
              {!isConnected ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Wallet className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Connect Your Wallet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                      Please connect your wallet using the button in the header to create NFTs
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">Create NFT in Collection</CardTitle>
                    <CardDescription>
                      Create a new NFT and add it to an existing collection. NFTs must belong to a collection.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* NFT Name */}
                    <div className="space-y-2">
                      <Label htmlFor="nftName" className="text-sm font-medium">NFT Name *</Label>
                      <Input
                        id="nftName"
                        placeholder="Enter NFT name"
                        className="w-full"
                        required
                      />
                    </div>

                    {/* NFT Description */}
                    <div className="space-y-2">
                      <Label htmlFor="nftDescription" className="text-sm font-medium">Description</Label>
                      <Textarea
                        id="nftDescription"
                        placeholder="Describe your NFT"
                        rows={3}
                        className="w-full"
                      />
                    </div>

                    {/* NFT Image Upload */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">NFT Image *</Label>
                      <p className="text-xs text-gray-500">Upload the image for your NFT. Recommended: 800×800px</p>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                        <div className="space-y-4">
                          {uploadingImages ? (
                            <div className="space-y-2">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Uploading... {uploadProgress}%
                              </div>
                              <Progress value={uploadProgress} className="h-2" />
                            </div>
                          ) : (
                            <>
                              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  Drop your NFT image here to upload
                                </p>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="hidden"
                                  id="nft-single-upload"
                                />
                                <Button variant="outline" size="sm" asChild>
                                  <label htmlFor="nft-single-upload" className="cursor-pointer">
                                    Choose Image...
                                  </label>
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Collection Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Select Collection *</Label>
                      <p className="text-xs text-gray-500">NFTs must belong to a collection. Choose an existing collection or create a new one.</p>
                      <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a collection" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCollections.length > 0 ? (
                            availableCollections.map((collection) => (
                              <SelectItem key={collection.id} value={collection.id}>
                                {collection.name} ({collection.symbol})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-collections" disabled>
                              No collections available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {availableCollections.length === 0 && (
                        <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            No collections found. Please create a collection first using the "Create Collection" tab.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* NFT Properties */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">NFT Properties</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nftRarity" className="text-sm">Rarity</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select rarity" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="common">Common</SelectItem>
                              <SelectItem value="uncommon">Uncommon</SelectItem>
                              <SelectItem value="rare">Rare</SelectItem>
                              <SelectItem value="epic">Epic</SelectItem>
                              <SelectItem value="legendary">Legendary</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="nftCategory" className="text-sm">Category</Label>
                          <Input
                            id="nftCategory"
                            placeholder="e.g., Art, Gaming, Music"
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 space-y-4">
                      <div className="flex gap-3">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                        >
                          Save as Draft
                        </Button>
                        <Button 
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
                          size="lg"
                          disabled={!selectedCollection || selectedCollection === "no-collections"}
                        >
                          <Zap className="w-5 h-5 mr-2" />
                          {!selectedCollection ? 'Select Collection First' : 'Create NFT'}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        By creating an NFT, you agree to the Marketplace Terms of Service.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Item</DialogTitle>
              <DialogDescription>
                {selectedTemplate?.name || 'Custom Item'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedTemplate && (
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                    <Image
                      src={selectedTemplate.image}
                      alt={selectedTemplate.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">{selectedTemplate.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedTemplate.type} • {selectedTemplate.price} {selectedTemplate.currency}
                    </p>
                  </div>
                </div>
              )}
              
              {creating && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Creating Item</span>
                    <span>{createProgress}%</span>
                  </div>
                  <Progress value={createProgress} className="h-2" />
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateItem}
                  disabled={creating || !isConnected}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Item
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
