"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  SlidersHorizontal,
  Eye,
  Heart,
  Share2,
  ExternalLink,
  Star,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Clock,
  User,
  MapPin,
  Calendar,
  DollarSign,
  Coins,
  Zap,
  Shield,
  CheckCircle,
  AlertCircle,
  Info,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Settings,
  Bell,
  LogOut,
  Home,
  Package,
  HelpCircle,
  Target,
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
  Download,
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
  Wallet,
  RefreshCw,
  Minus,
  Plus,
  Lock,
  Unlock,
  CreditCard,
  Banknote,
  Receipt,
  FileCheck,
  Timer,
  Calendar as CalendarIcon,
  UserCheck,
  UserX,
  Gift,
  Award,
  Trophy,
  Medal,
  Crown,
  Gem,
  Sparkles,
  Rocket,
  Flame,
  Sun,
  Moon,
  Star as StarIcon,
  Heart as HeartIcon,
  ThumbsUp as ThumbsUpIcon,
  ThumbsDown as ThumbsDownIcon,
  MessageSquare as MessageSquareIcon,
  Share as ShareIcon,
  Bookmark,
  BookmarkCheck,
  BookmarkX,
  BookmarkPlus,
  BookmarkMinus,
  BookmarkHeart,
  BookmarkStar,
  BookmarkUser,
  BookmarkSettings,
  BookmarkEdit,
  BookmarkTrash,
  BookmarkCopy,
  BookmarkSave,
  BookmarkUpload,
  BookmarkDownload,
  BookmarkSend,
  BookmarkPaperclip,
  BookmarkImage,
  BookmarkVideo,
  BookmarkFile,
  BookmarkFolder,
  BookmarkArchive,
  BookmarkDatabase,
  BookmarkServer,
  BookmarkCloud,
  BookmarkCloudOff,
  BookmarkWrench,
  BookmarkHammer,
  BookmarkCog,
  BookmarkSliders,
  BookmarkToggleLeft,
  BookmarkToggleRight,
  BookmarkPower,
  BookmarkPowerOff,
  BookmarkPlay,
  BookmarkPause,
  BookmarkStop,
  BookmarkSkipBack,
  BookmarkSkipForward,
  BookmarkRepeat,
  BookmarkShuffle,
  BookmarkVolume1,
  BookmarkVolume2,
  BookmarkVolumeX,
  BookmarkMic,
  BookmarkMicOff,
  BookmarkCamera,
  BookmarkCameraOff,
  BookmarkMonitor,
  BookmarkSmartphone,
  BookmarkTablet,
  BookmarkLaptop,
  BookmarkHeadphones,
  BookmarkSpeaker,
  BookmarkRadio,
  BookmarkTv,
  BookmarkGamepad2,
  BookmarkJoystick,
  BookmarkKeyboard,
  BookmarkMouse,
  BookmarkPrinter,
  BookmarkPhoneCall,
  BookmarkPhoneIncoming,
  BookmarkPhoneOutgoing,
  BookmarkPhoneMissed,
  BookmarkVoicemail,
  BookmarkMessageSquare,
  BookmarkMessageSquareText,
  BookmarkMessageSquareReply,
  BookmarkMessageSquareMore,
  BookmarkMessageSquareX,
  BookmarkMessageSquareWarning,
  BookmarkMessageSquarePlus,
  BookmarkMessageSquareShare,
  BookmarkMessageSquareHeart,
  BookmarkMessageSquareLock
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/page-transition"
import { useParams } from "next/navigation"
import Image from "next/image"

interface LaunchpadProject {
  id: string
  name: string
  description: string
  logo: string
  banner: string
  keyMetrics: {
    totalSupply: number
    mintPrice: number
    currency: string
    chain: string
    salePhase: 'upcoming' | 'live' | 'ended'
    minted: number
    remaining: number
    floorPrice?: number
    volume?: number
    holders?: number
  }
  primaryColor: string
  secondaryColor: string
  isVerified: boolean
}

interface NFT {
  id: string
  tokenId: string
  name: string
  description: string
  image: string
  traits: {
    trait_type: string
    value: string
    rarity: number
  }[]
  rarityScore: number
  rarityRank: number
  owner: string
  price?: number
  currency?: string
  isListed: boolean
  lastSale?: {
    price: number
    currency: string
    date: string
  }
  views: number
  likes: number
}

interface TraitFilter {
  trait_type: string
  values: {
    value: string
    count: number
    rarity: number
  }[]
}

interface PriceStats {
  floorPrice: number
  averagePrice: number
  highestSale: number
  totalVolume: number
  currency: string
}

