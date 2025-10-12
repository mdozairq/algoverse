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
  Zap,
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
  MessageSquareLock
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
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button"

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

interface MintTemplate {
  id: string
  name: string
  description: string
  image: string
  price: number
  currency: string
  totalSupply: number
  availableSupply: number
  traits: {
    trait_type: string
    value: string
    rarity: number
  }[]
  mintingConfig: {
    startDate: Date
    endDate: Date
    maxPerWallet: number
    whitelistRequired: boolean
  }
}

interface MintSession {
  id: string
  templateId: string
  userAddress: string
  quantity: number
  status: "pending" | "processing" | "completed" | "failed"
  transactionHash?: string
  nftIds?: string[]
  createdAt: Date
}

export default function MintPage({ params }: { params: { merchantId: string; marketplaceId: string } }) {
  const [marketplace, setMarketplace] = useState<Marketplace | null>(null)
  const [mintTemplates, setMintTemplates] = useState<MintTemplate[]>([])
  const [userMintSessions, setUserMintSessions] = useState<MintSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<MintTemplate | null>(null)
  const [mintQuantity, setMintQuantity] = useState(1)
  const [showMintDialog, setShowMintDialog] = useState(false)
  const [minting, setMinting] = useState(false)
  const [mintProgress, setMintProgress] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBy, setFilterBy] = useState("all")
  const [sortBy, setSortBy] = useState("price")

  const { isConnected, account, connect, disconnect, sendTransaction } = useWallet()

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

  const fetchMintTemplates = async () => {
    try {
      const response = await fetch(`/api/marketplaces/${params.marketplaceId}/mint-templates`)
      const data = await response.json()
      
      if (response.ok) {
        setMintTemplates(data.templates || [])
      }
    } catch (error) {
      console.error("Failed to fetch mint templates:", error)
    }
  }

  const fetchUserMintSessions = async () => {
    if (!isConnected || !account) return
    
    try {
      const response = await fetch(`/api/user/mint-sessions?address=${account}`)
      const data = await response.json()
      
      if (response.ok) {
        setUserMintSessions(data.sessions || [])
      }
    } catch (error) {
      console.error("Failed to fetch mint sessions:", error)
    }
  }

  useEffect(() => {
    fetchMarketplaceData()
    fetchMintTemplates()
  }, [params.marketplaceId])

  useEffect(() => {
    if (isConnected && account) {
      fetchUserMintSessions()
    }
  }, [isConnected, account])

  const handleMint = async () => {
    if (!selectedTemplate || !isConnected || !account) return

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

      const response = await fetch("/api/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          userAddress: account,
          quantity: mintQuantity,
          marketplaceId: params.marketplaceId
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Simulate transaction
        if (sendTransaction) {
          await sendTransaction({
            to: marketplace?.walletAddress || "",
            amount: selectedTemplate.price * mintQuantity,
            note: `Mint ${mintQuantity} ${selectedTemplate.name}`
          })
        }

        setMintProgress(100)
        setShowMintDialog(false)
        setSelectedTemplate(null)
        setMintQuantity(1)
        fetchUserMintSessions()
        fetchMintTemplates()
      }
    } catch (error) {
      console.error("Failed to mint NFT:", error)
    } finally {
      setMinting(false)
      setMintProgress(0)
    }
  }

  const filteredTemplates = mintTemplates.filter(template => {
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
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading mint marketplace...</p>
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
            <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
                    NFT Minting Studio
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Create and mint unique NFTs in {marketplace.businessName}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <WalletConnectButton />
                </div>
              </div>
            </div>
          </FadeIn>

          <Tabs defaultValue="templates" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="templates">Mint Templates</TabsTrigger>
              <TabsTrigger value="my-mints">My Mints</TabsTrigger>
              <TabsTrigger value="create">Create Template</TabsTrigger>
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
                          placeholder="Search mint templates..."
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
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="ended">Ended</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="supply">Supply</SelectItem>
                        <SelectItem value="recent">Recent</SelectItem>
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
                            {template.availableSupply}/{template.totalSupply} left
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
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Price</span>
                              <span className="font-semibold">{template.price} {template.currency}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Supply</span>
                              <span className="font-semibold">{template.totalSupply}</span>
                            </div>
                            <Progress 
                              value={(template.totalSupply - template.availableSupply) / template.totalSupply * 100} 
                              className="h-2"
                            />
                          </div>
                          
                          <Button
                            onClick={() => {
                              setSelectedTemplate(template)
                              setShowMintDialog(true)
                            }}
                            disabled={!isConnected || template.availableSupply === 0}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            {template.availableSupply === 0 ? 'Sold Out' : 'Mint Now'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="my-mints" className="space-y-6">
              {!isConnected ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Wallet className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Connect Your Wallet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                      Connect your wallet to view your minted NFTs
                    </p>
                    <WalletConnectButton />
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {userMintSessions.map((session, index) => (
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
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                <Zap className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  Mint Session #{session.id.slice(0, 8)}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {session.quantity} NFT(s) • {new Date(session.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge 
                                className={`text-xs ${
                                  session.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  session.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                  session.status === 'failed' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {session.status}
                              </Badge>
                              {session.transactionHash && (
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-1" />
                                  View TX
                                </Button>
                              )}
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
              <Card>
                <CardHeader>
                  <CardTitle>Create Mint Template</CardTitle>
                  <CardDescription>
                    Create a new mint template for your NFT collection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="templateName">Template Name</Label>
                      <Input
                        id="templateName"
                        placeholder="Enter template name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="templatePrice">Price</Label>
                      <Input
                        id="templatePrice"
                        type="number"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="templateDescription">Description</Label>
                    <Textarea
                      id="templateDescription"
                      placeholder="Describe your NFT collection"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="totalSupply">Total Supply</Label>
                      <Input
                        id="totalSupply"
                        type="number"
                        placeholder="1000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxPerWallet">Max Per Wallet</Label>
                      <Input
                        id="maxPerWallet"
                        type="number"
                        placeholder="5"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="templateImage">Template Image</Label>
                    <Input
                      id="templateImage"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <Button className="w-full">
                    <Zap className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Mint Dialog */}
        <Dialog open={showMintDialog} onOpenChange={setShowMintDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Mint NFT</DialogTitle>
              <DialogDescription>
                {selectedTemplate?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedTemplate && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden">
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
                        {selectedTemplate.price} {selectedTemplate.currency} each
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="mintQuantity">Quantity</Label>
                    <Input
                      id="mintQuantity"
                      type="number"
                      min="1"
                      max={selectedTemplate.availableSupply}
                      value={mintQuantity}
                      onChange={(e) => setMintQuantity(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Total Cost:</span>
                      <span className="font-semibold">
                        {(selectedTemplate.price * mintQuantity).toFixed(2)} {selectedTemplate.currency}
                      </span>
                    </div>
                  </div>
                  
                  {minting && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Minting Progress</span>
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
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {minting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Minting...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Mint {mintQuantity} NFT{mintQuantity > 1 ? 's' : ''}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
        
        <MarketplaceFooter marketplace={marketplace} />
      </div>
    </PageTransition>
  )
}
