"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { 
  Wallet, 
  QrCode, 
  RefreshCw, 
  ExternalLink,
  Copy,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Search,
  Filter
} from "lucide-react"
import { NFTLifecycleTimeline } from "@/components/nft/nft-lifecycle-timeline"
import { AtomicSwapModal } from "@/components/nft/atomic-swap-modal"

interface UserNFT {
  assetId: number
  amount: number
  metadata?: {
    name: string
    description: string
    image: string
    event_title: string
    event_date: string
    event_location: string
    ticket_type: string
    price: number
    currency: string
    seat_number?: string
    section?: string
  }
  eventId?: string
}

export default function UserNFTsPage() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [nfts, setNfts] = useState<UserNFT[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedNFT, setSelectedNFT] = useState<UserNFT | null>(null)
  const [showLifecycle, setShowLifecycle] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserNFTs()
    }
  }, [isAuthenticated, user])

  const fetchUserNFTs = async () => {
    try {
      setLoading(true)
      
      // In a real implementation, you would fetch from the Algorand blockchain
      // For now, we'll simulate with some mock data
      const mockNFTs: UserNFT[] = [
        {
          assetId: 12345,
          amount: 1,
          metadata: {
            name: "Concert Ticket",
            description: "VIP ticket for the amazing concert",
            image: "/placeholder-ticket.jpg",
            event_title: "Summer Music Festival 2024",
            event_date: "2024-07-15T20:00:00Z",
            event_location: "Madison Square Garden, NYC",
            ticket_type: "VIP",
            price: 150,
            currency: "ALGO",
            seat_number: "A-12",
            section: "VIP"
          },
          eventId: "event-1"
        },
        {
          assetId: 12346,
          amount: 2,
          metadata: {
            name: "Movie Ticket",
            description: "Premium movie experience",
            image: "/placeholder-ticket.jpg",
            event_title: "Blockbuster Movie Premiere",
            event_date: "2024-08-20T19:30:00Z",
            event_location: "AMC Theater, LA",
            ticket_type: "Premium",
            price: 25,
            currency: "ALGO"
          },
          eventId: "event-2"
        }
      ]
      
      setNfts(mockNFTs)
    } catch (error) {
      console.error('Error fetching NFTs:', error)
      toast({
        title: "Error",
        description: "Failed to fetch your NFTs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredNFTs = nfts.filter(nft => 
    nft.metadata?.event_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nft.metadata?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const copyAssetId = (assetId: number) => {
    navigator.clipboard.writeText(assetId.toString())
    toast({
      title: "Copied",
      description: "Asset ID copied to clipboard",
    })
  }

  const getTicketTypeBadge = (type: string) => {
    const colors = {
      'VIP': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Premium': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'General': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Backstage': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    }
    
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {type}
      </Badge>
    )
  }

  if (loading) {
    return (
      <DashboardLayout role="user">
        <div className="space-y-6">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="user">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My NFTs</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your NFT tickets and passes
            </p>
          </div>
          <Button onClick={fetchUserNFTs} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search NFTs by event name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* NFTs Grid */}
        {filteredNFTs.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? "No NFTs Found" : "No NFTs Yet"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? "Try adjusting your search terms"
                  : "Purchase tickets to events to receive NFT tickets in your wallet"
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => window.location.href = '/events'}>
                  Browse Events
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredNFTs.map((nft) => (
              <Card key={nft.assetId} className="overflow-hidden">
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative">
                  {nft.metadata?.image ? (
                    <img
                      src={nft.metadata.image}
                      alt={nft.metadata.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <QrCode className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {getTicketTypeBadge(nft.metadata?.ticket_type || 'General')}
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary">
                      {nft.amount}x
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-1">
                    {nft.metadata?.name || `NFT #${nft.assetId}`}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {nft.metadata?.description || 'NFT ticket'}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {nft.metadata && (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{new Date(nft.metadata.event_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="truncate">{nft.metadata.event_location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span>{nft.metadata.price} {nft.metadata.currency}</span>
                      </div>
                      {nft.metadata.seat_number && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>Seat {nft.metadata.seat_number}</span>
                          {nft.metadata.section && <span>• {nft.metadata.section}</span>}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Asset ID:</span>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                          {nft.assetId}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyAssetId(nft.assetId)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedNFT(nft)
                        setShowLifecycle(true)
                      }}
                      className="flex-1"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://testnet.algoexplorer.io/asset/${nft.assetId}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <AtomicSwapModal
                    userAssetId={nft.assetId}
                    userAddress={user?.walletAddress || ""}
                    onSwapCreated={(swapId) => {
                      toast({
                        title: "Swap Created",
                        description: `Atomic swap created with ID: ${swapId}`,
                      })
                    }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* NFT Lifecycle Modal */}
        {showLifecycle && selectedNFT && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">NFT Details - {selectedNFT.metadata?.name}</h2>
                  <Button
                    variant="ghost"
                    onClick={() => setShowLifecycle(false)}
                  >
                    ×
                  </Button>
                </div>
                <NFTLifecycleTimeline
                  assetId={selectedNFT.assetId}
                  eventId={selectedNFT.eventId || ""}
                  userAddress={user?.walletAddress || ""}
                  metadata={selectedNFT.metadata}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}