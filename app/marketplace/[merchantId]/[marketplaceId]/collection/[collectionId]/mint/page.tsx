"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  Zap,
  RefreshCw,
  Package,
  Clock,
  Users,
  DollarSign,
  Shield,
  CheckCircle2,
  Wallet
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { PageTransition, FadeIn } from "@/components/animations/page-transition"
import Image from "next/image"
import { useWallet } from "@/hooks/use-wallet"
import { useAuth } from "@/lib/auth/auth-context"
import { useToast } from "@/hooks/use-toast"
import MarketplaceHeader from "@/components/marketplace/marketplace-header"
import MarketplaceFooter from "@/components/marketplace/marketplace-footer"

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
  allowCreate?: boolean
  createdAt: Date
  updatedAt?: Date
}

interface Collection {
  id: string
  name: string
  symbol: string
  description: string
  image: string
  metadataUrl: string
  artType: "same" | "unique"
  chain: string
  mintPrice: number
  royaltyFee: number
  maxSupply: number
  mintLimit: number
  mintStartDate: Date
  mintStages: any[]
  creatorAddress: string
  marketplaceId: string
  merchantId: string
  status: "draft" | "published" | "archived"
  createdAt: Date
  updatedAt: Date
}

export default function MintPage({ params }: { params: { merchantId: string; marketplaceId: string; collectionId: string } }) {
  const [marketplace, setMarketplace] = useState<Marketplace | null>(null)
  const [collection, setCollection] = useState<Collection | null>(null)
  const [loading, setLoading] = useState(true)
  const [minting, setMinting] = useState(false)
  const [mintProgress, setMintProgress] = useState(0)
  const [mintQuantity, setMintQuantity] = useState(1)
  const [mintSuccess, setMintSuccess] = useState(false)

  const { isConnected, account, connect, disconnect } = useWallet()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchCollectionData()
  }, [params.collectionId])

  const fetchCollectionData = async () => {
    setLoading(true)
    try {
      // Fetch marketplace details
      const marketplaceRes = await fetch(`/api/marketplaces/${params.marketplaceId}`)
      const marketplaceData = await marketplaceRes.json()
      
      if (marketplaceRes.ok) {
        setMarketplace(marketplaceData.marketplace)
      }

      // Fetch collection details
      const collectionRes = await fetch(`/api/collections/${params.collectionId}`)
      const collectionData = await collectionRes.json()
      
      if (collectionRes.ok) {
        setCollection(collectionData.collection)
      }
    } catch (error) {
      console.error("Failed to fetch collection data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMint = async () => {
    if (!isConnected || !account) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to mint NFTs",
        variant: "destructive",
      })
      return
    }

    if (!collection) return

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

      const response = await fetch(`/api/collections/${params.collectionId}/mint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress: account.address,
          quantity: mintQuantity,
          collectionId: params.collectionId
        }),
      })

      if (response.ok) {
        setMintProgress(100)
        setMintSuccess(true)
        
        toast({
          title: "NFT Minted Successfully",
          description: `You have minted ${mintQuantity} NFT(s) from ${collection.name}`,
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Minting Failed",
          description: errorData.error || "Unknown error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to mint NFT:", error)
      toast({
        title: "Minting Failed",
        description: "Failed to mint NFT. Please try again.",
        variant: "destructive",
      })
    } finally {
      setMinting(false)
      setMintProgress(0)
    }
  }

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading mint page...</p>
          </div>
        </div>
      </PageTransition>
    )
  }

  if (!collection || !marketplace) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Collection Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400">The collection you're looking for doesn't exist or has been removed.</p>
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
              <Link href={`/marketplace/${params.merchantId}/${params.marketplaceId}/collection/${params.collectionId}`}>
                <Button variant="outline" className="rounded-full text-sm sm:text-base">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Back to Collection</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
            </div>
          </FadeIn>

          <div className="max-w-4xl mx-auto">
            {mintSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Mint Successful!
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  You have successfully minted {mintQuantity} NFT(s) from {collection.name}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => setMintSuccess(false)}
                    variant="outline"
                  >
                    Mint Another
                  </Button>
                  <Link href={`/marketplace/${params.merchantId}/${params.marketplaceId}/collection/${params.collectionId}`}>
                    <Button 
                      style={{ 
                        backgroundColor: marketplace.primaryColor,
                        color: 'white'
                      }}
                    >
                      View Collection
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Collection Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Mint from {collection.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Collection Image */}
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                      {collection.image ? (
                        <Image
                          src={collection.image}
                          alt={collection.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="w-24 h-24 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Collection Details */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold">{collection.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{collection.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {collection.mintPrice || 0}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Mint Price (ALGO)</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {collection.maxSupply || '∞'}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Max Supply</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Mint Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Mint NFT</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {!isConnected ? (
                      <div className="text-center py-8">
                        <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          Connect Your Wallet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Connect your wallet to mint NFTs from this collection
                        </p>
                        <Button 
                          onClick={connect}
                          style={{ 
                            backgroundColor: marketplace.primaryColor,
                            color: 'white'
                          }}
                        >
                          <Wallet className="w-4 h-4 mr-2" />
                          Connect Wallet
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <Label htmlFor="quantity">Quantity</Label>
                          <Input
                            id="quantity"
                            type="number"
                            min="1"
                            max={collection.mintLimit || 1}
                            value={mintQuantity}
                            onChange={(e) => setMintQuantity(parseInt(e.target.value) || 1)}
                            className="mt-2"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Max {collection.mintLimit || 1} per wallet
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Mint Price:</span>
                            <span className="font-semibold">{collection.mintPrice || 0} ALGO</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Quantity:</span>
                            <span className="font-semibold">{mintQuantity}</span>
                          </div>
                          <div className="flex justify-between text-sm font-semibold border-t pt-2">
                            <span>Total:</span>
                            <span>{(collection.mintPrice || 0) * mintQuantity} ALGO</span>
                          </div>
                        </div>
                        
                        {minting && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Minting NFT</span>
                              <span>{mintProgress}%</span>
                            </div>
                            <Progress value={mintProgress} className="h-2" />
                          </div>
                        )}
                        
                        <Button 
                          onClick={handleMint}
                          disabled={minting}
                          className="w-full"
                          size="lg"
                          style={{ 
                            backgroundColor: marketplace.primaryColor,
                            color: 'white'
                          }}
                        >
                          {minting ? (
                            <>
                              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                              Minting...
                            </>
                          ) : (
                            <>
                              <Zap className="w-5 h-5 mr-2" />
                              Mint NFT
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
        
        <MarketplaceFooter marketplace={marketplace} />
      </div>
    </PageTransition>
  )
}
