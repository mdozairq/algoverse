"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Share2, 
  Heart, 
  ArrowLeft,
  QrCode,
  ExternalLink,
  Ticket,
  ShoppingCart,
  AlertCircle,
  CheckCircle2,
  Wallet,
  Loader2
} from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-context"
import { useWallet } from "@/hooks/use-wallet"
import { walletService } from "@/lib/wallet/wallet-service"
import { WalletMintService } from "@/lib/algorand/wallet-mint-service"
import Link from "next/link"

interface Event {
  id: string
  title: string
  description: string
  date: string
  time?: string
  location: string
  address?: string
  category: string
  imageUrl?: string
  price: string
  availableSupply: number
  totalSupply: number
  merchantId: string
  merchantName?: string
  status?: "upcoming" | "live" | "ended" | "cancelled"
  tags?: string[]
  requirements?: string[]
  features?: string[]
  nftId?: string
  isFeatured?: boolean
  createdAt: string
  updatedAt?: string
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuth()
  const { 
    isConnected, 
    isConnecting, 
    account, 
    connect, 
    disconnect,
    error: walletError 
  } = useWallet()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([])
  const [timeUntilEvent, setTimeUntilEvent] = useState<string>("")
  const [walletConnecting, setWalletConnecting] = useState(false)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const loadEventData = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`)
        if (response.ok) {
          const data = await response.json()
          setEvent(data.event)
        } else if (response.status === 404) {
          toast({
            title: "Event Not Found",
            description: "The event you're looking for doesn't exist.",
            variant: "destructive"
          })
          router.push("/events")
        }
      } catch (error) {
        console.error('Error loading event:', error)
        toast({
          title: "Error",
          description: "Failed to load event details.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      loadEventData()
    }
  }, [eventId, router, toast])

  useEffect(() => {
    const loadRelatedEvents = async () => {
      try {
        const response = await fetch(`/api/events?category=${event?.category}&limit=4`)
        if (response.ok) {
          const data = await response.json()
          setRelatedEvents(data.events.filter((e: Event) => e.id !== eventId))
        }
      } catch (error) {
        console.error('Error loading related events:', error)
      }
    }

    if (event?.category) {
      loadRelatedEvents()
    }
  }, [event?.category, eventId])

  // Countdown timer effect
  useEffect(() => {
    if (!event) return

    const updateCountdown = () => {
      const now = new Date()
      const eventDate = new Date(event.date)
      const diffTime = eventDate.getTime() - now.getTime()

      if (diffTime > 0) {
        const days = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60))

        if (days > 0) {
          setTimeUntilEvent(`${days}d ${hours}h ${minutes}m`)
        } else if (hours > 0) {
          setTimeUntilEvent(`${hours}h ${minutes}m`)
        } else {
          setTimeUntilEvent(`${minutes}m`)
        }
      } else {
        setTimeUntilEvent("Event started")
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [event])

  const handlePurchase = async () => {
    // Check authentication first
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase tickets.",
        variant: "destructive"
      })
      router.push("/auth/user")
      return
    }

    // Check wallet connection
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to purchase tickets.",
        variant: "destructive"
      })
      return
    }

    // Check if event exists and has available supply
    if (!event) {
      toast({
        title: "Event Not Found",
        description: "The event you're trying to purchase is no longer available.",
        variant: "destructive"
      })
      return
    }

    // Validate supply
    if (event.availableSupply <= 0) {
      toast({
        title: "Sold Out",
        description: "This event is sold out. No tickets are available.",
        variant: "destructive"
      })
      return
    }

    setPurchasing(true)
    try {
      // Step 1: Create purchase transaction
      const purchaseResponse = await fetch(`/api/events/${eventId}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: account?.address,
          quantity: quantity
        })
      })

      if (!purchaseResponse.ok) {
        const errorData = await purchaseResponse.json()
        throw new Error(errorData.error || 'Failed to create purchase transaction')
      }

      const purchaseData = await purchaseResponse.json()
      
      // Step 2: Sign the payment transaction
      toast({
        title: "Signing Transaction",
        description: "Please sign the payment transaction in your wallet.",
      })

      const signedTransactions = await walletService.signTransactions([purchaseData.transaction])
      
      // Step 3: Confirm purchase and mint NFT tickets
      const confirmResponse = await fetch(`/api/events/${eventId}/confirm-purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signedTransaction: signedTransactions[0],
          quantity: quantity
        })
      })

      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json()
        throw new Error(errorData.error || 'Failed to confirm purchase')
      }

      const confirmData = await confirmResponse.json()
      
      // Update event state with new supply
      setEvent(prev => prev ? { 
        ...prev, 
        availableSupply: confirmData.updatedEvent.availableSupply 
      } : null)
      
      toast({
        title: "Purchase Successful!",
        description: `Payment completed successfully. Transaction: ${confirmData.paymentTransactionId.slice(0, 8)}...`,
      })
      
      console.log('Purchase completed successfully')
      
      // Redirect to claim tickets page
      router.push("/dashboard/user/claim-tickets")
      
    } catch (error: any) {
      console.error('Purchase error:', error)
      toast({
        title: "Purchase Failed",
        description: error.message || "There was an error processing your purchase. Please try again.",
        variant: "destructive"
      })
    } finally {
      setPurchasing(false)
    }
  }

  const handleWalletConnect = async () => {
    setWalletConnecting(true)
    try {
      await connect()
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been connected successfully.",
      })
    } catch (error: any) {
      console.error('Wallet connection error:', error)
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet. Please try again.",
        variant: "destructive"
      })
    } finally {
      setWalletConnecting(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: `Check out this event: ${event?.title}`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link Copied",
        description: "Event link has been copied to clipboard.",
      })
    }
  }

  const handleFavorite = () => {
    setIsFavorited(!isFavorited)
    toast({
      title: isFavorited ? "Removed from Favorites" : "Added to Favorites",
      description: isFavorited 
        ? "Event removed from your favorites." 
        : "Event added to your favorites.",
    })
  }

  const getEventStatus = (eventDate: string) => {
    const now = new Date()
    const event = new Date(eventDate)
    const diffTime = event.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "ended"
    if (diffDays === 0) return "live"
    if (diffDays <= 7) return "upcoming"
    return "upcoming"
  }

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Live Now</Badge>
      case "upcoming":
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Upcoming</Badge>
      case "ended":
        return <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/20">Ended</Badge>
      case "cancelled":
        return <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">Cancelled</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header showSearch={false} />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="aspect-video bg-gray-300 dark:bg-gray-700 rounded-lg mb-6"></div>
                <div className="space-y-4">
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
              <div>
                <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header showSearch={false} />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="max-w-md mx-auto">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Event Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The event you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push("/events")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const eventStatus = getEventStatus(event.date)
  const isEventLive = eventStatus === "live"
  const isEventEnded = eventStatus === "ended"

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header showSearch={false} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Event Image */}
              <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden mb-6 relative">
                <img
                  src={event.imageUrl || "/placeholder.svg?height=400&width=800&text=Event"}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {getStatusBadge(eventStatus)}
                  {event.isFeatured && (
                    <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleShare}
                    className="bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleFavorite}
                    className={`bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 ${
                      isFavorited ? "text-red-500" : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
                  </Button>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {event.title}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    {event.description}
                  </p>
                </div>

                {/* Event Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{event.date}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{event.date}</p>
                      {timeUntilEvent && eventStatus === "upcoming" && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                          {timeUntilEvent} until event
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{event.location}</p>
                      {event.address && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{event.address}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {event.availableSupply} of {event.totalSupply} tickets available
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Limited availability</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Ticket className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{event.price}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Per ticket</p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tabs */}
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="requirements">Requirements</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Event Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose dark:prose-invert max-w-none">
                          <p>{event.description}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                            Organized by <span className="font-medium">{event.merchantName || "Event Organizer"}</span>
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="requirements" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Requirements</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {event.requirements?.map((requirement, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{requirement}</span>
                            </li>
                          )) || (
                            <li className="text-sm text-gray-600 dark:text-gray-400">
                              No special requirements for this event.
                            </li>
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="features" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Event Features</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {event.features?.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          )) || (
                            <li className="text-sm text-gray-600 dark:text-gray-400">
                              No special features listed for this event.
                            </li>
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="sticky top-8"
            >
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{event.price}</span>
                    {getStatusBadge(eventStatus)}
                  </CardTitle>
                  <CardDescription>
                    {event.availableSupply} tickets remaining
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Wallet Connection Status */}
                  {!isConnected && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                        <Wallet className="w-4 h-4" />
                        <span className="text-sm font-medium">Wallet Required</span>
                      </div>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                        Connect your wallet to purchase tickets
                      </p>
                    </div>
                  )}

                  {isConnected && account && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Wallet Connected</span>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                        {account.address.slice(0, 6)}...{account.address.slice(-4)}
                      </p>
                    </div>
                  )}

                  {/* Quantity Selector */}
                  {isConnected && event.availableSupply > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-900 dark:text-white">
                        Quantity
                      </label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                        >
                          -
                        </Button>
                        <span className="w-12 text-center font-medium">{quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuantity(Math.min(event.availableSupply, quantity + 1))}
                          disabled={quantity >= event.availableSupply}
                        >
                          +
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Total: {parseFloat(event.price.replace(/[^\d.]/g, '')) * quantity} ALGO
                      </p>
                    </div>
                  )}

                  {/* Purchase Button */}
                  {isEventEnded ? (
                    <Button disabled className="w-full">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Event Ended
                    </Button>
                  ) : !isConnected ? (
                    <Button
                      onClick={handleWalletConnect}
                      disabled={walletConnecting || isConnecting}
                      className="w-full"
                    >
                      {walletConnecting || isConnecting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Wallet className="w-4 h-4 mr-2" />
                          Connect Wallet
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handlePurchase}
                      disabled={purchasing || event.availableSupply === 0 || !isAuthenticated}
                      className="w-full"
                    >
                      {purchasing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : event.availableSupply === 0 ? (
                        <>
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Sold Out
                        </>
                      ) : !isAuthenticated ? (
                        <>
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Login Required
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Purchase {quantity} Ticket{quantity > 1 ? 's' : ''}
                        </>
                      )}
                    </Button>
                  )}

                  {isAuthenticated && event.nftId && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/nft/${event.nftId}`}>
                        <QrCode className="w-4 h-4 mr-2" />
                        View NFT
                      </Link>
                    </Button>
                  )}

                  <div className="text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Powered by Algorand blockchain
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Merchant Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Organizer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {(event.merchantName || "E").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{event.merchantName || "Event Organizer"}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Event Organizer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Related Events */}
        {relatedEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Related Events
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedEvents.map((relatedEvent) => (
                <Card key={relatedEvent.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-200 dark:bg-gray-800">
                    <img
                      src={relatedEvent.imageUrl || "/placeholder.svg?height=200&width=300&text=Event"}
                      alt={relatedEvent.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {relatedEvent.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <Calendar className="w-4 h-4" />
                      {relatedEvent.date}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {relatedEvent.price}
                      </span>
                      <Button size="sm" asChild>
                        <Link href={`/events/${relatedEvent.id}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  )
}
