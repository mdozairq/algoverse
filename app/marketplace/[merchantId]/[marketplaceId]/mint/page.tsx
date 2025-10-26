"use client"

import { useState, useEffect } from "react"
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
import { 
  ArrowLeft, 
  Zap,
  Search,
  Filter,
  CheckCircle2,
  Wallet,
  Eye,
  } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { PageTransition, FadeIn, } from "@/components/animations/page-transition"
import MarketplaceHeader from "@/components/marketplace/marketplace-header"
import MarketplaceFooter from "@/components/marketplace/marketplace-footer"
import TemplateLoader from "@/components/marketplace/template-loader"
import { CreatePageLoadingTemplate, SimpleLoadingTemplate } from "@/components/ui/loading-templates"
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

interface MintableCollection {
  id: string
  name: string
  description: string
  image: string
  price: number
  currency: string
  totalSupply: number
  mintedCount: number
  availableSupply: number
  mintPrice: number
  mintingProgress: number
  draftNFTs: number
  isActive: boolean
  mintingConfig: {
    startDate: Date
    endDate: Date
    maxPerWallet: number
    whitelistRequired: boolean
  }
  allowMint: boolean
  createdAt: Date
}

interface MintSession {
  id: string
  marketplaceId: string
  collectionId: string
  userAddress: string
  nftIds: string[]
  quantity: number
  status: "pending" | "processing" | "completed" | "failed"
  transactionHash?: string
  totalCost: number
  currency: string
  createdAt: Date
  completedAt?: Date
}

interface DraftNFT {
  id: string
  collectionId: string
  name: string
  image: string
  mintPrice: number
  currency: string
  rarityScore: number
  traits: {
    trait_type: string
    value: string
    rarity: number
  }[]
  isMintable: boolean
  mintingStatus: "ready" | "minting" | "minted"
  status: "draft"
  createdAt: Date
}

