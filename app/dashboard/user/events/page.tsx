"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock, QrCode, ExternalLink, Users, Star } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import AuthGuard from "@/components/auth-guard"
import Link from "next/link"

export default function UserEventsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || authLoading) {
      setLoading(false)
      return
    }

    const loadEvents = async () => {
      try {
        const response = await fetch('/api/user/events')
        if (response.ok) {
          const data = await response.json()
          setEvents(data.events || [])
        }
      } catch (error) {
        console.error('Error loading events:', error)
      } finally {
        setLoading(false)
      }
    }
    loadEvents()
  }, [isAuthenticated, authLoading])

  const getEventStatus = (eventDate: string) => {
    const now = new Date()
    const event = new Date(eventDate)
    const diffTime = event.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { status: "past", label: "Past Event", color: "bg-gray-500/10 text-gray-400 border-gray-500/20" }
    if (diffDays === 0) return { status: "today", label: "Today", color: "bg-green-500/10 text-green-400 border-green-500/20" }
    if (diffDays <= 7) return { status: "upcoming", label: "This Week", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" }
    return { status: "future", label: "Upcoming", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" }
  }

  return (
    <AuthGuard requiredRole="user">
      <DashboardLayout role="user">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">My Events</h1>
              <p className="text-gray-600 dark:text-gray-400">Events you have tickets for</p>
            </div>
            <Link href="/events">
              <Button className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                <Calendar className="w-4 h-4 mr-2" />
                Browse All Events
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Events</CardTitle>
                <Calendar className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{events.length}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Events with tickets</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming</CardTitle>
                <Clock className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {events.filter(event => {
                    const eventDate = new Date(event.date)
                    return eventDate > new Date()
                  }).length}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Future events</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</CardTitle>
                <Star className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {events.filter(event => {
                    const eventDate = new Date(event.date)
                    const now = new Date()
                    const diffTime = eventDate.getTime() - now.getTime()
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                    return diffDays > 0 && diffDays <= 7
                  }).length}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">This week</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Attended</CardTitle>
                <Users className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {events.filter(event => {
                    const eventDate = new Date(event.date)
                    return eventDate < new Date()
                  }).length}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Past events</p>
              </CardContent>
            </Card>
          </div>

          {/* Events List */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Event Tickets</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Manage your event tickets and check-in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading events...</div>
                ) : events.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No events found</p>
                    <p className="text-sm text-gray-400 mt-2">Purchase tickets to see your events here</p>
                  </div>
                ) : (
                  events.map((event) => {
                    const eventStatus = getEventStatus(event.date)
                    return (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-6 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{event.title}</h3>
                              <Badge className={eventStatus.color}>
                                {eventStatus.label}
                              </Badge>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-2">{event.description}</p>
                            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {new Date(event.date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {event.location}
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                {event.totalSupply - event.availableSupply} / {event.totalSupply} sold
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {eventStatus.status !== "past" && (
                            <Link href={`/dashboard/user/event-checkin/${event.id}`}>
                              <Button className="bg-green-600 hover:bg-green-700 text-white">
                                <QrCode className="w-4 h-4 mr-2" />
                                Check In
                              </Button>
                            </Link>
                          )}
                          <Link href={`/events/${event.id}`}>
                            <Button
                              variant="outline"
                              className="border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 bg-transparent"
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
