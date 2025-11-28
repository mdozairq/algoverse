"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardLayout from "@/components/dashboard-layout"
import AuthGuard from "@/components/auth-guard"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-context"
import { useWallet } from "@/hooks/use-wallet"
import {
  ArrowRightLeft,
  Plus,
  Eye,
  Trash2,
  Loader2,
  Search,
  Filter,
  Package,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface NFT {
  id: string
  name: string
  image: string
  assetId: number
  collectionId: string
  collectionName?: string
  ownerAddress: string
  ownerId: string
  status: "minted" | "draft"
  price?: number
  listedForSale?: boolean
  metadata?: any
}

interface TradingOrder {
  id: string
  nftId: string
  marketplaceId?: string
  nftName?: string
  nftImage?: string
  price: number
  currency: string
  status: "active" | "filled" | "cancelled"
  createdAt: string
  expiresAt: string
  buyerAddress?: string
  transactionId?: string
}

export default function MerchantTradePage() {
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuth()
  const { isConnected, account, connect, signMessage } = useWallet()
  const [loading, setLoading] = useState(true)
  const [nfts, setNfts] = useState<NFT[]>([])
  const [orders, setOrders] = useState<TradingOrder[]>([])
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null)
  const [showListDialog, setShowListDialog] = useState(false)
  const [listPrice, setListPrice] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "filled" | "cancelled">("all")
  const [merchantWalletAddress, setMerchantWalletAddress] = useState<string | null>(null)
  const [marketplaces, setMarketplaces] = useState<any[]>([])

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMerchantData()
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (merchantWalletAddress && marketplaces.length > 0) {
      fetchNFTs()
      fetchOrders()
    }
  }, [merchantWalletAddress, marketplaces, filterStatus])

  const fetchMerchantData = async () => {
    if (!user?.userId) return

    try {
      setLoading(true)
      // Fetch merchant details to get wallet address
      const merchantRes = await fetch(`/api/merchants/me`)
      if (merchantRes.ok) {
        const merchantData = await merchantRes.json()
        const walletAddress = merchantData.merchant?.walletAddress
        setMerchantWalletAddress(walletAddress || null)
      }

      // Fetch merchant's marketplaces
      const marketplacesRes = await fetch(`/api/marketplaces?merchantId=${user.userId}`)
      if (marketplacesRes.ok) {
        const marketplacesData = await marketplacesRes.json()
        setMarketplaces(marketplacesData.marketplaces || [])
      }
    } catch (error) {
      console.error("Error fetching merchant data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch merchant data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchNFTs = async () => {
    if (!merchantWalletAddress || marketplaces.length === 0) return

    try {
      setLoading(true)
      // Fetch NFTs from all merchant's marketplaces
      const nftPromises = marketplaces.map(async (marketplace: any) => {
        try {
          const response = await fetch(`/api/marketplaces/${marketplace.id}/mint/nfts?walletAddress=${merchantWalletAddress}`)
          if (response.ok) {
            const data = await response.json()
            return data.nfts || []
          }
          return []
        } catch (error) {
          console.error(`Error fetching NFTs for marketplace ${marketplace.id}:`, error)
          return []
        }
      })

      const nftResults = await Promise.all(nftPromises)
      const allNFTs = nftResults.flat()

      // Filter only minted NFTs with assetId
      const mintedNFTs = allNFTs.filter(
        (nft: any) => nft.status === "minted" && nft.assetId
      )

      // Transform to match NFT interface
      const transformedNFTs = mintedNFTs.map((nft: any) => ({
        id: nft.id,
        name: nft.name || nft.metadata?.name || `NFT #${nft.id.slice(-4)}`,
        image: nft.image || nft.metadata?.image || "/placeholder.jpg",
        assetId: nft.assetId,
        collectionId: nft.collectionId || "",
        collectionName: nft.collectionName,
        ownerAddress: nft.ownerAddress || merchantWalletAddress,
        ownerId: nft.ownerId || user?.userId || "",
        status: nft.status || "minted",
        price: nft.price,
        listedForSale: nft.listedForSale || false,
        metadata: nft.metadata || {},
      }))

      setNfts(transformedNFTs)
    } catch (error) {
      console.error("Error fetching NFTs:", error)
      toast({
        title: "Error",
        description: "Failed to fetch NFTs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    if (!merchantWalletAddress || marketplaces.length === 0) return

    try {
      // Fetch orders for all merchant's marketplaces
      const ordersPromises = marketplaces.map(async (marketplace: any) => {
        try {
          const res = await fetch(`/api/marketplaces/${marketplace.id}/trading/orders?type=sell`)
          const data = await res.json()
          // Add marketplaceId to each order
          return (data.orders || []).map((order: any) => ({
            ...order,
            marketplaceId: marketplace.id,
          }))
        } catch (error) {
          console.error(`Error fetching orders for marketplace ${marketplace.id}:`, error)
          return []
        }
      })

      const ordersResults = await Promise.all(ordersPromises)
      const allOrders = ordersResults.flat()

      // Filter orders by seller (merchant's wallet address)
      const merchantOrders = allOrders.filter((order: any) => {
        const sellerAddress = order.sellerAddress || order.signedOrder?.sellerAddress
        return sellerAddress?.toLowerCase() === merchantWalletAddress.toLowerCase()
      })

      // Enrich with NFT data
      const enrichedOrders = await Promise.all(
        merchantOrders.map(async (order: any) => {
          try {
            // Try to get NFT data from order first
            if (order.nftName && order.nftImage) {
              return {
                ...order,
                createdAt: order.createdAt || order.signedOrder?.createdAt || new Date().toISOString(),
                expiresAt: order.expiresAt || order.signedOrder?.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              }
            }

            // Fallback to fetching NFT data
            const nftRes = await fetch(`/api/nft/${order.nftId}`)
            if (nftRes.ok) {
              const nftData = await nftRes.json()
              return {
                ...order,
                nftName: nftData.nft?.metadata?.name || `NFT #${order.nftId.slice(-4)}`,
                nftImage: nftData.nft?.metadata?.image || "/placeholder.jpg",
                createdAt: order.createdAt || order.signedOrder?.createdAt || new Date().toISOString(),
                expiresAt: order.expiresAt || order.signedOrder?.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              }
            }
          } catch (error) {
            console.error("Error fetching NFT data:", error)
          }
          return {
            ...order,
            nftName: `NFT #${order.nftId.slice(-4)}`,
            nftImage: "/placeholder.jpg",
            createdAt: order.createdAt || order.signedOrder?.createdAt || new Date().toISOString(),
            expiresAt: order.expiresAt || order.signedOrder?.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          }
        })
      )

      // Convert date fields properly
      const ordersWithDates = enrichedOrders.map((order: any) => ({
        ...order,
        createdAt: typeof order.createdAt === 'string' 
          ? order.createdAt 
          : order.createdAt?._seconds 
            ? new Date(order.createdAt._seconds * 1000).toISOString()
            : order.createdAt instanceof Date
              ? order.createdAt.toISOString()
              : new Date().toISOString(),
        expiresAt: typeof order.expiresAt === 'string'
          ? order.expiresAt
          : order.expiresAt?._seconds
            ? new Date(order.expiresAt._seconds * 1000).toISOString()
            : order.expiresAt instanceof Date
              ? order.expiresAt.toISOString()
              : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }))

      setOrders(ordersWithDates)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to fetch trading orders",
        variant: "destructive",
      })
    }
  }

  const handleListNFT = async () => {
    if (!account || !account.address || !selectedNFT) {
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

    // Use first marketplace from state
    if (marketplaces.length === 0) {
      toast({
        title: "No Marketplace",
        description: "Please create a marketplace first",
        variant: "destructive",
      })
      return
    }

    const marketplaceId = marketplaces[0].id // Use first marketplace

    try {
      setIsProcessing(true)
      setProcessingStep("Creating order...")

      const { createOrderPayload, serializeOrderPayload } = await import("@/lib/trading/order-signing")

      const orderPayloadObj = createOrderPayload({
        marketplaceId,
        nftId: selectedNFT.id,
        assetId: selectedNFT.assetId,
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
      const response = await fetch(`/api/marketplaces/${marketplaceId}/trading/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ signedOrder }),
      })

      if (response.ok) {
        toast({
          title: "Success!",
          description: "NFT listed successfully",
        })
        setShowListDialog(false)
        setListPrice("")
        setSelectedNFT(null)
        fetchNFTs()
        fetchOrders()
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

  const handleCancelOrder = async (orderId: string, marketplaceId: string) => {
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
        `/api/marketplaces/${marketplaceId}/trading/orders/${orderId}/cancel`,
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
        fetchOrders()
        fetchNFTs()
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

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} ALGO`
  }

  const filteredNFTs = nfts.filter((nft) =>
    (nft.metadata?.name || `NFT #${nft.id.slice(-4)}`)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  const filteredOrders = orders.filter((order) => {
    if (filterStatus !== "all" && order.status !== filterStatus) return false
    return true
  }).sort((a, b) => {
    // Sort by created date, newest first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <AuthGuard requiredRole="merchant">
      <DashboardLayout role="merchant">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trade Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                List your NFTs for sale and manage trading orders
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  fetchMerchantData()
                  fetchNFTs()
                  fetchOrders()
                }}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {!isConnected && (
                <Button onClick={connect}>
                  <Package className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total NFTs</CardDescription>
                <CardTitle className="text-2xl">{nfts.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Listed NFTs</CardDescription>
                <CardTitle className="text-2xl">
                  {nfts.filter((n) => n.listedForSale).length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Active Orders</CardDescription>
                <CardTitle className="text-2xl">
                  {orders.filter((o) => o.status === "active").length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Sales</CardDescription>
                <CardTitle className="text-2xl">
                  {orders.filter((o) => o.status === "filled").length}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Trading Orders */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Trading Orders</CardTitle>
                  <CardDescription>Manage your NFT listings and sales</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="filled">Filled</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ArrowRightLeft className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No trading orders found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NFT</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded overflow-hidden">
                              <Image
                                src={order.nftImage || "/placeholder.jpg"}
                                alt={order.nftName || "NFT"}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <span className="font-medium">{order.nftName || "NFT"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">{formatPrice(order.price)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "active"
                                ? "default"
                                : order.status === "filled"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {order.createdAt 
                            ? (() => {
                                try {
                                  const createdAt = order.createdAt as any
                                  const date = typeof createdAt === 'string' 
                                    ? new Date(createdAt) 
                                    : createdAt?._seconds 
                                      ? new Date(createdAt._seconds * 1000)
                                      : new Date(createdAt)
                                  return date.toLocaleDateString()
                                } catch {
                                  return 'N/A'
                                }
                              })()
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {order.expiresAt
                            ? (() => {
                                try {
                                  const expiresAt = order.expiresAt as any
                                  const date = typeof expiresAt === 'string'
                                    ? new Date(expiresAt)
                                    : expiresAt?._seconds
                                      ? new Date(expiresAt._seconds * 1000)
                                      : new Date(expiresAt)
                                  return date.toLocaleDateString()
                                } catch {
                                  return 'N/A'
                                }
                              })()
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {order.status === "active" && order.marketplaceId && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  handleCancelOrder(order.id, order.marketplaceId!)
                                }}
                                disabled={isProcessing}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            )}
                            {order.transactionId && (
                              <Link
                                href={`https://testnet.algoexplorer.io/tx/${order.transactionId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Available NFTs to List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your NFTs</CardTitle>
                  <CardDescription>Select an NFT to list for sale</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search NFTs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : filteredNFTs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No minted NFTs available to list</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {filteredNFTs.map((nft) => (
                    <Card
                      key={nft.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => {
                        if (!nft.listedForSale && isConnected) {
                          setSelectedNFT(nft)
                          setShowListDialog(true)
                        }
                      }}
                    >
                      <CardContent className="p-0">
                        <div className="aspect-square relative">
                          <Image
                            src={nft.image || nft.metadata?.image || "/placeholder.jpg"}
                            alt={nft.metadata?.name || `NFT #${nft.id.slice(-4)}`}
                            fill
                            className="object-cover rounded-t-lg"
                          />
                          {nft.listedForSale && (
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-green-500">Listed</Badge>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="font-medium text-sm truncate">
                            {nft.metadata?.name || `NFT #${nft.id.slice(-4)}`}
                          </p>
                          {nft.listedForSale && nft.price && (
                            <p className="text-sm text-blue-500 font-semibold mt-1">
                              {formatPrice(nft.price)}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* List Dialog */}
        <Dialog open={showListDialog} onOpenChange={setShowListDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>List NFT for Sale</DialogTitle>
              <DialogDescription>
                Set a price for {selectedNFT?.metadata?.name || `NFT #${selectedNFT?.id.slice(-4)}`}
              </DialogDescription>
            </DialogHeader>
            {selectedNFT && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                    <Image
                      src={selectedNFT.image || selectedNFT.metadata?.image || "/placeholder.jpg"}
                      alt={selectedNFT.metadata?.name || "NFT"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">
                      {selectedNFT.metadata?.name || `NFT #${selectedNFT.id.slice(-4)}`}
                    </p>
                    <p className="text-sm text-gray-500">Asset ID: {selectedNFT.assetId}</p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="listPrice">Price (ALGO)</Label>
                  <Input
                    id="listPrice"
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
                    onClick={() => {
                      setShowListDialog(false)
                      setSelectedNFT(null)
                      setListPrice("")
                    }}
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleListNFT}
                    className="flex-1"
                    disabled={isProcessing || !listPrice || !isConnected}
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
            )}
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </AuthGuard>
  )
}

