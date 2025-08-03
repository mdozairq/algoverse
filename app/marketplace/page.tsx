"use client"

import { Label } from "@/components/ui/label"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Search, Filter, Calendar, Store, ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/page-transition"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [eventType, setEventType] = useState("all")
  const [merchantFilter, setMerchantFilter] = useState("all")
  const [priceRange, setPriceRange] = useState([0, 10]) // Example: 0 to 10 ALGO
  const [dateFilter, setDateFilter] = useState("all")

  const nfts = [
    {
      id: 1,
      title: "Summer Concert VIP",
      description: "Exclusive access to the hottest music festival.",
      image: "/placeholder.svg?height=200&width=300&text=Concert NFT",
      price: "0.5 ALGO",
      merchant: "Festival Productions LLC",
      category: "Concert",
      date: "2024-07-15",
      status: "available",
    },
    {
      id: 2,
      title: "Jazz Night Premium",
      description: "Enjoy a sophisticated evening of jazz.",
      image: "/placeholder.svg?height=200&width=300&text=Jazz NFT",
      price: "0.3 ALGO",
      merchant: "Blue Note NYC",
      category: "Music",
      date: "2024-08-20",
      status: "available",
    },
    {
      id: 3,
      title: "Resort Weekend Pass",
      description: "A luxurious getaway pass for two.",
      image: "/placeholder.svg?height=200&width=300&text=Resort Pass",
      price: "2.0 ALGO",
      merchant: "Luxury Resorts Inc.",
      category: "Travel",
      date: "2024-09-01",
      status: "available",
    },
    {
      id: 4,
      title: "Art Exhibition Entry",
      description: "Access to the grand opening of a modern art exhibition.",
      image: "/placeholder.svg?height=200&width=300&text=Art NFT",
      price: "0.1 ALGO",
      merchant: "Modern Art Gallery",
      category: "Art",
      date: "2024-07-25",
      status: "available",
    },
    {
      id: 5,
      title: "Tech Conference VIP",
      description: "All-access pass to the leading tech conference.",
      image: "/placeholder.svg?height=200&width=300&text=Tech NFT",
      price: "1.2 ALGO",
      merchant: "Global Tech Events",
      category: "Conference",
      date: "2024-10-10",
      status: "available",
    },
    {
      id: 6,
      title: "Food Festival Pass",
      description: "Taste the world's cuisines at this annual food festival.",
      image: "/placeholder.svg?height=200&width=300&text=Food NFT",
      price: "0.4 ALGO",
      merchant: "Gourmet Events Co.",
      category: "Food",
      date: "2024-08-05",
      status: "available",
    },
  ]

  const filteredNfts = nfts.filter((nft) => {
    const matchesSearch = nft.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEventType = eventType === "all" || nft.category === eventType
    const matchesMerchant = merchantFilter === "all" || nft.merchant === merchantFilter
    const nftPrice = Number.parseFloat(nft.price.split(" ")[0])
    const matchesPrice = nftPrice >= priceRange[0] && nftPrice <= priceRange[1]
    const matchesDate =
      dateFilter === "all" ||
      (dateFilter === "upcoming" && new Date(nft.date) > new Date()) ||
      (dateFilter === "past" && new Date(nft.date) <= new Date())

    return matchesSearch && matchesEventType && matchesMerchant && matchesPrice && matchesDate
  })

  const uniqueEventTypes = Array.from(new Set(nfts.map((nft) => nft.category)))
  const uniqueMerchants = Array.from(new Set(nfts.map((nft) => nft.merchant)))

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Header showSearch={false} />

        <div className="container mx-auto px-6 py-8">
          <FadeIn>
            <div className="mb-8">
              <h2 className="text-4xl font-black tracking-tight mb-2">Explore Event NFTs</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Discover unique tickets and passes for events worldwide
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search NFTs by title..."
                  className="pl-9 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                  <Filter className="h-4 w-4 mr-2 text-gray-500" />
                  <SelectValue placeholder="Filter by Event Type" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                  <SelectItem value="all">All Event Types</SelectItem>
                  {uniqueEventTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={merchantFilter} onValueChange={setMerchantFilter}>
                <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                  <Store className="h-4 w-4 mr-2 text-gray-500" />
                  <SelectValue placeholder="Filter by Merchant" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                  <SelectItem value="all">All Merchants</SelectItem>
                  {uniqueMerchants.map((merchant) => (
                    <SelectItem key={merchant} value={merchant}>
                      {merchant}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <SelectValue placeholder="Filter by Date" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4">
              <Label htmlFor="price-range" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Price Range (ALGO): {priceRange[0]} - {priceRange[1]}
              </Label>
              <Slider
                id="price-range"
                min={0}
                max={10}
                step={0.1}
                value={priceRange}
                onValueChange={(val) => setPriceRange(val as [number, number])}
                className="mt-2"
              />
            </div>
          </motion.div>

          {/* NFT Grid */}
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNfts.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-600 dark:text-gray-400">
                No NFTs found matching your criteria.
              </div>
            ) : (
              filteredNfts.map((nft, index) => (
                <StaggerItem key={nft.id}>
                  <motion.div
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    }}
                    className="h-full"
                  >
                    <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-full flex flex-col">
                      <Link href={`/nft/${nft.id}`}>
                        <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700">
                          <img
                            src={nft.image || "/placeholder.svg"}
                            alt={nft.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>
                      <CardContent className="p-4 flex-1 flex flex-col">
                        <h3 className="font-bold text-lg mb-1">{nft.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{nft.merchant}</p>
                        <div className="flex justify-between items-center mb-3 mt-auto">
                          <span className="font-black text-xl">{nft.price}</span>
                          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 rounded-full">
                            {nft.category}
                          </Badge>
                        </div>
                        <Link href={`/nft/${nft.id}`}>
                          <Button className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-full">
                            View Details
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
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
