"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Eye, 
  Heart, 
  Share2, 
  Star,
  ExternalLink,
  Copy,
  CheckCircle
} from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"

interface NFTCardProps {
  id: string
  tokenId: string
  name: string
  description: string
  image: string
  traits: {
    trait_type: string
    value: string
    rarity: number
  }[]
  rarityScore: number
  rarityRank: number
  price?: number
  currency?: string
  isListed: boolean
  lastSale?: {
    price: number
    currency: string
    date: string
  }
  views: number
  likes: number
  onClick?: () => void
  onLike?: () => void
  onShare?: () => void
  className?: string
}

export function NFTCard({
  id,
  tokenId,
  name,
  description,
  image,
  traits,
  rarityScore,
  rarityRank,
  price,
  currency,
  isListed,
  lastSale,
  views,
  likes,
  onClick,
  onLike,
  onShare,
  className
}: NFTCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [copied, setCopied] = useState(false)

  const getRarityColor = (rarity: number) => {
    if (rarity >= 90) return "text-red-500"
    if (rarity >= 70) return "text-orange-500"
    if (rarity >= 50) return "text-yellow-500"
    if (rarity >= 30) return "text-green-500"
    return "text-blue-500"
  }

  const getRarityBadge = (rarity: number) => {
    if (rarity >= 90) return "Legendary"
    if (rarity >= 70) return "Epic"
    if (rarity >= 50) return "Rare"
    if (rarity >= 30) return "Uncommon"
    return "Common"
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike?.()
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: name,
        text: description,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    onShare?.()
  }

  const copyTokenId = () => {
    navigator.clipboard.writeText(tokenId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card 
        className="overflow-hidden cursor-pointer group"
        onClick={onClick}
      >
        <div className="relative aspect-square">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Rarity Badge */}
          <div className="absolute top-2 left-2">
            <Badge 
              className={`text-xs ${
                rarityScore >= 90 ? 'bg-red-500' :
                rarityScore >= 70 ? 'bg-orange-500' :
                rarityScore >= 50 ? 'bg-yellow-500' :
                rarityScore >= 30 ? 'bg-green-500' :
                'bg-blue-500'
              } text-white`}
            >
              #{rarityRank}
            </Badge>
          </div>
          
          {/* Price Badge */}
          {price && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-black/80 text-white">
                {price} {currency}
              </Badge>
            </div>
          )}
          
          {/* Quick Actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <Button size="sm" variant="secondary">
                <Eye className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation()
                  handleLike()
                }}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation()
                  handleShare()
                }}
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold line-clamp-1">{name}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  copyTokenId()
                }}
                className="h-6 w-6 p-0"
              >
                {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium">{rarityScore.toFixed(1)}%</span>
                <span className="text-xs text-gray-500">({getRarityBadge(rarityScore)})</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span>{likes + (isLiked ? 1 : 0)}</span>
                </div>
              </div>
            </div>
            
            {/* Traits Preview */}
            {traits.length > 0 && (
              <div className="pt-2 border-t">
                <div className="flex flex-wrap gap-1">
                  {traits.slice(0, 3).map((trait, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {trait.trait_type}: {trait.value}
                    </Badge>
                  ))}
                  {traits.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{traits.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            {/* Price and Sale Info */}
            {(price || lastSale) && (
              <div className="pt-2 border-t">
                {price && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Current Price</span>
                    <span className="font-semibold">
                      {price} {currency}
                    </span>
                  </div>
                )}
                {lastSale && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Last Sale</span>
                    <span className="text-sm">
                      {lastSale.price} {lastSale.currency}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