export default function MintPage({ params }: { params: { merchantId: string; marketplaceId: string } }) {
  const [mintableCollections, setMintableCollections] = useState<MintableCollection[]>([])
  const [draftNFTs, setDraftNFTs] = useState<DraftNFT[]>([])
  const [userMintSessions, setUserMintSessions] = useState<MintSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCollection, setSelectedCollection] = useState<MintableCollection | null>(null)
  const [selectedNFTs, setSelectedNFTs] = useState<DraftNFT[]>([])
  const [mintQuantity, setMintQuantity] = useState(1)
  const [showMintDialog, setShowMintDialog] = useState(false)
  const [minting, setMinting] = useState(false)
  const [mintProgress, setMintProgress] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBy, setFilterBy] = useState("all")
  const [sortBy, setSortBy] = useState("price")
  const [activeTab, setActiveTab] = useState("collections")

  const { isConnected, account, connect, disconnect, sendTransaction } = useWallet()

  const fetchMintableCollections = async () => {
    try {
      const response = await fetch(`/api/marketplaces/${params.marketplaceId}/mint/collections`)
      const data = await response.json()
      
      if (response.ok) {
        setMintableCollections(data.collections || [])
      } else {
        console.error("Failed to fetch mintable collections:", data.error)
        setMintableCollections([])
      }
    } catch (error) {
      console.error("Error fetching mintable collections:", error)
      setMintableCollections([])
    }
  }

  const fetchDraftNFTs = async (collectionId?: string) => {
    try {
      const url = collectionId 
        ? `/api/marketplaces/${params.marketplaceId}/mint/nfts?collectionId=${collectionId}`
        : `/api/marketplaces/${params.marketplaceId}/mint/nfts`
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setDraftNFTs(data.nfts || [])
      } else {
        console.error("Failed to fetch draft NFTs")
        setDraftNFTs([])
      }
    } catch (error) {
      console.error("Error fetching draft NFTs:", error)
      setDraftNFTs([])
    }
  }

  const fetchUserMintSessions = async () => {
    if (!isConnected || !account) return
    
    try {
      const response = await fetch(`/api/marketplaces/${params.marketplaceId}/mint/sessions?userAddress=${account.address}`)
      const data = await response.json()
      
      if (response.ok) {
        setUserMintSessions(data.sessions || [])
      } else {
        console.error("Failed to fetch mint sessions:", data.error)
        setUserMintSessions([])
      }
    } catch (error) {
      console.error("Error fetching mint sessions:", error)
      setUserMintSessions([])
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        await Promise.all([
          fetchMintableCollections(),
          fetchDraftNFTs()
        ])
      } catch (error) {
        console.error("Error loading mint data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [params.marketplaceId])

  useEffect(() => {
    if (isConnected && account) {
      fetchUserMintSessions()
    }
  }, [isConnected, account])

  const handleCollectionSelect = (collection: MintableCollection) => {
    setSelectedCollection(collection)
    fetchDraftNFTs(collection.id)
    setActiveTab("nfts")
  }

  const handleNFTSelect = (nft: DraftNFT) => {
    setSelectedNFTs(prev => {
      const isSelected = prev.some(selected => selected.id === nft.id)
      if (isSelected) {
        return prev.filter(selected => selected.id !== nft.id)
      } else {
        return [...prev, nft]
      }
    })
  }

  const handleMint = async () => {
    if (!selectedCollection || !selectedNFTs.length || !isConnected || !account) return

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

      const nftIds = selectedNFTs.map(nft => nft.id)
      const totalCost = selectedNFTs.reduce((sum, nft) => sum + nft.mintPrice, 0)

      const response = await fetch(`/api/marketplaces/${params.marketplaceId}/mint/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collectionId: selectedCollection.id,
          nftIds,
          userAddress: account.address,
          quantity: selectedNFTs.length,
          totalCost,
          currency: "ALGO"
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Simulate transaction
        if (sendTransaction) {
          await sendTransaction(
            "", // Wallet address will be handled by the template loader
            totalCost,
            `Mint ${selectedNFTs.length} NFT(s) from ${selectedCollection.name}`
          )
        }

        setMintProgress(100)
        setShowMintDialog(false)
        setSelectedCollection(null)
        setSelectedNFTs([])
        fetchUserMintSessions()
        fetchMintableCollections()
        fetchDraftNFTs()
      }
    } catch (error) {
      console.error("Failed to mint NFT:", error)
    } finally {
      setMinting(false)
      setMintProgress(0)
    }
  }

  const filteredCollections = mintableCollections.filter(collection => {
    const matchesSearch = collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collection.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const filteredNFTs = draftNFTs.filter(nft => {
    const matchesSearch = nft.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading mint marketplace...</p>
          </div>
        </div>
      </PageTransition>
    )
  }

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
                    NFT Minting Studio
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Create and mint unique NFTs in {marketplace?.businessName || 'this marketplace'}
                  </p>
                </div>
                {/* <div className="flex items-center gap-3">
                  <WalletConnectButton />
                </div> */}
              </div>
            </div>
          </FadeIn>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="collections">Mintable Collections</TabsTrigger>
              <TabsTrigger value="nfts">Draft NFTs</TabsTrigger>
              <TabsTrigger value="my-mints">My Mints</TabsTrigger>
            </TabsList>

            <TabsContent value="collections" className="space-y-6">
              {/* Search and Filters */}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search mintable collections..."
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
                        <SelectItem value="all">All Collections</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="sold-out">Sold Out</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="supply">Supply</SelectItem>
                        <SelectItem value="recent">Recent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Collections Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredCollections.map((collection, index) => (
                  <motion.div
                    key={collection.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer"
                          onClick={() => handleCollectionSelect(collection)}>
                      <div className="relative aspect-square overflow-hidden rounded-t-lg">
                        <Image
                          src={collection.image}
                          alt={collection.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            {collection.availableSupply}/{collection.totalSupply} available
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                              {collection.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {collection.description}
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Mint Price</span>
                              <span className="font-semibold">{collection.mintPrice} {collection.currency}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Draft NFTs</span>
                              <span className="font-semibold">{collection.draftNFTs}</span>
                            </div>
                            <Progress 
                              value={collection.mintingProgress} 
                              className="h-2"
                            />
                          </div>
                          
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCollectionSelect(collection)
                            }}
                            disabled={!isConnected || collection.availableSupply === 0}
                            className="w-full hover:from-blue-700 hover:to-purple-700"
                            style={getButtonStyle('primary')}
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            {collection.availableSupply === 0 ? 'Sold Out' : 'Browse NFTs'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="nfts" className="space-y-6">
              {/* Search and Filters */}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search draft NFTs..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedNFTs.length} selected
                      </span>
                      {selectedNFTs.length > 0 && (
                        <Button
                          onClick={() => {
                            setSelectedCollection(null)
                            setShowMintDialog(true)
                          }}
                          disabled={!isConnected}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Mint Selected
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* NFTs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredNFTs.map((nft, index) => (
                  <motion.div
                    key={nft.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className={`group hover:shadow-lg transition-all duration-200 cursor-pointer ${
                      selectedNFTs.some(selected => selected.id === nft.id) 
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : ''
                    }`}
                          onClick={() => handleNFTSelect(nft)}>
                      <div className="relative aspect-square overflow-hidden rounded-t-lg">
                        <Image
                          src={nft.image}
                          alt={nft.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        {nft.rarityScore && (
                          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            #{nft.rarityScore}
                          </div>
                        )}
                        {selectedNFTs.some(selected => selected.id === nft.id) && (
                          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                            {nft.name}
                          </h3>
                          <div className="flex items-center justify-between">
                            <span className="text-blue-500 font-semibold text-sm">
                              {nft.mintPrice} {nft.currency}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              Draft
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="my-mints" className="space-y-6">
              {!isConnected ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Wallet className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Connect Your Wallet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                      Connect your wallet to view your minted NFTs
                    </p>
                    <WalletConnectButton />
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {userMintSessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                <Zap className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  Mint Session #{session.id.slice(0, 8)}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {session.quantity} NFT(s) • {new Date(session.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge 
                                className={`text-xs ${
                                  session.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  session.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                  session.status === 'failed' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {session.status}
                              </Badge>
                              {session.transactionHash && (
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-1" />
                                  View TX
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="create" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create Mint Template</CardTitle>
                  <CardDescription>
                    Create a new mint template for your NFT collection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="templateName">Template Name</Label>
                      <Input
                        id="templateName"
                        placeholder="Enter template name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="templatePrice">Price</Label>
                      <Input
                        id="templatePrice"
                        type="number"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="templateDescription">Description</Label>
                    <Textarea
                      id="templateDescription"
                      placeholder="Describe your NFT collection"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="totalSupply">Total Supply</Label>
                      <Input
                        id="totalSupply"
                        type="number"
                        placeholder="1000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxPerWallet">Max Per Wallet</Label>
                      <Input
                        id="maxPerWallet"
                        type="number"
                        placeholder="5"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="templateImage">Template Image</Label>
                    <Input
                      id="templateImage"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <Button className="w-full">
                    <Zap className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Mint Dialog */}
        <Dialog open={showMintDialog} onOpenChange={setShowMintDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Mint Selected NFTs</DialogTitle>
              <DialogDescription>
                {selectedCollection ? `Minting from ${selectedCollection.name}` : 'Minting selected NFTs'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedNFTs.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                    {selectedNFTs.map((nft) => (
                      <div key={nft.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                          <Image
                            src={nft.image}
                            alt={nft.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{nft.name}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {nft.mintPrice} {nft.currency}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Selected NFTs:</span>
                      <span className="font-semibold">{selectedNFTs.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Cost:</span>
                      <span className="font-semibold">
                        {selectedNFTs.reduce((sum, nft) => sum + nft.mintPrice, 0).toFixed(2)} ALGO
                      </span>
                    </div>
                  </div>
                  
                  {minting && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Minting Progress</span>
                        <span>{mintProgress}%</span>
                      </div>
                      <Progress value={mintProgress} className="h-2" />
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowMintDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleMint}
                      disabled={minting || !isConnected}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {minting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Minting...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Mint {selectedNFTs.length} NFT{selectedNFTs.length > 1 ? 's' : ''}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
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
