"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useTheme } from "next-themes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Package, TrendingUp, Star, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import MarketplaceHeader from "@/components/marketplace/marketplace-header"
import MarketplaceFooter from "@/components/marketplace/marketplace-footer"
import { MarketplaceLoadingTemplate } from "@/components/ui/loading-templates"

interface Marketplace {
  id: string
  merchantId: string
  businessName: string
  description: string
  category: string
  website?: string
  logo?: string
  banner?: string | string[]
  template: string
  primaryColor: string
  secondaryColor: string
  accentColor?: string
  paymentMethod: string
  walletAddress: string
  status: "draft" | "pending" | "approved" | "rejected"
  isEnabled: boolean
  allowSwap: boolean
  allowMint?: boolean
  allowTrading?: boolean
  allowCreate?: boolean
  createdAt: Date
  updatedAt?: Date
}

interface MarketplaceTemplate {
  id: string
  name: string
  description: string
  preview: string
  category: string
  configuration: {
    layout: {
      headerStyle: 'fixed' | 'static'
      navigationStyle: 'horizontal' | 'vertical' | 'minimal'
      footerStyle: 'full' | 'minimal' | 'hidden'
    }
    theme: {
      primaryColor: string
      secondaryColor: string
      accentColor: string
      backgroundColor: string
      textColor: string
      cardStyle: 'flat' | 'elevated' | 'outlined'
      borderRadius: 'none' | 'small' | 'medium' | 'large'
    }
    features: {
      heroSection: boolean
      featuredProducts: boolean
      categories: boolean
      search: boolean
      filters: boolean
    }
  }
}

interface Collection {
  id: string
  name: string
  description: string
  price: number
  currency: string
  image: string
  category: string
  inStock: boolean
  rating: number
  reviews: number
  type: "nft" | "event" | "merchandise"
  isEnabled: boolean
  allowSwap: boolean
  nftCount: number
  mintPrice?: number
  floorPrice?: number
  topOffer?: number
  createdAt?: string | Date
  updatedAt?: string | Date
  nftData?: {
    assetId: number
    totalSupply: number
    availableSupply: number
    royaltyPercentage: number
  }
  eventData?: {
    date: string
    location: string
    totalSupply: number
    availableSupply: number
    nftAssetId?: number
  }
}

