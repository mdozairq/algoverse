"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, MapPin, QrCode, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"

export default function EventCheckinPage() {
  const params = useParams()
  const eventId = params.id
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [checkinStatus, setCheckinStatus] = useState<"idle" | "success" | "failed" | "used">("idle")
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Load event data
  useEffect(() => {
    if (!isAuthenticated || authLoading) {
      setLoading(false)
      return
    }

    const loadEvent = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`)
        if (response.ok) {
          const data = await response.json()
          setEvent(data.event)
        }
      } catch (error) {
        console.error('Error loading event:', error)
      } finally {
        setLoading(false)
      }
    }
    loadEvent()
  }, [eventId, isAuthenticated, authLoading])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading event...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Event Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The event you're looking for doesn't exist.</p>
          <Link href="/dashboard/user">
            <Button className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const eventDateTime = new Date(event.date)
  const timeRemaining = eventDateTime.getTime() - currentTime.getTime()
  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24))
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)

  const handleCheckIn = async () => {
    try {
      setCheckinStatus("idle")
      // In a real app, this would call a check-in API
      const success = Math.random() > 0.2 // Simulate success/failure
      setTimeout(() => {
        if (success) {
          setCheckinStatus("success")
          // In a real app, update event.isUsed in backend
        } else {
          setCheckinStatus("failed")
        }
      }, 1500)
    } catch (error) {
      console.error('Check-in error:', error)
      setCheckinStatus("failed")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 bg-white dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/user"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-xl font-bold">Event Ticket</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-8 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md space-y-6 text-center"
        >
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-3xl font-black">{event.title}</CardTitle>
              <p className="text-gray-600 dark:text-gray-400">Event ID: {event.id}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center gap-4 text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{event.location}</span>
                </div>
              </div>

              {timeRemaining > 0 ? (
                <div className="text-center text-gray-600 dark:text-gray-300">
                  <p className="text-lg font-semibold mb-2">Time until event:</p>
                  <div className="flex justify-center gap-4 text-2xl font-bold">
                    <span>{days}d</span>
                    <span>{hours}h</span>
                    <span>{minutes}m</span>
                    <span>{seconds}s</span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-lg font-semibold text-green-600 dark:text-green-400">
                  Event is Live!
                </div>
              )}

              <div className="relative w-full max-w-[250px] mx-auto aspect-square bg-white p-4 rounded-lg flex items-center justify-center">
                {checkinStatus === "idle" && (
                  <img
                    src={event.imageUrl || "/placeholder.svg?height=300&width=300&text=QR Code"}
                    alt="Event QR Code"
                    className="w-full h-full object-contain"
                  />
                )}
                {checkinStatus === "success" && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center text-green-600 dark:text-green-500"
                  >
                    <CheckCircle2 className="w-24 h-24" />
                    <p className="mt-2 text-lg font-bold">Check-in Successful!</p>
                  </motion.div>
                )}
                {checkinStatus === "failed" && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center text-red-600 dark:text-red-500"
                  >
                    <XCircle className="w-24 h-24" />
                    <p className="mt-2 text-lg font-bold">Check-in Failed!</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Please try again or contact support.</p>
                  </motion.div>
                )}
                {checkinStatus === "used" && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center text-gray-600 dark:text-gray-500"
                  >
                    <QrCode className="w-24 h-24" />
                    <p className="mt-2 text-lg font-bold">Ticket Already Used</p>
                  </motion.div>
                )}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                Present this QR code at the venue entrance for quick access.
              </p>

              <Button
                onClick={handleCheckIn}
                disabled={checkinStatus !== "idle"}
                className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                {checkinStatus === "idle" && "Simulate Check-In"}
                {checkinStatus === "success" && "Checked In!"}
                {checkinStatus === "failed" && "Try Again"}
                {checkinStatus === "used" && "Already Used"}
              </Button>

              <div className="mt-6 text-left space-y-2">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Usage Log:</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>2024-07-15 18:55:00 - QR Code Generated</li>
                  {checkinStatus === "success" && (
                    <li className="text-green-600 dark:text-green-400">
                      2024-07-15 {currentTime.toLocaleTimeString()} - Checked In
                    </li>
                  )}
                  {event.isUsed && <li className="text-gray-500">2024-07-15 19:05:00 - Previously Used</li>}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