export default function CollectionPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [project, setProject] = useState<LaunchpadProject | null>(null)
  const [nfts, setNfts] = useState<NFT[]>([])
  const [filteredNfts, setFilteredNfts] = useState<NFT[]>([])
  const [traitFilters, setTraitFilters] = useState<TraitFilter[]>([])
  const [priceStats, setPriceStats] = useState<PriceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("rarity")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedTraits, setSelectedTraits] = useState<Record<string, string[]>>({})
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchCollectionData()
  }, [projectId])

  useEffect(() => {
    applyFilters()
  }, [nfts, searchTerm, sortBy, selectedTraits, priceRange])

  const fetchCollectionData = async () => {
    setLoading(true)
    try {
      // Fetch project details
      const projectRes = await fetch(`/api/launchpad/projects/${projectId}`)
      const projectData = await projectRes.json()
      
      if (projectRes.ok) {
        setProject(projectData.project)
        
        // Fetch NFTs
        const nftsRes = await fetch(`/api/launchpad/projects/${projectId}/nfts`)
        const nftsData = await nftsRes.json()
        
        if (nftsRes.ok) {
          setNfts(nftsData.nfts || [])
        }
        
        // Fetch trait filters
        const traitsRes = await fetch(`/api/launchpad/projects/${projectId}/traits`)
        const traitsData = await traitsRes.json()
        
        if (traitsRes.ok) {
          setTraitFilters(traitsData.traits || [])
        }
        
        // Fetch price stats
        const statsRes = await fetch(`/api/launchpad/projects/${projectId}/stats`)
        const statsData = await statsRes.json()
        
        if (statsRes.ok) {
          setPriceStats(statsData.stats)
        }
      }
    } catch (error) {
      console.error("Failed to fetch collection data:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...nfts]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(nft => 
        nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.tokenId.includes(searchTerm)
      )
    }

    // Trait filters
    Object.entries(selectedTraits).forEach(([traitType, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter(nft => {
          const trait = nft.traits.find(t => t.trait_type === traitType)
          return trait && values.includes(trait.value)
        })
      }
    })

    // Price range filter
    filtered = filtered.filter(nft => {
      if (!nft.price) return true
      return nft.price >= priceRange[0] && nft.price <= priceRange[1]
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rarity":
          return a.rarityRank - b.rarityRank
        case "price-low":
          return (a.price || 0) - (b.price || 0)
        case "price-high":
          return (b.price || 0) - (a.price || 0)
        case "recent":
          return new Date(b.lastSale?.date || 0).getTime() - new Date(a.lastSale?.date || 0).getTime()
        case "views":
          return b.views - a.views
        case "likes":
          return b.likes - a.likes
        default:
          return a.rarityRank - b.rarityRank
      }
    })

    setFilteredNfts(filtered)
  }

  const handleTraitFilter = (traitType: string, value: string) => {
    setSelectedTraits(prev => {
      const current = prev[traitType] || []
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      
      return {
        ...prev,
        [traitType]: updated
      }
    })
  }

  const clearFilters = () => {
    setSelectedTraits({})
    setSearchTerm("")
    setPriceRange([0, 1000])
  }

  const getRarityColor = (rarity: number) => {
    if (rarity >= 90) return "text-red-500"
    if (rarity >= 70) return "text-orange-500"
    if (rarity >= 50) return "text-yellow-500"
    if (rarity >= 30) return "text-green-500"
    return "text-blue-500"
  }

  const getRarityBadge = (rarity: number) => {
    if (rarity >= 90) return "Legendary"
    if (rarity >= 70) return "Epic"
    if (rarity >= 50) return "Rare"
    if (rarity >= 30) return "Uncommon"
    return "Common"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading collection...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Project Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400">The project you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
          <div className="container mx-auto px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Image
                  src={project.logo}
                  alt={project.name}
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <div>
                  <h1 className="text-xl font-bold">{project.name}</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Collection</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Heart className="w-4 h-4 mr-2" />
                  Favorite
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-6 py-8">
          {/* Collection Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {nfts.length.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Items</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {priceStats?.floorPrice ? `${priceStats.floorPrice} ${project.keyMetrics.currency}` : 'TBD'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Floor Price</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {priceStats?.totalVolume ? `${priceStats.totalVolume.toLocaleString()} ${project.keyMetrics.currency}` : 'TBD'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Volume</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {project.keyMetrics.holders ? project.keyMetrics.holders.toLocaleString() : 'TBD'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Holders</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Column - Filters */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Filters
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs"
                    >
                      Clear All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Search */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search NFTs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rarity">Rarity</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="recent">Recently Sold</SelectItem>
                        <SelectItem value="views">Most Viewed</SelectItem>
                        <SelectItem value="likes">Most Liked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price Range</label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Trait Filters */}
                  {traitFilters.map((trait) => (
                    <div key={trait.trait_type}>
                      <label className="text-sm font-medium mb-2 block">
                        {trait.trait_type}
                      </label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {trait.values.map((value) => (
                          <div
                            key={value.value}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                            onClick={() => handleTraitFilter(trait.trait_type, value.value)}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedTraits[trait.trait_type]?.includes(value.value) || false}
                                onChange={() => {}}
                                className="rounded"
                              />
                              <span className="text-sm">{value.value}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500">{value.count}</span>
                              <span className={`text-xs ${getRarityColor(value.rarity)}`}>
                                {value.rarity.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - NFT Grid */}
            <div className="lg:col-span-3">
              {/* Controls */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold">
                    {filteredNfts.length} NFT{filteredNfts.length !== 1 ? 's' : ''}
                  </h2>
                  {Object.values(selectedTraits).some(traits => traits.length > 0) && (
                    <Badge variant="secondary">
                      {Object.values(selectedTraits).reduce((acc, traits) => acc + traits.length, 0)} filters
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
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

              {/* NFT Grid */}
              <StaggerContainer 
                className={`grid gap-4 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}
              >
                {filteredNfts.map((nft) => (
                  <StaggerItem key={nft.id}>
                    <motion.div
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card 
                        className="overflow-hidden cursor-pointer group"
                        onClick={() => setSelectedNft(nft)}
                      >
                        <div className="relative aspect-square">
                          <Image
                            src={nft.image}
                            alt={nft.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          
                          {/* Rarity Badge */}
                          <div className="absolute top-2 left-2">
                            <Badge 
                              className={`text-xs ${
                                nft.rarityScore >= 90 ? 'bg-red-500' :
                                nft.rarityScore >= 70 ? 'bg-orange-500' :
                                nft.rarityScore >= 50 ? 'bg-yellow-500' :
                                nft.rarityScore >= 30 ? 'bg-green-500' :
                                'bg-blue-500'
                              } text-white`}
                            >
                              #{nft.rarityRank}
                            </Badge>
                          </div>
                          
                          {/* Price Badge */}
                          {nft.price && (
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-black/80 text-white">
                                {nft.price} {nft.currency}
                              </Badge>
                            </div>
                          )}
                          
                          {/* Quick Actions */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex gap-2">
                              <Button size="sm" variant="secondary">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="secondary">
                                <Heart className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="secondary">
                                <Share2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <h3 className="font-semibold line-clamp-1">{nft.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {nft.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm font-medium">{nft.rarityScore.toFixed(1)}%</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  <span>{nft.views}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="w-3 h-3" />
                                  <span>{nft.likes}</span>
                                </div>
                              </div>
                            </div>
                            
                            {nft.price && (
                              <div className="pt-2 border-t">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">Price</span>
                                  <span className="font-semibold">
                                    {nft.price} {nft.currency}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </StaggerItem>
                ))}
              </StaggerContainer>

              {filteredNfts.length === 0 && (
                <div className="text-center py-16">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No NFTs found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Try adjusting your filters to find what you're looking for.
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* NFT Detail Modal */}
        <Dialog open={!!selectedNft} onOpenChange={() => setSelectedNft(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedNft && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* NFT Image */}
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={selectedNft.image}
                      alt={selectedNft.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge 
                        className={`${
                          selectedNft.rarityScore >= 90 ? 'bg-red-500' :
                          selectedNft.rarityScore >= 70 ? 'bg-orange-500' :
                          selectedNft.rarityScore >= 50 ? 'bg-yellow-500' :
                          selectedNft.rarityScore >= 30 ? 'bg-green-500' :
                          'bg-blue-500'
                        } text-white`}
                      >
                        #{selectedNft.rarityRank} • {getRarityBadge(selectedNft.rarityScore)}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* NFT Details */}
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{selectedNft.name}</h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {selectedNft.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Token ID</div>
                          <div className="font-semibold">{selectedNft.tokenId}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Rarity Score</div>
                          <div className="font-semibold">{selectedNft.rarityScore.toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Traits */}
                    <div>
                      <h3 className="font-semibold mb-3">Traits</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedNft.traits.map((trait, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {trait.trait_type}
                            </div>
                            <div className="font-semibold">{trait.value}</div>
                            <div className="text-xs text-gray-500">
                              {trait.rarity.toFixed(1)}% have this trait
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Price and Actions */}
                    {selectedNft.price && (
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Current Price</div>
                            <div className="text-2xl font-bold">
                              {selectedNft.price} {selectedNft.currency}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <Button className="flex-1">
                            <Wallet className="w-4 h-4 mr-2" />
                            Buy Now
                          </Button>
                          <Button variant="outline">
                            <Heart className="w-4 h-4 mr-2" />
                            Make Offer
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  )
}
