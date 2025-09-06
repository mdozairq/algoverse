"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Store, Mail, Lock } from "lucide-react"
import { PageTransition, FadeIn, ScaleIn } from "@/components/animations/page-transition"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function MerchantLoginPage() {
  const router = useRouter()
  const { loginWithEmail, loading } = useAuth()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (!formData.email || !formData.password) {
        toast({
          title: "Validation Error",
          description: "Please fill in all fields",
          variant: "destructive",
        })
        return
      }

      await loginWithEmail(formData.email, formData.password, "merchant")
      
      toast({
        title: "Login Successful",
        description: "Welcome back, Merchant!",
      })

      router.push("/dashboard/merchant")
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
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
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Store className="w-8 h-8 text-white" />
                </div>
              </ScaleIn>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-4 text-gray-900 dark:text-white">
                MERCHANT
                <br />
                SIGN IN
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Access your merchant dashboard</p>
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
                      Business Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your business email"
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
                      placeholder="Enter your password"
                      className="rounded-full h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                      required
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-full py-3 text-sm font-medium"
                      size="lg"
                    >
                      {loading ? "SIGNING IN..." : "MERCHANT SIGN IN"}
                    </Button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="text-center"
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Don't have a merchant account?{" "}
                      <Link
                        href="/auth/merchant"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Apply here
                      </Link>
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="bg-blue-900/20 border border-blue-700 rounded-lg p-4"
                  >
                    <p className="text-xs text-blue-300 text-center">
                      💼 Merchant accounts require admin approval before you can access the dashboard.
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