"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { 
  Plus, 
  QrCode, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Copy,
  Settings
} from "lucide-react"
import { QRVerification } from "@/components/nft/qr-verification"

interface Event {
  id: string
  title: string
  description: string
  price: string
  category: string
  date: string
  location: string
  totalSupply: number
  availableSupply: number
  nftAssetId?: number
  nftCreated?: boolean
  nftCreatedAt?: Date
  nftUnitName?: string
  nftAssetName?: string
  nftUrl?: string
  royaltyPercentage?: number
}

export default function NFTManagementPage() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [creatingNFT, setCreatingNFT] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showVerification, setShowVerification] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchEvents()
    }
  }, [isAuthenticated, user])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/events', {
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }
      
      const data = await response.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error('Error fetching events:', error)
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createNFT = async (event: Event) => {
    try {
      setCreatingNFT(event.id)
      
      const metadata = {
        name: `${event.title} Ticket`,
        description: `NFT ticket for ${event.title} at ${event.location}`,
        image: event.imageUrl || '/placeholder-ticket.jpg',
        attributes: [
          { trait_type: "Event", value: event.title },
          { trait_type: "Date", value: event.date },
          { trait_type: "Location", value: event.location },
          { trait_type: "Category", value: event.category },
          { trait_type: "Price", value: event.price },
          { trait_type: "Type", value: "Event Ticket" }
        ]
      }

      const response = await fetch('/api/nft/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          eventId: event.id,
          metadata,
          totalSupply: event.totalSupply,
          unitName: event.title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase(),
          assetName: `${event.title} Ticket`,
          url: `${window.location.origin}/events/${event.id}`,
          royaltyPercentage: 2.5 // 2.5% royalty
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create NFT')
      }

      toast({
        title: "NFT Created",
        description: `NFT created successfully for ${event.title}`,
      })

      // Refresh events to show updated NFT status
      await fetchEvents()

    } catch (error: any) {
      console.error('Error creating NFT:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create NFT",
        variant: "destructive",
      })
    } finally {
      setCreatingNFT(null)
    }
  }

  const copyAssetId = (assetId: number) => {
    navigator.clipboard.writeText(assetId.toString())
    toast({
      title: "Copied",
      description: "Asset ID copied to clipboard",
    })
  }

  const getStatusBadge = (event: Event) => {
    if (event.nftCreated) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        NFT Created
      </Badge>
    } else {
      return <Badge variant="outline">
        <AlertCircle className="h-3 w-3 mr-1" />
        No NFT
      </Badge>
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="merchant">
        <div className="space-y-6">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="merchant">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">NFT Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create and manage NFT tickets for your events
            </p>
          </div>
          <Button onClick={fetchEvents} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Events List */}
        <div className="grid gap-6">
          {events.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create an event first to manage NFT tickets
                </p>
                <Button onClick={() => window.location.href = '/dashboard/merchant/create-event'}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription>
                        {event.category} • {new Date(event.date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    {getStatusBadge(event)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Location:</span>
                      <p className="text-gray-600 dark:text-gray-400">{event.location}</p>
                    </div>
                    <div>
                      <span className="font-medium">Price:</span>
                      <p className="text-gray-600 dark:text-gray-400">${event.price}</p>
                    </div>
                    <div>
                      <span className="font-medium">Supply:</span>
                      <p className="text-gray-600 dark:text-gray-400">
                        {event.totalSupply - event.availableSupply} / {event.totalSupply} sold
                      </p>
                    </div>
                  </div>

                  {event.nftCreated ? (
                    <div className="space-y-3">
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                          NFT Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span>Asset ID:</span>
                            <div className="flex items-center gap-2">
                              <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                {event.nftAssetId}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyAssetId(event.nftAssetId!)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Unit Name:</span>
                            <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {event.nftUnitName}
                            </code>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Created:</span>
                            <span>{event.nftCreatedAt ? new Date(event.nftCreatedAt).toLocaleDateString() : 'N/A'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Royalty:</span>
                            <span>{event.royaltyPercentage || 0}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedEvent(event)
                            setShowVerification(true)
                          }}
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          Verify Tickets
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => window.open(`https://testnet.algoexplorer.io/asset/${event.nftAssetId}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View on Explorer
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          This event doesn't have an NFT collection yet. Create one to enable NFT ticketing.
                        </AlertDescription>
                      </Alert>
                      
                      <Button
                        onClick={() => createNFT(event)}
                        disabled={creatingNFT === event.id}
                        className="w-full"
                      >
                        {creatingNFT === event.id ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Creating NFT...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Create NFT Collection
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* QR Verification Modal */}
        {showVerification && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Ticket Verification - {selectedEvent.title}</h2>
                  <Button
                    variant="ghost"
                    onClick={() => setShowVerification(false)}
                  >
                    ×
                  </Button>
                </div>
                <QRVerification 
                  eventId={selectedEvent.id}
                  onVerificationComplete={(result) => {
                    console.log('Verification result:', result)
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
