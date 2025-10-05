"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Filter, 
  Activity,
  Clock,
  User,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
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
  BarChart3,
  PieChart,
  LineChart,
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
  BookmarkMessageSquareLock,
  ExternalLink,
  Copy as CopyIcon
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
  }
  primaryColor: string
  secondaryColor: string
  isVerified: boolean
}

interface ActivityItem {
  id: string
  type: 'mint' | 'sale' | 'transfer' | 'list' | 'delist' | 'offer' | 'bid'
  timestamp: string
  fromAddress: string
  toAddress?: string
  tokenId: string
  nftName: string
  nftImage: string
  price?: number
  currency?: string
  transactionHash: string
  blockNumber: number
  gasUsed?: number
  gasPrice?: number
  status: 'pending' | 'confirmed' | 'failed'
}

interface ActivityStats {
  totalMints: number
  totalSales: number
  totalVolume: number
  averagePrice: number
  uniqueBuyers: number
  uniqueSellers: number
  currency: string
}

export default function ActivityPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [project, setProject] = useState<LaunchpadProject | null>(null)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([])
  const [stats, setStats] = useState<ActivityStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activityType, setActivityType] = useState("all")
  const [timeRange, setTimeRange] = useState("24h")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)

  useEffect(() => {
    fetchActivityData()
  }, [projectId])

  useEffect(() => {
    applyFilters()
  }, [activities, searchTerm, activityType, timeRange])

  const fetchActivityData = async () => {
    setLoading(true)
    try {
      // Fetch project details
      const projectRes = await fetch(`/api/launchpad/projects/${projectId}`)
      const projectData = await projectRes.json()
      
      if (projectRes.ok) {
        setProject(projectData.project)
        
        // Fetch activities
        const activitiesRes = await fetch(`/api/launchpad/projects/${projectId}/activity`)
        const activitiesData = await activitiesRes.json()
        
        if (activitiesRes.ok) {
          setActivities(activitiesData.activities || [])
        }
        
        // Fetch stats
        const statsRes = await fetch(`/api/launchpad/projects/${projectId}/activity/stats`)
        const statsData = await statsRes.json()
        
        if (statsRes.ok) {
          setStats(statsData.stats)
        }
      }
    } catch (error) {
      console.error("Failed to fetch activity data:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...activities]

    // Activity type filter
    if (activityType !== "all") {
      filtered = filtered.filter(activity => activity.type === activityType)
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(activity => 
        activity.nftName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.tokenId.includes(searchTerm) ||
        activity.fromAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activity.toAddress && activity.toAddress.toLowerCase().includes(searchTerm.toLowerCase())) ||
        activity.transactionHash.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Time range filter
    const now = new Date()
    const timeRanges = {
      '1h': 1 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      'all': Infinity
    }
    
    if (timeRange !== "all") {
      const cutoffTime = now.getTime() - timeRanges[timeRange as keyof typeof timeRanges]
      filtered = filtered.filter(activity => 
        new Date(activity.timestamp).getTime() >= cutoffTime
      )
    }

    setFilteredActivities(filtered)
    setCurrentPage(1)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'mint': return <Zap className="w-4 h-4" />
      case 'sale': return <DollarSign className="w-4 h-4" />
      case 'transfer': return <ArrowRight className="w-4 h-4" />
      case 'list': return <TrendingUp className="w-4 h-4" />
      case 'delist': return <TrendingDown className="w-4 h-4" />
      case 'offer': return <Target className="w-4 h-4" />
      case 'bid': return <Award className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'mint': return 'text-green-500'
      case 'sale': return 'text-blue-500'
      case 'transfer': return 'text-gray-500'
      case 'list': return 'text-yellow-500'
      case 'delist': return 'text-red-500'
      case 'offer': return 'text-purple-500'
      case 'bid': return 'text-orange-500'
      default: return 'text-gray-500'
    }
  }

  const getActivityText = (type: string) => {
    switch (type) {
      case 'mint': return 'Minted'
      case 'sale': return 'Sold'
      case 'transfer': return 'Transferred'
      case 'list': return 'Listed'
      case 'delist': return 'Delisted'
      case 'offer': return 'Offer Made'
      case 'bid': return 'Bid Placed'
      default: return 'Activity'
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading activity...</p>
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Activity</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-6 py-8">
          {/* Activity Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalMints.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Mints</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalSales.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Sales</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalVolume.toLocaleString()} {stats.currency}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Volume</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.averagePrice.toFixed(2)} {stats.currency}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Average Price</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.uniqueBuyers.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Unique Buyers</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search by NFT name, token ID, or wallet address..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Select value={activityType} onValueChange={setActivityType}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Activity</SelectItem>
                      <SelectItem value="mint">Mints</SelectItem>
                      <SelectItem value="sale">Sales</SelectItem>
                      <SelectItem value="transfer">Transfers</SelectItem>
                      <SelectItem value="list">Listings</SelectItem>
                      <SelectItem value="delist">Delistings</SelectItem>
                      <SelectItem value="offer">Offers</SelectItem>
                      <SelectItem value="bid">Bids</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">Last Hour</SelectItem>
                      <SelectItem value="24h">Last 24h</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
                <Badge variant="secondary">{filteredActivities.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paginatedActivities.length > 0 ? (
                <div className="space-y-4">
                  {paginatedActivities.map((activity) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      {/* NFT Image */}
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={activity.nftImage}
                          alt={activity.nftName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      {/* Activity Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`${getActivityColor(activity.type)}`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <span className="font-semibold">{getActivityText(activity.type)}</span>
                          <span className="text-gray-600 dark:text-gray-400">#{activity.tokenId}</span>
                        </div>
                        
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {activity.nftName}
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>From: {formatAddress(activity.fromAddress)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0"
                              onClick={() => copyToClipboard(activity.fromAddress)}
                            >
                              <CopyIcon className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          {activity.toAddress && (
                            <div className="flex items-center gap-1">
                              <ArrowRight className="w-3 h-3" />
                              <span>To: {formatAddress(activity.toAddress)}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0"
                                onClick={() => copyToClipboard(activity.toAddress!)}
                              >
                                <CopyIcon className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                          
                          {activity.price && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              <span>{activity.price} {activity.currency}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Timestamp and Status */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {formatTime(activity.timestamp)}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={activity.status === 'confirmed' ? 'default' : 
                                   activity.status === 'pending' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {activity.status}
                          </Badge>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(activity.transactionHash)}
                          >
                            <CopyIcon className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No activity found</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your filters to see more activity.
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredActivities.length)} of {filteredActivities.length} activities
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        )
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}
