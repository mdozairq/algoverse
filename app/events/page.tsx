"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Clock, Users, Search, Star, Heart } from "lucide-react"
import Link from "next/link"
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/page-transition"
import { FloatingCard } from "@/components/animations/card-hover"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")

  const featuredEvents = [
    {
      id: 1,
      title: "Summer Music Festival 2024",
      description: "The biggest music festival of the year featuring top artists from around the world",
      image: "/placeholder.svg?height=400&width=600&text=Music Festival",
      date: "July 15-17, 2024",
      time: "6:00 PM - 2:00 AM",
      location: "Central Park, NYC",
      venue: "Great Lawn Stage",
      category: "Music",
      price: "From 0.5 ALGO",
      attendees: "50K+",
      rating: 4.9,
      isFeatured: true,
      isLiked: false,
    },
    {
      id: 2,
      title: "Tech Innovation Conference",
      description: "Leading technology conference bringing together innovators and industry leaders",
      image: "/placeholder.svg?height=400&width=600&text=Tech Conference",
      date: "August 20-22, 2024",
      time: "9:00 AM - 6:00 PM",
      location: "San Francisco, CA",
      venue: "Moscone Center",
      category: "Conference",
      price: "From 1.2 ALGO",
      attendees: "10K+",
      rating: 4.8,
      isFeatured: true,
      isLiked: false,
    },
  ]

  const upcomingEvents = [
    {
      id: 3,
      title: "Broadway Show: Hamilton",
      description: "The award-winning musical that tells the story of Alexander Hamilton",
      image: "/placeholder.svg?height=300&width=400&text=Hamilton Show",
      date: "September 5, 2024",
      time: "8:00 PM",
      location: "New York, NY",
      venue: "Richard Rodgers Theatre",
      category: "Theater",
      price: "From 2.8 ALGO",
      attendees: "1.4K",
      rating: 4.9,
      isLiked: false,
    },
    {
      id: 4,
      title: "Art Gallery Opening",
      description: "Contemporary art exhibition featuring emerging artists",
      image: "/placeholder.svg?height=300&width=400&text=Art Gallery",
      date: "September 12, 2024",
      time: "7:00 PM",
      location: "Los Angeles, CA",
      venue: "LACMA",
      category: "Art",
      price: "From 0.3 ALGO",
      attendees: "500",
      rating: 4.6,
      isLiked: false,
    },
    {
      id: 5,
      title: "Food & Wine Festival",
      description: "Culinary experience with world-renowned chefs and wine tastings",
      image: "/placeholder.svg?height=300&width=400&text=Food Festival",
      date: "September 18-19, 2024",
      time: "12:00 PM - 10:00 PM",
      location: "Napa Valley, CA",
      venue: "Various Venues",
      category: "Food",
      price: "From 1.5 ALGO",
      attendees: "5K+",
      rating: 4.7,
      isLiked: false,
    },
    {
      id: 6,
      title: "Sports Championship Finals",
      description: "The ultimate showdown between the top teams of the season",
      image: "/placeholder.svg?height=300&width=400&text=Sports Event",
      date: "October 1, 2024",
      time: "3:00 PM",
      location: "Chicago, IL",
      venue: "United Center",
      category: "Sports",
      price: "From 3.2 ALGO",
      attendees: "20K+",
      rating: 4.8,
      isLiked: false,
    },
  ]

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
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === "all" || event.category.toLowerCase() === selectedCategory.toLowerCase()
    const matchesLocation =
      selectedLocation === "all" || event.location.toLowerCase().includes(selectedLocation.toLowerCase())

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

            {filteredEvents.length === 0 && (
              <FadeIn>
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-center py-12">
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                      No events found matching your criteria
                    </p>
                    <Button
                      onClick={() => {
                        setSearchQuery("")
                        setSelectedCategory("all")
                        setSelectedLocation("all")
                      }}
                      variant="outline"
                      className="border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full bg-white dark:bg-gray-800"
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              </FadeIn>
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
