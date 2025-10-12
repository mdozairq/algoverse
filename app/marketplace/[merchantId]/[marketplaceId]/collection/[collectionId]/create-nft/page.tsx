"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  Plus,
  Upload,
  Image as ImageIcon,
  Zap,
  RefreshCw,
  Package,
  Info
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { PageTransition, FadeIn } from "@/components/animations/page-transition"
import MarketplaceHeader from "@/components/marketplace/marketplace-header"
import MarketplaceFooter from "@/components/marketplace/marketplace-footer"
import Image from "next/image"
import { useWallet } from "@/hooks/use-wallet"
import { useToast } from "@/hooks/use-toast"
import { useParams } from "next/navigation"

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
  image?: string
  metadataUrl?: string
  artType: "same" | "unique"
  chain: string
  mintPrice: number
  royaltyFee: number
  maxSupply: number
  mintLimit: number
  mintStartDate?: string
  mintStages: any[]
  creatorAddress: string
  marketplaceId: string
  merchantId: string
  status: "draft" | "published" | "archived"
  createdAt: Date
  updatedAt?: Date
}

export default function CreateNFTPage() {
  const params = useParams()
  const merchantId = params.merchantId as string
  const marketplaceId = params.marketplaceId as string
  const collectionId = params.collectionId as string

  const [marketplace, setMarketplace] = useState<Marketplace | null>(null)
  const [collection, setCollection] = useState<Collection | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  // NFT form data
  const [nftData, setNftData] = useState({
    name: "",
    description: "",
    image: "",
    rarity: "common",
    category: "",
    properties: {}
  })

  const { isConnected, account } = useWallet()
  const { toast } = useToast()

  const fetchMarketplaceData = useCallback(async () => {
    try {
      const response = await fetch(`/api/marketplaces/${marketplaceId}`)
      const data = await response.json()
      if (response.ok) {
        setMarketplace(data.marketplace)
      }
    } catch (error) {
      console.error("Failed to fetch marketplace data:", error)
    }
  }, [marketplaceId])

  const fetchCollectionData = useCallback(async () => {
    try {
      const response = await fetch(`/api/collections/${collectionId}`)
      const data = await response.json()
      if (response.ok) {
        setCollection(data.collection)
      }
    } catch (error) {
      console.error("Failed to fetch collection data:", error)
    }
  }, [collectionId])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchMarketplaceData(),
        fetchCollectionData()
      ])
      setLoading(false)
    }
    loadData()
  }, [fetchMarketplaceData, fetchCollectionData])

  const uploadImageToServer = async (file: File, path: string): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('path', path)
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to upload image')
    }
    
    const data = await response.json()
    return data.url
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadingImage(true)
      setUploadProgress(0)
      
      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return prev
            }
            return prev + 10
          })
        }, 100)

        const imageUrl = await uploadImageToServer(file, `collections/${collectionId}/nft-images`)
        setUploadedImage(imageUrl)
        setNftData({ ...nftData, image: imageUrl })
        setUploadProgress(100)
        
        toast({
          title: "Image Uploaded",
          description: "NFT image uploaded successfully",
        })
      } catch (error) {
        console.error("Failed to upload image:", error)
        toast({
          title: "Upload Failed",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        })
      } finally {
        setUploadingImage(false)
        setUploadProgress(0)
      }
    }
  }

  const handleCreateNFT = async () => {
    console.log("Create NFT button clicked", { isConnected, account, nftData })
    
    if (!isConnected || !account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create NFTs.",
        variant: "destructive",
      })
      return
    }

    if (!nftData.name.trim() || !nftData.image) {
      toast({
        title: "Missing Required Fields",
        description: "Please provide a name and image for your NFT.",
        variant: "destructive",
      })
      return
    }

    setCreating(true)

    try {
      const response = await fetch("/api/nfts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...nftData,
          userAddress: account.address,
          collectionId: collectionId,
          marketplaceId: marketplaceId,
          merchantId: merchantId
        }),
      })

      if (response.ok) {
        toast({
          title: "NFT Created",
          description: "Your NFT has been created successfully!",
        })
        
        // Reset form
        setNftData({
          name: "",
          description: "",
          image: "",
          rarity: "common",
          category: "",
          properties: {}
        })
        setUploadedImage(null)
        
        // Redirect to collection page after a short delay
        setTimeout(() => {
          window.location.href = `/marketplace/${merchantId}/${marketplaceId}/collection/${collectionId}`
        }, 1500)
      } else {
        const errorData = await response.json()
        toast({
          title: "Creation Failed",
          description: errorData.error || "Unknown error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to create NFT:", error)
      toast({
        title: "Creation Failed",
        description: "Failed to create NFT. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </PageTransition>
    )
  }

  if (!marketplace || !collection) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Collection Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400">The collection you're looking for doesn't exist or has been removed.</p>
            <Link href={`/marketplace/${merchantId}/${marketplaceId}`}>
              <Button variant="outline" className="mt-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Marketplace
              </Button>
            </Link>
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
          merchantId={merchantId} 
          marketplaceId={marketplaceId} 
        />

        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {/* Back Button */}
          <FadeIn>
            <div className="mb-4 sm:mb-6">
              <Link href={`/marketplace/${merchantId}/${marketplaceId}/collection/${collectionId}`}>
                <Button variant="outline" className="rounded-full text-sm sm:text-base">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Back to Collection</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
            </div>
          </FadeIn>

          <FadeIn>
            <Card className="max-w-3xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold">Create NFT in {collection.name}</CardTitle>
                <CardDescription>
                  Add a new NFT to your collection on the Algorand blockchain.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Collection Info */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                    {collection.image ? (
                      <Image
                        src={collection.image}
                        alt={collection.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-200 dark:bg-gray-700">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{collection.name} ({collection.symbol})</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{collection.description}</p>
                  </div>
                </div>

                {/* NFT Name */}
                <div className="space-y-2">
                  <Label htmlFor="nftName" className="text-sm font-medium">NFT Name *</Label>
                  <Input
                    id="nftName"
                    value={nftData.name}
                    onChange={(e) => setNftData({ ...nftData, name: e.target.value })}
                    placeholder="Enter NFT name"
                    className="w-full"
                    required
                  />
                </div>

                {/* NFT Description */}
                <div className="space-y-2">
                  <Label htmlFor="nftDescription" className="text-sm font-medium">Description</Label>
                  <Textarea
                    id="nftDescription"
                    value={nftData.description}
                    onChange={(e) => setNftData({ ...nftData, description: e.target.value })}
                    placeholder="Describe your NFT"
                    rows={3}
                    className="w-full"
                  />
                </div>

                {/* NFT Image Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">NFT Image *</Label>
                  <p className="text-xs text-gray-500">Upload the image for your NFT. Recommended: 800×800px</p>
                  
                  {uploadedImage ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                      <Image
                        src={uploadedImage}
                        alt="NFT preview"
                        fill
                        className="object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setUploadedImage(null)
                          setNftData({ ...nftData, image: "" })
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                      <div className="space-y-4">
                        {uploadingImage ? (
                          <div className="space-y-2">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Uploading... {uploadProgress}%
                            </div>
                            <Progress value={uploadProgress} className="h-2" />
                          </div>
                        ) : (
                          <>
                            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Drop your NFT image here to upload
                              </p>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="nft-image-upload"
                              />
                              <Button variant="outline" size="sm" asChild>
                                <label htmlFor="nft-image-upload" className="cursor-pointer">
                                  Choose Image...
                                </label>
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* NFT Properties */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">NFT Properties</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nftRarity" className="text-sm">Rarity</Label>
                      <Select value={nftData.rarity} onValueChange={(value) => setNftData({ ...nftData, rarity: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rarity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="common">Common</SelectItem>
                          <SelectItem value="uncommon">Uncommon</SelectItem>
                          <SelectItem value="rare">Rare</SelectItem>
                          <SelectItem value="epic">Epic</SelectItem>
                          <SelectItem value="legendary">Legendary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nftCategory" className="text-sm">Category</Label>
                      <Input
                        id="nftCategory"
                        value={nftData.category}
                        onChange={(e) => setNftData({ ...nftData, category: e.target.value })}
                        placeholder="e.g., Art, Gaming, Music"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 space-y-4">
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setNftData({
                          name: "",
                          description: "",
                          image: "",
                          rarity: "common",
                          category: "",
                          properties: {}
                        })
                        setUploadedImage(null)
                      }}
                      className="flex-1"
                    >
                      Clear Form
                    </Button>
                    <Button 
                      onClick={handleCreateNFT}
                      disabled={creating || !isConnected || !nftData.name.trim() || !nftData.image}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
                      size="lg"
                      type="button"
                    >
                      {creating ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 mr-2" />
                          Create NFT
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    By creating an NFT, you agree to the Marketplace Terms of Service.
                  </p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
        
        <MarketplaceFooter marketplace={marketplace} />
      </div>
    </PageTransition>
  )
}
