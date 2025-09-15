"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Clock, Users, Search, Star, Heart, Loader2, RefreshCw } from "lucide-react"
import Link from "next/link"
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/page-transition"
import { FloatingCard } from "@/components/animations/card-hover"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useToast } from "@/hooks/use-toast"

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const { toast } = useToast()

  const fetchEvents = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const [featuredRes, upcomingRes] = await Promise.all([
        fetch("/api/events?featured=true"),
        fetch("/api/events?upcoming=true")
      ])

      const [featuredData, upcomingData] = await Promise.all([
        featuredRes.json(),
        upcomingRes.json()
      ])

      if (featuredRes.ok) {
        setFeaturedEvents(featuredData.events || [])
      }

      if (upcomingRes.ok) {
        setUpcomingEvents(upcomingData.events || [])
      }
    } catch (error: any) {
      console.error("Error fetching events:", error)
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "music", label: "Music" },
    { value: "conference", label: "Conference" },
    { value: "theater", label: "Theater" },
    { value: "art", label: "Art" },
    { value: "food", label: "Food & Drink" },
    { value: "sports", label: "Sports" },
  ]

  const locations = [
    { value: "all", label: "All Locations" },
    { value: "nyc", label: "New York City" },
    { value: "sf", label: "San Francisco" },
    { value: "la", label: "Los Angeles" },
    { value: "chicago", label: "Chicago" },
    { value: "miami", label: "Miami" },
  ]

  const filteredEvents = upcomingEvents.filter((event) => {
    const matchesSearch =
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === "all" || event.category?.toLowerCase() === selectedCategory.toLowerCase()
    const matchesLocation =
      selectedLocation === "all" || event.location?.toLowerCase().includes(selectedLocation.toLowerCase())

    return matchesSearch && matchesCategory && matchesLocation
  })

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />

        <div className="container mx-auto px-6 py-8">
          {/* Hero Section */}
          <FadeIn>
            <div className="text-center mb-12">
              <h1 className="text-6xl font-black tracking-tight mb-4 text-gray-900 dark:text-white">DISCOVER EVENTS</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Find and collect NFTs for the most exclusive events around the world
              </p>
            </div>
          </FadeIn>

          {/* Search and Filters */}
          <FadeIn delay={0.1}>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-12">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                      <Input
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-gray-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-[180px] bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        {categories.map((category) => (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                            className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger className="w-[180px] bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        {locations.map((location) => (
                          <SelectItem
                            key={location.value}
                            value={location.value}
                            className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {location.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchEvents(true)}
                      disabled={refreshing}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Featured Events */}
          <section className="mb-16">
            <FadeIn>
              <h2 className="text-3xl font-black tracking-tight mb-8 text-gray-900 dark:text-white">Featured Events</h2>
            </FadeIn>
            {loading ? (
              <div className="grid lg:grid-cols-2 gap-8">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="aspect-[3/2] bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                    <CardContent className="p-6">
                      <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
                      <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : featuredEvents.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400 mb-4">No featured events available</div>
                <Button onClick={() => fetchEvents(true)} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            ) : (
              <StaggerContainer className="grid lg:grid-cols-2 gap-8">
                {featuredEvents.map((event, index) => (
                <StaggerItem key={event.id}>
                  <FloatingCard>
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden group">
                      <div className="aspect-[3/2] bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                        <img
                          src={event.image || "/placeholder.svg"}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-blue-600 text-white border-0 font-medium">Featured</Badge>
                        </div>
                        <div className="absolute top-4 right-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3">
                            <div className="flex items-center justify-between text-white">
                              <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{event.rating}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span className="text-sm">{event.attendees}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-0 font-medium">
                            {event.category}
                          </Badge>
                          <span className="text-lg font-black text-gray-900 dark:text-white">{event.price}</span>
                        </div>
                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">{event.title}</CardTitle>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{event.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">{event.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">{event.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{event.location}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/events/${event.id}`} className="flex-1">
                            <Button className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-full">
                              View Event
                            </Button>
                          </Link>
                          <Link href="/marketplace">
                            <Button
                              variant="outline"
                              className="border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full bg-white dark:bg-gray-800"
                            >
                              Browse NFTs
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </FloatingCard>
                </StaggerItem>
              ))}
              </StaggerContainer>
            )}
          </section>

          {/* Upcoming Events */}
          <section>
            <FadeIn>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Upcoming Events</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Showing {filteredEvents.length} of {upcomingEvents.length} events
                </p>
              </div>
            </FadeIn>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                    <CardHeader className="p-4">
                      <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                      <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400 mb-4">
                  {upcomingEvents.length === 0 
                    ? "No events available" 
                    : "No events match your filters"
                  }
                </div>
                <Button onClick={() => fetchEvents(true)} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            ) : (
              <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event, index) => (
                <StaggerItem key={event.id}>
                  <FloatingCard>
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden group h-full">
                      <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                        <img
                          src={event.image || "/placeholder.svg"}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-0 font-medium">
                            {event.category}
                          </Badge>
                        </div>
                        <div className="absolute top-4 right-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <CardHeader className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">{event.rating}</span>
                          </div>
                          <span className="text-lg font-black text-gray-900 dark:text-white">{event.price}</span>
                        </div>
                        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">{event.title}</CardTitle>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{event.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">{event.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <Users className="w-4 h-4" />
                            <span className="text-sm">{event.attendees} attending</span>
                          </div>
                        </div>
                        <Link href={`/events/${event.id}`}>
                          <Button className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-full">
                            View Details
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </FloatingCard>
                </StaggerItem>
              ))}
              </StaggerContainer>
            )}
          </section>

          {/* Load More */}
          {filteredEvents.length > 0 && (
            <FadeIn>
              <div className="text-center mt-12">
                <Button
                  variant="outline"
                  className="border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full px-8 bg-white dark:bg-gray-800"
                >
                  Load More Events
                </Button>
              </div>
            </FadeIn>
          )}
        </div>
      </div>
      <Footer />
    </PageTransition>
  )
}
