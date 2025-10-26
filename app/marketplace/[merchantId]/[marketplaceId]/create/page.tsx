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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { NFTCreationForm } from "@/components/nft/nft-creation-form"
import { WalletConnectButtonCompact } from "@/components/wallet/wallet-connect-button"
import { 
  ArrowLeft, 
  Plus,
  Wallet,
  Eye,
  Upload,
  Image as ImageIcon,
  Zap,
  Loader2,
  CheckCircle2,
  Trash2,
  X
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { PageTransition, FadeIn} from "@/components/animations/page-transition"
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
  createdAt: Date
  updatedAt?: Date
}

interface CreateTemplate {
  id: string
  name: string
  description: string
  category: string
  type: "nft" | "event" | "merchandise"
  image: string
  price: number
  currency: string
  isEnabled: boolean
  createdAt: Date
}

interface CreateSession {
  id: string
  templateId: string
  userAddress: string
  status: "draft" | "published" | "archived"
  createdAt: Date
  publishedAt?: Date
}

interface NFTTrait {
  trait_type: string
  value: string
  rarity: number
}

interface NewNFT {
  name: string
  description: string
  image: string
  ipfsHash: string
  price: number
  mintPrice: number
  maxSupply: number
  rarity: string
  royaltyFee: number
  traits: NFTTrait[]
}

