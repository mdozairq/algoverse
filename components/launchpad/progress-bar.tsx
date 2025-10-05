"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

interface ProgressBarProps {
  current: number
  total: number
  label?: string
  showPercentage?: boolean
  showCount?: boolean
  color?: string
  size?: "sm" | "md" | "lg"
  className?: string
  animated?: boolean
}

export function ProgressBar({
  current,
  total,
  label,
  showPercentage = true,
  showCount = true,
  color,
  size = "md",
  className,
  animated = true
}: ProgressBarProps) {
  const percentage = Math.min((current / total) * 100, 100)
  
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-2"
      case "lg":
        return "h-4"
      default:
        return "h-3"
    }
  }

  const getColorClass = () => {
    if (color) return color
    
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 70) return "bg-orange-500"
    if (percentage >= 50) return "bg-yellow-500"
    if (percentage >= 30) return "bg-green-500"
    return "bg-blue-500"
  }

  const ProgressComponent = animated ? motion.div : "div"
  const progressProps = animated ? {
    initial: { width: 0 },
    animate: { width: `${percentage}%` },
    transition: { duration: 1, ease: "easeOut" }
  } : {
    style: { width: `${percentage}%` }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {(label || showCount || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && (
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          <div className="flex items-center gap-2">
            {showCount && (
              <span className="text-gray-600 dark:text-gray-400">
                {current.toLocaleString()} / {total.toLocaleString()}
              </span>
            )}
            {showPercentage && (
              <Badge variant="outline" className="text-xs">
                {percentage.toFixed(1)}%
              </Badge>
            )}
          </div>
        </div>
      )}
      
      <div className={`relative ${getSizeClasses()} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}>
        <ProgressComponent
          className={`h-full ${getColorClass()} rounded-full transition-all duration-300`}
          {...progressProps}
        />
      </div>
    </div>
  )
}

// Specialized progress bar for mint progress
interface MintProgressBarProps {
  minted: number
  totalSupply: number
  className?: string
}

export function MintProgressBar({ minted, totalSupply, className }: MintProgressBarProps) {
  const percentage = (minted / totalSupply) * 100
  const remaining = totalSupply - minted

  return (
    <div className={`space-y-3 ${className}`}>
      <ProgressBar
        current={minted}
        total={totalSupply}
        label="Mint Progress"
        showPercentage
        showCount
        size="lg"
        animated
      />
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="font-semibold text-green-700 dark:text-green-400">
            {minted.toLocaleString()}
          </div>
          <div className="text-green-600 dark:text-green-500">
            Minted
          </div>
        </div>
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="font-semibold text-blue-700 dark:text-blue-400">
            {remaining.toLocaleString()}
          </div>
          <div className="text-blue-600 dark:text-blue-500">
            Remaining
          </div>
        </div>
      </div>
    </div>
  )
}

// Specialized progress bar for roadmap milestones
interface MilestoneProgressBarProps {
  completed: number
  total: number
  className?: string
}

export function MilestoneProgressBar({ completed, total, className }: MilestoneProgressBarProps) {
  const percentage = (completed / total) * 100

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Project Progress
        </span>
        <Badge variant="secondary" className="text-xs">
          {completed} of {total} milestones
        </Badge>
      </div>
      
      <ProgressBar
        current={completed}
        total={total}
        showPercentage={false}
        showCount={false}
        size="md"
        animated
      />
    </div>
  )
}

// Specialized progress bar for sale phases
interface SalePhaseProgressBarProps {
  currentPhase: string
  phaseProgress: number
  className?: string
}

export function SalePhaseProgressBar({ currentPhase, phaseProgress, className }: SalePhaseProgressBarProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentPhase}
        </span>
        <Badge variant="outline" className="text-xs">
          {phaseProgress.toFixed(1)}%
        </Badge>
      </div>
      
      <ProgressBar
        current={phaseProgress}
        total={100}
        showPercentage={false}
        showCount={false}
        size="sm"
        animated
      />
    </div>
  )
}
