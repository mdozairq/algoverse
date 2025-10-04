"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ExternalLink, Store, Calendar, MapPin, Globe, Wallet } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { PageTransition, FadeIn } from "@/components/animations/page-transition"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function MarketplaceDetailPage({ params }: { params: { id: string } }) {
  const [marketplace, setMarketplace] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<any[]>([])

  const fetchMarketplace = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/marketplaces/${params.id}`)
      const data = await res.json()
      if (res.ok) {
        setMarketplace(data.marketplace)
        // Fetch events for this marketplace
        const eventsRes = await fetch(`/api/events?merchantId=${data.marketplace.merchantId}`)
        const eventsData = await eventsRes.json()
        if (eventsRes.ok) {
          setEvents(eventsData.events || [])
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMarketplace()
  }, [params.id])

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <Header showSearch={false} />
          <div className="container mx-auto px-6 py-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading marketplace...</p>
            </div>
          </div>
          <Footer />
        </div>
      </PageTransition>
    )
  }

  if (!marketplace) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <Header showSearch={false} />
          <div className="container mx-auto px-6 py-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Marketplace Not Found</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">The marketplace you're looking for doesn't exist or has been removed.</p>
              <Link href="/marketplace">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Marketplaces
                </Button>
              </Link>
            </div>
          </div>
          <Footer />
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Header showSearch={false} />

        <div className="container mx-auto px-6 py-8">
          {/* Back Button */}
          <FadeIn>
            <div className="mb-6">
              <Link href="/marketplace">
                <Button variant="outline" className="rounded-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Marketplaces
                </Button>
              </Link>
            </div>
          </FadeIn>

          {/* Marketplace Header */}
          <FadeIn>
            <div className="mb-8">
              <div 
                className="relative rounded-lg overflow-hidden mb-6"
                style={{ 
                  background: `linear-gradient(135deg, ${marketplace.primaryColor}20, ${marketplace.secondaryColor}20)` 
                }}
              >
                {marketplace.banner ? (
                  <img
                    src={marketplace.banner}
                    alt={marketplace.businessName}
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <div className="w-full h-64 flex items-center justify-center">
                    <Store className="w-24 h-24 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h1 className="text-4xl font-black mb-2">{marketplace.businessName}</h1>
                  <p className="text-lg opacity-90">{marketplace.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                <Badge 
                  className="text-sm px-3 py-1"
                  style={{ 
                    backgroundColor: `${marketplace.primaryColor}20`,
                    color: marketplace.primaryColor,
                    borderColor: `${marketplace.primaryColor}40`
                  }}
                >
                  {marketplace.category}
                </Badge>
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {marketplace.template} Template
                </Badge>
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {marketplace.paymentMethod} Payments
                </Badge>
              </div>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Section */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">About This Marketplace</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {marketplace.description}
                  </p>
                </CardContent>
              </Card>

              {/* Events Section */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Available Events</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Events hosted by this marketplace
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {events.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No events available yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {events.map((event) => (
                        <div key={event.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{event.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-3">{event.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(event.date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {event.location}
                              </span>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {event.price} ALGO
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {marketplace.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <Link 
                        href={marketplace.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2"
                      >
                        Visit Website
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {marketplace.paymentMethod} Payments
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Template Preview */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Template Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="rounded-lg p-4 border-2 border-dashed border-gray-300 dark:border-gray-600"
                    style={{ 
                      background: `linear-gradient(135deg, ${marketplace.primaryColor}10, ${marketplace.secondaryColor}10)` 
                    }}
                  >
                    <div className="text-center">
                      <div 
                        className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl"
                        style={{ backgroundColor: marketplace.primaryColor }}
                      >
                        {marketplace.businessName.charAt(0)}
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1">{marketplace.businessName}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{marketplace.template} Template</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </PageTransition>
  )
}
