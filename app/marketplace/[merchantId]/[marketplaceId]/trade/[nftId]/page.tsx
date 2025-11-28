"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Wallet,
  Clock,
  DollarSign,
  Users,
  Activity,
  Share2,
  Copy,
  CheckCircle2,
  XCircle,
  AlertCircle,
  LineChart,
  BarChart3,
  Calendar,
  Tag,
  Eye,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { PageTransition, FadeIn } from "@/components/animations/page-transition"
import MarketplaceHeader from "@/components/marketplace/marketplace-header"
import MarketplaceFooter from "@/components/marketplace/marketplace-footer"
import TemplateLoader from "@/components/marketplace/template-loader"
import { CreatePageLoadingTemplate } from "@/components/ui/loading-templates"
import { useWallet } from "@/hooks/use-wallet"
import { useToast } from "@/hooks/use-toast"
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Loader2, X, Trash2 } from "lucide-react"

interface NFT {
  id: string
  name: string
  description: string
  image: string
  price: number
  currency: string
  owner: string
  ownerAddress?: string
  listed: boolean
  assetId: number
  collectionId?: string
  metadata?: any
  createdAt: string
  updatedAt?: string
}

interface TradingOrder {
  id: string
  nftId: string
  price: number
  currency: string
  sellerAddress: string
  status: string
  createdAt: string
  expiresAt: string
}

interface TradeHistory {
  id: string
  price: number
  currency: string
  buyerAddress: string
  sellerAddress: string
  transactionId: string
  createdAt: string
}

interface PriceDataPoint {
  date: string
  price: number
  volume: number
}

