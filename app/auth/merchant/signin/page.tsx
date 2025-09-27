"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ArrowLeft, Store, Smartphone, Chrome } from "lucide-react"
import { PageTransition, FadeIn, ScaleIn } from "@/components/animations/page-transition"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { PeraWalletService } from "@/lib/wallet/pera-wallet"

export default function MerchantLoginPage() {
  const router = useRouter()
  const { connectWallet, loading, logout } = useAuth()
  const { toast } = useToast()
  const [authMethod, setAuthMethod] = useState<"pera" | "google">("pera")
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected">("idle")

  // Clear any existing session when accessing merchant login page
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

  const handlePeraWalletConnect = async () => {
    setConnectionStatus("connecting")

    try {
      // Check if Pera Wallet is installed
      if (!PeraWalletService.isInstalled()) {
        throw new Error("Pera Wallet not installed. Please install Pera Wallet from the App Store or Google Play Store.")
      }

      // Connect to Pera Wallet
      const peraWallet = PeraWalletService.getInstance()
      const peraAccount = await peraWallet.connect()
      
      console.log('Pera wallet connected:', peraAccount)
      console.log('Pera account address:', peraAccount.address, 'Type:', typeof peraAccount.address)

      // Connect to auth system with Pera wallet address
      await connectWallet(peraAccount.address)

      setConnectionStatus("connected")

      toast({
        title: "Wallet Connected",
        description: "Your Pera wallet has been connected successfully!",
      })

      // Redirect after success animation
      setTimeout(() => {
        router.replace("/dashboard/merchant")
      }, 1500)
    } catch (error: any) {
      console.error("Pera wallet connection failed:", error)
      setConnectionStatus("idle")
      
      let errorMessage = "Failed to connect Pera wallet. Please try again."
      
      if (error.message) {
        if (error.message.includes("User rejected")) {
          errorMessage = "Wallet connection was rejected. Please try again."
        } else if (error.message.includes("Network error")) {
          errorMessage = "Network error. Please check your connection and try again."
        } else if (error.message.includes("not installed")) {
          errorMessage = "Pera Wallet not installed. Please install Pera Wallet from the App Store or Google Play Store."
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleGoogleAuth = async () => {
    setConnectionStatus("connecting")

    try {
      // TODO: Implement Google OAuth integration
      // For now, we'll simulate the process
      toast({
        title: "Google OAuth",
        description: "Google OAuth integration coming soon!",
        variant: "destructive",
      })
      
      setConnectionStatus("idle")
    } catch (error: any) {
      console.error("Google auth failed:", error)
      setConnectionStatus("idle")
      
      toast({
        title: "Authentication Failed",
        description: "Failed to authenticate with Google. Please try again.",
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
              <p className="text-gray-600 dark:text-gray-400">Connect your Pera wallet or sign in with Google</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <Card className="border-0 shadow-lg rounded-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-4">
                <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                  <Button
                    variant={authMethod === "pera" ? "default" : "ghost"}
                    onClick={() => setAuthMethod("pera")}
                    className="flex-1 rounded-md text-sm font-medium"
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Pera Wallet
                  </Button>
                  <Button
                    variant={authMethod === "google" ? "default" : "ghost"}
                    onClick={() => setAuthMethod("google")}
                    className="flex-1 rounded-md text-sm font-medium"
                  >
                    <Chrome className="w-4 h-4 mr-2" />
                    Google
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6 lg:p-8 pt-0">
                {authMethod === "pera" ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Smartphone className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Connect Pera Wallet
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Connect your Pera Wallet to access your merchant account
                      </p>
                    </div>

                    <Button
                      onClick={handlePeraWalletConnect}
                      disabled={connectionStatus === "connecting" || loading}
                      className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-full py-3 text-sm font-medium"
                      size="lg"
                    >
                      {connectionStatus === "connecting" ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          CONNECTING...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Smartphone className="w-4 h-4 mr-2" />
                          CONNECT PERA WALLET
                        </div>
                      )}
                    </Button>

                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Don't have Pera Wallet?{" "}
                        <a
                          href="https://perawallet.app/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Download here
                        </a>
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Chrome className="w-8 h-8 text-red-600 dark:text-red-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Sign in with Google
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Use your Google account to sign in to your merchant account
                      </p>
                    </div>

                    <Button
                      onClick={handleGoogleAuth}
                      disabled={connectionStatus === "connecting" || loading}
                      className="w-full bg-red-600 text-white hover:bg-red-700 rounded-full py-3 text-sm font-medium"
                      size="lg"
                    >
                      {connectionStatus === "connecting" ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          CONNECTING...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Chrome className="w-4 h-4 mr-2" />
                          SIGN IN WITH GOOGLE
                        </div>
                      )}
                    </Button>

                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        By signing in, you agree to our Terms of Service and Privacy Policy
                      </p>
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mt-6"
                >
                  <p className="text-xs text-blue-300 text-center">
                    💼 Merchant accounts require admin approval before you can access the dashboard.
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  )
}
