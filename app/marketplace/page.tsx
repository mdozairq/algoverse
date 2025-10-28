"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Search, Filter, Calendar, Store, ArrowRight, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/page-transition"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [templateFilter, setTemplateFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [marketplaces, setMarketplaces] = useState<any[]>([])

  const fetchMarketplaces = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/marketplaces?status=approved")
      const data = await res.json()
      if (res.ok) setMarketplaces(data.marketplaces || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMarketplaces()
  }, [])

  const filteredMarketplaces = marketplaces.filter((marketplace) => {
    const matchesSearch = marketplace.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         marketplace.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || marketplace.category === categoryFilter
    const matchesTemplate = templateFilter === "all" || marketplace.template === templateFilter

    return matchesSearch && matchesCategory && matchesTemplate
  })

  const uniqueCategories = Array.from(new Set(marketplaces.map((m) => m.category)))
  const uniqueTemplates = Array.from(new Set(marketplaces.map((m) => m.template)))

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Header showSearch={false} />

        <div className="container mx-auto px-6 py-8">
          <FadeIn>
            <div className="mb-8">
              <h2 className="text-4xl font-black tracking-tight mb-2">Explore Marketplaces</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Discover unique marketplaces and their event offerings
              </p>
            </div>
          </FadeIn>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm dark:shadow-none dark:border dark:border-gray-700 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search marketplaces..."
                  className="pl-9 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="select-theme">
                  <Filter className="h-4 w-4 mr-2 text-gray-500" />
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={templateFilter} onValueChange={setTemplateFilter}>
                <SelectTrigger className="select-theme">
                  <Store className="h-4 w-4 mr-2 text-gray-500" />
                  <SelectValue placeholder="Filter by Template" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                  <SelectItem value="all">All Templates</SelectItem>
                  {uniqueTemplates.map((template) => (
                    <SelectItem key={template} value={template}>
                      {template}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Marketplace Grid */}
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12 text-gray-600 dark:text-gray-400">
                Loading marketplaces...
              </div>
            ) : filteredMarketplaces.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-600 dark:text-gray-400">
                No marketplaces found matching your criteria.
              </div>
            ) : (
              filteredMarketplaces.map((marketplace, index) => (
                <StaggerItem key={marketplace.id}>
                  <motion.div
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    }}
                    className="h-full"
                  >
                    <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-full flex flex-col">
                      <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700 relative">
                        {(() => {
                          const bannerUrl = Array.isArray(marketplace.banner) 
                            ? marketplace.banner[0] 
                            : marketplace.banner
                          return bannerUrl ? (
                            <Image
                              src={bannerUrl}
                              alt={marketplace.businessName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div 
                              className="w-full h-full flex items-center justify-center"
                              style={{ 
                                background: `linear-gradient(135deg, ${marketplace.primaryColor}20, ${marketplace.secondaryColor}20)` 
                              }}
                            >
                              <Store className="w-16 h-16 text-gray-400" />
                            </div>
                          )
                        })()}
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-white/90 text-gray-800 border-gray-200">
                            {marketplace.template}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4 flex-1 flex flex-col">
                        <h3 className="font-bold text-lg mb-1">{marketplace.businessName}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {marketplace.description}
                        </p>
                        <div className="flex justify-between items-center mb-3 mt-auto">
                          <Badge 
                            className="rounded-full"
                            style={{ 
                              backgroundColor: `${marketplace.primaryColor}20`,
                              color: marketplace.primaryColor,
                              borderColor: `${marketplace.primaryColor}40`
                            }}
                          >
                            {marketplace.category}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {marketplace.paymentMethod}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-full"
                            asChild
                          >
                            <Link href={`/marketplace/details/${marketplace.id}`}>
                              View Marketplace
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                          </Button>
                          {marketplace.website && (
                            <Button 
                              variant="outline" 
                              size="icon"
                              asChild
                            >
                              <Link href={marketplace.website} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </StaggerItem>
              ))
            )}
          </StaggerContainer>
        </div>
      </div>
      <Footer />
    </PageTransition>
  )
}
