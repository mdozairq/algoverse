"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Shield, Key } from "lucide-react"
import { PageTransition, FadeIn, ScaleIn } from "@/components/animations/page-transition"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function AdminAuthPage() {
  const router = useRouter()
  const { loginWithEmail, loading, logout } = useAuth()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    adminKey: "",
  })

  // Clear any existing session when accessing admin auth page
  useEffect(() => {
    const clearSession = async () => {
      try {
        await logout()
      } catch (error) {
        console.log("No existing session to clear")
      }
    }
    clearSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (!formData.email || !formData.password || !formData.adminKey) {
        toast({
          title: "Validation Error",
          description: "Please fill in all fields",
          variant: "destructive",
        })
        return
      }

      const user = await loginWithEmail(formData.email, formData.password, "admin", formData.adminKey)
      
      toast({
        title: "Login Successful",
        description: "Welcome back, Administrator!",
      })

      // Redirect to role-specific dashboard
      router.push(`/dashboard/${user.role}`)
    } catch (error: any) {
      let errorMessage = "Invalid credentials"
      
      if (error.message) {
        if (error.message.includes("User not found")) {
          errorMessage = "No admin account found with this email address"
        } else if (error.message.includes("Invalid password")) {
          errorMessage = "Incorrect password. Please try again"
        } else if (error.message.includes("Invalid admin master key")) {
          errorMessage = "Invalid admin master key. Please check your key and try again"
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <FadeIn>
            <Link
              href="/"
              className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-8 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Link>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="text-center mb-8">
              <ScaleIn>
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </ScaleIn>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-4 text-gray-900 dark:text-white">
                ADMIN
                <br />
                ACCESS
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Secure administrative access to the platform</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <Card className="border-0 shadow-lg rounded-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <Label htmlFor="email" className="text-sm font-medium text-gray-900 dark:text-gray-300">
                      Admin Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter admin email"
                      className="rounded-full h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                      required
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <Label htmlFor="password" className="text-sm font-medium text-gray-900 dark:text-gray-300">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password"
                      className="rounded-full h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                      required
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <Label
                      htmlFor="adminKey"
                      className="text-sm font-medium flex items-center gap-2 text-gray-900 dark:text-gray-300"
                    >
                      <Key className="w-4 h-4" />
                      Admin Master Key
                    </Label>
                    <Input
                      id="adminKey"
                      type="password"
                      value={formData.adminKey}
                      onChange={(e) => setFormData({ ...formData, adminKey: e.target.value })}
                      placeholder="Enter master key"
                      className="rounded-full h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Master key required for administrative access
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-red-600 text-white hover:bg-red-700 rounded-full py-3 text-sm font-medium"
                      size="lg"
                    >
                      {loading ? "SIGNING IN..." : "ADMIN SIGN IN"}
                    </Button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="bg-red-900/20 border border-red-700 rounded-lg p-4"
                  >
                    <p className="text-xs text-red-300 text-center">
                      ⚠️ Administrative access is restricted and monitored. Unauthorized access attempts will be logged.
                    </p>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  )
}
