"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Edit, 
  Trash2, 
  Eye, 
  Loader2,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react"
import Link from "next/link"

interface Event {
  id: string
  title: string
  description: string
  price: string
  merchantId: string
  category: string
  date: string
  location: string
  imageUrl?: string
  totalSupply: number
  availableSupply: number
  createdAt: string
  featured?: boolean
  trending?: boolean
}

export default function MerchantEventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const eventId = params.id as string

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchEvent()
    }
  }, [isAuthenticated, user, eventId])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/${eventId}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch event")
      }

      const data = await response.json()
      console.log('Event data received:', data.event)
      setEvent(data.event)
    } catch (error) {
      console.error("Error fetching event:", error)
      toast({
        title: "Error",
        description: "Failed to fetch event details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePublishEvent = async () => {
    if (!event) return

    try {
      setActionLoading("publish")
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status: "active",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to publish event")
      }

      toast({
        title: "Success",
        description: "Event published successfully",
      })

      // Refresh event data
      await fetchEvent()
    } catch (error) {
      console.error("Error publishing event:", error)
      toast({
        title: "Error",
        description: "Failed to publish event",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteEvent = async () => {
    if (!event) return

    try {
      setActionLoading("delete")
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to delete event")
      }

      toast({
        title: "Success",
        description: "Event deleted successfully",
      })

      // Redirect to merchant dashboard
      router.push("/dashboard/merchant")
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleViewAnalytics = () => {
    router.push(`/dashboard/merchant/analytics?event=${eventId}`)
  }

  if (loading) {
    return (
      <DashboardLayout role="merchant">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" disabled>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="grid gap-6">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="space-y-4">
              <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!event) {
    return (
      <DashboardLayout role="merchant">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Event Not Found</h1>
          </div>
          <Card>
            <CardContent className="p-6 text-center">
              <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Event Not Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The event you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button onClick={() => router.push("/dashboard/merchant")}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  // Safely handle potentially undefined values
  const totalSupply = Number(event.totalSupply) || 0
  const availableSupply = Number(event.availableSupply) || 0
  const price = parseFloat(event.price) || 0
  
  const soldCount = Math.max(0, totalSupply - availableSupply)
  const soldPercentage = totalSupply > 0 ? Math.max(0, Math.min(100, (soldCount / totalSupply) * 100)) : 0
  const revenue = soldCount * price
  // Use the event's status if it exists, otherwise calculate based on supply
  const status = (event as any).status || (availableSupply === 0 ? "completed" : availableSupply < totalSupply ? "active" : "draft")
  
  console.log('Calculated values:', { totalSupply, availableSupply, price, soldCount, soldPercentage, revenue, status })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case "active":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"><TrendingUp className="h-3 w-3 mr-1" />Active</Badge>
      case "minted":
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"><CheckCircle className="h-3 w-3 mr-1" />Minted</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"><Clock className="h-3 w-3 mr-1" />Draft</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <DashboardLayout role="merchant">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{event.title}</h1>
              <p className="text-gray-600 dark:text-gray-400">{event.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(status)}
          </div>
        </div>

        {/* Event Image */}
        {event.imageUrl && (
          <Card>
            <CardContent className="p-0">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <CardDescription>Information about your event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-gray-600 dark:text-gray-400">{event.description}</p>
                </div>
                
                <Separator />
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {event.date ? new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }) : 'Date not set'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{event.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Price</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">${price.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Capacity</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{totalSupply} tickets</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* NFT Information */}
            {(event as any).status === "minted" && ((event as any).assetId || (event as any).nftAssetId) && (
              <Card>
                <CardHeader>
                  <CardTitle>NFT Information</CardTitle>
                  <CardDescription>Blockchain details for your event NFTs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="font-medium">Asset ID</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {(event as any).assetId || (event as any).nftAssetId || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Transaction ID</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {(event as any).transactionId || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">NFT Created</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {(event as any).nftCreatedAt ? new Date((event as any).nftCreatedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Total Supply</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {totalSupply} NFTs
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sales Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Analytics</CardTitle>
                <CardDescription>Track your event performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{soldCount}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tickets Sold</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{availableSupply}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">${revenue.toFixed(2)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Sales Progress</span>
                    <span>{soldPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={soldPercentage} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/events/${event.id}`} className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    View Public Page
                  </Button>
                </Link>
                
                <Link href={`/dashboard/merchant/create-event?edit=${event.id}`} className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Event
                  </Button>
                </Link>
                
                {status === "draft" && (
                  <Button
                    onClick={handlePublishEvent}
                    disabled={actionLoading === "publish"}
                    className="w-full justify-start"
                  >
                    {actionLoading === "publish" ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <TrendingUp className="h-4 w-4 mr-2" />
                    )}
                    Publish Event
                  </Button>
                )}
                
                {status === "active" && (
                  <Button
                    onClick={handleViewAnalytics}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                )}
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full justify-start"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Event
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Event</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{event.title}"? This action cannot be undone and will remove all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteEvent}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={actionLoading === "delete"}
                      >
                        {actionLoading === "delete" ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Deleting...
                          </>
                        ) : (
                          "Delete Event"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            {/* Event Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Event Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Created</span>
                  <span className="text-sm font-medium">
                    {event.createdAt ? new Date(event.createdAt).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                  {getStatusBadge(status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</span>
                  <span className="text-sm font-medium">
                    {soldPercentage.toFixed(1)}%
                  </span>
                </div>
                {event.featured && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Featured</span>
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      Yes
                    </Badge>
                  </div>
                )}
                {event.trending && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Trending</span>
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                      Yes
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
