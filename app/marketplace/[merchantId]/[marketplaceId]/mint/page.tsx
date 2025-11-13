"use client"

import { useState, useEffect, useRef } from "react"
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
  Music,
  Video,
  FileText,
  PlayCircle,
  PauseCircle,
  Download,
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
import { transactionSigner } from "@/lib/wallet/transaction-signer"
import { useToast } from "@/hooks/use-toast"

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
  metadata?: Record<string, any>
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
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map())
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())

  const { isConnected, account, connect, disconnect } = useWallet()
  const { toast } = useToast()

  // Helper function to get NFT category and media URL
  const getNFTMediaInfo = (nft: DraftNFT | UserNFT) => {
    const metadata = nft.metadata || {}
    const category = metadata?.properties?.category || 
                     metadata?.properties?.mediaCategory || 
                     (nft.image?.startsWith('data:image') ? 'image' : 
                      nft.image?.match(/\.(mp4|webm|ogg|mov)$/i) ? 'video' :
                      nft.image?.match(/\.(mp3|wav|ogg|m4a)$/i) ? 'audio' :
                      nft.image?.match(/\.(pdf|doc|docx|txt)$/i) ? 'file' : 'image')
    const mediaUrl = nft.image || ''
    const fileType = metadata?.properties?.fileType || ''
    return { category, mediaUrl, fileType, metadata }
  }

  // Component to render NFT media based on type
  const renderNFTMedia = (nft: DraftNFT | UserNFT, className: string = "w-full h-full object-cover") => {
    const { category, mediaUrl, fileType, metadata } = getNFTMediaInfo(nft)
    const nftId = nft.id

    switch (category) {
      case 'audio':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
            {metadata?.properties?.audioMetadata?.thumbnail ? (
              <Image
                src={metadata.properties.audioMetadata.thumbnail}
                alt={nft.name}
                fill
                className="object-cover opacity-50"
              />
            ) : (
              <Music className="w-16 h-16 text-white opacity-80" />
            )}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="bg-black/60 rounded-full p-3 backdrop-blur-sm">
                {playingAudio === nftId ? (
                  <PauseCircle 
                    className="w-12 h-12 text-white cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => {
                      const audio = audioRefs.current.get(nftId)
                      audio?.pause()
                      setPlayingAudio(null)
                    }}
                  />
                ) : (
                  <PlayCircle 
                    className="w-12 h-12 text-white cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => {
                      // Stop any currently playing audio
                      if (playingAudio) {
                        const currentAudio = audioRefs.current.get(playingAudio)
                        currentAudio?.pause()
                      }
                      // Play this audio
                      let audio = audioRefs.current.get(nftId)
                      if (!audio) {
                        audio = new Audio(mediaUrl)
                        audioRefs.current.set(nftId, audio)
                        audio.onended = () => setPlayingAudio(null)
                        audio.onerror = () => {
                          setPlayingAudio(null)
                          toast({
                            title: "Playback Error",
                            description: "Failed to play audio file",
                            variant: "destructive"
                          })
                        }
                      }
                      audio.src = mediaUrl
                      audio.play()
                      setPlayingAudio(nftId)
                    }}
                  />
                )}
              </div>
            </div>
            {metadata?.properties?.audioMetadata && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-2 text-xs">
                {metadata.properties.audioMetadata.composerName && (
                  <div>Composer: {metadata.properties.audioMetadata.composerName}</div>
                )}
                {metadata.properties.audioMetadata.singerName && (
                  <div>Singer: {metadata.properties.audioMetadata.singerName}</div>
                )}
              </div>
            )}
          </div>
        )

      case 'video':
        return (
          <div className="relative w-full h-full">
            {playingVideo === nftId ? (
              <video
                ref={(el) => {
                  if (el) {
                    videoRefs.current.set(nftId, el)
                    // Auto-play when video element is ready
                    el.play().catch((error) => {
                      console.error("Video play error:", error)
                      setPlayingVideo(null)
                      toast({
                        title: "Playback Error",
                        description: "Failed to play video file",
                        variant: "destructive"
                      })
                    })
                  }
                }}
                src={mediaUrl}
                controls
                className={className}
                onEnded={() => setPlayingVideo(null)}
                onError={() => {
                  setPlayingVideo(null)
                  toast({
                    title: "Playback Error",
                    description: "Failed to play video file",
                    variant: "destructive"
                  })
                }}
              />
            ) : (
              <>
                {metadata?.properties?.videoMetadata?.thumbnail ? (
                  <Image
                    src={metadata.properties.videoMetadata.thumbnail}
                    alt={nft.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Video className="w-16 h-16 text-white opacity-80" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <PlayCircle 
                    className="w-12 h-12 text-white cursor-pointer hover:scale-110 transition-transform drop-shadow-lg"
                    onClick={() => {
                      // Stop any currently playing video
                      if (playingVideo) {
                        const currentVideo = videoRefs.current.get(playingVideo)
                        currentVideo?.pause()
                      }
                      setPlayingVideo(nftId)
                    }}
                  />
                </div>
              </>
            )}
            {metadata?.properties?.videoMetadata && playingVideo !== nftId && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-2 text-xs">
                {metadata.properties.videoMetadata.director && (
                  <div>Director: {metadata.properties.videoMetadata.director}</div>
                )}
                {metadata.properties.videoMetadata.duration && (
                  <div>Duration: {metadata.properties.videoMetadata.duration}</div>
                )}
              </div>
            )}
          </div>
        )

      case 'file':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-400 to-gray-600">
            <FileText className="w-16 h-16 text-white opacity-80 mb-2" />
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-2 text-center">
              <p className="text-xs font-semibold mb-1 truncate px-1">{nft.name}</p>
              {metadata?.properties?.fileMetadata && (
                <div className="text-xs space-y-0.5">
                  {metadata.properties.fileMetadata.documentType && (
                    <div>Type: {metadata.properties.fileMetadata.documentType}</div>
                  )}
                  {metadata.properties.fileMetadata.pages && (
                    <div>Pages: {metadata.properties.fileMetadata.pages}</div>
                  )}
                </div>
              )}
              <Button
                size="sm"
                variant="outline"
                className="mt-2 bg-white text-gray-900 hover:bg-gray-100 text-xs h-6 px-2"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(mediaUrl, '_blank')
                }}
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        )

      case 'image':
      default:
        return (
          <Image
            src={mediaUrl || "/placeholder.jpg"}
            alt={nft.name || 'NFT'}
            fill
            className={className}
          />
        )
    }
  }

  // Initialize transaction signer with wallet hook
  useEffect(() => {
    transactionSigner.setUseWalletHook({ isConnected, account, connect, disconnect })
  }, [isConnected, account, connect, disconnect])

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

  // Cleanup: Stop playing media when unmounting
  useEffect(() => {
    return () => {
      // Stop all audio
      audioRefs.current.forEach((audio) => {
        audio.pause()
        audio.src = ''
      })
      // Stop all video
      videoRefs.current.forEach((video) => {
        video.pause()
        video.src = ''
      })
      setPlayingAudio(null)
      setPlayingVideo(null)
    }
  }, [])

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
    if (!selectedNFTs.length || !isConnected || !account) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to mint NFTs.",
        variant: "destructive"
      })
      return
    }

    setMinting(true)
    setMintProgress(0)

    try {
      // Mint each NFT sequentially
      const mintedNFTs: string[] = []
      const failedNFTs: string[] = []

      for (let i = 0; i < selectedNFTs.length; i++) {
        const nft = selectedNFTs[i]
        setMintProgress((i / selectedNFTs.length) * 80) // Progress up to 80% for minting

        try {
          toast({
            title: "Creating Mint Transaction",
            description: `Preparing to mint ${nft.name}...`,
          })

          // Step 1: Create mint transaction
          const mintResponse = await fetch('/api/nfts/mint-wallet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nftId: nft.id,
              userAddress: account.address
            }),
          })

          if (!mintResponse.ok) {
            const errorData = await mintResponse.json()
            throw new Error(errorData.error || 'Failed to create mint transaction')
          }

          const mintData = await mintResponse.json()

          // Step 2: Sign transaction
          toast({
            title: "Signing Transaction",
            description: `Please sign the transaction for ${nft.name} in your wallet.`,
          })

          const signedTransaction = await transactionSigner.signTransaction(
            mintData.transaction.txn,
            account.address
          )

          // Step 3: Submit signed transaction
          toast({
            title: "Submitting Transaction",
            description: `Submitting mint transaction for ${nft.name}...`,
          })

          const submitResponse = await fetch('/api/nfts/mint-wallet', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              signedTransaction,
              nftId: nft.id,
              userAddress: account.address,
              isMinted: false
            }),
          })

          if (!submitResponse.ok) {
            const errorData = await submitResponse.json()
            throw new Error(errorData.error || 'Failed to submit mint transaction')
          }

          const submitData = await submitResponse.json()
          mintedNFTs.push(nft.id)

          toast({
            title: "Mint Successful",
            description: `${nft.name} has been minted successfully!`,
          })
        } catch (error: any) {
          console.error(`Failed to mint NFT ${nft.name}:`, error)
          failedNFTs.push(nft.name)
          toast({
            title: "Mint Failed",
            description: `Failed to mint ${nft.name}: ${error.message}`,
            variant: "destructive"
          })
        }
      }

      setMintProgress(100)

      // Show final result
      if (mintedNFTs.length > 0) {
        toast({
          title: "Minting Complete",
          description: `Successfully minted ${mintedNFTs.length} out of ${selectedNFTs.length} NFT(s).`,
        })
      }

      if (failedNFTs.length > 0) {
        toast({
          title: "Some Mints Failed",
          description: `Failed to mint: ${failedNFTs.join(', ')}`,
          variant: "destructive"
        })
      }

      // Refresh data
      setShowMintDialog(false)
      setSelectedNFTs([])
      await fetchDraftNFTs()
      await fetchUserNFTs()
    } catch (error: any) {
      console.error("Failed to mint NFTs:", error)
      toast({
        title: "Minting Error",
        description: error.message || "Failed to mint NFTs",
        variant: "destructive"
      })
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
                                {renderNFTMedia(nft, "object-cover group-hover:scale-105 transition-transform duration-200")}
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
                                    {renderNFTMedia(nft, "object-cover group-hover:scale-105 transition-transform duration-200")}
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
                                {(() => {
                                  const { category, mediaUrl, metadata } = getNFTMediaInfo(nft)
                                  if (category === 'audio' && metadata?.properties?.audioMetadata?.thumbnail) {
                                    return (
                                      <Image
                                        src={metadata.properties.audioMetadata.thumbnail}
                                        alt={nft.name}
                                        fill
                                        className="object-cover"
                                      />
                                    )
                                  } else if (category === 'video' && metadata?.properties?.videoMetadata?.thumbnail) {
                                    return (
                                      <Image
                                        src={metadata.properties.videoMetadata.thumbnail}
                                        alt={nft.name}
                                        fill
                                        className="object-cover"
                                      />
                                    )
                                  } else if (category === 'file') {
                                    return (
                                      <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-white" />
                                      </div>
                                    )
                                  } else {
                                    return (
                                      <Image
                                        src={mediaUrl || nft.image}
                                        alt={nft.name}
                                        fill
                                        className="object-cover"
                                      />
                                    )
                                  }
                                })()}
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
