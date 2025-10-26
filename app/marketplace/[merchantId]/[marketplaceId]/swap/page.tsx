"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  ArrowLeft, 
  ArrowRightLeft, 
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
  Zap,
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
  Plus,
  History
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/page-transition"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Image from "next/image"
import { useWallet } from "@/hooks/use-wallet"
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button"
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
  createdAt: Date
  updatedAt?: Date
}

interface NFT {
  id: string
  name: string
  description: string
  image: string
  price: number
  currency: string
  owner: string
  assetId: number
  traits?: {
    trait_type: string
    value: string
    rarity: number
  }[]
  rarityScore?: number
  rarityRank?: number
}

interface SwapProposal {
  id: string
  fromUser: string
  toUser: string
  offeredNFT: NFT
  requestedNFT: NFT
  status: "pending" | "accepted" | "rejected" | "expired"
  createdAt: Date
  expiresAt: Date
}

export default function SwapPage({ params }: { params: { merchantId: string; marketplaceId: string } }) {
  const [marketplace, setMarketplace] = useState<Marketplace | null>(null)
  const [userNFTs, setUserNFTs] = useState<NFT[]>([])
  const [availableNFTs, setAvailableNFTs] = useState<NFT[]>([])
  const [swapProposals, setSwapProposals] = useState<SwapProposal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null)
  const [requestedNFT, setRequestedNFT] = useState<NFT | null>(null)
  const [showSwapDialog, setShowSwapDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBy, setFilterBy] = useState("all")
  const [sortBy, setSortBy] = useState("rarity")

  const { isConnected, account, connect, disconnect } = useWallet()

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

  const fetchUserNFTs = async () => {
    if (!isConnected || !account) return
    
    try {
      const response = await fetch(`/api/user/nfts?address=${account}`)
      const data = await response.json()
      
      if (response.ok) {
        setUserNFTs(data.nfts || [])
      }
    } catch (error) {
      console.error("Failed to fetch user NFTs:", error)
    }
  }

  const fetchAvailableNFTs = async () => {
    try {
      const response = await fetch(`/api/marketplaces/${params.marketplaceId}/nfts`)
      const data = await response.json()
      
      if (response.ok) {
        setAvailableNFTs(data.nfts || [])
      }
    } catch (error) {
      console.error("Failed to fetch available NFTs:", error)
    }
  }

  const fetchSwapProposals = async () => {
    if (!isConnected || !account) return
    
    try {
      const response = await fetch(`/api/swap/proposals?user=${account}`)
      const data = await response.json()
      
      if (response.ok) {
        setSwapProposals(data.proposals || [])
      }
    } catch (error) {
      console.error("Failed to fetch swap proposals:", error)
    }
  }

  useEffect(() => {
    fetchMarketplaceData()
  }, [params.marketplaceId])

  useEffect(() => {
    if (isConnected && account) {
      fetchUserNFTs()
      fetchSwapProposals()
    }
  }, [isConnected, account])

  useEffect(() => {
    fetchAvailableNFTs()
  }, [params.marketplaceId])

  const handleCreateSwap = async () => {
    if (!selectedNFT || !requestedNFT || !isConnected) return

    try {
      const response = await fetch("/api/swap/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromUser: account,
          toUser: requestedNFT.owner,
          offeredNFTId: selectedNFT.id,
          requestedNFTId: requestedNFT.id,
          marketplaceId: params.marketplaceId
        }),
      })

      if (response.ok) {
        setShowSwapDialog(false)
        setSelectedNFT(null)
        setRequestedNFT(null)
        fetchSwapProposals()
      }
    } catch (error) {
      console.error("Failed to create swap proposal:", error)
    }
  }

  const handleAcceptSwap = async (proposalId: string) => {
    try {
      const response = await fetch(`/api/swap/proposals/${proposalId}/accept`, {
        method: "POST",
      })

      if (response.ok) {
        fetchSwapProposals()
        fetchUserNFTs()
        fetchAvailableNFTs()
      }
    } catch (error) {
      console.error("Failed to accept swap:", error)
    }
  }

  const handleRejectSwap = async (proposalId: string) => {
    try {
      const response = await fetch(`/api/swap/proposals/${proposalId}/reject`, {
        method: "POST",
      })

      if (response.ok) {
        fetchSwapProposals()
      }
    } catch (error) {
      console.error("Failed to reject swap:", error)
    }
  }

  const filteredNFTs = availableNFTs.filter(nft => {
    const matchesSearch = nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nft.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <TemplateLoader marketplaceId={params.marketplaceId}>
      {({ marketplace, template, loading, getButtonStyle, getCardStyle, getBadgeStyle, getThemeStyles }) => {
        if (loading) {
          return <CreatePageLoadingTemplate />
        }

        if (!marketplace) {
          return (
            <SimpleLoadingTemplate message="Marketplace not found. Redirecting..." />
          )
        }

        return (
          <PageTransition>
            <div 
              className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              style={getThemeStyles()}
            >
              <MarketplaceHeader 
                marketplace={marketplace} 
                merchantId={params.merchantId} 
                marketplaceId={params.marketplaceId} 
              />
        
              <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
                {/* Header */}
                <FadeIn>
                  <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                          NFT Swap
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                          Trade your NFTs with other collectors in {marketplace?.businessName || 'this marketplace'}
                        </p>
                      </div>
                    </div>
                  </div>
                </FadeIn>

                <Tabs defaultValue="swap" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="swap">Swap</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                    <TabsTrigger value="proposals">Proposals</TabsTrigger>
                  </TabsList>

                  <TabsContent value="swap" className="space-y-6">
                    {/* Main Swap Interface */}
                    <div className="max-w-2xl mx-auto">
                      <Card 
                        className="bg-white dark:bg-gray-800 shadow-lg"
                        style={getCardStyle()}
                      >
                        <CardContent className="p-4 sm:p-6 lg:p-8">
                          {/* Auto Settings */}
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Auto</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Cog className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-400">Settings</span>
                            </div>
                          </div>

                          {/* Pay Section */}
                          <div className="mb-6">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Pay</Label>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">0</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">$0</div>
                              <div className="flex items-center justify-between">
                                <Button 
                                  variant="outline" 
                                  style={getButtonStyle('outline')}
                                >
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-6 h-6 rounded-full flex items-center justify-center"
                                      style={{ backgroundColor: marketplace?.primaryColor || '#8B5CF6' }}
                                    >
                                      <span className="text-xs font-bold text-white">S</span>
                                    </div>
                                    <span>SOL</span>
                                    <ChevronRight className="w-4 h-4" />
                                  </div>
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Percentage Buttons */}
                          <div className="flex items-center gap-2 mb-6 flex-wrap">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex-1 sm:flex-none"
                              style={getButtonStyle('outline')}
                            >
                              <ArrowRightLeft className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex-1 sm:flex-none"
                              style={getButtonStyle('outline')}
                            >
                              25%
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex-1 sm:flex-none"
                              style={getButtonStyle('outline')}
                            >
                              50%
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex-1 sm:flex-none"
                              style={getButtonStyle('outline')}
                            >
                              100%
                            </Button>
                          </div>

                          {/* Receive Section */}
                          <div className="mb-6">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Receive</Label>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">0</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">$0</div>
                              <div className="flex items-center justify-between">
                                <Button 
                                  variant="outline" 
                                  className="bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-500"
                                >
                                  <div className="flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    <span>Select</span>
                                    <ChevronRight className="w-4 h-4" />
                                  </div>
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Swap Button */}
                          <Button 
                            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-lg mb-4"
                            disabled={!isConnected}
                            style={getButtonStyle('primary')}
                          >
                            {isConnected ? 'Swap' : 'Log in to swap'}
                          </Button>

                          {/* Info Text */}
                          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            Swap services are available through{" "}
                            <span className="underline cursor-pointer hover:text-pink-500">third party API partners</span>
                          </p>

                          {/* Select Receiving Address Button */}
                          <Button 
                            variant="outline" 
                            className="w-full mt-4 bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/30"
                            style={getButtonStyle('outline')}
                          >
                            Select Receiving Address
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="space-y-6">
                    <Card style={getCardStyle()}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <History className="w-5 h-5" />
                          Swap History
                        </CardTitle>
                        <CardDescription>
                          View your past swap transactions
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {!isConnected ? (
                          <div className="flex flex-col items-center justify-center py-12">
                            <Wallet className="w-16 h-16 text-gray-400 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                              Connect Your Wallet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                              Connect your wallet to view swap history
                            </p>
                            <WalletConnectButton />
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>No swap history available yet</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="proposals" className="space-y-6">
                    <Card style={getCardStyle()}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ArrowRightLeft className="w-5 h-5" />
                          Swap Proposals
                        </CardTitle>
                        <CardDescription>
                          Manage your incoming and outgoing swap proposals
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {!isConnected ? (
                          <div className="flex flex-col items-center justify-center py-12">
                            <Wallet className="w-16 h-16 text-gray-400 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                              Connect Your Wallet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                              Connect your wallet to view swap proposals
                            </p>
                            <WalletConnectButton />
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {swapProposals.length === 0 ? (
                              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <ArrowRightLeft className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No active swap proposals</p>
                              </div>
                            ) : (
                              swapProposals.map((proposal, index) => (
                                <motion.div
                                  key={proposal.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                  <Card>
                                    <CardContent className="p-6">
                                      <div className="flex flex-col lg:flex-row gap-6">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-4">
                                            <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                                              <Image
                                                src={proposal.offeredNFT.image}
                                                alt={proposal.offeredNFT.name}
                                                fill
                                                className="object-cover"
                                              />
                                            </div>
                                            <div>
                                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                                {proposal.offeredNFT.name}
                                              </h4>
                                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Offered by {proposal.fromUser.slice(0, 6)}...{proposal.fromUser.slice(-4)}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-center">
                                          <ArrowRightLeft className="w-6 h-6 text-gray-400" />
                                        </div>
                                        
                                        <div className="flex-1">
                                          <div className="flex items-center gap-4">
                                            <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                                              <Image
                                                src={proposal.requestedNFT.image}
                                                alt={proposal.requestedNFT.name}
                                                fill
                                                className="object-cover"
                                              />
                                            </div>
                                            <div>
                                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                                {proposal.requestedNFT.name}
                                              </h4>
                                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Requested NFT
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <div className="flex flex-col gap-2">
                                          <Badge 
                                            className={`text-xs ${
                                              proposal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                              proposal.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                              proposal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                              'bg-gray-100 text-gray-800'
                                            }`}
                                          >
                                            {proposal.status}
                                          </Badge>
                                          {proposal.status === 'pending' && (
                                            <div className="flex gap-2">
                                              <Button
                                                size="sm"
                                                onClick={() => handleAcceptSwap(proposal.id)}
                                                className="bg-green-600 hover:bg-green-700"
                                              >
                                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                                Accept
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleRejectSwap(proposal.id)}
                                              >
                                                <XCircle className="w-4 h-4 mr-1" />
                                                Reject
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              ))
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Swap Dialog */}
                <Dialog open={showSwapDialog} onOpenChange={setShowSwapDialog}>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Swap Proposal</DialogTitle>
                      <DialogDescription>
                        Select an NFT from your collection to offer in exchange
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {selectedNFT && (
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">Your NFT</h4>
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                              <Image
                                src={selectedNFT.image}
                                alt={selectedNFT.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{selectedNFT.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {selectedNFT.price} {selectedNFT.currency}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {requestedNFT && (
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">Requested NFT</h4>
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                              <Image
                                src={requestedNFT.image}
                                alt={requestedNFT.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{requestedNFT.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {requestedNFT.price} {requestedNFT.currency}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowSwapDialog(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleCreateSwap}
                          disabled={!selectedNFT || !requestedNFT}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          <ArrowRightLeft className="w-4 h-4 mr-2" />
                          Create Swap Proposal
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
        
              <MarketplaceFooter marketplace={marketplace} />
            </div>
          </PageTransition>
        )
      }}
    </TemplateLoader>
  )
}