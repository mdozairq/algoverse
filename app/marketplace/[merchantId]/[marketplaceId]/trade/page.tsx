"use client"

import { useState, useEffect } from "react"
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
  TrendingUp,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Wallet,
  Package,
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

interface TradeOrder {
  id: string
  type: "buy" | "sell"
  nftId: string
  nft: {
    id: string
    name: string
    image: string
    price: number
    currency: string
  }
  userAddress: string
  price: number
  currency: string
  quantity: number
  status: "active" | "filled" | "cancelled" | "expired"
  createdAt: Date
  filledAt?: Date
}

interface TradeHistory {
  id: string
  orderId: string
  buyerAddress: string
  sellerAddress: string
  nftId: string
  price: number
  currency: string
  quantity: number
  transactionHash: string
  createdAt: Date
}

export default function TradePage({ params }: { params: { merchantId: string; marketplaceId: string } }) {
  const [marketplace, setMarketplace] = useState<Marketplace | null>(null)
  const [activeOrders, setActiveOrders] = useState<TradeOrder[]>([])
  const [userOrders, setUserOrders] = useState<TradeOrder[]>([])
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<TradeOrder | null>(null)
  const [showCreateOrderDialog, setShowCreateOrderDialog] = useState(false)
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy")
  const [orderPrice, setOrderPrice] = useState("")
  const [orderQuantity, setOrderQuantity] = useState("1")
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

  const fetchActiveOrders = async () => {
    try {
      const response = await fetch(`/api/marketplaces/${params.marketplaceId}/trade/orders`)
      const data = await response.json()
      
      if (response.ok) {
        setActiveOrders(data.orders || [])
      }
    } catch (error) {
      console.error("Failed to fetch active orders:", error)
    }
  }

  const fetchUserOrders = async () => {
    if (!isConnected || !account) return
    
    try {
      const response = await fetch(`/api/user/trade-orders?address=${account}`)
      const data = await response.json()
      
      if (response.ok) {
        setUserOrders(data.orders || [])
      }
    } catch (error) {
      console.error("Failed to fetch user orders:", error)
    }
  }

  const fetchTradeHistory = async () => {
    try {
      const response = await fetch(`/api/marketplaces/${params.marketplaceId}/trade/history`)
      const data = await response.json()
      
      if (response.ok) {
        setTradeHistory(data.history || [])
      }
    } catch (error) {
      console.error("Failed to fetch trade history:", error)
    }
  }

  useEffect(() => {
    fetchMarketplaceData()
    fetchActiveOrders()
    fetchTradeHistory()
  }, [params.marketplaceId])

  useEffect(() => {
    if (isConnected && account) {
      fetchUserOrders()
    }
  }, [isConnected, account])

  const handleCreateOrder = async () => {
    if (!isConnected || !account || !selectedOrder) return

    try {
      const response = await fetch("/api/trade/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: orderType,
          nftId: selectedOrder.nftId,
          userAddress: account,
          price: parseFloat(orderPrice),
          quantity: parseInt(orderQuantity),
          marketplaceId: params.marketplaceId
        }),
      })

      if (response.ok) {
        setShowCreateOrderDialog(false)
        setSelectedOrder(null)
        setOrderPrice("")
        setOrderQuantity("1")
        fetchActiveOrders()
        fetchUserOrders()
      }
    } catch (error) {
      console.error("Failed to create order:", error)
    }
  }

  const handleFillOrder = async (orderId: string) => {
    if (!isConnected || !account) return

    try {
      const response = await fetch(`/api/trade/orders/${orderId}/fill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress: account
        }),
      })

      if (response.ok) {
        fetchActiveOrders()
        fetchUserOrders()
        fetchTradeHistory()
      }
    } catch (error) {
      console.error("Failed to fill order:", error)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/trade/orders/${orderId}/cancel`, {
        method: "POST",
      })

      if (response.ok) {
        fetchActiveOrders()
        fetchUserOrders()
      }
    } catch (error) {
      console.error("Failed to cancel order:", error)
    }
  }

  const filteredOrders = activeOrders.filter(order => {
    const matchesSearch = order.nft.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading trade marketplace...</p>
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
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
                    Trading Floor
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Buy and sell NFTs in {marketplace.businessName}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <WalletConnectButton />
                </div>
              </div>
            </div>
          </FadeIn>

          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="orders">Active Orders</TabsTrigger>
              <TabsTrigger value="my-orders">My Orders</TabsTrigger>
              <TabsTrigger value="history">Trade History</TabsTrigger>
              <TabsTrigger value="create">Create Order</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-6">
              {/* Search and Filters */}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search orders..."
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
                        <SelectItem value="all">All Orders</SelectItem>
                        <SelectItem value="buy">Buy Orders</SelectItem>
                        <SelectItem value="sell">Sell Orders</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="recent">Recent</SelectItem>
                        <SelectItem value="quantity">Quantity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Orders List */}
              <div className="space-y-4">
                {filteredOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                              <Image
                                src={order.nft.image}
                                alt={order.nft.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {order.nft.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {order.type === 'buy' ? 'Buy Order' : 'Sell Order'} • {order.quantity} units
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {order.price} {order.currency}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                per unit
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge 
                                className={`text-xs ${
                                  order.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {order.type.toUpperCase()}
                              </Badge>
                              {isConnected && (
                                <Button
                                  size="sm"
                                  onClick={() => handleFillOrder(order.id)}
                                  className={order.type === 'buy' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                                >
                                  {order.type === 'buy' ? 'Sell to' : 'Buy from'}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="my-orders" className="space-y-6">
              {!isConnected ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Wallet className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Connect Your Wallet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                      Connect your wallet to view your orders
                    </p>
                    <WalletConnectButton />
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {userOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                                <Image
                                  src={order.nft.image}
                                  alt={order.nft.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {order.nft.name}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {order.type === 'buy' ? 'Buy Order' : 'Sell Order'} • {order.quantity} units
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {order.price} {order.currency}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  per unit
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Badge 
                                  className={`text-xs ${
                                    order.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                    order.status === 'filled' ? 'bg-green-100 text-green-800' :
                                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {order.status}
                                </Badge>
                                {order.status === 'active' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCancelOrder(order.id)}
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <div className="space-y-4">
                {tradeHistory.map((trade, index) => (
                  <motion.div
                    key={trade.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                              <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                Trade #{trade.id.slice(0, 8)}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {trade.quantity} units • {new Date(trade.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {trade.price} {trade.currency}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Total: {(trade.price * trade.quantity).toFixed(2)} {trade.currency}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
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
                      Connect your wallet to create trading orders
                    </p>
                    <WalletConnectButton />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Create Trading Order</CardTitle>
                    <CardDescription>
                      Create a buy or sell order for NFTs
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="orderType">Order Type</Label>
                        <Select value={orderType} onValueChange={(value: "buy" | "sell") => setOrderType(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="buy">Buy Order</SelectItem>
                            <SelectItem value="sell">Sell Order</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="orderPrice">Price</Label>
                        <Input
                          id="orderPrice"
                          type="number"
                          value={orderPrice}
                          onChange={(e) => setOrderPrice(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="orderQuantity">Quantity</Label>
                      <Input
                        id="orderQuantity"
                        type="number"
                        value={orderQuantity}
                        onChange={(e) => setOrderQuantity(e.target.value)}
                        placeholder="1"
                      />
                    </div>
                    <Button 
                      onClick={() => setShowCreateOrderDialog(true)}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Create Order
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Create Order Dialog */}
        <Dialog open={showCreateOrderDialog} onOpenChange={setShowCreateOrderDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Trading Order</DialogTitle>
              <DialogDescription>
                Select an NFT to create an order for
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Order Type</Label>
                <div className="flex gap-2">
                  <Button
                    variant={orderType === 'buy' ? 'default' : 'outline'}
                    onClick={() => setOrderType('buy')}
                    className="flex-1"
                  >
                    Buy Order
                  </Button>
                  <Button
                    variant={orderType === 'sell' ? 'default' : 'outline'}
                    onClick={() => setOrderType('sell')}
                    className="flex-1"
                  >
                    Sell Order
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="orderPrice">Price per Unit</Label>
                <Input
                  id="orderPrice"
                  type="number"
                  value={orderPrice}
                  onChange={(e) => setOrderPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="orderQuantity">Quantity</Label>
                <Input
                  id="orderQuantity"
                  type="number"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(e.target.value)}
                  placeholder="1"
                />
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Total Value:</span>
                  <span className="font-semibold">
                    {(parseFloat(orderPrice) * parseInt(orderQuantity)).toFixed(2)} ALGO
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateOrderDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateOrder}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Create Order
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
