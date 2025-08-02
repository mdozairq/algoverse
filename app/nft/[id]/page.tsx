"use client"

import { CardDescription } from "@/components/ui/card"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  MapPin,
  Star,
  Share2,
  Heart,
  ArrowLeft,
  Shield,
  Zap,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Edit,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { NftLifecycleTimeline } from "@/components/nft/nft-lifecycle-timeline"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { RequestChangeModal } from "@/components/nft/request-change-modal"

export default function NFTDetailPage() {
  const params = useParams()
  const [isLiked, setIsLiked] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackStatus, setFeedbackStatus] = useState<"success" | "error" | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [isChangeRequestModalOpen, setIsChangeRequestModalOpen] = useState(false)

  // Mock data - in real app, fetch based on params.id
  const nft = {
    id: params.id,
    title: "Summer Music Festival VIP",
    description:
      "Experience the ultimate music festival with VIP access, backstage passes, and premium amenities. This exclusive NFT grants you access to the main stage area, complimentary drinks, and meet & greet opportunities with featured artists.",
    image: "/placeholder.svg?height=600&width=800&text=NFT Image",
    price: "0.5 ALGO",
    originalPrice: "0.6 ALGO",
    merchant: "Festival Productions LLC",
    merchantVerified: true,
    category: "Concert",
    date: "July 15, 2024",
    time: "6:00 PM - 2:00 AM",
    location: "Central Park, NYC",
    venue: "Great Lawn Stage",
    available: 50,
    total: 100,
    rating: 4.8,
    reviews: 124,
    features: [
      "VIP Stage Access",
      "Complimentary Drinks",
      "Artist Meet & Greet",
      "Premium Parking",
      "Exclusive Merchandise",
    ],
    benefits: ["Transferable NFT", "Resale Rights", "Loyalty Points", "Future Event Discounts"],
    isEligibleForChange: true, // Mock eligibility for change
  }

  const similarNFTs = [
    {
      id: 2,
      title: "Jazz Night Premium",
      price: "0.3 ALGO",
      image: "/placeholder.svg?height=200&width=300&text=Jazz NFT",
      merchant: "Blue Note NYC",
    },
    {
      id: 3,
      title: "Rock Concert VIP",
      price: "0.8 ALGO",
      image: "/placeholder.svg?height=200&width=300&text=Rock NFT",
      merchant: "Madison Square Garden",
    },
    {
      id: 4,
      title: "Electronic Music Festival",
      price: "0.6 ALGO",
      image: "/placeholder.svg?height=200&width=300&text=EDM NFT",
      merchant: "EDM Events Co.",
    },
  ]

  const transactionHistory = [
    {
      id: 1,
      type: "mint",
      from: "Festival Productions",
      to: "0xABC...123",
      price: "0.5 ALGO",
      date: "2024-01-10",
      txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    },
    {
      id: 2,
      type: "transfer",
      from: "0xABC...123",
      to: "0xDEF...456",
      price: "0.55 ALGO",
      date: "2024-01-12",
      txHash: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c",
    },
    {
      id: 3,
      type: "stake",
      from: "0xDEF...456",
      to: "Staking Pool",
      price: "0 ALGO",
      date: "2024-01-15",
      txHash: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
    },
    {
      id: 4,
      type: "redeem",
      from: "0xDEF...456",
      to: "Event Venue",
      price: "0 ALGO",
      date: "2024-07-15",
      status: "used",
      txHash: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
    },
  ]

  const handleBuy = () => {
    // Simulate API call
    setTimeout(() => {
      const success = Math.random() > 0.5 // Simulate success/failure
      if (success) {
        setFeedbackStatus("success")
        setFeedbackMessage("Purchase successful! Your NFT is now in your wallet.")
      } else {
        setFeedbackStatus("error")
        setFeedbackMessage("Purchase failed. Please try again or contact support.")
      }
      setShowFeedbackModal(true)
    }, 1000)
  }

  const handleStake = () => {
    // Simulate API call
    setTimeout(() => {
      const success = Math.random() > 0.5 // Simulate success/failure
      if (success) {
        setFeedbackStatus("success")
        setFeedbackMessage("NFT successfully staked! You will now earn rewards.")
      } else {
        setFeedbackStatus("error")
        setFeedbackMessage("Staking failed. Please ensure you meet the requirements.")
      }
      setShowFeedbackModal(true)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 bg-white dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/marketplace"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Marketplace
            </Link>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className={`rounded-full ${isLiked ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"} hover:text-red-600 dark:hover:text-red-400`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Image */}
          <div className="space-y-4">
            <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <img src={nft.image || "/placeholder.svg"} alt={nft.title} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <img
                    src={nft.image || "/placeholder.svg"}
                    alt={`${nft.title} ${i + 1}`}
                    className="w-full h-full object-cover rounded-lg opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Header Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-0 font-medium capitalize">
                  {nft.category}
                </Badge>
                {nft.merchantVerified && (
                  <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-900 dark:text-blue-400">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl font-black tracking-tight mb-4 text-gray-900 dark:text-white">{nft.title}</h1>
              <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                <span>by {nft.merchant}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-600 text-yellow-600 dark:fill-yellow-400 dark:text-yellow-400" />
                  <span>{nft.rating}</span>
                  <span>({nft.reviews} reviews)</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <Card className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-black text-gray-900 dark:text-white">{nft.price}</div>
                  {nft.originalPrice && <div className="text-lg text-gray-500 line-through">{nft.originalPrice}</div>}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Available</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {nft.available} of {nft.total}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleBuy}
                  className="flex-1 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-full"
                >
                  Buy Now
                </Button>
                <Button
                  onClick={handleStake}
                  variant="outline"
                  className="border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full bg-white dark:bg-gray-800"
                >
                  Stake NFT
                </Button>
              </div>
            </Card>

            {/* Event Details */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <div className="text-gray-900 dark:text-white font-medium">{nft.date}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{nft.time}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <div className="text-gray-900 dark:text-white font-medium">{nft.location}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{nft.venue}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features & Benefits */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {nft.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-900 dark:text-gray-300">
                        <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {nft.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-900 dark:text-gray-300">
                        <div className="w-1.5 h-1.5 bg-green-600 dark:bg-green-400 rounded-full"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Request Change Button */}
            {nft.isEligibleForChange && (
              <Button
                variant="outline"
                className="w-full rounded-full bg-transparent border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsChangeRequestModalOpen(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Request Change
              </Button>
            )}
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="space-y-4">
            <TabsList className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <TabsTrigger
                value="description"
                className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
              >
                Transaction History
              </TabsTrigger>
              <TabsTrigger
                value="similar"
                className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
              >
                Similar NFTs
              </TabsTrigger>
              <TabsTrigger
                value="lifecycle"
                className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
              >
                NFT Lifecycle
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-4">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <p className="text-gray-900 dark:text-gray-300 leading-relaxed">{nft.description}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {transactionHistory.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                          <div>
                            <div className="text-gray-900 dark:text-white font-medium capitalize">{tx.type}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              From {tx.from} to {tx.to}
                            </div>
                            {tx.txHash && (
                              <a
                                href={`https://testnet.algoexplorer.io/tx/${tx.txHash}`} // Replace with actual explorer link
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                View Transaction
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-900 dark:text-white font-medium">{tx.price}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{tx.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="similar" className="space-y-4">
              <div className="grid md:grid-cols-3 gap-6">
                {similarNFTs.map((similar) => (
                  <Card
                    key={similar.id}
                    className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700">
                      <img
                        src={similar.image || "/placeholder.svg"}
                        alt={similar.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2">{similar.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">by {similar.merchant}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{similar.price}</span>
                        <Link href={`/nft/${similar.id}`}>
                          <Button
                            size="sm"
                            className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                          >
                            View
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="lifecycle" className="space-y-4">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">NFT Lifecycle</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Track the journey of this NFT on the blockchain.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <NftLifecycleTimeline currentNftId={nft.id} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Feedback Modal */}
      <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {feedbackStatus === "success" ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-500" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-500" />
              )}
              {feedbackStatus === "success" ? "Success!" : "Error!"}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">{feedbackMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setShowFeedbackModal(false)}
              className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Change Modal */}
      <RequestChangeModal
        isOpen={isChangeRequestModalOpen}
        onClose={() => setIsChangeRequestModalOpen(false)}
        nft={nft}
      />
    </div>
  )
}
