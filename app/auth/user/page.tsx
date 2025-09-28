"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, User, Smartphone, Chrome } from "lucide-react"
import { PageTransition, FadeIn, ScaleIn } from "@/components/animations/page-transition"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

import { useWallet } from "@/hooks/use-wallet"
import { WalletStatus } from "@/components/wallet/wallet-status"

// Client-side component that uses global wallet system
function UserAuthContent() {
  const router = useRouter()
  const { connectWallet, loading, logout, disconnectWallet } = useAuth()
  const { 
    isConnected, 
    isConnecting, 
    account, 
    connect: connectWalletService, 
    disconnect: disconnectWalletService 
  } = useWallet()
  const { toast } = useToast()
  const [authMethod, setAuthMethod] = useState<"pera" | "google">("pera")

  // Check wallet connection on mount
  useEffect(() => {
    // The wallet service automatically handles reconnection
    // No need for manual reconnection logic
  }, [])

  // Clear any existing session when accessing user auth page
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

  const handleConnectWalletClick = async () => {
    try {
      // Connect to wallet using the global wallet service
      const walletAccount = await connectWalletService()
      
      // Connect wallet to auth system
      await connectWallet(walletAccount.address)

      toast({
        title: "Wallet Connected",
        description: "Your Pera wallet has been connected successfully!",
      })

      // Redirect after success animation
      setTimeout(() => {
        router.replace("/dashboard/user")
      }, 1500)
    } catch (error: any) {
      console.error("Wallet connection failed:", error)
      
      let errorMessage = "Failed to connect wallet. Please try again."
      
      if (error.message) {
        if (error.message.includes("User rejected")) {
          errorMessage = "Wallet connection was rejected. Please try again."
        } else if (error.message.includes("Network error")) {
          errorMessage = "Network error. Please check your connection and try again."
        } else if (error.message.includes("not found") || error.message.includes("not installed")) {
          errorMessage = "Pera Wallet not found. Please install Pera Wallet from the App Store or Google Play Store."
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

  const handleDisconnectWalletClick = async () => {
    try {
      // Disconnect from auth system (this will also disconnect wallet service)
      await disconnectWallet()
      
      toast({
        title: "Wallet Disconnected",
        description: "Your Pera wallet has been disconnected.",
      })
    } catch (error: any) {
      console.error("Disconnect failed:", error)
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect wallet properly.",
        variant: "destructive",
      })
    }
  }

  const handleGoogleAuth = async () => {
    try {
      // TODO: Implement Google OAuth integration
      // For now, we'll simulate the process
      toast({
        title: "Google OAuth",
        description: "Google OAuth integration coming soon!",
        variant: "destructive",
      })
    } catch (error: any) {
      console.error("Google auth failed:", error)
      
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
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>
              </ScaleIn>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-4 text-gray-900 dark:text-white">
                USER
                <br />
                ACCESS
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Connect your Pera wallet or sign in with Google
              </p>
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
                        Connect your Pera Wallet to access your account securely
                      </p>
                    </div>

                    <Button
                      onClick={isConnected ? handleDisconnectWalletClick : handleConnectWalletClick}
                      disabled={isConnecting || loading}
                      className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-full py-3 text-sm font-medium"
                      size="lg"
                    >
                      {isConnecting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          CONNECTING...
                        </div>
                      ) : isConnected ? (
                        <div className="flex items-center">
                          <Smartphone className="w-4 h-4 mr-2" />
                          DISCONNECT WALLET
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Smartphone className="w-4 h-4 mr-2" />
                          CONNECT PERA WALLET
                        </div>
                      )}
                    </Button>

                    {/* Wallet Status Display */}
                    {isConnected && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                        className="mt-4"
                      >
                        <WalletStatus showDetails={true} showActions={false} />
                      </motion.div>
                    )}

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
                        Use your Google account to sign in quickly and securely
                      </p>
                    </div>

                    <Button
                      onClick={handleGoogleAuth}
                      disabled={loading}
                      className="w-full bg-red-600 text-white hover:bg-red-700 rounded-full py-3 text-sm font-medium"
                      size="lg"
                    >
                      <div className="flex items-center">
                        <Chrome className="w-4 h-4 mr-2" />
                        SIGN IN WITH GOOGLE
                      </div>
                    </Button>

                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        By signing in, you agree to our Terms of Service and Privacy Policy
                      </p>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  )
}

// Main page component with SSR compatibility
export default function UserAuthPage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-4 text-gray-900 dark:text-white">
                USER
                <br />
                ACCESS
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Loading authentication options...
              </p>
            </div>
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Initializing global wallet system...</p>
            </div>
          </div>
        </div>
      </PageTransition>
    )
  }

  return <UserAuthContent />
}
