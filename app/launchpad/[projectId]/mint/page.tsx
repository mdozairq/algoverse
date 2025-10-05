"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
    startDate: string
    endDate?: string
    minted: number
    remaining: number
  }
  primaryColor: string
  secondaryColor: string
  isVerified: boolean
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
  whitelistAddresses?: string[]
}

interface WalletInfo {
  address: string
  balance: number
  currency: string
  isConnected: boolean
}

export default function MintPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [project, setProject] = useState<LaunchpadProject | null>(null)
  const [mintPhases, setMintPhases] = useState<MintPhase[]>([])
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [mintQuantity, setMintQuantity] = useState(1)
  const [minting, setMinting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null>(null)
  const [currentPhase, setCurrentPhase] = useState<MintPhase | null>(null)
  const [isEligible, setIsEligible] = useState(false)
  const [mintError, setMintError] = useState<string | null>(null)
  const [mintSuccess, setMintSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchProjectData()
    checkWalletConnection()
  }, [projectId])

  useEffect(() => {
    if (project?.keyMetrics.salePhase === 'live' && project.keyMetrics.startDate) {
      const interval = setInterval(() => {
        updateCountdown()
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [project])

  useEffect(() => {
    if (mintPhases.length > 0) {
      const activePhase = mintPhases.find(phase => phase.isActive)
      setCurrentPhase(activePhase || null)
    }
  }, [mintPhases])

  useEffect(() => {
    if (wallet && currentPhase) {
      checkEligibility()
    }
  }, [wallet, currentPhase])

  const fetchProjectData = async () => {
    setLoading(true)
    try {
      const projectRes = await fetch(`/api/launchpad/projects/${projectId}`)
      const projectData = await projectRes.json()
      
      if (projectRes.ok) {
        setProject(projectData.project)
        
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

  const checkWalletConnection = async () => {
    try {
      // Check if wallet is connected
      const response = await fetch('/api/wallet/status')
      if (response.ok) {
        const data = await response.json()
        if (data.connected) {
          setWallet({
            address: data.address,
            balance: data.balance,
            currency: data.currency,
            isConnected: true
          })
        }
      }
    } catch (error) {
      console.error("Failed to check wallet connection:", error)
    }
  }

  const connectWallet = async () => {
    try {
      const response = await fetch('/api/wallet/connect', {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        setWallet({
          address: data.address,
          balance: data.balance,
          currency: data.currency,
          isConnected: true
        })
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  const checkEligibility = async () => {
    if (!wallet || !currentPhase) return

    try {
      const response = await fetch(`/api/launchpad/projects/${projectId}/eligibility`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          walletAddress: wallet.address,
          phaseId: currentPhase.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        setIsEligible(data.eligible)
      }
    } catch (error) {
      console.error("Failed to check eligibility:", error)
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

  const handleMint = async () => {
    if (!wallet || !currentPhase || !project) return

    setMinting(true)
    setMintError(null)
    setMintSuccess(null)

    try {
      const response = await fetch(`/api/launchpad/projects/${projectId}/mint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          walletAddress: wallet.address,
          quantity: mintQuantity,
          phaseId: currentPhase.id
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMintSuccess(`Successfully minted ${mintQuantity} NFT(s)! Transaction: ${data.transactionId}`)
        // Refresh project data to update minted count
        fetchProjectData()
      } else {
        setMintError(data.error || 'Minting failed')
      }
    } catch (error) {
      console.error("Minting error:", error)
      setMintError('Minting failed. Please try again.')
    } finally {
      setMinting(false)
    }
  }

  const getProgressPercentage = () => {
    if (!project) return 0
    return (project.keyMetrics.minted / project.keyMetrics.totalSupply) * 100
  }

  const getTotalCost = () => {
    if (!currentPhase) return 0
    return currentPhase.price * mintQuantity
  }

  const canMint = () => {
    return wallet?.isConnected && 
           currentPhase?.isActive && 
           isEligible && 
           mintQuantity > 0 && 
           mintQuantity <= currentPhase.maxPerWallet &&
           wallet.balance >= getTotalCost()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading mint page...</p>
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Mint Page</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {wallet?.isConnected ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">
                      {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {wallet.balance} {wallet.currency}
                    </span>
                  </div>
                ) : (
                  <Button onClick={connectWallet}>
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Mint Widget */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Overview */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Image
                      src={project.logo}
                      alt={project.name}
                      width={60}
                      height={60}
                      className="rounded-xl"
                    />
                    <div>
                      <h2 className="text-2xl font-bold">{project.name}</h2>
                      <p className="text-gray-600 dark:text-gray-400">{project.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold">{project.keyMetrics.totalSupply.toLocaleString()}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Supply</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{project.keyMetrics.mintPrice} {project.keyMetrics.currency}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Mint Price</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{project.keyMetrics.minted.toLocaleString()}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Minted</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{project.keyMetrics.remaining.toLocaleString()}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Remaining</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                        <div className="text-2xl font-bold">{timeRemaining.days}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Days</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{timeRemaining.hours}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Hours</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{timeRemaining.minutes}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Minutes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{timeRemaining.seconds}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Seconds</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Current Phase */}
              {currentPhase && (
                <Card>
                  <CardHeader>
                    <CardTitle>Current Phase: {currentPhase.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-600 dark:text-gray-400">{currentPhase.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Phase Price</Label>
                          <div className="text-lg font-semibold">
                            {currentPhase.price} {project.keyMetrics.currency}
                          </div>
                        </div>
                        <div>
                          <Label>Max Per Wallet</Label>
                          <div className="text-lg font-semibold">{currentPhase.maxPerWallet}</div>
                        </div>
                      </div>
                      
                      {currentPhase.isWhitelist && (
                        <Alert>
                          <Shield className="h-4 w-4" />
                          <AlertDescription>
                            This is a whitelist phase. Only whitelisted addresses can mint.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Mint Widget */}
              <Card>
                <CardHeader>
                  <CardTitle>Mint Your NFTs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Quantity Selector */}
                    <div>
                      <Label>Quantity</Label>
                      <div className="flex items-center gap-4 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setMintQuantity(Math.max(1, mintQuantity - 1))}
                          disabled={mintQuantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input
                          type="number"
                          value={mintQuantity}
                          onChange={(e) => setMintQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-20 text-center"
                          min="1"
                          max={currentPhase?.maxPerWallet || 5}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setMintQuantity(Math.min(currentPhase?.maxPerWallet || 5, mintQuantity + 1))}
                          disabled={mintQuantity >= (currentPhase?.maxPerWallet || 5)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Max {currentPhase?.maxPerWallet || 5} per wallet
                      </p>
                    </div>

                    {/* Total Cost */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total Cost</span>
                        <span className="text-2xl font-bold">
                          {getTotalCost()} {project.keyMetrics.currency}
                        </span>
                      </div>
                    </div>

                    {/* Mint Button */}
                    <Button
                      className="w-full"
                      size="lg"
                      disabled={!canMint() || minting}
                      onClick={handleMint}
                      style={{ 
                        backgroundColor: project.primaryColor,
                        color: 'white'
                      }}
                    >
                      {minting ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Minting...
                        </>
                      ) : !wallet?.isConnected ? (
                        <>
                          <Wallet className="w-4 h-4 mr-2" />
                          Connect Wallet to Mint
                        </>
                      ) : !currentPhase?.isActive ? (
                        <>
                          <Clock className="w-4 h-4 mr-2" />
                          Sale Not Active
                        </>
                      ) : !isEligible ? (
                        <>
                          <UserX className="w-4 h-4 mr-2" />
                          Not Eligible
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Mint {mintQuantity} NFT{mintQuantity > 1 ? 's' : ''}
                        </>
                      )}
                    </Button>

                    {/* Error/Success Messages */}
                    {mintError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{mintError}</AlertDescription>
                      </Alert>
                    )}

                    {mintSuccess && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>{mintSuccess}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Step-by-Step Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle>How to Mint</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold">Connect Your Wallet</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Connect your Algorand wallet to participate in the mint.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold">Select Quantity</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Choose how many NFTs you want to mint (up to the maximum allowed).
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold">Confirm Transaction</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Review the total cost and confirm the transaction in your wallet.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                        4
                      </div>
                      <div>
                        <h4 className="font-semibold">Receive Your NFTs</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Your NFTs will be minted and transferred to your wallet.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Wallet Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Wallet Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {wallet?.isConnected ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Connected</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {wallet.address.slice(0, 8)}...{wallet.address.slice(-8)}
                      </div>
                      <div className="text-sm">
                        Balance: <span className="font-semibold">{wallet.balance} {wallet.currency}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Wallet className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Connect your wallet to mint
                      </p>
                      <Button onClick={connectWallet} size="sm">
                        Connect Wallet
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Eligibility Status */}
              {currentPhase && (
                <Card>
                  <CardHeader>
                    <CardTitle>Eligibility</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      {isEligible ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-sm font-medium text-green-600">Eligible to mint</span>
                        </>
                      ) : (
                        <>
                          <UserX className="w-5 h-5 text-red-500" />
                          <span className="text-sm font-medium text-red-600">Not eligible</span>
                        </>
                      )}
                    </div>
                    {currentPhase.isWhitelist && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                        Whitelist phase - only whitelisted addresses can mint
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Tokenomics */}
              <Card>
                <CardHeader>
                  <CardTitle>Tokenomics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Supply</span>
                      <span className="text-sm font-semibold">{project.keyMetrics.totalSupply.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Mint Price</span>
                      <span className="text-sm font-semibold">{project.keyMetrics.mintPrice} {project.keyMetrics.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Chain</span>
                      <span className="text-sm font-semibold">{project.keyMetrics.chain}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Share */}
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
