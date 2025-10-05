"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Clock, 
  Users, 
  TrendingUp, 
  ExternalLink, 
  Share2, 
  Heart, 
  Twitter, 
  Globe, 
  Discord, 
  Instagram,
  ArrowRight,
  Star,
  Eye,
  MessageCircle,
  Calendar,
  MapPin,
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
  User,
  LogOut,
  Home,
  Package,
  BarChart3,
  HelpCircle,
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
  MessageSquareLock
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
  longDescription: string
  category: string
  logo: string
  banner: string
  website?: string
  twitter?: string
  discord?: string
  instagram?: string
  socialLinks: {
    website?: string
    twitter?: string
    discord?: string
    instagram?: string
    telegram?: string
  }
  keyMetrics: {
    totalSupply: number
    mintPrice: number
    currency: string
    chain: string
    salePhase: 'upcoming' | 'live' | 'ended'
    startDate: string
    endDate?: string
    minted: number
    remaining: number
    floorPrice?: number
    volume?: number
    holders?: number
  }
  tokenomics: {
    totalSupply: number
    publicSale: number
    teamAllocation: number
    communityRewards: number
    treasury: number
    liquidity: number
  }
  roadmap: {
    phase: string
    title: string
    description: string
    status: 'completed' | 'in-progress' | 'upcoming'
    date: string
  }[]
  team: {
    name: string
    role: string
    bio: string
    avatar: string
    socialLinks: {
      twitter?: string
      linkedin?: string
      github?: string
    }
  }[]
  faq: {
    question: string
    answer: string
  }[]
  traits: {
    name: string
    values: {
      value: string
      count: number
      rarity: number
    }[]
  }[]
  primaryColor: string
  secondaryColor: string
  isVerified: boolean
  isFeatured: boolean
  createdAt: Date
  updatedAt?: Date
}

interface MintPhase {
  id: string
  name: string
  description: string
  startTime: string
  endTime?: string
  price: number
  maxPerWallet: number
  isWhitelist: boolean
  isActive: boolean
  minted: number
  total: number
}

