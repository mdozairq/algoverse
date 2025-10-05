"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, AlertCircle } from "lucide-react"

interface CountdownTimerProps {
  startTime: string
  endTime?: string
  title?: string
  description?: string
  onComplete?: () => void
  className?: string
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

export function CountdownTimer({
  startTime,
  endTime,
  title = "Sale Starts In",
  description,
  onComplete,
  className
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [isEnded, setIsEnded] = useState(false)

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime()
      const start = new Date(startTime).getTime()
      const end = endTime ? new Date(endTime).getTime() : null

      // Check if sale has ended
      if (end && now >= end) {
        setIsEnded(true)
        setIsActive(false)
        setTimeRemaining(null)
        onComplete?.()
        return
      }

      // Check if sale has started
      if (now >= start) {
        setIsActive(true)
        if (end) {
          // Countdown to end
          const difference = end - now
          if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24))
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((difference % (1000 * 60)) / 1000)

            setTimeRemaining({
              days,
              hours,
              minutes,
              seconds,
              total: difference
            })
          } else {
            setIsEnded(true)
            setTimeRemaining(null)
            onComplete?.()
          }
        } else {
          // Sale is active with no end time
          setTimeRemaining(null)
        }
      } else {
        // Countdown to start
        const difference = start - now
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeRemaining({
          days,
          hours,
          minutes,
          seconds,
          total: difference
        })
        setIsActive(false)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [startTime, endTime, onComplete])

  const getStatusBadge = () => {
    if (isEnded) {
      return (
        <Badge variant="outline" className="border-red-500 text-red-600">
          <AlertCircle className="w-3 h-3 mr-1" />
          Ended
        </Badge>
      )
    }
    
    if (isActive) {
      return (
        <Badge className="bg-green-500 text-white">
          <CheckCircle className="w-3 h-3 mr-1" />
          Live
        </Badge>
      )
    }
    
    return (
      <Badge variant="outline" className="border-yellow-500 text-yellow-600">
        <Clock className="w-3 h-3 mr-1" />
        Upcoming
      </Badge>
    )
  }

  const getTitle = () => {
    if (isEnded) return "Sale Ended"
    if (isActive) return endTime ? "Sale Ends In" : "Sale is Live"
    return title
  }

  if (isEnded) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Sale Ended
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sale Has Ended</h3>
            <p className="text-gray-600">
              The minting period for this project has concluded.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isActive && !endTime) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Sale is Live
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Minting is Active</h3>
            <p className="text-gray-600">
              The sale is now live and you can mint NFTs.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          {getTitle()}
        </CardTitle>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          {getStatusBadge()}
        </div>

        {timeRemaining && (
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {timeRemaining.days}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Days</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {timeRemaining.hours}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Hours</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {timeRemaining.minutes}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {timeRemaining.seconds}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Seconds</div>
            </div>
          </div>
        )}

        {!timeRemaining && isActive && (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sale is Live</h3>
            <p className="text-gray-600">
              The minting period is now active.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
