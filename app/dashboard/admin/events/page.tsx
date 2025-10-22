"use client"

import { useEffect, useState } from "react"
import AuthGuard from "@/components/auth-guard"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Eye, Loader2, Calendar, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-context"

interface Event {
  id: string
  title: string
  description: string
  location: string
  date: string
  price: number | string
  category: string
  status: "draft" | "pending" | "approved" | "rejected"
  merchantId: string
  merchantName?: string
  merchantEmail?: string
  createdAt: any
}

export default function AdminEventsPage() {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([])
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuth()

  const fetchEvents = async () => {
    // Don't fetch if user is not authenticated
    if (!isAuthenticated || !user) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/events${filter !== "all" ? `?status=${filter}` : ""}`)
      const data = await res.json()
      if (res.ok) {
        setEvents(data.events || [])
      } else {
        throw new Error(data.error || "Failed to fetch events")
      }
    } catch (e) {
      console.error(e)
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (eventId: string, status: "approved" | "rejected") => {
    // Don't update if user is not authenticated
    if (!isAuthenticated || !user) {
      return
    }

    setUpdatingId(eventId)
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify({ status }),
      })

      const data = await res.json()

      if (res.ok) {
        toast({
          title: "Status Updated",
          description: `Event ${status} successfully.`,
        })
        fetchEvents() // Refresh the list
      } else {
        throw new Error(data.error || "Failed to update status")
      }
    } catch (error: any) {
      console.error("Error updating event status:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update event status.",
        variant: "destructive",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchEvents()
    }
  }, [filter, isAuthenticated, user])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Approved</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Rejected</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Draft</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">{status}</Badge>
    }
  }

  return (
    <AuthGuard requiredRole="admin">
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Events</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage event applications and approvals</p>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {events.length} event{events.length !== 1 ? 's' : ''} found
                {filter !== "all" && ` (${filter})`}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchEvents}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              onClick={() => setFilter("pending")}
              size="sm"
            >
              Pending
            </Button>
            <Button
              variant={filter === "approved" ? "default" : "outline"}
              onClick={() => setFilter("approved")}
              size="sm"
            >
              Approved
            </Button>
            <Button
              variant={filter === "rejected" ? "default" : "outline"}
              onClick={() => setFilter("rejected")}
              size="sm"
            >
              Rejected
            </Button>
          </div>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Event Applications</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Review and manage event applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 dark:border-gray-700">
                    <TableHead className="text-gray-600 dark:text-gray-400">Event</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Merchant</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Category</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Date & Location</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Price</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow className="border-gray-200 dark:border-gray-700">
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-gray-500">Loading events...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : events.length === 0 ? (
                    <TableRow className="border-gray-200 dark:border-gray-700">
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <Calendar className="h-8 w-8 text-gray-400" />
                          <span>No events found</span>
                          {filter !== "all" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setFilter("all")}
                            >
                              View All
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    events.map((event) => (
                      <TableRow key={event.id} className="border-gray-200 dark:border-gray-700">
                        <TableCell className="text-gray-900 dark:text-white">
                          <div>
                            <div className="font-medium">{event.title}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {event.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-300">
                          <div>
                            <div className="font-medium text-sm">{event.merchantName || 'Unknown Merchant'}</div>
                            {event.merchantEmail && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {event.merchantEmail}
                              </div>
                            )}
                            {event.merchantId && (
                              <div className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                                ID: {event.merchantId.slice(0, 8)}...
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-300">
                          <Badge variant="outline" className="text-xs">
                            {event.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-300">
                          <div className="text-sm">
                            <div>{event.location}</div>
                            <div className="text-xs text-gray-500">
                              {event.date}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-300">
                          <div className="font-medium">
                            ${typeof event.price === 'number' ? event.price.toFixed(2) : (parseFloat(event.price) || 0).toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(event.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {event.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(event.id, "approved")}
                                  disabled={updatingId === event.id}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  title="Approve event"
                                >
                                  {updatingId === event.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Check className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(event.id, "rejected")}
                                  disabled={updatingId === event.id}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Reject event"
                                >
                                  {updatingId === event.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <X className="w-4 h-4" />
                                  )}
                                </Button>
                              </>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              asChild
                              title="View event details"
                            >
                              <Link href={`/events/${event.id}`}>
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
