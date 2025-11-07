"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft, 
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  Loader2,
  Wallet,
  Zap,
  Eye,
  X,
  Plus,
  Trash2
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { PageTransition, FadeIn } from "@/components/animations/page-transition"
import MarketplaceHeader from "@/components/marketplace/marketplace-header"
import MarketplaceFooter from "@/components/marketplace/marketplace-footer"
import TemplateLoader from "@/components/marketplace/template-loader"
import { CreatePageLoadingTemplate, SimpleLoadingTemplate } from "@/components/ui/loading-templates"
import Image from "next/image"
import { useWallet } from "@/hooks/use-wallet"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-context"
import { transactionSigner } from "@/lib/wallet/transaction-signer"

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
  description?: string
  symbol?: string
  image?: string
  mintPrice?: number
  maxSupply?: number
  availableSupply?: number
  status: string
  createdAt: Date
}

interface GeneratedImage {
  id: string
  url: string
  prompt: string
  generatedAt: Date
}

interface NFTData {
  name: string
  description: string
  image: string
  ipfsHash: string
  price: number
  mintPrice: number
  maxSupply: number
  rarity: string
  royaltyFee: number
  traits: Array<{
    trait_type: string
    value: string
    rarity?: number
  }>
}

type Step = "select-collection" | "generate" | "create-nft" | "mint"

