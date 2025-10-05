"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Users,
  DollarSign,
  Activity,
  Clock,
  Star
} from "lucide-react"
import { motion } from "framer-motion"

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  changeType?: "increase" | "decrease" | "neutral"
  icon?: React.ReactNode
  subtitle?: string
  badge?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  className?: string
  loading?: boolean
}

export function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  subtitle,
  badge,
  badgeVariant = "default",
  className,
  loading = false
}: StatsCardProps) {
  const getChangeIcon = () => {
    switch (changeType) {
      case "increase":
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case "decrease":
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getChangeColor = () => {
    switch (changeType) {
      case "increase":
        return "text-green-500"
      case "decrease":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const formatValue = (val: string | number) => {
    if (typeof val === "number") {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`
      }
      return val.toLocaleString()
    }
    return val
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={className}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </CardTitle>
            {icon && (
              <div className="text-gray-400">
                {icon}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {formatValue(value)}
              </span>
              {badge && (
                <Badge variant={badgeVariant} className="text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
            
            {change !== undefined && (
              <div className={`flex items-center gap-1 text-sm ${getChangeColor()}`}>
                {getChangeIcon()}
                <span>
                  {change > 0 ? "+" : ""}{change.toFixed(1)}%
                </span>
                <span className="text-gray-500">vs last period</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Predefined stats card variants for common use cases
export function CollectionStatsCard({
  floorPrice,
  volume,
  holders,
  listed,
  change,
  className
}: {
  floorPrice: number
  volume: number
  holders: number
  listed: number
  change?: number
  className?: string
}) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      <StatsCard
        title="Floor Price"
        value={`${floorPrice} ETH`}
        change={change}
        changeType={change && change > 0 ? "increase" : change && change < 0 ? "decrease" : "neutral"}
        icon={<DollarSign className="w-4 h-4" />}
      />
      <StatsCard
        title="Volume"
        value={`${volume} ETH`}
        icon={<Activity className="w-4 h-4" />}
      />
      <StatsCard
        title="Holders"
        value={holders}
        icon={<Users className="w-4 h-4" />}
      />
      <StatsCard
        title="Listed"
        value={listed}
        icon={<Star className="w-4 h-4" />}
      />
    </div>
  )
}

export function ActivityStatsCard({
  totalMints,
  totalSales,
  totalVolume,
  averagePrice,
  uniqueBuyers,
  className
}: {
  totalMints: number
  totalSales: number
  totalVolume: number
  averagePrice: number
  uniqueBuyers: number
  className?: string
}) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-5 gap-4 ${className}`}>
      <StatsCard
        title="Total Mints"
        value={totalMints}
        icon={<Activity className="w-4 h-4" />}
      />
      <StatsCard
        title="Total Sales"
        value={totalSales}
        icon={<DollarSign className="w-4 h-4" />}
      />
      <StatsCard
        title="Total Volume"
        value={`${totalVolume} ETH`}
        icon={<TrendingUp className="w-4 h-4" />}
      />
      <StatsCard
        title="Average Price"
        value={`${averagePrice} ETH`}
        icon={<DollarSign className="w-4 h-4" />}
      />
      <StatsCard
        title="Unique Buyers"
        value={uniqueBuyers}
        icon={<Users className="w-4 h-4" />}
      />
    </div>
  )
}

export function ProjectStatsCard({
  totalSupply,
  minted,
  price,
  chain,
  salePhase,
  className
}: {
  totalSupply: number
  minted: number
  price: number
  chain: string
  salePhase: string
  className?: string
}) {
  const mintProgress = (minted / totalSupply) * 100

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      <StatsCard
        title="Total Supply"
        value={totalSupply}
        icon={<Star className="w-4 h-4" />}
      />
      <StatsCard
        title="Minted"
        value={minted}
        subtitle={`${mintProgress.toFixed(1)}% of supply`}
        icon={<Activity className="w-4 h-4" />}
      />
      <StatsCard
        title="Price"
        value={`${price} ETH`}
        icon={<DollarSign className="w-4 h-4" />}
      />
      <StatsCard
        title="Chain"
        value={chain}
        badge={salePhase}
        badgeVariant="secondary"
        icon={<Clock className="w-4 h-4" />}
      />
    </div>
  )
}