export default function CollectionsPage() {
  const router = useRouter()
  const params = useParams()
  const { theme: systemTheme } = useTheme()
  const merchantId = params.merchantId as string
  const marketplaceId = params.marketplaceId as string

  const [marketplace, setMarketplace] = useState<Marketplace | null>(null)
  const [template, setTemplate] = useState<MarketplaceTemplate | null>(null)
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<string>("name")
  const [currency, setCurrency] = useState<string>("ALGO")

  const isDarkMode = systemTheme === "dark" || (systemTheme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  useEffect(() => {
    fetchMarketplaceData()
  }, [merchantId, marketplaceId])

  const fetchMarketplaceData = async () => {
    setLoading(true)
    try {
      // Fetch marketplace details
      const marketplaceRes = await fetch(`/api/marketplaces/${marketplaceId}`)
      const marketplaceData = await marketplaceRes.json()

      if (marketplaceRes.ok) {
        // Check if marketplace is enabled
        if (!marketplaceData.marketplace.isEnabled) {
          setMarketplace(null)
          return
        }
        setMarketplace(marketplaceData.marketplace)

        // Fetch template configuration
        const templateRes = await fetch(`/api/marketplace-templates/${marketplaceData.marketplace.template}`)
        const templateData = await templateRes.json()

        if (templateRes.ok) {
          setTemplate(templateData.template)
        }

        // Fetch marketplace collections from API
        const collectionsRes = await fetch(`/api/marketplaces/${marketplaceId}/collections`)
        const collectionsData = await collectionsRes.json()

        if (collectionsRes.ok) {
          setCollections(collectionsData.collections.filter((collection: Collection) => collection.isEnabled) || [])
        } else {
          console.error("Failed to fetch collections:", collectionsData.error)
          setCollections([])
        }
      }
    } catch (error) {
      console.error("Failed to fetch marketplace data:", error)
    } finally {
      setLoading(false)
    }
  }

  const sortedCollections = [...collections].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (a.floorPrice || a.price) - (b.floorPrice || b.price)
      case "price-high":
        return (b.floorPrice || b.price) - (a.floorPrice || a.price)
      case "rating":
        return b.rating - a.rating
      case "reviews":
        return b.reviews - a.reviews
      case "nftCount":
        return b.nftCount - a.nftCount
      case "volume":
        // Sort by volume (using price * nftCount as proxy)
        return (b.floorPrice || b.price) * b.nftCount - (a.floorPrice || a.price) * a.nftCount
      default:
        return a.name.localeCompare(b.name)
    }
  })

  // Get last 4 collections (most recently created)
  const featuredCollections = [...collections]
    .sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return bDate - aDate
    })
    .slice(0, 4)

  if (loading) {
    return <MarketplaceLoadingTemplate />
  }

  if (!marketplace || !marketplace.isEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Marketplace Not Found</h1>
          <p className="text-muted-foreground">This marketplace is not available or has been disabled.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <MarketplaceHeader
        marketplace={marketplace}
        merchantId={merchantId}
        marketplaceId={marketplaceId}
      />
      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
        {/* Featured Collections Section */}
        {featuredCollections.length > 0 && (
          <Card
            className="card-theme mb-6"
            style={{
              backgroundColor: isDarkMode
                ? (template?.configuration.theme.backgroundColor || '#1f2937')
                : (template?.configuration.theme.backgroundColor || '#ffffff'),
              borderColor: `${marketplace.primaryColor}20`
            }}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" style={{ color: marketplace.primaryColor }} />
                <CardTitle
                  className="text-lg sm:text-xl text-foreground"
                  style={{
                    color: isDarkMode
                      ? (template?.configuration.theme.textColor || '#f9fafb')
                      : (template?.configuration.theme.textColor || '#000000')
                  }}
                >
                  Featured Collections
                </CardTitle>
              </div>
              <CardDescription
                className="text-sm text-muted-foreground"
                style={{
                  color: isDarkMode
                    ? `${template?.configuration.theme.textColor || '#f9fafb'}80`
                    : `${template?.configuration.theme.textColor || '#000000'}80`
                }}
              >
                Latest collections in this marketplace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredCollections.map((collection, index) => (
                  <motion.div
                    key={collection.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="group cursor-pointer"
                    onClick={() => {
                      router.push(`/marketplace/${merchantId}/${marketplaceId}/collection/${collection.id}`)
                    }}
                  >
                    <Card
                      className="overflow-hidden hover:shadow-lg transition-all duration-300"
                      style={{
                        backgroundColor: isDarkMode
                          ? (template?.configuration.theme.backgroundColor || '#1f2937')
                          : (template?.configuration.theme.backgroundColor || '#ffffff'),
                        borderColor: `${marketplace.primaryColor}20`
                      }}
                    >
                      <div className="relative aspect-square">
                        {collection.image ? (
                          <Image
                            src={collection.image}
                            alt={collection.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{
                              background: `linear-gradient(135deg, ${marketplace.primaryColor}, ${marketplace.secondaryColor})`
                            }}
                          >
                            <Package className="w-12 h-12 text-white opacity-80" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <Badge
                            className="text-xs font-semibold"
                            style={{
                              backgroundColor: `${marketplace.primaryColor}90`,
                              color: 'white'
                            }}
                          >
                            #{index + 1}
                          </Badge>
                        </div>
                        {collection.rating > 0 && (
                          <div className="absolute top-3 right-3">
                            <Badge
                              className="text-xs font-semibold flex items-center gap-1"
                              style={{
                                backgroundColor: `${marketplace.secondaryColor}90`,
                                color: 'white'
                              }}
                            >
                              <Star className="w-3 h-3 fill-current" />
                              {collection.rating.toFixed(1)}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3 sm:p-4">
                        <h3
                          className="font-semibold text-sm sm:text-base mb-1 line-clamp-1"
                          style={{
                            color: isDarkMode
                              ? (template?.configuration.theme.textColor || '#f9fafb')
                              : (template?.configuration.theme.textColor || '#000000')
                          }}
                        >
                          {collection.name}
                        </h3>
                        <p
                          className="text-xs sm:text-sm mb-2 line-clamp-2"
                          style={{
                            color: isDarkMode
                              ? `${template?.configuration.theme.textColor || '#f9fafb'}80`
                              : `${template?.configuration.theme.textColor || '#000000'}80`
                          }}
                        >
                          {collection.description}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div>
                            {/* <div
                              className="font-bold text-sm sm:text-base"
                              style={{
                                color: marketplace.primaryColor
                              }}
                            >
                              {collection.floorPrice || collection.price} {currency}
                            </div> */}
                            <div
                              className="text-xs"
                              style={{
                                color: isDarkMode
                                  ? `${template?.configuration.theme.textColor || '#f9fafb'}60`
                                  : `${template?.configuration.theme.textColor || '#000000'}60`
                              }}
                            >
                              {collection.nftCount} NFTs
                            </div>
                          </div>
                          {collection.topOffer && (
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-xs text-green-600">
                                <TrendingUp className="w-3 h-3" />
                                <span className="font-medium">
                                  {collection.floorPrice && collection.topOffer ?
                                    (((collection.topOffer - collection.floorPrice) / collection.floorPrice) * 100).toFixed(1) :
                                    '0.0'
                                  }%
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Collections Table */}
        <Card
          className="card-theme"
          style={{
            backgroundColor: isDarkMode
              ? (template?.configuration.theme.backgroundColor || '#1f2937')
              : (template?.configuration.theme.backgroundColor || '#ffffff'),
            borderColor: `${marketplace.primaryColor}20`
          }}
        >
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div>
                <CardTitle
                  className="text-lg sm:text-xl text-foreground"
                  style={{
                    color: isDarkMode
                      ? (template?.configuration.theme.textColor || '#f9fafb')
                      : (template?.configuration.theme.textColor || '#000000')
                  }}
                >
                  Collections
                </CardTitle>
                <CardDescription
                  className="text-sm text-muted-foreground"
                  style={{
                    color: isDarkMode
                      ? `${template?.configuration.theme.textColor || '#f9fafb'}80`
                      : `${template?.configuration.theme.textColor || '#000000'}80`
                  }}
                >
                  Browse all collections in this marketplace
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="select-theme-currency w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="reviews">Reviews</SelectItem>
                    <SelectItem value="nftCount">NFT Count</SelectItem>
                    <SelectItem value="volume">Volume</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="select-theme-currency w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALGO">ALGO</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {sortedCollections.length === 0 ? (
              <div
                className="text-center py-8"
                style={{
                  color: isDarkMode
                    ? `${template?.configuration.theme.textColor || '#f9fafb'}80`
                    : `${template?.configuration.theme.textColor || '#000000'}80`
                }}
              >
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No collections available yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      className="border-b"
                      style={{ borderColor: `${marketplace.primaryColor}20` }}
                    >
                      <th
                        className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm"
                        style={{
                          color: isDarkMode
                            ? `${template?.configuration.theme.textColor || '#f9fafb'}80`
                            : `${template?.configuration.theme.textColor || '#000000'}80`
                        }}
                      >
                        #
                      </th>
                      <th
                        className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm"
                        style={{
                          color: isDarkMode
                            ? `${template?.configuration.theme.textColor || '#f9fafb'}80`
                            : `${template?.configuration.theme.textColor || '#000000'}80`
                        }}
                      >
                        Collection
                      </th>
                      <th
                        className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm hidden sm:table-cell"
                        style={{
                          color: isDarkMode
                            ? `${template?.configuration.theme.textColor || '#f9fafb'}80`
                            : `${template?.configuration.theme.textColor || '#000000'}80`
                        }}
                      >
                        Floor
                      </th>
                      <th
                        className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm hidden lg:table-cell"
                        style={{
                          color: isDarkMode
                            ? `${template?.configuration.theme.textColor || '#f9fafb'}80`
                            : `${template?.configuration.theme.textColor || '#000000'}80`
                        }}
                      >
                        Top Offer
                      </th>
                      <th
                        className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm hidden lg:table-cell"
                        style={{
                          color: isDarkMode
                            ? `${template?.configuration.theme.textColor || '#f9fafb'}80`
                            : `${template?.configuration.theme.textColor || '#000000'}80`
                        }}
                      >
                        Floor 1d %
                      </th>
                      <th
                        className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm hidden sm:table-cell"
                        style={{
                          color: isDarkMode
                            ? `${template?.configuration.theme.textColor || '#f9fafb'}80`
                            : `${template?.configuration.theme.textColor || '#000000'}80`
                        }}
                      >
                        Volume
                      </th>
                      <th
                        className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm hidden lg:table-cell"
                        style={{
                          color: isDarkMode
                            ? `${template?.configuration.theme.textColor || '#f9fafb'}80`
                            : `${template?.configuration.theme.textColor || '#000000'}80`
                        }}
                      >
                        Sales
                      </th>
                      <th
                        className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm hidden lg:table-cell"
                        style={{
                          color: isDarkMode
                            ? `${template?.configuration.theme.textColor || '#f9fafb'}80`
                            : `${template?.configuration.theme.textColor || '#000000'}80`
                        }}
                      >
                        Listed
                      </th>
                      <th
                        className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm hidden xl:table-cell"
                        style={{
                          color: isDarkMode
                            ? `${template?.configuration.theme.textColor || '#f9fafb'}80`
                            : `${template?.configuration.theme.textColor || '#000000'}80`
                        }}
                      >
                        Last 1d
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCollections.map((collection, index) => (
                      <motion.tr
                        key={collection.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          borderColor: `${marketplace.primaryColor}10`
                        }}
                        onClick={() => {
                          router.push(`/marketplace/${merchantId}/${marketplaceId}/collection/${collection.id}`)
                        }}
                      >
                        <td
                          className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm"
                          style={{
                            color: isDarkMode
                              ? `${template?.configuration.theme.textColor || '#f9fafb'}80`
                              : `${template?.configuration.theme.textColor || '#000000'}80`
                          }}
                        >
                          {index + 1}
                        </td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="relative w-8 h-8 sm:w-12 sm:h-12 rounded-lg overflow-hidden">
                              {collection.image ? (
                                <Image
                                  src={collection.image}
                                  alt={collection.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div
                                  className="w-full h-full flex items-center justify-center"
                                  style={{
                                    background: `linear-gradient(135deg, ${marketplace.primaryColor}, ${marketplace.secondaryColor})`
                                  }}
                                >
                                  <Package className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div
                                className="font-medium text-xs sm:text-sm"
                                style={{
                                  color: isDarkMode
                                    ? (template?.configuration.theme.textColor || '#f9fafb')
                                    : (template?.configuration.theme.textColor || '#000000')
                                }}
                              >
                                {collection.name}
                              </div>
                              <div
                                className="text-xs sm:text-sm"
                                style={{
                                  color: isDarkMode
                                    ? `${template?.configuration.theme.textColor || '#f9fafb'}80`
                                    : `${template?.configuration.theme.textColor || '#000000'}80`
                                }}
                              >
                                {collection.nftCount} NFTs
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 hidden sm:table-cell">
                          <div
                            className="font-medium text-xs sm:text-sm"
                            style={{
                              color: isDarkMode
                                ? (template?.configuration.theme.textColor || '#f9fafb')
                                : (template?.configuration.theme.textColor || '#000000')
                            }}
                          >
                            {collection.floorPrice || collection.price} {currency}
                          </div>
                        </td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 hidden lg:table-cell">
                          <div
                            className="text-xs sm:text-sm"
                            style={{
                              color: isDarkMode
                                ? `${template?.configuration.theme.textColor || '#f9fafb'}80`
                                : `${template?.configuration.theme.textColor || '#000000'}80`
                            }}
                          >
                            {collection.topOffer ? `${collection.topOffer} ${currency}` : '--'}
                          </div>
                        </td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 hidden lg:table-cell">
                          <div className="flex items-center gap-1 text-xs sm:text-sm text-green-600">
                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="font-medium">
                              {collection.floorPrice && collection.topOffer ?
                                (((collection.topOffer - collection.floorPrice) / collection.floorPrice) * 100).toFixed(1) :
                                '0.0'
                              }%
                            </span>
                          </div>
                        </td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 hidden sm:table-cell">
                          <div
                            className="font-medium text-xs sm:text-sm"
                            style={{
                              color: isDarkMode
                                ? (template?.configuration.theme.textColor || '#f9fafb')
                                : (template?.configuration.theme.textColor || '#000000')
                            }}
                          >
                            {((collection.floorPrice || collection.price) * collection.nftCount).toFixed(2)} {currency}
                          </div>
                        </td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 hidden lg:table-cell">
                          <div
                            className="text-xs sm:text-sm"
                            style={{
                              color: isDarkMode
                                ? `${template?.configuration.theme.textColor || '#f9fafb'}80`
                                : `${template?.configuration.theme.textColor || '#000000'}80`
                            }}
                          >
                            {collection.reviews || 0}
                          </div>
                        </td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 hidden lg:table-cell">
                          <div
                            className="text-xs sm:text-sm"
                            style={{
                              color: isDarkMode
                                ? `${template?.configuration.theme.textColor || '#f9fafb'}80`
                                : `${template?.configuration.theme.textColor || '#000000'}80`
                            }}
                          >
                            {collection.inStock ? 'Yes' : 'No'}
                          </div>
                        </td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 hidden xl:table-cell">
                          <div
                            className="w-12 sm:w-16 h-6 sm:h-8 rounded flex items-center justify-center"
                            style={{ backgroundColor: marketplace.primaryColor }}
                          >
                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <MarketplaceFooter
        marketplace={marketplace}
      />
    </div>
  )
}
