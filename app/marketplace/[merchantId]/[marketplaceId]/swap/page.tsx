"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useTinymanSwap } from "@/hooks/use-tinyman-swap"
import { WalletMintService } from "@/lib/algorand/wallet-mint-service"
import { tinymanSwapService } from "@/lib/tinyman/tinyman-swap-service"
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

  // Tinyman swap state
  const [selectedAssetInId, setSelectedAssetInId] = useState<number | null>(null)
  const [selectedAssetOutId, setSelectedAssetOutId] = useState<number | null>(null)
  const [swapAmount, setSwapAmount] = useState<string>("")
  const [slippage, setSlippage] = useState<number>(0.01)
  const [userAssets, setUserAssets] = useState<Array<{ assetId: number; name: string; unitName: string; balance: number; decimals: number }>>([])
  const [loadingAssets, setLoadingAssets] = useState(false)
  const [swapDirection, setSwapDirection] = useState<'ASA_TO_ALGO' | 'ALGO_TO_ASA'>('ASA_TO_ALGO')

  const { isConnected, account, connect, disconnect } = useWallet()
  
  // Use Tinyman swap hook
  const walletAddress = account?.address || null
  const {
    quote,
    loading: quoteLoading,
    error: swapError,
    txStatus,
    assetInfo,
    balance,
    outputBalance,
    getQuote,
    executeSwap,
    clearQuote,
    clearError,
    refreshBalance,
    refreshOutputBalance
  } = useTinymanSwap(params.merchantId, walletAddress)

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
    if (!isConnected || !account?.address) return
    
    try {
      const response = await fetch(`/api/user/nfts?address=${account.address}`)
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
    // NFT swap proposals not implemented - focusing on Tinyman swaps
    setSwapProposals([])
  }

  useEffect(() => {
    fetchMarketplaceData()
  }, [params.marketplaceId])

  useEffect(() => {
    if (isConnected && account) {
      fetchUserNFTs()
      fetchSwapProposals()
      fetchUserAssets()
    }
  }, [isConnected, account])

  // Fetch user's assets for swap using Tinyman service
  const fetchUserAssets = async () => {
    if (!account?.address) {
      setUserAssets([])
      return
    }
    
    setLoadingAssets(true)
    try {
      console.log('Fetching user assets for address:', account.address)
      
      // Use the efficient getUserAssets method
      const assets = await tinymanSwapService.getUserAssets(account.address)
      console.log('Final assets list:', assets)
      setUserAssets(assets)
    } catch (error) {
      console.error("Failed to fetch user assets:", error)
      setUserAssets([])
    } finally {
      setLoadingAssets(false)
    }
  }

  // Handle amount input change
  const handleAmountChange = useCallback((value: string) => {
    console.log('Amount changed:', value)
    setSwapAmount(value)
    clearError()
    
    const numValue = parseFloat(value)
    console.log('Parsed value:', numValue, 'selectedAssetInId:', selectedAssetInId, 'selectedAssetOutId:', selectedAssetOutId)
    
    // Clear quote if amount is invalid - useEffect will handle fetching new quote
    if (!numValue || numValue <= 0) {
      console.log('Clearing quote - invalid amount')
      clearQuote()
    }
  }, [clearQuote, clearError])

  // Get asset display name
  const getAssetDisplayName = useCallback((assetId: number | null) => {
    if (assetId === null) return "Select"
    if (assetId === 0) return "ALGO"
    
    const asset = userAssets.find(a => a.assetId === assetId)
    return asset ? (asset.unitName || asset.name) : "Select"
  }, [userAssets])

  // Add these helper functions to get balances from userAssets
  const getAssetBalance = useCallback((assetId: number | null): number => {
    if (assetId === null) return 0
    const asset = userAssets.find(a => a.assetId === assetId)
    return asset ? asset.balance : 0
  }, [userAssets])

  const getInputBalance = useCallback(() => {
    return getAssetBalance(selectedAssetInId)
  }, [selectedAssetInId, getAssetBalance])

  const getOutputBalance = useCallback(() => {
    return getAssetBalance(selectedAssetOutId)
  }, [selectedAssetOutId, getAssetBalance])

  // Handle input asset selection
  const handleAssetInSelect = useCallback(async (value: string) => {
    const assetId = parseInt(value)
    console.log('Input asset selected:', assetId, 'userAssets:', userAssets.length)
    
    setSelectedAssetInId(assetId)
    clearQuote()
    
    // Auto-set output asset to ALGO if input is ASA, or to first available ASA if input is ALGO
    if (assetId === 0) {
      // Input is ALGO, set output to first available ASA (excluding ALGO)
      const firstAsa = userAssets.find(asset => asset.assetId !== 0)
      console.log('First ASA found:', firstAsa)
      if (firstAsa) {
        setSelectedAssetOutId(firstAsa.assetId)
        setSwapDirection('ALGO_TO_ASA')
        console.log('Set output asset to:', firstAsa.assetId)
      }
    } else {
      // Input is ASA, set output to ALGO
      setSelectedAssetOutId(0)
      setSwapDirection('ASA_TO_ALGO')
      console.log('Set output asset to ALGO (0)')
    }
    
    // Don't get quote here - let useEffect handle it when both assets are selected
    
    if (walletAddress) {
      await refreshBalance(assetId, walletAddress)
    }
  }, [swapAmount, slippage, walletAddress, getQuote, clearQuote, refreshBalance, userAssets])

  // Handle output asset selection
  const handleAssetOutSelect = useCallback(async (value: string) => {
    const assetId = parseInt(value)
    console.log('Output asset selected:', assetId, 'selectedAssetInId:', selectedAssetInId)
    
    setSelectedAssetOutId(assetId)
    clearQuote()
    
    // Update swap direction
    if (selectedAssetInId === 0) {
      setSwapDirection('ALGO_TO_ASA')
      console.log('Set swap direction to ALGO_TO_ASA')
    } else {
      setSwapDirection('ASA_TO_ALGO')
      console.log('Set swap direction to ASA_TO_ALGO')
    }
    
    if (swapAmount && parseFloat(swapAmount) > 0 && selectedAssetInId !== null) {
      console.log('Getting quote after output asset selection:', selectedAssetInId, '->', assetId)
      await getQuote(selectedAssetInId, assetId, parseFloat(swapAmount), slippage)
    }
    
    if (walletAddress) {
      await refreshOutputBalance(assetId, walletAddress)
    }
  }, [swapAmount, slippage, walletAddress, getQuote, clearQuote, refreshOutputBalance, selectedAssetInId])

  // Handle slippage change
  const handleSlippageChange = useCallback(async (newSlippage: number) => {
    setSlippage(newSlippage)
    
    if (selectedAssetInId && selectedAssetOutId && swapAmount && parseFloat(swapAmount) > 0) {
      await getQuote(selectedAssetInId, selectedAssetOutId, parseFloat(swapAmount), newSlippage)
    }
  }, [selectedAssetInId, selectedAssetOutId, swapAmount, getQuote])

  // Handle swap execution
  const handleSwap = useCallback(async () => {
    if (!quote || !isConnected || !selectedAssetInId || !selectedAssetOutId || !swapAmount) return
    
    try {
      const result = await executeSwap(quote)
      
      if (result) {
        // Reset form after successful swap
        setSwapAmount("")
        setSelectedAssetInId(null)
        setSelectedAssetOutId(null)
        clearQuote()
        
        // Refresh assets
        if (account?.address) {
          await fetchUserAssets()
        }
      }
    } catch (error) {
      console.error("Swap error:", error)
    }
  }, [quote, isConnected, executeSwap, account, clearQuote, selectedAssetInId, selectedAssetOutId, swapAmount])

  // Set percentage buttons
  const handlePercentageClick = useCallback((percentage: number) => {
    console.log('Percentage clicked:', percentage, 'selectedAssetInId:', selectedAssetInId)
    
    if (!selectedAssetInId) {
      console.log('No asset selected, cannot apply percentage')
      return
    }
    
    const currentBalance = getInputBalance()
    console.log('Current balance:', currentBalance)
    
    if (currentBalance <= 0) {
      console.log('No balance available for percentage calculation')
      return
    }
    
    const amount = (currentBalance * percentage / 100).toString()
    console.log('Calculated amount:', amount)
    
    setSwapAmount(amount)
    handleAmountChange(amount)
  }, [selectedAssetInId, getInputBalance, handleAmountChange])

  // Calculate conversion rate
  const getConversionRate = useCallback(() => {
    if (!quote || !quote.poolExists || quote.input.amount <= 0) return null
    
    const rate = quote.output.amount / quote.input.amount
    return {
      rate,
      display: `1 ${quote.input.asset.unitName || quote.input.asset.name} = ${rate.toFixed(6)} ${quote.output.asset.unitName || quote.output.asset.name}`
    }
  }, [quote])

  const conversionRate = getConversionRate()

  // Refresh hook balances when assets are selected
  useEffect(() => {
    if (selectedAssetInId && walletAddress) {
      refreshBalance(selectedAssetInId, walletAddress)
    }
  }, [selectedAssetInId, walletAddress, refreshBalance])

  useEffect(() => {
    if (selectedAssetOutId && walletAddress) {
      refreshOutputBalance(selectedAssetOutId, walletAddress)
    }
  }, [selectedAssetOutId, walletAddress, refreshOutputBalance])

  // Add this useEffect to debug balance issues
  useEffect(() => {
    console.log('Current balances:', {
      selectedAssetInId,
      selectedAssetOutId,
      hookBalance: balance,
      hookOutputBalance: outputBalance,
      userAssetsBalance: getInputBalance(),
      userAssetsOutputBalance: getOutputBalance(),
      userAssets
    })
  }, [selectedAssetInId, selectedAssetOutId, balance, outputBalance, getInputBalance, getOutputBalance, userAssets])

  // Auto-fetch quote when both assets are selected and amount is entered
  useEffect(() => {
    const numValue = parseFloat(swapAmount)
    console.log('Quote useEffect triggered:', {
      selectedAssetInId,
      selectedAssetOutId,
      swapAmount,
      numValue,
      quoteLoading,
      userAssets: userAssets.length
    })
    
    if (selectedAssetInId !== null && selectedAssetOutId !== null && numValue > 0 && !quoteLoading) {
      console.log('Auto-fetching quote:', selectedAssetInId, '->', selectedAssetOutId, 'amount:', numValue)
      getQuote(selectedAssetInId, selectedAssetOutId, numValue, slippage)
    } else {
      console.log('Not fetching quote:', {
        hasInputAsset: selectedAssetInId !== null,
        hasOutputAsset: selectedAssetOutId !== null,
        hasAmount: numValue > 0,
        notLoading: !quoteLoading
      })
    }
  }, [selectedAssetInId, selectedAssetOutId, swapAmount, slippage, getQuote, quoteLoading])

  useEffect(() => {
    fetchAvailableNFTs()
  }, [params.marketplaceId])

  const handleCreateSwap = async () => {
    // NFT swap proposals not implemented - focusing on Tinyman swaps
    console.log("NFT swap proposals not implemented")
  }

  const handleAcceptSwap = async (proposalId: string) => {
    // NFT swap proposals not implemented - focusing on Tinyman swaps
    console.log("NFT swap proposals not implemented")
  }

  const handleRejectSwap = async (proposalId: string) => {
    // NFT swap proposals not implemented - focusing on Tinyman swaps
    console.log("NFT swap proposals not implemented")
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
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="swap">Swap</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                  </TabsList>

                  <TabsContent value="swap" className="space-y-6">
                    {/* Main Swap Interface */}
                    <div className="max-w-2xl mx-auto">
                      <Card 
                        className="bg-white dark:bg-gray-800 shadow-lg"
                        style={getCardStyle()}
                      >
                        <CardContent className="p-4 sm:p-6 lg:p-8">
                          {/* Settings */}
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Tinyman Swap</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Cog className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-400">Slippage: {(slippage * 100).toFixed(1)}%</span>
                            </div>
                          </div>

                          {/* Input Section */}
                          <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">From</Label>
                              {selectedAssetInId !== null && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Balance: {getInputBalance().toFixed(6)} {getAssetDisplayName(selectedAssetInId)}
                                </span>
                              )}
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <Input
                                    type="number"
                                    placeholder="0.0"
                                    value={swapAmount}
                                    onChange={(e) => handleAmountChange(e.target.value)}
                                    className="text-4xl font-bold border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 mb-1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] h-16"
                                    disabled={!isConnected}
                                  />
                                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {getAssetDisplayName(selectedAssetInId)}
                                  </div>
                                </div>
                                <Select
                                  value={selectedAssetInId !== null ? selectedAssetInId.toString() : undefined}
                                  onValueChange={handleAssetInSelect}
                                  disabled={!isConnected || (userAssets.length === 0 && !loadingAssets)}
                                >
                                  <SelectTrigger className="w-[140px] border-0 bg-transparent px-3 py-2 bg-gray-100 dark:bg-gray-600 rounded-lg text-gray-900 dark:text-gray-100">
                                    <SelectValue placeholder={isConnected ? (loadingAssets ? "Loading..." : userAssets.length === 0 ? "No assets" : "Select") : "Connect"}>
                                      {selectedAssetInId !== null && (
                                        <div className="flex items-center gap-2">
                                          <Coins className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                                          <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {getAssetDisplayName(selectedAssetInId)}
                                          </span>
                                        </div>
                                      )}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {loadingAssets ? (
                                      <div className="px-2 py-1.5 text-sm text-gray-500 text-center">
                                        Loading assets...
                                      </div>
                                    ) : userAssets.length === 0 ? (
                                      <div className="px-2 py-1.5 text-sm text-gray-500 text-center">
                                        No assets found
                                      </div>
                                    ) : (
                                      userAssets.map((asset) => (
                                        <SelectItem key={asset.assetId} value={asset.assetId.toString()}>
                                          <div className="flex items-center justify-between w-full">
                                            <span className="truncate">{asset.unitName || asset.name}</span>
                                            <span className="text-xs text-gray-500 ml-2">
                                              {asset.balance.toFixed(4)}
                                            </span>
                                          </div>
                                        </SelectItem>
                                      ))
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                              {isConnected && userAssets.length === 0 && !loadingAssets && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                  No assets found in your wallet. You need assets to swap.
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Percentage Buttons */}
                          {selectedAssetInId !== null && getInputBalance() > 0 && (
                            <div className="flex items-center gap-2 mb-6 flex-wrap">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex-1 sm:flex-none"
                                style={getButtonStyle('outline')}
                                onClick={() => handlePercentageClick(25)}
                              >
                                25%
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex-1 sm:flex-none"
                                style={getButtonStyle('outline')}
                                onClick={() => handlePercentageClick(50)}
                              >
                                50%
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex-1 sm:flex-none"
                                style={getButtonStyle('outline')}
                                onClick={() => handlePercentageClick(75)}
                              >
                                75%
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex-1 sm:flex-none"
                                style={getButtonStyle('outline')}
                                onClick={() => handlePercentageClick(100)}
                              >
                                100%
                              </Button>
                            </div>
                          )}

                          {/* Conversion Rate Display - Always show when available */}
                          {conversionRate && (
                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Conversion Rate</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                  {conversionRate.display}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Quote Display */}
                          {quote && quote.poolExists && (
                            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">You will receive</span>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {quote.output.amount.toFixed(6)}
                                  </div>
                                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {quote.output.asset.unitName || quote.output.asset.name}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                <div className="flex justify-between">
                                  <span>Minimum received:</span>
                                  <span className="font-medium text-gray-900 dark:text-gray-100">
                                    {quote.minAmountOut.toFixed(6)} {quote.output.asset.unitName || quote.output.asset.name}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Price impact:</span>
                                  <span className={`font-medium ${quote.fees.priceImpact > 1 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                                    {quote.fees.priceImpact.toFixed(2)}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Swap fee:</span>
                                  <span className="font-medium text-gray-900 dark:text-gray-100">
                                    {quote.fees.swapFee.toFixed(6)} {quote.output.asset.unitName || quote.output.asset.name}
                                  </span>
                                </div>
                              </div>
                              {quote.fees.priceImpact > 1 && (
                                <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-xs text-yellow-800 dark:text-yellow-200">
                                  <AlertCircle className="w-4 h-4 inline mr-1" />
                                  High price impact warning
                                </div>
                              )}
                            </div>
                          )}

                          {/* Error Display */}
                          {swapError && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-sm">{swapError}</span>
                              </div>
                            </div>
                          )}

                          {/* Pool Not Found */}
                          {quote && !quote.poolExists && (
                            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                              <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                                <Info className="w-4 h-4" />
                                <span className="text-sm">No liquidity pool found for this asset. Cannot swap.</span>
                              </div>
                            </div>
                          )}

                          {/* Output Section */}
                          <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">To</Label>
                              {selectedAssetOutId !== null && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Balance: {getOutputBalance().toFixed(6)} {getAssetDisplayName(selectedAssetOutId)}
                                </span>
                              )}
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                    {quoteLoading ? (
                                      <span className="animate-pulse">...</span>
                                    ) : quote && quote.poolExists ? (
                                      quote.output.amount.toFixed(6)
                                    ) : (
                                      '0'
                                    )}
                                  </div>
                                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {getAssetDisplayName(selectedAssetOutId)}
                                  </div>
                          {/* Debug info */}
                          {process.env.NODE_ENV === 'development' && (
                            <div className="text-xs text-gray-400 mt-1 space-y-1">
                              <div>Debug: {quote ? `Quote exists, pool: ${quote.poolExists}` : 'No quote'} | Loading: {quoteLoading ? 'Yes' : 'No'}</div>
                              <div>Assets: {selectedAssetInId} → {selectedAssetOutId} | Amount: {swapAmount}</div>
                              <div>Balances: {getInputBalance().toFixed(4)} | {getOutputBalance().toFixed(4)}</div>
                              <div>User Assets: {userAssets.length} | Connected: {isConnected ? 'Yes' : 'No'}</div>
                            </div>
                          )}
                                </div>
                                <Select
                                  value={selectedAssetOutId !== null ? selectedAssetOutId.toString() : undefined}
                                  onValueChange={handleAssetOutSelect}
                                  disabled={!isConnected || (userAssets.length === 0 && !loadingAssets)}
                                >
                                  <SelectTrigger className="w-[140px] border-0 bg-transparent px-3 py-2 bg-gray-100 dark:bg-gray-600 rounded-lg text-gray-900 dark:text-gray-100">
                                    <SelectValue placeholder={isConnected ? (loadingAssets ? "Loading..." : userAssets.length === 0 ? "No assets" : "Select") : "Connect"}>
                                      {selectedAssetOutId !== null && (
                                        <div className="flex items-center gap-2">
                                          <Coins className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                                          <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {getAssetDisplayName(selectedAssetOutId)}
                                          </span>
                                        </div>
                                      )}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {loadingAssets ? (
                                      <div className="px-2 py-1.5 text-sm text-gray-500 text-center">
                                        Loading assets...
                                      </div>
                                    ) : userAssets.length === 0 ? (
                                      <div className="px-2 py-1.5 text-sm text-gray-500 text-center">
                                        No assets found
                                      </div>
                                    ) : (
                                      <>
                                        <SelectItem value="0">
                                          <div className="flex items-center gap-2">
                                            <Coins className="w-4 h-4" />
                                            <span>ALGO</span>
                                          </div>
                                        </SelectItem>
                                        {userAssets.filter(asset => asset.assetId !== 0).map((asset) => (
                                          <SelectItem key={asset.assetId} value={asset.assetId.toString()}>
                                            <div className="flex items-center justify-between w-full">
                                              <span className="truncate">{asset.unitName || asset.name}</span>
                                              <span className="text-xs text-gray-500 ml-2">
                                                {asset.balance.toFixed(4)}
                                              </span>
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </>
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          {/* Slippage Settings */}
                          <div className="mb-6">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                              Slippage Tolerance
                            </Label>
                            <div className="flex gap-2">
                              <Button
                                variant={slippage === 0.005 ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleSlippageChange(0.005)}
                                style={slippage === 0.005 ? getButtonStyle('primary') : getButtonStyle('outline')}
                              >
                                0.5%
                              </Button>
                              <Button
                                variant={slippage === 0.01 ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleSlippageChange(0.01)}
                                style={slippage === 0.01 ? getButtonStyle('primary') : getButtonStyle('outline')}
                              >
                                1%
                              </Button>
                              <Button
                                variant={slippage === 0.03 ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleSlippageChange(0.03)}
                                style={slippage === 0.03 ? getButtonStyle('primary') : getButtonStyle('outline')}
                              >
                                3%
                              </Button>
                            </div>
                          </div>

                          {/* Swap Button */}
                          {!isConnected ? (
                            <Button 
                              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-lg mb-4"
                              onClick={() => connect()}
                              style={getButtonStyle('primary')}
                            >
                              <Wallet className="w-4 h-4 mr-2" />
                              Connect Wallet to Swap
                            </Button>
                          ) : (
                            <Button 
                              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-lg mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={(() => {
                                const conditions = {
                                  noInputAsset: !selectedAssetInId,
                                  noOutputAsset: !selectedAssetOutId,
                                  noQuote: !quote,
                                  noPool: !quote?.poolExists,
                                  loading: quoteLoading,
                                  notIdle: txStatus !== 'idle',
                                  noAmount: !swapAmount,
                                  invalidAmount: parseFloat(swapAmount) <= 0,
                                  insufficientBalance: parseFloat(swapAmount) > getInputBalance()
                                }
                                const isDisabled = Object.values(conditions).some(Boolean)
                                console.log('Swap button disabled conditions:', conditions, 'isDisabled:', isDisabled)
                                return isDisabled
                              })()}
                              onClick={handleSwap}
                              style={getButtonStyle('primary')}
                            >
                              {txStatus === 'preparing' && 'Preparing...'}
                              {txStatus === 'signing' && 'Signing Transaction...'}
                              {txStatus === 'submitting' && 'Submitting...'}
                              {txStatus === 'confirming' && 'Waiting for Confirmation...'}
                              {txStatus === 'confirmed' && 'Swap Confirmed ✓'}
                              {txStatus === 'failed' && 'Swap Failed'}
                              {txStatus === 'idle' && (
                                quoteLoading ? 'Fetching Quote...' : 
                                !selectedAssetInId || !selectedAssetOutId ? 'Select Assets' :
                                !quote || !quote.poolExists ? 'No Pool Available' :
                                !swapAmount || parseFloat(swapAmount) <= 0 ? 'Enter Amount' :
                                parseFloat(swapAmount) > getInputBalance() ? 'Insufficient Balance' :
                                `Swap ${swapDirection === 'ASA_TO_ALGO' ? 'to ALGO' : 'to ASA'}`
                              )}
                            </Button>
                          )}

                          {/* Info Text */}
                          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            Powered by{" "}
                            <a 
                              href="https://tinyman.org" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="underline cursor-pointer hover:text-pink-500"
                            >
                              Tinyman
                            </a>
                            {" "}AMM Protocol
                          </p>
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