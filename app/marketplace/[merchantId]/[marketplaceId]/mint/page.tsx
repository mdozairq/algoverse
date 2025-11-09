"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { 
  Zap,
  Search,
  CheckCircle2,
  Wallet,
  Edit2,
  Save,
  X,
  } from "lucide-react"
import { motion } from "framer-motion"
import { PageTransition, FadeIn } from "@/components/animations/page-transition"
import MarketplaceHeader from "@/components/marketplace/marketplace-header"
import MarketplaceFooter from "@/components/marketplace/marketplace-footer"
import TemplateLoader from "@/components/marketplace/template-loader"
import { CreatePageLoadingTemplate, SimpleLoadingTemplate } from "@/components/ui/loading-templates"
import Image from "next/image"
import { useWallet } from "@/hooks/use-wallet"
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button"

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
  createdAt: string
  price?: number
}

interface UserNFT {
  id: string
  name: string
  image: string
  price: number
  currency: string
  assetId?: number
  createdAt: string
  mintedAt?: string
  metadata?: Record<string, any>
}

export default function MintPage({ params }: { params: { merchantId: string; marketplaceId: string } }) {
  const [draftNFTs, setDraftNFTs] = useState<DraftNFT[]>([])
  const [userNFTs, setUserNFTs] = useState<UserNFT[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNFTs, setSelectedNFTs] = useState<DraftNFT[]>([])
  const [showMintDialog, setShowMintDialog] = useState(false)
  const [minting, setMinting] = useState(false)
  const [mintProgress, setMintProgress] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("drafts")
  const [editingPrice, setEditingPrice] = useState<string | null>(null)
  const [priceValue, setPriceValue] = useState("")
  const [updatingPrice, setUpdatingPrice] = useState(false)

  const { isConnected, account, sendTransaction } = useWallet()

  const fetchDraftNFTs = async () => {
    try {
      const response = await fetch(`/api/marketplaces/${params.marketplaceId}/mint/nfts`)
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

  const fetchUserNFTs = async () => {
    if (!isConnected || !account?.address) {
      setUserNFTs([])
      return
    }
    
    try {
      const response = await fetch(`/api/marketplaces/${params.marketplaceId}/mint/nfts?walletAddress=${account.address}`)
      if (response.ok) {
        const data = await response.json()
        setUserNFTs(data.nfts || [])
      } else {
        console.error("Failed to fetch user NFTs")
        setUserNFTs([])
      }
    } catch (error) {
      console.error("Error fetching user NFTs:", error)
      setUserNFTs([])
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        await fetchDraftNFTs()
        if (isConnected && account) {
          await fetchUserNFTs()
        }
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
      fetchUserNFTs()
    } else {
      setUserNFTs([])
    }
  }, [isConnected, account])

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

  const handleUpdatePrice = async (nftId: string, newPrice: number) => {
    if (newPrice < 0) {
      alert("Price must be non-negative")
      return
    }

    setUpdatingPrice(true)
    try {
      const response = await fetch(`/api/marketplaces/${params.marketplaceId}/mint/nfts`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nftId,
          price: newPrice
        }),
      })

      if (response.ok) {
        // Update local state
        setDraftNFTs(prev => prev.map(nft => 
          nft.id === nftId ? { ...nft, mintPrice: newPrice, price: newPrice } : nft
        ))
        setEditingPrice(null)
        setPriceValue("")
      } else {
        const data = await response.json()
        alert(data.error || "Failed to update price")
      }
    } catch (error) {
      console.error("Failed to update price:", error)
      alert("Failed to update price")
    } finally {
      setUpdatingPrice(false)
    }
  }

  const handleMint = async () => {
    if (!selectedNFTs.length || !isConnected || !account) return

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
          collectionId: selectedNFTs[0]?.collectionId || "",
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
            "",
            totalCost,
            `Mint ${selectedNFTs.length} NFT(s)`
          )
        }

        setMintProgress(100)
        setShowMintDialog(false)
        setSelectedNFTs([])
        fetchDraftNFTs()
        fetchUserNFTs()
      }
    } catch (error) {
      console.error("Failed to mint NFT:", error)
      alert("Failed to mint NFT")
    } finally {
      setMinting(false)
      setMintProgress(0)
    }
  }

  const filteredDraftNFTs = draftNFTs.filter(nft => {
    const matchesSearch = nft.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const filteredUserNFTs = userNFTs.filter(nft => {
    const matchesSearch = nft.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         nft.metadata?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
                    </div>
                  </div>
                </FadeIn>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="drafts">Draft NFTs</TabsTrigger>
                    <TabsTrigger value="my-nfts">My NFTs</TabsTrigger>
                  </TabsList>

                  <TabsContent value="drafts" className="space-y-6">
                    {/* Search and Actions */}
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
                                onClick={() => setShowMintDialog(true)}
                                disabled={!isConnected}
                                style={getButtonStyle('primary')}
                              >
                                <Zap className="w-4 h-4 mr-2" />
                                Mint Selected
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Draft NFTs Grid */}
                    {filteredDraftNFTs.length === 0 ? (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                          <p className="text-gray-600 dark:text-gray-400">No draft NFTs available</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {filteredDraftNFTs.map((nft, index) => (
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
                                    {editingPrice === nft.id ? (
                                      <div className="flex items-center gap-1 flex-1">
                                        <Input
                                          type="number"
                                          value={priceValue}
                                          onChange={(e) => setPriceValue(e.target.value)}
                                          className="h-7 text-xs"
                                          min="0"
                                          step="0.01"
                                          onClick={(e) => e.stopPropagation()}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              handleUpdatePrice(nft.id, parseFloat(priceValue))
                                            } else if (e.key === 'Escape') {
                                              setEditingPrice(null)
                                              setPriceValue("")
                                            }
                                          }}
                                        />
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 w-7 p-0"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleUpdatePrice(nft.id, parseFloat(priceValue))
                                          }}
                                          disabled={updatingPrice}
                                        >
                                          <Save className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 w-7 p-0"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setEditingPrice(null)
                                            setPriceValue("")
                                          }}
                                        >
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <>
                                        <span className="text-blue-500 font-semibold text-sm">
                                          {nft.mintPrice} {nft.currency}
                                        </span>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-6 w-6 p-0"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setEditingPrice(nft.id)
                                            setPriceValue(nft.mintPrice.toString())
                                          }}
                                        >
                                          <Edit2 className="w-3 h-3" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    Draft
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="my-nfts" className="space-y-6">
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
                      <>
                        {/* Search */}
                        <Card>
                          <CardContent className="p-4 sm:p-6">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                              <Input
                                placeholder="Search my NFTs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                              />
                            </div>
                          </CardContent>
                        </Card>

                        {/* User NFTs Grid */}
                        {filteredUserNFTs.length === 0 ? (
                          <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                              <p className="text-gray-600 dark:text-gray-400">No NFTs found in your wallet</p>
                            </CardContent>
                          </Card>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {filteredUserNFTs.map((nft, index) => (
                              <motion.div
                                key={nft.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                              >
                                <Card className="group hover:shadow-lg transition-all duration-200">
                                  <div className="relative aspect-square overflow-hidden rounded-t-lg">
                                    <Image
                                      src={nft.image || "/placeholder.jpg"}
                                      alt={nft.name || `NFT #${nft.assetId}`}
                                      fill
                                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                                    />
                                    {nft.assetId && (
                                      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                        #{nft.assetId}
                                      </div>
                                    )}
                                  </div>
                                  <CardContent className="p-3">
                                    <div className="space-y-2">
                                      <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                        {nft.name || nft.metadata?.name || `NFT #${nft.assetId}`}
                                      </h3>
                                      <div className="flex items-center justify-between">
                                        <span className="text-blue-500 font-semibold text-sm">
                                          {nft.price} {nft.currency || "ALGO"}
                                        </span>
                                        <Badge className="bg-green-100 text-green-800 text-xs">
                                          Minted
                                        </Badge>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              {/* Mint Dialog */}
              <Dialog open={showMintDialog} onOpenChange={setShowMintDialog}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Mint Selected NFTs</DialogTitle>
                    <DialogDescription>
                      Mint {selectedNFTs.length} selected NFT{selectedNFTs.length > 1 ? 's' : ''}
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
                            style={getButtonStyle('primary')}
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
