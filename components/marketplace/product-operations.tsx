"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ShoppingCart, 
  ArrowLeftRight, 
  CreditCard, 
  Wallet, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  ExternalLink,
  Eye,
  Star,
  Heart,
  Share2,
  Copy,
  Download,
  Info
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  image: string
  category: string
  type: "nft" | "event" | "merchandise"
  inStock: boolean
  rating: number
  reviews: number
  isEnabled: boolean
  allowSwap: boolean
  nftData?: {
    assetId: number
    totalSupply: number
    availableSupply: number
    royaltyPercentage: number
  }
  eventData?: {
    date: string
    location: string
    totalSupply: number
    availableSupply: number
    nftAssetId?: number
  }
}

interface ProductOperationsProps {
  product: Product
  marketplace: {
    id: string
    businessName: string
    allowSwap: boolean
    primaryColor: string
    secondaryColor: string
  }
  onPurchase?: (productId: string, quantity: number) => Promise<void>
  onSwap?: (productId: string, offeredNftId: string, message?: string) => Promise<void>
  onAddToCart?: (productId: string) => void
  onAddToWishlist?: (productId: string) => void
  onShare?: (productId: string) => void
}

export default function ProductOperations({
  product,
  marketplace,
  onPurchase,
  onSwap,
  onAddToCart,
  onAddToWishlist,
  onShare
}: ProductOperationsProps) {
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [showSwapDialog, setShowSwapDialog] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [offeredNftId, setOfferedNftId] = useState("")
  const [swapMessage, setSwapMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [purchaseStep, setPurchaseStep] = useState<'details' | 'payment' | 'confirm'>('details')
  const [paymentMethod, setPaymentMethod] = useState<'algorand' | 'usdc'>('algorand')
  const [walletAddress, setWalletAddress] = useState("")
  
  const { toast } = useToast()

  const handlePurchase = async () => {
    if (!onPurchase) return
    
    setLoading(true)
    try {
      await onPurchase(product.id, quantity)
      setShowPurchaseDialog(false)
      toast({
        title: "Purchase Successful",
        description: `You have successfully purchased ${product.name}`,
      })
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSwap = async () => {
    if (!onSwap || !offeredNftId) return
    
    setLoading(true)
    try {
      await onSwap(product.id, offeredNftId, swapMessage)
      setShowSwapDialog(false)
      setOfferedNftId("")
      setSwapMessage("")
      toast({
        title: "Swap Proposal Sent",
        description: "Your swap proposal has been sent to the owner",
      })
    } catch (error) {
      toast({
        title: "Swap Failed",
        description: "There was an error creating your swap proposal",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product.id)
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart`,
      })
    }
  }

  const handleAddToWishlist = () => {
    if (onAddToWishlist) {
      onAddToWishlist(product.id)
      toast({
        title: "Added to Wishlist",
        description: `${product.name} has been added to your wishlist`,
      })
    }
  }

  const handleShare = () => {
    if (onShare) {
      onShare(product.id)
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link Copied",
        description: "Product link has been copied to clipboard",
      })
    }
  }

  const getButtonStyle = (variant: 'primary' | 'secondary' | 'outline' = 'primary') => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: marketplace.primaryColor,
          color: 'white',
          border: 'none'
        }
      case 'secondary':
        return {
          backgroundColor: marketplace.secondaryColor,
          color: 'white',
          border: 'none'
        }
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: marketplace.primaryColor,
          border: `2px solid ${marketplace.primaryColor}`
        }
      default:
        return {}
    }
  }

  return (
    <div className="space-y-4">
      {/* Product Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {product.description}
                  </p>
                </div>
                <Badge 
                  variant="outline"
                  style={{ 
                    borderColor: marketplace.secondaryColor,
                    color: marketplace.secondaryColor
                  }}
                >
                  {product.type}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{product.rating}</span>
                  <span className="text-xs text-gray-500">({product.reviews})</span>
                </div>
                <div className="text-2xl font-bold">
                  {product.price} <span className="text-sm text-gray-500">{product.currency}</span>
                </div>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-4">
                {product.inStock ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">In Stock</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Out of Stock</span>
                  </div>
                )}
                {product.allowSwap && (
                  <Badge 
                    className="text-xs"
                    style={{ 
                      backgroundColor: `${marketplace.secondaryColor}20`,
                      color: marketplace.secondaryColor
                    }}
                  >
                    <ArrowLeftRight className="w-3 h-3 mr-1" />
                    Swappable
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Purchase Button */}
        <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              disabled={!product.inStock}
              style={getButtonStyle('primary')}
              className="w-full"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {product.inStock ? 'Buy Now' : 'Out of Stock'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Purchase {product.name}</DialogTitle>
              <DialogDescription>
                Complete your purchase using Algorand blockchain
              </DialogDescription>
            </DialogHeader>
            
            <AnimatePresence mode="wait">
              {purchaseStep === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {product.description}
                      </p>
                      <div className="text-lg font-bold mt-1">
                        {product.price} {product.currency}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max={product.nftData?.availableSupply || 10}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div>
                      <div className="font-semibold">Total Amount</div>
                      <div className="text-2xl font-bold">
                        {(product.price * quantity).toFixed(2)} {product.currency}
                      </div>
                    </div>
                    <Button
                      onClick={() => setPurchaseStep('payment')}
                      style={getButtonStyle('primary')}
                    >
                      Continue to Payment
                      <ArrowLeftRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {purchaseStep === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <Label>Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={(value: 'algorand' | 'usdc') => setPaymentMethod(value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="algorand">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-600 rounded-full" />
                            <span>Algorand (ALGO)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="usdc">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-600 rounded-full" />
                            <span>USDC</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="walletAddress">Wallet Address</Label>
                    <Input
                      id="walletAddress"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="Enter your wallet address"
                      className="mt-1"
                    />
                  </div>

                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-800 dark:text-yellow-200">
                          Important: Make sure you have enough {paymentMethod.toUpperCase()} in your wallet
                        </p>
                        <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                          Required: {(product.price * quantity).toFixed(2)} {paymentMethod.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setPurchaseStep('details')}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setPurchaseStep('confirm')}
                      style={getButtonStyle('primary')}
                      className="flex-1"
                    >
                      Continue
                    </Button>
                  </div>
                </motion.div>
              )}

              {purchaseStep === 'confirm' && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Confirm Purchase</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Please review your purchase details before confirming
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Product:</span>
                      <span className="font-medium">{product.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quantity:</span>
                      <span className="font-medium">{quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price per unit:</span>
                      <span className="font-medium">{product.price} {product.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment method:</span>
                      <span className="font-medium">{paymentMethod.toUpperCase()}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>{(product.price * quantity).toFixed(2)} {product.currency}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setPurchaseStep('payment')}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handlePurchase}
                      disabled={loading}
                      style={getButtonStyle('primary')}
                      className="flex-1"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Confirm Purchase
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </DialogContent>
        </Dialog>

        {/* Swap Button */}
        {product.type === "nft" && marketplace.allowSwap && product.allowSwap && (
          <Dialog open={showSwapDialog} onOpenChange={setShowSwapDialog}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                variant="outline"
                style={getButtonStyle('outline')}
                className="w-full"
              >
                <ArrowLeftRight className="w-5 h-5 mr-2" />
                Swap
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Propose Swap</DialogTitle>
                <DialogDescription>
                  Offer one of your NFTs in exchange for this one
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="offeredNftId">Your NFT ID</Label>
                  <Input
                    id="offeredNftId"
                    value={offeredNftId}
                    onChange={(e) => setOfferedNftId(e.target.value)}
                    placeholder="Enter the ID of the NFT you want to offer"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="swapMessage">Message (Optional)</Label>
                  <Textarea
                    id="swapMessage"
                    value={swapMessage}
                    onChange={(e) => setSwapMessage(e.target.value)}
                    placeholder="Add a message to explain why you want to swap"
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-800 dark:text-blue-200">
                        Swap Process
                      </p>
                      <p className="text-blue-700 dark:text-blue-300 mt-1">
                        1. Your proposal will be sent to the owner<br/>
                        2. They can accept, reject, or counter-offer<br/>
                        3. If accepted, the swap will be executed automatically
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowSwapDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSwap}
                    disabled={loading || !offeredNftId}
                    style={getButtonStyle('primary')}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <ArrowLeftRight className="w-4 h-4 mr-2" />
                        Send Proposal
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Secondary Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddToCart}
          className="flex-1"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddToWishlist}
        >
          <Heart className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Product Details */}
      {product.nftData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">NFT Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Asset ID:</span>
              <span className="font-mono">{product.nftData.assetId}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Supply:</span>
              <span>{product.nftData.totalSupply}</span>
            </div>
            <div className="flex justify-between">
              <span>Available:</span>
              <span>{product.nftData.availableSupply}</span>
            </div>
            <div className="flex justify-between">
              <span>Royalty:</span>
              <span>{product.nftData.royaltyPercentage}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {product.eventData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{new Date(product.eventData.date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Location:</span>
              <span>{product.eventData.location}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Tickets:</span>
              <span>{product.eventData.totalSupply}</span>
            </div>
            <div className="flex justify-between">
              <span>Available:</span>
              <span>{product.eventData.availableSupply}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