export default function GeneratePage({ params }: { params: { merchantId: string; marketplaceId: string } }) {
  const router = useRouter()
  const { isConnected, account, connect, disconnect } = useWallet()
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuth()

  const [currentStep, setCurrentStep] = useState<Step>("select-collection")
  const [availableCollections, setAvailableCollections] = useState<Collection[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  
  // Generation state
  const [prompt, setPrompt] = useState("")
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
  
  // NFT Creation state
  const [nftData, setNftData] = useState<NFTData>({
    name: "",
    description: "",
    image: "",
    ipfsHash: "",
    price: 0,
    mintPrice: 0,
    maxSupply: 1,
    rarity: "common",
    royaltyFee: 0,
    traits: []
  })
  const [creatingNFT, setCreatingNFT] = useState(false)
  const [createdNFTId, setCreatedNFTId] = useState<string | null>(null)
  
  // Minting state
  const [mintStatus, setMintStatus] = useState<'idle' | 'creating' | 'signing' | 'submitting' | 'success' | 'error'>('idle')
  const [minting, setMinting] = useState(false)
  const [mintResult, setMintResult] = useState<any>(null)

  // Set up the transaction signer
  useEffect(() => {
    transactionSigner.setUseWalletHook({ isConnected, account, connect, disconnect })
  }, [isConnected, account, connect, disconnect])

  const fetchAvailableCollections = async () => {
    try {
      const response = await fetch(`/api/marketplaces/${params.marketplaceId}/collections`)
      const data = await response.json()
      if (response.ok) {
        setAvailableCollections(data.collections.filter((collection: any) => collection.isEnabled && collection.source === "public") || [])
      }
    } catch (error) {
      console.error("Failed to fetch collections:", error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        await fetchAvailableCollections()
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [params.marketplaceId])

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt to generate an image",
        variant: "destructive",
      })
      return
    }

    if (!selectedCollection || selectedCollection === "no-collections") {
      toast({
        title: "Error",
        description: "Please select a collection first",
        variant: "destructive",
      })
      return
    }

    setGenerating(true)
    setGenerationProgress(0)

    try {
      // Simulate generation progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 300)

      // Call AI generation API
      const response = await fetch(`/api/generate/image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          collectionId: selectedCollection,
          marketplaceId: params.marketplaceId
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const newImage: GeneratedImage = {
          id: `img-${Date.now()}`,
          url: data.imageUrl || data.url,
          prompt: prompt,
          generatedAt: new Date()
        }
        
        setGeneratedImages(prev => [newImage, ...prev])
        setGenerationProgress(100)
        
        // Check if image was successfully uploaded to IPFS
        const isIPFSUploaded = data.uploadedToIPFS || data.ipfsHash || (data.imageUrl && data.imageUrl.includes('ipfs'))
        
        // Automatically select the generated image
        setSelectedImage(newImage)
        
        // Update NFT data with the generated image
        setNftData(prev => ({
          ...prev,
          image: newImage.url,
          ipfsHash: data.ipfsHash || newImage.url,
          description: prev.description || `AI-generated NFT based on: ${newImage.prompt}`
        }))
        
        toast({
          title: "Success",
          description: isIPFSUploaded 
            ? "Image generated and uploaded to IPFS successfully! Moving to create NFT step..."
            : "Image generated successfully!",
        })
        
        // Automatically move to create-nft step after a short delay
        setTimeout(() => {
          setCurrentStep("create-nft")
        }, 1000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate image")
      }
    } catch (error: any) {
      console.error("Failed to generate image:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to generate image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
      setGenerationProgress(0)
    }
  }

  const handleSelectImage = (image: GeneratedImage) => {
    setSelectedImage(image)
    setNftData(prev => ({
      ...prev,
      image: image.url,
      description: prev.description || `AI-generated NFT based on: ${image.prompt}`
    }))
    setCurrentStep("create-nft")
  }

  const handleCreateNFT = async () => {
    if (!selectedImage) {
      toast({
        title: "Error",
        description: "Please select a generated image first",
        variant: "destructive",
      })
      return
    }

    if (!nftData.name.trim()) {
      toast({
        title: "Error",
        description: "NFT name is required",
        variant: "destructive",
      })
      return
    }

    if (!selectedCollection || selectedCollection === "no-collections") {
      toast({
        title: "Error",
        description: "Please select a collection",
        variant: "destructive",
      })
      return
    }

    setCreatingNFT(true)
    try {
      // Upload image to IPFS if needed
      let ipfsHash = nftData.ipfsHash
      if (!ipfsHash && selectedImage.url) {
        // In a real implementation, you would upload the image to IPFS here
        // For now, we'll use the generated image URL
        ipfsHash = selectedImage.url
      }

      const response = await fetch(`/api/nfts/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...nftData,
          ipfsHash: ipfsHash || selectedImage.url,
          collectionId: selectedCollection,
          marketplaceId: params.marketplaceId,
          merchantId: params.merchantId,
          userAddress: account?.address,
          traits: nftData.traits || []
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setCreatedNFTId(result.nftId)
        setCurrentStep("mint")
        toast({
          title: "Success",
          description: "NFT created successfully! You can now mint it on the blockchain.",
        })
      } else {
        throw new Error("Failed to create NFT")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create NFT",
        variant: "destructive",
      })
    } finally {
      setCreatingNFT(false)
    }
  }

  const handleMintNFT = async () => {
    if (!createdNFTId || !user) return

    setMinting(true)
    setMintStatus('creating')
    try {
      // Step 1: Create mint transaction
      const createResponse = await fetch(`/api/nfts/mint-wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nftId: createdNFTId,
          userAddress: account?.address || account
        }),
      })

      if (!createResponse.ok) {
        const error = await createResponse.json()
        throw new Error(error.error || "Failed to create mint transaction")
      }

      const { transaction } = await createResponse.json()

      // Step 2: Sign transaction with wallet
      let signedTransaction
      try {
        setMintStatus('signing')
        const userAddress = typeof account === 'string' ? account : account?.address
        if (!userAddress) {
          throw new Error('User address is required for signing transaction')
        }
        signedTransaction = await transactionSigner.signTransaction(transaction.txn, userAddress)
        console.log('Transaction signed successfully with Pera Wallet')
      } catch (error: any) {
        console.error('Wallet signing failed:', error)
        throw new Error(`Failed to sign transaction: ${error.message || 'Unknown error'}`)
      }

      // Step 3: Submit signed transaction
      setMintStatus('submitting')
      const submitResponse = await fetch(`/api/nfts/mint-wallet`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nftId: createdNFTId,
          signedTransaction,
          userAddress: account?.address || account,
          isMinted: true,
        }),
      })

      if (submitResponse.ok) {
        const result = await submitResponse.json()
        setMintResult(result)
        setMintStatus('success')
        toast({
          title: "Success",
          description: `NFT minted successfully! Asset ID: ${result.assetId}`,
        })
        
        // Reset and redirect after a delay
        setTimeout(() => {
          router.push(`/marketplace/${params.merchantId}/${params.marketplaceId}`)
        }, 3000)
      } else {
        const error = await submitResponse.json()
        throw new Error(error.error || "Failed to submit mint transaction")
      }
    } catch (error: any) {
      setMintStatus('error')
      toast({
        title: "Error",
        description: error.message || "Failed to mint NFT",
        variant: "destructive",
      })
    } finally {
      setMinting(false)
    }
  }

  const selectedCollectionData = availableCollections.find(c => c.id === selectedCollection)

  return (
    <TemplateLoader marketplaceId={params.marketplaceId}>
      {({ marketplace, template, loading: templateLoading, getButtonStyle, getCardStyle, getBadgeStyle, getThemeStyles }) => {
        if (templateLoading || loading) {
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
                {/* Back Button */}
                {/* <FadeIn>
                  <div className="mb-4 sm:mb-6">
                    <Link href={`/marketplace/${params.merchantId}/${params.marketplaceId}`}>
                      <Button variant="outline" className="rounded-full text-sm sm:text-base">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Back to Marketplace</span>
                        <span className="sm:hidden">Back</span>
                      </Button>
                    </Link>
                  </div>
                </FadeIn> */}

                {/* Header */}
                <FadeIn>
                  <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
                          AI Generate NFT
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                          Generate unique NFTs using AI in {marketplace.businessName}
                        </p>
                      </div>
                    </div>
                  </div>
                </FadeIn>

                {/* Step Indicator */}
                <FadeIn>
                  <div className="mb-6">
                    <div className="flex items-center justify-between max-w-2xl mx-auto">
                      {["Select Collection", "Generate", "Create NFT", "Mint"].map((step, index) => {
                        const stepKeys: Step[] = ["select-collection", "generate", "create-nft", "mint"]
                        const isActive = currentStep === stepKeys[index]
                        const isCompleted = stepKeys.indexOf(currentStep) > index
                        
                        return (
                          <div key={step} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                                  isActive
                                    ? "bg-blue-600 text-white"
                                    : isCompleted
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-5 h-5" />
                                ) : (
                                  index + 1
                                )}
                              </div>
                              <span className={`text-xs mt-2 text-center ${isActive ? "font-semibold" : ""}`}>
                                {step}
                              </span>
                            </div>
                            {index < 3 && (
                              <div
                                className={`h-1 flex-1 mx-2 transition-all ${
                                  isCompleted ? "bg-green-600" : "bg-gray-200 dark:bg-gray-700"
                                }`}
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </FadeIn>

                {/* Step 1: Select Collection */}
                {currentStep === "select-collection" && (
                  <FadeIn>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl font-bold">Step 1: Select Collection</CardTitle>
                        <CardDescription>
                          Choose a collection to add your AI-generated NFT to
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {!isConnected ? (
                            <Alert>
                              <Wallet className="w-4 h-4" />
                              <AlertDescription>
                                Please connect your wallet to continue
                              </AlertDescription>
                            </Alert>
                          ) : (
                            <>
                              <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select a collection" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableCollections.length > 0 ? (
                                    availableCollections.map((collection) => (
                                      <SelectItem key={collection.id} value={collection.id}>
                                        <div className="flex items-center gap-2">
                                          {collection.image && (
                                            <Image
                                              src={collection.image}
                                              alt={collection.name}
                                              width={24}
                                              height={24}
                                              className="rounded"
                                            />
                                          )}
                                          <span>{collection.name} {collection.symbol && `(${collection.symbol})`}</span>
                                        </div>
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="no-collections" disabled>
                                      No collections available
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                              
                              {selectedCollection && selectedCollectionData && (
                                <Card className="mt-4">
                                  <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                      {selectedCollectionData.image && (
                                        <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                                          <Image
                                            src={selectedCollectionData.image}
                                            alt={selectedCollectionData.name}
                                            fill
                                            className="object-cover"
                                          />
                                        </div>
                                      )}
                                      <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{selectedCollectionData.name}</h3>
                                        {selectedCollectionData.description && (
                                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {selectedCollectionData.description}
                                          </p>
                                        )}
                                        <div className="flex items-center gap-4 mt-2 text-sm">
                                          {selectedCollectionData.mintPrice !== undefined && (
                                            <span>Mint Price: {selectedCollectionData.mintPrice} ALGO</span>
                                          )}
                                          {selectedCollectionData.maxSupply !== undefined && (
                                            <span>Max Supply: {selectedCollectionData.maxSupply}</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}

                              {availableCollections.length === 0 && (
                                <Alert>
                                  <AlertDescription>
                                    No collections found. Please create a collection first using the "Create" page.
                                  </AlertDescription>
                                </Alert>
                              )}

                              <div className="flex justify-end pt-4">
                                <Button
                                  onClick={() => {
                                    if (selectedCollection && selectedCollection !== "no-collections") {
                                      setCurrentStep("generate")
                                    } else {
                                      toast({
                                        title: "Error",
                                        description: "Please select a collection first",
                                        variant: "destructive",
                                      })
                                    }
                                  }}
                                  disabled={!selectedCollection || selectedCollection === "no-collections"}
                                  style={getButtonStyle('primary')}
                                >
                                  Next: Generate Image
                                  <Wand2 className="w-4 h-4 ml-2" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </FadeIn>
                )}

                {/* Step 2: Generate Image */}
                {currentStep === "generate" && (
                  <FadeIn>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl font-bold">Step 2: Generate Image with AI</CardTitle>
                        <CardDescription>
                          Enter a prompt to generate a unique NFT image using AI
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="prompt">Image Generation Prompt</Label>
                            <Textarea
                              id="prompt"
                              value={prompt}
                              onChange={(e) => setPrompt(e.target.value)}
                              placeholder="e.g., A futuristic cyberpunk warrior with neon lights, digital art style, 4k, highly detailed"
                              rows={4}
                              className="w-full"
                            />
                            <p className="text-xs text-gray-500">
                              Be descriptive! Include style, colors, mood, and details for best results.
                            </p>
                          </div>

                          <Button
                            onClick={handleGenerateImage}
                            disabled={generating || !prompt.trim()}
                            className="w-full"
                            style={getButtonStyle('primary')}
                          >
                            {generating ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating... {generationProgress}%
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generate Image
                              </>
                            )}
                          </Button>

                          {generating && (
                            <div className="space-y-2">
                              <Progress value={generationProgress} className="h-2" />
                              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                                Creating your unique NFT image...
                              </p>
                            </div>
                          )}

                          {/* Generated Images Grid */}
                          {generatedImages.length > 0 && (
                            <div className="space-y-4">
                              <h3 className="font-semibold text-lg">Generated Images</h3>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {generatedImages.map((image) => (
                                  <motion.div
                                    key={image.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                                      selectedImage?.id === image.id
                                        ? "border-blue-500 ring-2 ring-blue-300"
                                        : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                                    }`}
                                    onClick={() => handleSelectImage(image)}
                                  >
                                    <Image
                                      src={image.url}
                                      alt={image.prompt}
                                      fill
                                      className="object-cover"
                                    />
                                    {selectedImage?.id === image.id && (
                                      <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                        <CheckCircle2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                      </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs line-clamp-2">
                                      {image.prompt}
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex justify-between pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setCurrentStep("select-collection")}
                            >
                              Back
                            </Button>
                            <Button
                              onClick={() => {
                                if (selectedImage) {
                                  setCurrentStep("create-nft")
                                } else {
                                  toast({
                                    title: "Error",
                                    description: "Please generate and select an image first",
                                    variant: "destructive",
                                  })
                                }
                              }}
                              disabled={!selectedImage}
                              style={getButtonStyle('primary')}
                            >
                              Next: Create NFT
                              <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </FadeIn>
                )}

                {/* Step 3: Create NFT */}
                {currentStep === "create-nft" && selectedImage && (
                  <FadeIn>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl font-bold">Step 3: Create NFT</CardTitle>
                        <CardDescription>
                          Finalize your NFT details before minting
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Selected Image Preview */}
                          <div className="space-y-2">
                            <Label>Selected Generated Image</Label>
                            <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                              <Image
                                src={selectedImage.url}
                                alt={selectedImage.prompt}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <p className="text-xs text-gray-500">
                              Prompt: {selectedImage.prompt}
                            </p>
                          </div>

                          {/* NFT Details Form */}
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="nftName">NFT Name *</Label>
                              <Input
                                id="nftName"
                                value={nftData.name}
                                onChange={(e) => setNftData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter NFT name"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="nftDescription">Description</Label>
                              <Textarea
                                id="nftDescription"
                                value={nftData.description}
                                onChange={(e) => setNftData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe your NFT"
                                rows={3}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="mintPrice">Mint Price (ALGO)</Label>
                                <Input
                                  id="mintPrice"
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={nftData.mintPrice || ""}
                                  onChange={(e) => setNftData(prev => ({ ...prev, mintPrice: parseFloat(e.target.value) || 0 }))}
                                  placeholder="0.1"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="price">Sale Price (ALGO)</Label>
                                <Input
                                  id="price"
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={nftData.price || ""}
                                  onChange={(e) => setNftData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                  placeholder="1.0"
                                />
                                <p className="text-xs text-gray-500">
                                  Price for listing the NFT for sale
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="royaltyFee">Royalty Fee (%)</Label>
                                <Input
                                  id="royaltyFee"
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max="100"
                                  value={nftData.royaltyFee || ""}
                                  onChange={(e) => setNftData(prev => ({ ...prev, royaltyFee: parseFloat(e.target.value) || 0 }))}
                                  placeholder="5"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="rarity">Rarity</Label>
                                <Select
                                  value={nftData.rarity}
                                  onValueChange={(value) => setNftData(prev => ({ ...prev, rarity: value }))}
                                >
                                  <SelectTrigger id="rarity">
                                    <SelectValue placeholder="Select rarity" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="common">Common</SelectItem>
                                    <SelectItem value="uncommon">Uncommon</SelectItem>
                                    <SelectItem value="rare">Rare</SelectItem>
                                    <SelectItem value="epic">Epic</SelectItem>
                                    <SelectItem value="legendary">Legendary</SelectItem>
                                    <SelectItem value="mythic">Mythic</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Traits Section */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Label>Traits / Attributes</Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setNftData(prev => ({
                                      ...prev,
                                      traits: [...(prev.traits || []), { trait_type: "", value: "" }]
                                    }))
                                  }}
                                  className="flex items-center gap-1"
                                >
                                  <Plus className="w-4 h-4" />
                                  Add Trait
                                </Button>
                              </div>
                              
                              {nftData.traits && nftData.traits.length > 0 ? (
                                <div className="space-y-3 border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                                  {nftData.traits.map((trait, index) => (
                                    <div key={index} className="flex gap-2 items-start">
                                      <div className="flex-1 grid grid-cols-2 gap-2">
                                        <Input
                                          placeholder="Trait type (e.g., Background)"
                                          value={trait.trait_type}
                                          onChange={(e) => {
                                            const newTraits = [...nftData.traits]
                                            newTraits[index] = { ...trait, trait_type: e.target.value }
                                            setNftData(prev => ({ ...prev, traits: newTraits }))
                                          }}
                                        />
                                        <Input
                                          placeholder="Value (e.g., Blue)"
                                          value={trait.value}
                                          onChange={(e) => {
                                            const newTraits = [...nftData.traits]
                                            newTraits[index] = { ...trait, value: e.target.value }
                                            setNftData(prev => ({ ...prev, traits: newTraits }))
                                          }}
                                        />
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const newTraits = nftData.traits.filter((_, i) => i !== index)
                                          setNftData(prev => ({ ...prev, traits: newTraits }))
                                        }}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-6 border-2 border-dashed rounded-lg text-gray-500 dark:text-gray-400">
                                  <p className="text-sm">No traits added yet</p>
                                  <p className="text-xs mt-1">Click "Add Trait" to add attributes to your NFT</p>
                                </div>
                              )}
                              <p className="text-xs text-gray-500">
                                Add unique attributes that make your NFT special (e.g., Background: Blue, Eyes: Laser, etc.)
                              </p>
                            </div>
                          </div>

                          <div className="flex justify-between pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setCurrentStep("generate")}
                            >
                              Back
                            </Button>
                            <Button
                              onClick={handleCreateNFT}
                              disabled={creatingNFT || !nftData.name.trim()}
                              style={getButtonStyle('primary')}
                            >
                              {creatingNFT ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Creating...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Create NFT
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </FadeIn>
                )}

                {/* Step 4: Mint NFT */}
                {currentStep === "mint" && createdNFTId && (
                  <FadeIn>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl font-bold">Step 4: Mint NFT</CardTitle>
                        <CardDescription>
                          Mint your NFT on the Algorand blockchain
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <Alert>
                            <CheckCircle2 className="w-4 h-4" />
                            <AlertDescription>
                              NFT created successfully! Ready to mint on blockchain.
                            </AlertDescription>
                          </Alert>

                          <div className="space-y-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <h3 className="font-semibold mb-2">NFT Details</h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Name:</span>
                                  <span className="font-medium">{nftData.name}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Collection:</span>
                                  <span className="font-medium">{selectedCollectionData?.name}</span>
                                </div>
                                {nftData.mintPrice > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Mint Price:</span>
                                    <span className="font-medium">{nftData.mintPrice} ALGO</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {mintStatus === 'success' && mintResult && (
                              <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                                <AlertDescription className="text-green-800 dark:text-green-200">
                                  <strong>Success!</strong> NFT minted on Algorand. Asset ID: {mintResult.assetId}
                                </AlertDescription>
                              </Alert>
                            )}

                            {mintStatus === 'error' && (
                              <Alert variant="destructive">
                                <AlertDescription>
                                  Failed to mint NFT. Please try again.
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>

                          <div className="flex justify-between pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setCurrentStep("create-nft")}
                              disabled={minting}
                            >
                              Back
                            </Button>
                            <Button
                              onClick={handleMintNFT}
                              disabled={minting || !isConnected || mintStatus === 'success'}
                              style={getButtonStyle('primary')}
                            >
                              {minting ? (
                                <>
                                  {mintStatus === 'creating' && (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Creating Transaction...
                                    </>
                                  )}
                                  {mintStatus === 'signing' && (
                                    <>
                                      <Wallet className="w-4 h-4 mr-2" />
                                      Signing in Wallet...
                                    </>
                                  )}
                                  {mintStatus === 'submitting' && (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Submitting to Blockchain...
                                    </>
                                  )}
                                </>
                              ) : mintStatus === 'success' ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Minted Successfully!
                                </>
                              ) : (
                                <>
                                  <Zap className="w-4 h-4 mr-2" />
                                  Mint NFT
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </FadeIn>
                )}
              </div>

              <MarketplaceFooter marketplace={marketplace} />
            </div>
          </PageTransition>
        )
      }}
    </TemplateLoader>
  )
}

