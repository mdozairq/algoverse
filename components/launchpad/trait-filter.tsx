"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { 
  ChevronDown, 
  ChevronUp, 
  X,
  Filter,
  RotateCcw
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Trait {
  trait_type: string
  value: string
  count: number
  rarity: number
}

interface TraitFilterProps {
  traits: Trait[]
  selectedTraits: Record<string, string[]>
  priceRange: [number, number]
  onTraitChange: (traitType: string, values: string[]) => void
  onPriceRangeChange: (range: [number, number]) => void
  onClearFilters: () => void
  className?: string
}

export function TraitFilter({
  traits,
  selectedTraits,
  priceRange,
  onTraitChange,
  onPriceRangeChange,
  onClearFilters,
  className
}: TraitFilterProps) {
  const [expandedTraits, setExpandedTraits] = useState<Set<string>>(new Set())
  const [showAllTraits, setShowAllTraits] = useState<Record<string, boolean>>({})

  // Group traits by trait_type
  const groupedTraits = traits.reduce((acc, trait) => {
    if (!acc[trait.trait_type]) {
      acc[trait.trait_type] = []
    }
    acc[trait.trait_type].push(trait)
    return acc
  }, {} as Record<string, Trait[]>)

  // Sort traits within each group by rarity (descending)
  Object.keys(groupedTraits).forEach(traitType => {
    groupedTraits[traitType].sort((a, b) => b.rarity - a.rarity)
  })

  const toggleTraitExpansion = (traitType: string) => {
    const newExpanded = new Set(expandedTraits)
    if (newExpanded.has(traitType)) {
      newExpanded.delete(traitType)
    } else {
      newExpanded.add(traitType)
    }
    setExpandedTraits(newExpanded)
  }

  const toggleTraitValue = (traitType: string, value: string) => {
    const currentValues = selectedTraits[traitType] || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    
    onTraitChange(traitType, newValues)
  }

  const clearTraitType = (traitType: string) => {
    onTraitChange(traitType, [])
  }

  const getActiveFilterCount = () => {
    const traitCount = Object.values(selectedTraits).reduce((sum, values) => sum + values.length, 0)
    const priceCount = priceRange[0] > 0 || priceRange[1] < 1000 ? 1 : 0
    return traitCount + priceCount
  }

  const getRarityColor = (rarity: number) => {
    if (rarity >= 90) return "text-red-500"
    if (rarity >= 70) return "text-orange-500"
    if (rarity >= 50) return "text-yellow-500"
    if (rarity >= 30) return "text-green-500"
    return "text-blue-500"
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFilterCount()}
              </Badge>
            )}
          </CardTitle>
          {getActiveFilterCount() > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Price Range Filter */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Price Range</h4>
          <div className="space-y-2">
            <Slider
              value={priceRange}
              onValueChange={(value) => onPriceRangeChange(value as [number, number])}
              max={1000}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{priceRange[0]} ETH</span>
              <span>{priceRange[1]} ETH</span>
            </div>
          </div>
        </div>

        {/* Trait Filters */}
        <div className="space-y-4">
          {Object.entries(groupedTraits).map(([traitType, traitValues]) => {
            const isExpanded = expandedTraits.has(traitType)
            const selectedValues = selectedTraits[traitType] || []
            const hasSelection = selectedValues.length > 0
            const showAll = showAllTraits[traitType] || false
            const displayValues = showAll ? traitValues : traitValues.slice(0, 5)

            return (
              <div key={traitType} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleTraitExpansion(traitType)}
                    className="h-auto p-0 font-medium text-sm justify-start"
                  >
                    {traitType}
                    {hasSelection && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {selectedValues.length}
                      </Badge>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 ml-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </Button>
                  {hasSelection && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearTraitType(traitType)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2 overflow-hidden"
                    >
                      {displayValues.map((trait) => (
                        <div
                          key={`${traitType}-${trait.value}`}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`${traitType}-${trait.value}`}
                            checked={selectedValues.includes(trait.value)}
                            onCheckedChange={() => toggleTraitValue(traitType, trait.value)}
                          />
                          <label
                            htmlFor={`${traitType}-${trait.value}`}
                            className="flex-1 flex items-center justify-between text-sm cursor-pointer"
                          >
                            <span className="truncate">{trait.value}</span>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>({trait.count})</span>
                              <span className={getRarityColor(trait.rarity)}>
                                {trait.rarity.toFixed(1)}%
                              </span>
                            </div>
                          </label>
                        </div>
                      ))}
                      
                      {traitValues.length > 5 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAllTraits(prev => ({
                            ...prev,
                            [traitType]: !showAll
                          }))}
                          className="w-full text-xs"
                        >
                          {showAll ? "Show Less" : `Show All ${traitValues.length} Options`}
                        </Button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* Active Filters Summary */}
        {getActiveFilterCount() > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-medium text-sm mb-2">Active Filters</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(selectedTraits).map(([traitType, values]) =>
                values.map((value) => (
                  <Badge
                    key={`${traitType}-${value}`}
                    variant="secondary"
                    className="text-xs"
                  >
                    {traitType}: {value}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTraitValue(traitType, value)}
                      className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))
              )}
              {(priceRange[0] > 0 || priceRange[1] < 1000) && (
                <Badge variant="secondary" className="text-xs">
                  Price: {priceRange[0]}-{priceRange[1]} ETH
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPriceRangeChange([0, 1000])}
                    className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
