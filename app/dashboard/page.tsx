"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Store, User, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // Redirect to role-specific dashboard
      switch (user.role) {
        case "admin":
          router.push("/dashboard/admin")
          break
        case "merchant":
          router.push("/dashboard/merchant")
          break
        case "user":
          router.push("/dashboard/user")
          break
        default:
          router.push("/auth/user")
      }
    } else if (!loading && !user) {
      router.push("/auth/user")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Loader2 className="w-8 h-8 animate-spin text-gray-600 dark:text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Loading Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Please wait while we redirect you...</p>
        </motion.div>
      </div>
    )
  }

  // Fallback UI while redirecting
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Redirecting...</h1>
        <p className="text-gray-600 dark:text-gray-400">Taking you to your dashboard</p>
      </motion.div>
    </div>
  )
}