export default function CreatePage({ params }: { params: { merchantId: string; marketplaceId: string } }) {
  const router = useRouter()
  const [createTemplates, setCreateTemplates] = useState<CreateTemplate[]>([])
  const [userSessions, setUserSessions] = useState<CreateSession[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<CreateTemplate | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createProgress, setCreateProgress] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBy, setFilterBy] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [selectedArtType, setSelectedArtType] = useState<"same" | "unique">("unique")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedNFTImages, setUploadedNFTImages] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [availableCollections, setAvailableCollections] = useState<any[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string>("")
  const [tabLoading, setTabLoading] = useState(false)
  
  // NFT Creation State
  const [newNFT, setNewNFT] = useState<NewNFT>({
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
  const [nftTraits, setNftTraits] = useState<NFTTrait[]>([])
  const [createdNFTId, setCreatedNFTId] = useState<string | null>(null)
  const [showMintDialog, setShowMintDialog] = useState(false)
  const [mintStatus, setMintStatus] = useState<'idle' | 'creating' | 'signing' | 'submitting' | 'success' | 'error'>('idle')
  const [mintResult, setMintResult] = useState<any>(null)
  const [enableOnChainMint, setEnableOnChainMint] = useState(false)

  // Form data for creating new items
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    type: "nft" as "nft" | "event" | "merchandise",
    image: "",
    price: "",
    currency: "ALGO",
    symbol: "",
    chain: "algorand",
    artType: "unique" as "same" | "unique",
    metadataUrl: "",
    mintPrice: "",
    royaltyFee: "",
    maxSupply: "",
    mintLimit: "",
    mintStartDate: "",
    mintStages: [],
    source: "public",
    isEnabled: true
  })

  const { isConnected, account, connect, disconnect } = useWallet()
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuth()

  // Set up the transaction signer
  useEffect(() => {
    transactionSigner.setUseWalletHook({ isConnected, account, connect, disconnect })
  }, [isConnected, account, connect, disconnect])

  const handleTabChange = async (value: string) => {
    setTabLoading(true)
    
    // Simulate a small delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Handle specific tab data fetching if needed
    if (value === "my-creations" && availableCollections.length === 0) {
      await fetchAvailableCollections()
    }
    
    setTabLoading(false)
  }


  const fetchCreateTemplates = async () => {
    try {
      const response = await fetch(`/api/marketplaces/${params.marketplaceId}/create-templates`)
      const data = await response.json()
      
      if (response.ok) {
        setCreateTemplates(data.templates || [])
      }
    } catch (error) {
      console.error("Failed to fetch create templates:", error)
    }
  }

  const fetchUserSessions = async () => {
    if (!isConnected || !account) return
    
    try {
      const response = await fetch(`/api/user/create-sessions?address=${account}`)
      const data = await response.json()
      
      if (response.ok) {
        setUserSessions(data.sessions || [])
      }
    } catch (error) {
      console.error("Failed to fetch user sessions:", error)
    }
  }

  const fetchAvailableCollections = async () => {
    try {
      const response = await fetch(`/api/marketplaces/${params.marketplaceId}/collections`)
      const data = await response.json()
      console.log("available collections", data);
      if (response.ok) {
        setAvailableCollections(data.collections.filter((collection: any) => collection.isEnabled && collection.source === "public") || [])
      }
    } catch (error) {
      console.error("Failed to fetch collections:", error)
    }
  }

  useEffect(() => {
    fetchCreateTemplates()
    fetchAvailableCollections()
  }, [params.marketplaceId])

  useEffect(() => {
    if (isConnected && account) {
      fetchUserSessions()
    }
  }, [isConnected, account])

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
      setUploadingImages(true)
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

        const imageUrl = await uploadImageToServer(file, `collections/${params.marketplaceId}/collection-image`)
        setUploadedImage(imageUrl)
        setFormData({ ...formData, image: imageUrl })
        setUploadProgress(100)
        
        toast({
          title: "Image Uploaded",
          description: "Collection image uploaded successfully",
        })
      } catch (error) {
        console.error("Failed to upload image:", error)
        toast({
          title: "Upload Failed",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        })
      } finally {
        setUploadingImages(false)
        setUploadProgress(0)
      }
    }
  }

  const handleNFTImagesUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setUploadingImages(true)
    setUploadProgress(0)
    
    try {
      const uploadPromises = files.map(async (file, index) => {
        const imageUrl = await uploadImageToServer(file, `collections/${params.marketplaceId}/nft-images/${Date.now()}-${index}`)
        return imageUrl
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setUploadedNFTImages(prev => [...prev, ...uploadedUrls])
      
      toast({
        title: "Images Uploaded",
        description: `${uploadedUrls.length} NFT images uploaded successfully`,
      })
    } catch (error) {
      console.error("Failed to upload NFT images:", error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload NFT images. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploadingImages(false)
      setUploadProgress(0)
    }
  }

  const validateForm = () => {
    const errors = []
    
    if (!formData.name.trim()) errors.push("Collection name is required")
    if (!formData.symbol.trim()) errors.push("Collection symbol is required")
    if (formData.mintPrice && (parseFloat(formData.mintPrice) || 0) < 0) errors.push("Mint price must be positive")
    if (formData.royaltyFee && ((parseFloat(formData.royaltyFee) || 0) < 0 || (parseFloat(formData.royaltyFee) || 0) > 100)) {
      errors.push("Royalty fee must be between 0 and 100")
    }
    if (formData.maxSupply && (parseInt(formData.maxSupply) || 0) < 1) errors.push("Max supply must be at least 1")
    if (formData.mintLimit && (parseInt(formData.mintLimit) || 0) < 1) errors.push("Mint limit must be at least 1")
    
    return errors
  }

  const handleCreateItem = async () => {
    if (!isConnected || !account) return

    // Validate form
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join(', '),
        variant: "destructive",
      })
      return
    }

    setCreating(true)
    setCreateProgress(0)

    try {
      // Simulate creation progress
      const progressInterval = setInterval(() => {
        setCreateProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch("/api/marketplaces/create-collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          artType: selectedArtType,
          userAddress: account,
          marketplaceId: params.marketplaceId,
          merchantId: params.merchantId,
          mintPrice: parseFloat(formData.mintPrice || "0") || 0,
          royaltyFee: parseFloat(formData.royaltyFee || "0") || 0,
          maxSupply: parseInt(formData.maxSupply || "1000") || 1000,
          mintLimit: parseInt(formData.mintLimit || "1") || 1,
          nftImages: uploadedNFTImages,
          creatorAddress: account,
          source: "public",
          isEnabled: true
        }),
      })

      if (response.ok) {
        setCreateProgress(100)
        setShowCreateDialog(false)
        setFormData({
          name: "",
          description: "",
          category: "",
          type: "nft",
          image: "",
          price: "",
          currency: "ALGO",
          symbol: "",
          chain: "algorand",
          artType: "unique",
          metadataUrl: "",
          mintPrice: "",
          royaltyFee: "",
          maxSupply: "",
          mintLimit: "",
          mintStartDate: "",
          mintStages: [],
          source: "public",
          isEnabled: true
        })
        setSelectedArtType("unique")
        setUploadedImage(null)
        setUploadedNFTImages([])
        fetchUserSessions()
        fetchCreateTemplates()
        
        // Show success message
        toast({
          title: "Collection Created",
          description: "Your NFT collection has been created successfully!",
        })
        
        // Navigate back to marketplace after successful creation
        setTimeout(() => {
          router.push(`/marketplace/${params.merchantId}/${params.marketplaceId}`)
        }, 2000)
      } else {
        const errorData = await response.json()
        toast({
          title: "Creation Failed",
          description: errorData.error || "Unknown error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to create collection:", error)
      toast({
        title: "Creation Failed",
        description: "Failed to create collection. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
      setCreateProgress(0)
    }
  }

  const handleCreateNFT = async () => {
    if (!selectedCollection || selectedCollection === "no-collections") {
      toast({
        title: "Error",
        description: "Please select a collection first",
        variant: "destructive",
      })
      return
    }

    if (!newNFT.name || !newNFT.description) {
      toast({
        title: "Error",
        description: "NFT name and description are required",
        variant: "destructive",
      })
      return
    }

    setCreating(true)
    try {
      const response = await fetch(`/api/nfts/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newNFT,
          collectionId: selectedCollection,
          marketplaceId: params.marketplaceId,
          merchantId: params.merchantId,
          userAddress: account,
          traits: nftTraits
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setCreatedNFTId(result.nftId)
        toast({
          title: "Success",
          description: "NFT created successfully! You can now mint it on the blockchain.",
        })
        
        // Reset form
        setNewNFT({
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
        setNftTraits([])
        fetchAvailableCollections()
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
      setCreating(false)
    }
  }

  const handleMintNFT = async (nftId: string, userAddress: string) => {
    if (!user) return

    setMintStatus('creating')
    try {
      // Step 1: Create mint transaction
      const createResponse = await fetch(`/api/nfts/mint-wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nftId,
          userAddress
        }),
      })

      if (!createResponse.ok) {
        const error = await createResponse.json()
        throw new Error(error.error || "Failed to create mint transaction")
      }

      const { transaction } = await createResponse.json()

      // Step 2: Sign transaction with wallet using the transaction signer
      let signedTransaction
      
      try {
        setMintStatus('signing')
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
          nftId,
          signedTransaction
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
        fetchAvailableCollections()
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
    }
  }

  const filteredTemplates = createTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
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
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Creator Studio
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Create and publish content in {marketplace.businessName}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Wallet connection is handled in the header */}
                </div>
              </div>
            </div>
          </FadeIn>

          <Tabs defaultValue="create" className="space-y-6" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="my-creations">My Creations</TabsTrigger>
              <TabsTrigger value="create">Create Collection</TabsTrigger>
              <TabsTrigger value="create-nft">Create NFT</TabsTrigger>
            </TabsList>

            <TabsContent value="my-creations" className="space-y-6">
              {tabLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading collections...</p>
                  </div>
                </div>
              ) : !isConnected ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Wallet className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Connect Your Wallet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                      Please connect your wallet using the button in the header to view your creations
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Search and Filter Controls */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search collections..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select value={filterBy} onValueChange={setFilterBy}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recent">Recent</SelectItem>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="status">Status</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Collections Grid */}
                  {availableCollections.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                          <Plus className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          No Collections Found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                          {searchTerm || filterBy !== 'all' 
                            ? 'No collections match your current filters. Try adjusting your search or filter criteria.'
                            : 'You haven\'t created any collections yet. Start by creating your first collection!'
                          }
                        </p>
                        {!searchTerm && filterBy === 'all' && (
                          <Button 
                            onClick={() => {
                              const createTab = document.querySelector('[value="create"]') as HTMLElement;
                              createTab?.click();
                            }}
                            style={getButtonStyle('primary')}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Collection
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {availableCollections
                        .filter(collection => {
                          const matchesSearch = collection.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                               collection.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                               collection.symbol?.toLowerCase().includes(searchTerm.toLowerCase())
                          const matchesFilter = filterBy === 'all' || collection.status === filterBy
                          return matchesSearch && matchesFilter
                        })
                        .sort((a, b) => {
                          switch (sortBy) {
                            case 'name':
                              return (a.name || '').localeCompare(b.name || '')
                            case 'status':
                              return (a.status || '').localeCompare(b.status || '')
                            case 'recent':
                            default:
                              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                          }
                        })
                        .map((collection, index) => (
                        <motion.div
                          key={collection.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <CardContent className="p-0">
                              {/* Collection Image */}
                              <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                                {collection.image ? (
                                  <Image
                                    src={collection.image}
                                    alt={collection.name || 'Collection'}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <Plus className="w-12 h-12 text-white opacity-80" />
                                  </div>
                                )}
                                <div className="absolute top-3 right-3">
                                  <Badge 
                                    className={`text-xs ${
                                      collection.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                      collection.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                      'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                    }`}
                                  >
                                    {collection.status || 'draft'}
                                  </Badge>
                                </div>
                              </div>

                              {/* Collection Info */}
                              <div className="p-6 space-y-4">
                                <div>
                                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-1">
                                    {collection.name || 'Untitled Collection'}
                                  </h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {collection.symbol && `(${collection.symbol})`}
                                  </p>
                                  {collection.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                      {collection.description}
                                    </p>
                                  )}
                                </div>

                                {/* Collection Stats */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-gray-500 dark:text-gray-400">Max Supply</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                      {collection.maxSupply || '∞'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 dark:text-gray-400">Mint Price</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                      {collection.mintPrice ? `${collection.mintPrice} ALGO` : 'Free'}
                                    </p>
                                  </div>
                                </div>

                                {/* Collection Metadata */}
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <span>Created {new Date(collection.createdAt).toLocaleDateString()}</span>
                                    <span>{collection.chain || 'Algorand'}</span>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex-1"
                                    onClick={() => {
                                      // Navigate to collection page
                                      router.push(`/marketplace/${params.merchantId}/${params.marketplaceId}/collection/${collection.id}`)
                                    }}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
                                  </Button>
                                  {/* <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="hover:from-blue-700 hover:to-purple-700 text-white"
                                    onClick={() => {
                                      // Navigate to create NFT in this collection
                                      router.push(`/marketplace/${params.merchantId}/${params.marketplaceId}/collection/${collection.id}/create-nft`)
                                    }}
                                    style={{ backgroundColor: marketplace.primaryColor }}
                                  >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add NFT
                                  </Button> */}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
                      Please connect your wallet using the button in the header to create new content
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">Create NFT Collection</CardTitle>
                    <CardDescription>
                      Launch your NFT collection on Algorand blockchain
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Chain Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="chain" className="text-sm font-medium">Algorand Chain</Label>
                      <Select defaultValue="algorand">
                        <SelectTrigger className="select-theme-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="algorand">Algorand Mainnet</SelectItem>
                          <SelectItem value="testnet">Algorand Testnet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Collection Name */}
                    <div className="space-y-2">
                      <Label htmlFor="collectionName" className="text-sm font-medium">Name *</Label>
                      <Input
                        id="collectionName"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter collection name"
                        className="w-full"
                        required
                      />
                    </div>

                    {/* Symbol */}
                    <div className="space-y-2">
                      <Label htmlFor="symbol" className="text-sm font-medium">Symbol *</Label>
                      <Input
                        id="symbol"
                        value={formData.symbol}
                        onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                        placeholder="e.g., MYNFT"
                        className="w-full"
                        required
                      />
                    </div>

                    {/* Collection Image Upload */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Collection Image *</Label>
                      <p className="text-xs text-gray-500">Image that will be shown as the main image for the collection. Recommended: 800×800px jpg</p>
                      {uploadedImage ? (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                          <Image
                            src={uploadedImage}
                            alt="Collection preview"
                            fill
                            className="object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setUploadedImage(null)
                              setFormData({ ...formData, image: "" })
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                          <div className="space-y-4">
                            {uploadingImages ? (
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
                                    Drop your artwork here to upload
                                  </p>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="image-upload"
                                  />
                                  <Button variant="outline" size="sm" asChild>
                                    <label htmlFor="image-upload" className="cursor-pointer">
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

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe your collection"
                        rows={4}
                        className="w-full"
                      />
                    </div>

                    {/* NFT Art Type */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">NFT Art Type</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card 
                          className={`cursor-pointer transition-colors ${
                            selectedArtType === "same" 
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                              : "hover:border-blue-500"
                          }`}
                          onClick={() => setSelectedArtType("same")}
                        >
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <h4 className="font-semibold">Same Artwork</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                An ASA collection where everyone mints the same artwork
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card 
                          className={`cursor-pointer transition-colors ${
                            selectedArtType === "unique" 
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                              : "hover:border-blue-500"
                          }`}
                          onClick={() => setSelectedArtType("unique")}
                        >
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <h4 className="font-semibold">Unique Artwork</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                An ASA collection where everyone mints a unique artwork
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Unique Artwork Upload */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Upload Artwork Files</Label>
                      <p className="text-xs text-gray-500">File types allowed: .jpg,.png. Max file size: 10MB</p>
                      
                      {/* Uploaded Images Grid */}
                      {uploadedNFTImages.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          {uploadedNFTImages.map((imageUrl, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                              <Image
                                src={imageUrl}
                                alt={`NFT ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 h-6 w-6 p-0"
                                onClick={() => {
                                  setUploadedNFTImages(prev => prev.filter((_, i) => i !== index))
                                }}
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                        <div className="space-y-4">
                          {uploadingImages ? (
                            <div className="space-y-2">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Uploading {uploadedNFTImages.length} images... {uploadProgress}%
                              </div>
                              <Progress value={uploadProgress} className="h-2" />
                            </div>
                          ) : (
                            <>
                              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  Drop your artwork here to upload
                                </p>
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={handleNFTImagesUpload}
                                  className="hidden"
                                  id="nft-images-upload"
                                />
                                <Button variant="outline" size="sm" asChild>
                                  <label htmlFor="nft-images-upload" className="cursor-pointer">
                                    Choose Files...
                                  </label>
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Metadata URL */}
                    <div className="space-y-2">
                      <Label htmlFor="metadataUrl" className="text-sm font-medium">Metadata URL</Label>
                      <Input
                        id="metadataUrl"
                        value={formData.metadataUrl}
                        onChange={(e) => setFormData({ ...formData, metadataUrl: e.target.value })}
                        placeholder="https://your-metadata-url.com"
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500">
                        Check our step-by-step guide on how to generate and upload your collection assets and metadata.
                      </p>
                    </div>

                    {/* Pricing and Supply */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="mintPrice" className="text-sm font-medium">Mint Price</Label>
                        <div className="flex">
                          <Input
                            id="mintPrice"
                            type="number"
                            value={formData.mintPrice}
                            onChange={(e) => setFormData({ ...formData, mintPrice: e.target.value })}
                            placeholder="0.1"
                            className="rounded-r-none"
                          />
                          <Select 
                            value={formData.currency} 
                            onValueChange={(value) => setFormData({ ...formData, currency: value })}
                          >
                            <SelectTrigger className="w-20 rounded-l-none border-l-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ALGO">ALGO</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="royaltyFee" className="text-sm font-medium">Royalty Fee</Label>
                        <div className="flex">
                          <Input
                            id="royaltyFee"
                            type="number"
                            value={formData.royaltyFee}
                            onChange={(e) => setFormData({ ...formData, royaltyFee: e.target.value })}
                            placeholder="5"
                            className="rounded-r-none"
                          />
                          <span className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md text-sm flex items-center">
                            %
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxSupply" className="text-sm font-medium">Max Supply</Label>
                        <Input
                          id="maxSupply"
                          type="number"
                          value={formData.maxSupply}
                          onChange={(e) => setFormData({ ...formData, maxSupply: e.target.value })}
                          placeholder="1000"
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Mint Limit */}
                    <div className="space-y-2">
                      <Label htmlFor="mintLimit" className="text-sm font-medium">Mint Limit per Wallet</Label>
                      <Input
                        id="mintLimit"
                        type="number"
                        value={formData.mintLimit}
                        onChange={(e) => setFormData({ ...formData, mintLimit: e.target.value })}
                        placeholder="1"
                        className="w-full"
                      />
                    </div>

                    {/* Mint Start Date */}
                    <div className="space-y-2">
                      <Label htmlFor="mintStart" className="text-sm font-medium">Mint Start Date & Time</Label>
                      <Input
                        id="mintStart"
                        type="datetime-local"
                        value={formData.mintStartDate}
                        onChange={(e) => setFormData({ ...formData, mintStartDate: e.target.value })}
                        className="w-full"
                      />
                    </div>

                    {/* Mint Stages */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Mint Stages</Label>
                        <Button variant="outline" size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Allowlist Stage
                        </Button>
                      </div>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">Public Mint</h4>
                              <Badge variant="secondary">FREE</Badge>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Oct 11 2025, 11:28 AM - Oct 12 2025, 11:28 AM
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 space-y-4">
                      <div className="flex gap-3">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setFormData({
                              name: "",
                              description: "",
                              category: "",
                              type: "nft",
                              image: "",
                              price: "",
                              currency: "ALGO",
                              symbol: "",
                              chain: "algorand",
                              artType: "unique",
                              metadataUrl: "",
                              mintPrice: "",
                              royaltyFee: "",
                              maxSupply: "",
                              mintLimit: "",
                              mintStartDate: "",
                              mintStages: [],
                              source: "public",
                              isEnabled: true
                            })
                            setSelectedArtType("unique")
                            setUploadedImage(null)
                            setUploadedNFTImages([])
                          }}
                          className="flex-1"
                        >
                          Clear Form
                        </Button>
                        <Button 
                          onClick={() => setShowCreateDialog(true)}
                            style={getButtonStyle('primary')}
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Publish on Algorand
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        By clicking "publish on algorand", you agree to the Marketplace Terms of Service.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="create-nft" className="space-y-6">
              {!isConnected ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Wallet className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Connect Your Wallet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                      Please connect your wallet using the button in the header to create NFTs
                    </p>
                    <WalletConnectButtonCompact />
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Collection Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold">Select Collection</CardTitle>
                      <CardDescription>
                        Choose a collection to add your NFT to. NFTs must belong to a collection.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a collection" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCollections.length > 0 ? (
                              availableCollections.map((collection) => (
                                <SelectItem key={collection.id} value={collection.id}>
                                  {collection.name} ({collection.symbol})
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-collections" disabled>
                                No collections available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {availableCollections.length === 0 && (
                          <Alert>
                            <AlertDescription>
                              No collections found. Please create a collection first using the "Create Collection" tab.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* NFT Creation Form */}
                  {selectedCollection && selectedCollection !== "no-collections" && (
                    <NFTCreationForm
                      newNFT={newNFT}
                      setNewNFT={setNewNFT}
                      nftTraits={nftTraits}
                      setNftTraits={setNftTraits}
                      onCancel={() => {
                        setNewNFT({
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
                        setNftTraits([])
                        setCreatedNFTId(null)
                      }}
                      onCreate={handleCreateNFT}
                      onMint={handleMintNFT}
                      isLoading={creating}
                      createdNFTId={createdNFTId}
                      showMintOption={enableOnChainMint}
                    />
                  )}

                  {/* On-Chain Minting Toggle */}
                  {selectedCollection && selectedCollection !== "no-collections" && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold">Minting Options</CardTitle>
                        <CardDescription>
                          Choose whether to mint your NFT on the blockchain immediately
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                              <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <p className="font-medium">On-Chain Minting</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {enableOnChainMint 
                                  ? 'NFT will be minted on Algorand blockchain immediately after creation'
                                  : 'NFT will be created off-chain only (can be minted later)'
                                }
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={enableOnChainMint}
                            onCheckedChange={setEnableOnChainMint}
                          />
                        </div>
                        {enableOnChainMint && (
                          <Alert className="mt-4">
                            <AlertDescription>
                              <strong>Note:</strong> On-chain minting requires wallet connection and will incur blockchain transaction fees. 
                              Your NFT will be permanently recorded on the Algorand blockchain.
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Item</DialogTitle>
              <DialogDescription>
                {selectedTemplate?.name || 'Custom Item'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedTemplate && (
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                    <Image
                      src={selectedTemplate.image}
                      alt={selectedTemplate.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">{selectedTemplate.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedTemplate.type} • {selectedTemplate.price} {selectedTemplate.currency}
                    </p>
                  </div>
                </div>
              )}
              
              {creating && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Creating Item</span>
                    <span>{createProgress}%</span>
                  </div>
                  <Progress value={createProgress} className="h-2" />
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateItem}
                  disabled={creating || !isConnected}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Item
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <MarketplaceFooter marketplace={marketplace} />
      </div>
    </PageTransition>
        )
      }}
    </TemplateLoader>
  )
}