export default function NFTTradePage({
  params,
}: {
  params: { merchantId: string; marketplaceId: string; nftId: string }
}) {
  const router = useRouter()
  const [nft, setNft] = useState<NFT | null>(null)
  const [activeListings, setActiveListings] = useState<TradingOrder[]>([])
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([])
  const [priceData, setPriceData] = useState<PriceDataPoint[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showListDialog, setShowListDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [listPrice, setListPrice] = useState("")
  const [timeRange, setTimeRange] = useState<"1D" | "7D" | "30D" | "ALL">("30D")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<TradingOrder | null>(null)
  const [transactionInfo, setTransactionInfo] = useState<any>(null)
  const [balance, setBalance] = useState<number | null>(null)

  const { isConnected, account, connect, signMessage, signTransactions, refreshBalance } = useWallet()
  const { toast } = useToast()

  useEffect(() => {
    fetchNFTDetails()
  }, [params.marketplaceId, params.nftId])

  useEffect(() => {
    if (isConnected && account?.address) {
      checkBalance()
    }
  }, [isConnected, account?.address])

  const checkBalance = async () => {
    if (!account?.address) return
    try {
      const bal = await refreshBalance()
      setBalance(bal)
    } catch (error) {
      console.error("Error checking balance:", error)
    }
  }

  const fetchNFTDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/marketplaces/${params.marketplaceId}/trading/nfts/${params.nftId}`
      )
      if (response.ok) {
        const data = await response.json()
        setNft(data.nft)
        setActiveListings(data.activeListings || [])
        setTradeHistory(data.tradeHistory || [])
        setStatistics(data.statistics || {})

        // Process price data for chart
        const processedData = processPriceData(data.tradeHistory || [], timeRange)
        setPriceData(processedData)
      } else {
        console.error("Failed to fetch NFT details")
      }
    } catch (error) {
      console.error("Error fetching NFT details:", error)
    } finally {
      setLoading(false)
    }
  }

  const processPriceData = (history: TradeHistory[], range: string): PriceDataPoint[] => {
    if (history.length === 0) {
      // Return mock data for demonstration
      const now = new Date()
      const data: PriceDataPoint[] = []
      const days = range === "1D" ? 1 : range === "7D" ? 7 : range === "30D" ? 30 : 90
      
      for (let i = days; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        data.push({
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          price: parseFloat((Math.random() * 10 + 5).toFixed(2)),
          volume: Math.floor(Math.random() * 5),
        })
      }
      return data
    }

    // Group trades by date
    const grouped = history.reduce((acc: any, trade: TradeHistory) => {
      const date = new Date(trade.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
      if (!acc[date]) {
        acc[date] = { prices: [], count: 0 }
      }
      acc[date].prices.push(trade.price)
      acc[date].count++
      return acc
    }, {})

    // Convert to chart data
    return Object.entries(grouped).map(([date, data]: [string, any]) => ({
      date,
      price: data.prices.reduce((sum: number, p: number) => sum + p, 0) / data.prices.length,
      volume: data.count,
    }))
  }

  const handleListNFT = async () => {
    if (!account || !account.address || !nft) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    const price = parseFloat(listPrice)
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price greater than 0",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)
      setProcessingStep("Creating order...")

      // Create order payload and sign it
      const { createOrderPayload, serializeOrderPayload } = await import("@/lib/trading/order-signing")

      const orderPayloadObj = createOrderPayload({
        marketplaceId: params.marketplaceId,
        nftId: nft.id,
        assetId: nft.assetId,
        sellerAddress: account.address,
        price,
        currency: "ALGO",
        expiresInSeconds: 7 * 24 * 60 * 60,
      })

      setProcessingStep("Signing order...")
      const payloadString = serializeOrderPayload(orderPayloadObj)
      const signature = await signMessage(payloadString)

      const signedOrder = {
        ...orderPayloadObj,
        signature,
        orderId: `order-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
      }

      setProcessingStep("Submitting listing...")
      const response = await fetch(
        `/api/marketplaces/${params.marketplaceId}/trading/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ signedOrder }),
        }
      )

      if (response.ok) {
        toast({
          title: "Success!",
          description: "NFT listed successfully",
        })
        setShowListDialog(false)
        setListPrice("")
        fetchNFTDetails()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to list NFT")
      }
    } catch (error: any) {
      console.error("Error listing NFT:", error)
      toast({
        title: "Listing Failed",
        description: error.message || "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setProcessingStep("")
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!account || !account.address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)
      setProcessingStep("Cancelling order...")

      const response = await fetch(
        `/api/marketplaces/${params.marketplaceId}/trading/orders/${orderId}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userAddress: account.address,
          }),
        }
      )

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Order cancelled successfully",
        })
        setShowCancelDialog(false)
        setSelectedOrder(null)
        fetchNFTDetails()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to cancel order")
      }
    } catch (error: any) {
      console.error("Error cancelling order:", error)
      toast({
        title: "Cancellation Failed",
        description: error.message || "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setProcessingStep("")
    }
  }

  const prepareTrade = async (orderId: string) => {
    if (!account || !account.address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)
      setProcessingStep("Preparing trade...")

      // Prepare trade
      const prepareResponse = await fetch(
        `/api/marketplaces/${params.marketplaceId}/trading/execute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
            buyerAddress: account.address,
          }),
        }
      )

      if (!prepareResponse.ok) {
        const error = await prepareResponse.json()
        throw new Error(error.error || "Failed to prepare trade")
      }

      const prepareData = await prepareResponse.json()
      
      // Check balance
      const totalPrice = prepareData.transactionInfo?.totalPrice || 0
      if (balance !== null && balance < totalPrice) {
        throw new Error(`Insufficient balance. You need ${totalPrice.toFixed(2)} ALGO but have ${balance.toFixed(2)} ALGO`)
      }

      setTransactionInfo(prepareData.transactionInfo)
      setSelectedOrder(activeListings.find(o => o.id === orderId) || null)
      setShowConfirmDialog(true)
    } catch (error: any) {
      console.error("Error preparing trade:", error)
      toast({
        title: "Trade Preparation Failed",
        description: error.message || "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setProcessingStep("")
    }
  }

  const executeTrade = async () => {
    if (!account || !account.address || !selectedOrder) {
      return
    }

    try {
      setIsProcessing(true)
      setProcessingStep("Preparing transactions...")

      // Prepare trade again to get fresh transaction data
      const prepareResponse = await fetch(
        `/api/marketplaces/${params.marketplaceId}/trading/execute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: selectedOrder.id,
            buyerAddress: account.address,
          }),
        }
      )

      if (!prepareResponse.ok) {
        const error = await prepareResponse.json()
        throw new Error(error.error || "Failed to prepare trade")
      }

      const prepareData = await prepareResponse.json()
      const {
        transactions,
        buyerTransactionIndices,
        sellerTransactionIndices,
        transactionGroup,
      } = prepareData

      setProcessingStep("Signing transactions...")
      // Sign buyer transactions
      const buyerTransactions = buyerTransactionIndices.map(
        (idx: number) => transactions[idx]
      )
      const signedBuyerTransactions = await signTransactions(buyerTransactions)

      // Reconstruct full transaction array
      const allSignedTransactions = [...transactions]
      buyerTransactionIndices.forEach((idx: number, i: number) => {
        allSignedTransactions[idx] = signedBuyerTransactions[i]
      })

      setProcessingStep("Submitting to blockchain...")
      // Execute trade
      const executeResponse = await fetch(
        `/api/marketplaces/${params.marketplaceId}/trading/execute`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: selectedOrder.id,
            signedTransactions: allSignedTransactions,
            buyerWalletAddress: account.address,
            transactionGroup: transactions,
            buyerTransactionIndices,
            sellerTransactionIndices,
          }),
        }
      )

      if (executeResponse.ok) {
        const executeData = await executeResponse.json()
        setShowConfirmDialog(false)
        toast({
          title: "Trade Successful!",
          description: `Transaction: ${executeData.transactionId.slice(0, 8)}...`,
        })
        await checkBalance()
        fetchNFTDetails()
      } else {
        const error = await executeResponse.json()
        throw new Error(error.error || "Failed to execute trade")
      }
    } catch (error: any) {
      console.error("Error executing trade:", error)
      toast({
        title: "Trade Failed",
        description: error.message || "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setProcessingStep("")
      setSelectedOrder(null)
      setTransactionInfo(null)
    }
  }

  const formatPrice = (price: number | null | undefined) => {
    if (price == null || isNaN(price)) return "N/A"
    return `${price.toFixed(2)} ALGO`
  }

  const formatAddress = (address: string) => {
    if (!address) return "N/A"
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const isOwner = account?.address?.toLowerCase() === nft?.owner?.toLowerCase() || 
                  account?.address?.toLowerCase() === nft?.ownerAddress?.toLowerCase()

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <CreatePageLoadingTemplate />
        </div>
      </PageTransition>
    )
  }

  if (!nft) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              NFT Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The NFT you're looking for doesn't exist or hasn't been minted yet.
            </p>
            <Link href={`/marketplace/${params.merchantId}/${params.marketplaceId}/trade`}>
              <Button>Back to Trading</Button>
            </Link>
          </div>
        </div>
      </PageTransition>
    )
  }

  const lowestListing = activeListings.length > 0 ? activeListings[0] : null

  return (
    <TemplateLoader marketplaceId={params.marketplaceId}>
      {({ marketplace, template, loading: templateLoading, getButtonStyle, getCardStyle, getBadgeStyle, getThemeStyles }) => {
        if (templateLoading) {
          return <CreatePageLoadingTemplate />
        }

        if (!marketplace) {
          return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
              <p>Marketplace not found</p>
            </div>
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
                {/* Back Button */}
                <FadeIn>
                  <div className="mb-6">
                    <Link href={`/marketplace/${params.merchantId}/${params.marketplaceId}/trade`}>
                      <Button variant="outline" className="rounded-full">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Trading
                      </Button>
                    </Link>
                  </div>
                </FadeIn>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - NFT Image and Details */}
                  <div className="lg:col-span-1 space-y-6">
                    <FadeIn>
                      <Card style={getCardStyle()}>
                        <CardContent className="p-0">
                          <div className="aspect-square relative rounded-t-lg overflow-hidden">
                            <Image
                              src={nft.image}
                              alt={nft.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </CardContent>
                        <CardHeader>
                          <CardTitle className="text-2xl">{nft.name}</CardTitle>
                          <CardDescription>{nft.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Owner</span>
                            <span className="font-medium">{formatAddress(nft.owner || nft.ownerAddress || "")}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Asset ID</span>
                            <span className="font-medium">{nft.assetId}</span>
                          </div>
                          {nft.collectionId && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Collection</span>
                              <span className="font-medium">#{nft.collectionId.slice(-6)}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </FadeIn>

                    {/* Statistics Card */}
                    <FadeIn>
                      <Card style={getCardStyle()}>
                        <CardHeader>
                          <CardTitle className="text-lg">Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Floor Price</span>
                            <span className="font-semibold text-lg">
                              {formatPrice(statistics?.floorPrice)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Last Sale</span>
                            <span className="font-semibold">
                              {formatPrice(statistics?.lastSalePrice)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Volume</span>
                            <span className="font-semibold">
                              {formatPrice(statistics?.totalVolume)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Sales</span>
                            <span className="font-semibold">{statistics?.totalSales || 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Listings</span>
                            <span className="font-semibold">{statistics?.activeListingsCount || 0}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </FadeIn>
                  </div>

                  {/* Right Column - Trading Info */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Price Chart */}
                    <FadeIn>
                      <Card style={getCardStyle()}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-xl">Price History</CardTitle>
                              <CardDescription>Historical trading data</CardDescription>
                            </div>
                            <div className="flex gap-2">
                              {(["1D", "7D", "30D", "ALL"] as const).map((range) => (
                                <Button
                                  key={range}
                                  variant={timeRange === range ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => {
                                    setTimeRange(range)
                                    const processed = processPriceData(tradeHistory, range)
                                    setPriceData(processed)
                                  }}
                                >
                                  {range}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={priceData}>
                                <defs>
                                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                <XAxis
                                  dataKey="date"
                                  className="text-xs"
                                  tick={{ fill: "currentColor" }}
                                />
                                <YAxis
                                  className="text-xs"
                                  tick={{ fill: "currentColor" }}
                                  label={{ value: "Price (ALGO)", angle: -90, position: "insideLeft" }}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                                    border: "none",
                                    borderRadius: "8px",
                                    color: "#fff",
                                  }}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="price"
                                  stroke="#3b82f6"
                                  fillOpacity={1}
                                  fill="url(#colorPrice)"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </FadeIn>

                    {/* Buy/Sell Section */}
                    <FadeIn>
                      <Card style={getCardStyle()}>
                        <CardHeader>
                          <CardTitle className="text-xl">Trade</CardTitle>
                          <CardDescription>
                            {isOwner
                              ? "You own this NFT. List it for sale or view current offers."
                              : "Buy this NFT or make an offer."}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {!isConnected ? (
                            <div className="text-center py-8">
                              <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Connect your wallet to trade
                              </p>
                              <Button onClick={connect}>Connect Wallet</Button>
                            </div>
                          ) : isOwner ? (
                            <div className="space-y-4">
                              {lowestListing && lowestListing.sellerAddress.toLowerCase() === account?.address?.toLowerCase() ? (
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      Your listing is active
                                    </p>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedOrder(lowestListing)
                                        setShowCancelDialog(true)
                                      }}
                                      className="text-red-500 hover:text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <p className="text-2xl font-bold mb-2">
                                    {formatPrice(lowestListing.price)}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Expires: {new Date(lowestListing.expiresAt).toLocaleDateString()}
                                  </p>
                                </div>
                              ) : (
                                <>
                                  <div>
                                    <Label htmlFor="listPrice">List Price (ALGO)</Label>
                                    <Input
                                      id="listPrice"
                                      type="number"
                                      step="0.01"
                                      placeholder="Enter price"
                                      value={listPrice}
                                      onChange={(e) => setListPrice(e.target.value)}
                                      className="mt-2"
                                    />
                                  </div>
                                  <Button
                                    onClick={() => setShowListDialog(true)}
                                    className="w-full"
                                    style={getButtonStyle()}
                                    disabled={isProcessing}
                                  >
                                    {isProcessing ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {processingStep || "Processing..."}
                                      </>
                                    ) : (
                                      "List for Sale"
                                    )}
                                  </Button>
                                </>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {lowestListing ? (
                                <>
                                  <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                      Lowest Listing
                                    </p>
                                    <p className="text-3xl font-bold mb-2">
                                      {formatPrice(lowestListing.price)}
                                    </p>
                                    {balance !== null && (
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                        Your balance: {balance.toFixed(2)} ALGO
                                      </p>
                                    )}
                                    <Button
                                      onClick={() => prepareTrade(lowestListing.id)}
                                      className="w-full"
                                      size="lg"
                                      style={getButtonStyle()}
                                      disabled={isProcessing || (balance !== null && balance < lowestListing.price)}
                                    >
                                      {isProcessing ? (
                                        <>
                                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                          {processingStep || "Processing..."}
                                        </>
                                      ) : (
                                        "Buy Now"
                                      )}
                                    </Button>
                                    {balance !== null && balance < lowestListing.price && (
                                      <p className="text-xs text-red-500 mt-2">
                                        Insufficient balance
                                      </p>
                                    )}
                                  </div>
                                  {activeListings.length > 1 && (
                                    <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                      {activeListings.length - 1} more listing{activeListings.length > 2 ? "s" : ""} available
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="text-center py-8">
                                  <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                  <p className="text-gray-600 dark:text-gray-400">
                                    No active listings for this NFT
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </FadeIn>

                    {/* Trading History */}
                    <FadeIn>
                      <Card style={getCardStyle()}>
                        <CardHeader>
                          <CardTitle className="text-xl">Trading History</CardTitle>
                          <CardDescription>Recent trades for this NFT</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {tradeHistory.length > 0 ? (
                            <div className="space-y-3">
                              {tradeHistory.slice(0, 10).map((trade) => (
                                <div
                                  key={trade.id}
                                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    <div>
                                      <p className="font-medium">
                                        {formatPrice(trade.price)}
                                      </p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {new Date(trade.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {formatAddress(trade.buyerAddress)}
                                    </p>
                                    <a
                                      href={`https://testnet.algoexplorer.io/tx/${trade.transactionId}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-500 hover:underline"
                                    >
                                      View on Explorer
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>No trading history yet</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </FadeIn>
                  </div>
                </div>
              </div>

              <MarketplaceFooter marketplace={marketplace} />

              {/* List Dialog */}
              <Dialog open={showListDialog} onOpenChange={setShowListDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>List NFT for Sale</DialogTitle>
                    <DialogDescription>
                      Set a price for {nft.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="dialogListPrice">Price (ALGO)</Label>
                      <Input
                        id="dialogListPrice"
                        type="number"
                        step="0.01"
                        placeholder="Enter price"
                        value={listPrice}
                        onChange={(e) => setListPrice(e.target.value)}
                        className="mt-2"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Listing will expire in 7 days
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowListDialog(false)}
                        className="flex-1"
                        disabled={isProcessing}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleListNFT}
                        className="flex-1"
                        style={getButtonStyle()}
                        disabled={isProcessing || !listPrice}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {processingStep || "Processing..."}
                          </>
                        ) : (
                          "List NFT"
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Transaction Confirmation Dialog */}
              <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Confirm Purchase</DialogTitle>
                    <DialogDescription>
                      Review transaction details before confirming
                    </DialogDescription>
                  </DialogHeader>
                  {transactionInfo && selectedOrder && (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">NFT Price</span>
                          <span className="font-medium">{formatPrice(transactionInfo.totalPrice)}</span>
                        </div>
                        {transactionInfo.platformFee > 0 && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Platform Fee</span>
                            <span className="font-medium">{formatPrice(transactionInfo.platformFee)}</span>
                          </div>
                        )}
                        {transactionInfo.royaltyAmount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Royalty</span>
                            <span className="font-medium">{formatPrice(transactionInfo.royaltyAmount)}</span>
                          </div>
                        )}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
                          <span className="font-semibold">Total</span>
                          <span className="font-bold text-lg">{formatPrice(transactionInfo.totalPrice)}</span>
                        </div>
                      </div>
                      {balance !== null && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex justify-between text-sm">
                            <span>Your Balance</span>
                            <span className={balance < transactionInfo.totalPrice ? "text-red-500" : ""}>
                              {balance.toFixed(2)} ALGO
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowConfirmDialog(false)
                            setSelectedOrder(null)
                            setTransactionInfo(null)
                          }}
                          className="flex-1"
                          disabled={isProcessing}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={executeTrade}
                          className="flex-1"
                          style={getButtonStyle()}
                          disabled={isProcessing || (balance !== null && balance < transactionInfo.totalPrice)}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              {processingStep || "Processing..."}
                            </>
                          ) : (
                            "Confirm Purchase"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Cancel Order Dialog */}
              <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Listing</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to cancel this listing?
                    </DialogDescription>
                  </DialogHeader>
                  {selectedOrder && (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Listing Price</p>
                        <p className="text-xl font-bold">{formatPrice(selectedOrder.price)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowCancelDialog(false)
                            setSelectedOrder(null)
                          }}
                          className="flex-1"
                          disabled={isProcessing}
                        >
                          Keep Listing
                        </Button>
                        <Button
                          onClick={() => selectedOrder && handleCancelOrder(selectedOrder.id)}
                          className="flex-1"
                          variant="destructive"
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              {processingStep || "Cancelling..."}
                            </>
                          ) : (
                            "Cancel Listing"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </PageTransition>
        )
      }}
    </TemplateLoader>
  )
}