export default function LaunchpadProjectPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [project, setProject] = useState<LaunchpadProject | null>(null)
  const [mintPhases, setMintPhases] = useState<MintPhase[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null>(null)

  useEffect(() => {
    fetchProjectData()
  }, [projectId])

  useEffect(() => {
    if (project?.keyMetrics.salePhase === 'live' && project.keyMetrics.startDate) {
      const interval = setInterval(() => {
        updateCountdown()
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [project])

  const fetchProjectData = async () => {
    setLoading(true)
    try {
      // Fetch project details
      const projectRes = await fetch(`/api/launchpad/projects/${projectId}`)
      const projectData = await projectRes.json()
      
      if (projectRes.ok) {
        setProject(projectData.project)
        
        // Fetch mint phases
        const phasesRes = await fetch(`/api/launchpad/projects/${projectId}/phases`)
        const phasesData = await phasesRes.json()
        
        if (phasesRes.ok) {
          setMintPhases(phasesData.phases || [])
        }
      }
    } catch (error) {
      console.error("Failed to fetch project data:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateCountdown = () => {
    if (!project?.keyMetrics.startDate) return

    const now = new Date().getTime()
    const startTime = new Date(project.keyMetrics.startDate).getTime()
    const difference = startTime - now

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeRemaining({ days, hours, minutes, seconds })
    } else {
      setTimeRemaining(null)
    }
  }

  const getProgressPercentage = () => {
    if (!project) return 0
    return (project.keyMetrics.minted / project.keyMetrics.totalSupply) * 100
  }

  const getSalePhaseColor = (phase: string) => {
    switch (phase) {
      case 'upcoming': return 'bg-yellow-500'
      case 'live': return 'bg-green-500'
      case 'ended': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getSalePhaseText = (phase: string) => {
    switch (phase) {
      case 'upcoming': return 'Upcoming'
      case 'live': return 'Live Now'
      case 'ended': return 'Sale Ended'
      default: return 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading project...</p>
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
          <p className="text-gray-600 dark:text-gray-400">The project you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Banner */}
        <div className="relative h-96 overflow-hidden">
          <Image
            src={project.banner}
            alt={project.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Project Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="container mx-auto">
              <div className="flex items-end gap-6">
                <div className="relative">
                  <Image
                    src={project.logo}
                    alt={project.name}
                    width={120}
                    height={120}
                    className="rounded-2xl shadow-2xl border-4 border-white"
                  />
                  {project.isVerified && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold">{project.name}</h1>
                    <Badge 
                      className={`${getSalePhaseColor(project.keyMetrics.salePhase)} text-white`}
                    >
                      {getSalePhaseText(project.keyMetrics.salePhase)}
                    </Badge>
                    {project.isFeatured && (
                      <Badge className="bg-purple-500 text-white">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-lg text-gray-200 mb-4 max-w-2xl">
                    {project.description}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="border-white text-white">
                      {project.category}
                    </Badge>
                    <Badge variant="outline" className="border-white text-white">
                      {project.keyMetrics.chain}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm">Live</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 lg:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Key Metrics Cards */}
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StaggerItem>
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {project.keyMetrics.totalSupply.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Supply</div>
                    </CardContent>
                  </Card>
                </StaggerItem>
                
                <StaggerItem>
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {project.keyMetrics.mintPrice} {project.keyMetrics.currency}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Mint Price</div>
                    </CardContent>
                  </Card>
                </StaggerItem>
                
                <StaggerItem>
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {project.keyMetrics.minted.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Minted</div>
                    </CardContent>
                  </Card>
                </StaggerItem>
                
                <StaggerItem>
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {project.keyMetrics.remaining.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Remaining</div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              </StaggerContainer>

              {/* Progress Bar */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Mint Progress</h3>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {project.keyMetrics.minted.toLocaleString()} / {project.keyMetrics.totalSupply.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={getProgressPercentage()} className="h-3" />
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <span>0%</span>
                    <span>{getProgressPercentage().toFixed(1)}%</span>
                    <span>100%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Countdown Timer */}
              {timeRemaining && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Sale Starts In</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          {timeRemaining.days}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Days</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          {timeRemaining.hours}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Hours</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          {timeRemaining.minutes}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Minutes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          {timeRemaining.seconds}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Seconds</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tabs Navigation */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="mint">Mint</TabsTrigger>
                  <TabsTrigger value="collection">Collection</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>About {project.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {project.longDescription}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Social Links */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Connect With Us</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4">
                        {project.socialLinks.website && (
                          <Button variant="outline" asChild>
                            <Link href={project.socialLinks.website} target="_blank">
                              <Globe className="w-4 h-4 mr-2" />
                              Website
                            </Link>
                          </Button>
                        )}
                        {project.socialLinks.twitter && (
                          <Button variant="outline" asChild>
                            <Link href={project.socialLinks.twitter} target="_blank">
                              <Twitter className="w-4 h-4 mr-2" />
                              Twitter
                            </Link>
                          </Button>
                        )}
                        {project.socialLinks.discord && (
                          <Button variant="outline" asChild>
                            <Link href={project.socialLinks.discord} target="_blank">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Discord
                            </Link>
                          </Button>
                        )}
                        {project.socialLinks.instagram && (
                          <Button variant="outline" asChild>
                            <Link href={project.socialLinks.instagram} target="_blank">
                              <Instagram className="w-4 h-4 mr-2" />
                              Instagram
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* FAQ */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Frequently Asked Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {project.faq.map((item, index) => (
                          <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                            <h4 className="font-semibold mb-2">{item.question}</h4>
                            <p className="text-gray-600 dark:text-gray-400">{item.answer}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Mint Tab */}
                <TabsContent value="mint">
                  <Card>
                    <CardHeader>
                      <CardTitle>Mint Your {project.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Mint Widget Coming Soon</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          The minting interface will be available when the sale goes live.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Collection Tab */}
                <TabsContent value="collection">
                  <Card>
                    <CardHeader>
                      <CardTitle>Collection Gallery</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Gallery Coming Soon</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          The collection gallery will be available after minting begins.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Activity Feed Coming Soon</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Track recent mints, sales, and transfers here.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Roadmap Tab */}
                <TabsContent value="roadmap">
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Roadmap</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {project.roadmap.map((milestone, index) => (
                          <div key={index} className="flex items-start gap-4">
                            <div className={`w-4 h-4 rounded-full mt-2 ${
                              milestone.status === 'completed' ? 'bg-green-500' :
                              milestone.status === 'in-progress' ? 'bg-blue-500' :
                              'bg-gray-300'
                            }`} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{milestone.title}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {milestone.date}
                                </Badge>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {milestone.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Team Tab */}
                <TabsContent value="team">
                  <Card>
                    <CardHeader>
                      <CardTitle>Meet the Team</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {project.team.map((member, index) => (
                          <div key={index} className="flex items-start gap-4">
                            <Image
                              src={member.avatar}
                              alt={member.name}
                              width={60}
                              height={60}
                              className="rounded-full"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold">{member.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {member.role}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {member.bio}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Mint Widget */}
              <Card>
                <CardHeader>
                  <CardTitle>Mint Now</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {project.keyMetrics.mintPrice} {project.keyMetrics.currency}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">per NFT</div>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      size="lg"
                      style={{ 
                        backgroundColor: project.primaryColor,
                        color: 'white'
                      }}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Connect Wallet to Mint
                    </Button>
                    
                    <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                      Max 5 per wallet
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Floor Price</span>
                      <span className="font-semibold">
                        {project.keyMetrics.floorPrice ? 
                          `${project.keyMetrics.floorPrice} ${project.keyMetrics.currency}` : 
                          'TBD'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Volume</span>
                      <span className="font-semibold">
                        {project.keyMetrics.volume ? 
                          `${project.keyMetrics.volume.toLocaleString()} ${project.keyMetrics.currency}` : 
                          'TBD'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Holders</span>
                      <span className="font-semibold">
                        {project.keyMetrics.holders ? 
                          project.keyMetrics.holders.toLocaleString() : 
                          'TBD'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Share Project */}
              <Card>
                <CardHeader>
                  <CardTitle>Share Project</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Heart className="w-4 h-4 mr-2" />
                      Favorite
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
