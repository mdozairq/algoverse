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
import { PeraWalletConnect } from "@perawallet/connect"
import algosdk from "algosdk"


// Create the PeraWalletConnect instance outside of the component
const peraWallet = new PeraWalletConnect()

// Client-side component that uses direct Pera Wallet connection
function UserAuthContent() {
  const router = useRouter()
  const { connectWallet, loading, logout } = useAuth()
  const { toast } = useToast()
  const [authMethod, setAuthMethod] = useState<"pera" | "google">("pera")
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected">("idle")
  const [accountAddress, setAccountAddress] = useState<string | null>(null)
  
  const isConnectedToPeraWallet = !!accountAddress

  // Reconnect to the session when the component is mounted
  useEffect(() => {
    peraWallet.reconnectSession().then((accounts) => {
      // Setup the disconnect event listener
      peraWallet.connector?.on("disconnect", handleDisconnectWalletClick)

      if (accounts.length) {
        setAccountAddress(accounts[0])
      }
    }).catch((error) => {
      console.log("No existing Pera wallet session to reconnect")
    })
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

  const handleConnectWalletClick = () => {
    setConnectionStatus("connecting")

    peraWallet
      .connect()
      .then((newAccounts) => {
        // Setup the disconnect event listener
        peraWallet.connector?.on("disconnect", handleDisconnectWalletClick)

        const accountAddress = newAccounts[0]
        setAccountAddress(accountAddress)

        console.log('Pera wallet connected:', accountAddress)

        // Connect to auth system with Pera wallet address
        connectWallet(accountAddress).then(() => {
          setConnectionStatus("connected")

          toast({
            title: "Wallet Connected",
            description: "Your Pera wallet has been connected successfully!",
          })

          // Redirect after success animation
          setTimeout(() => {
            router.replace("/dashboard/user")
          }, 1500)
        }).catch((error) => {
          console.error("Auth connection failed:", error)
          setConnectionStatus("idle")
          toast({
            title: "Authentication Failed",
            description: "Failed to authenticate with the connected wallet.",
            variant: "destructive",
          })
        })
      })
      .catch((error) => {
        // You MUST handle the reject because once the user closes the modal, peraWallet.connect() promise will be rejected.
        setConnectionStatus("idle")
        
        if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
          console.error("Pera wallet connection failed:", error)
          
          let errorMessage = "Failed to connect Pera wallet. Please try again."
          
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
      })
  }

  const handleDisconnectWalletClick = () => {
    peraWallet.disconnect()
    setAccountAddress(null)
    setConnectionStatus("idle")
    
    toast({
      title: "Wallet Disconnected",
      description: "Your Pera wallet has been disconnected.",
    })
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
                      onClick={isConnectedToPeraWallet ? handleDisconnectWalletClick : handleConnectWalletClick}
                      disabled={connectionStatus === "connecting" || loading}
                      className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-full py-3 text-sm font-medium"
                      size="lg"
                    >
                      {connectionStatus === "connecting" ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          CONNECTING...
                        </div>
                      ) : isConnectedToPeraWallet ? (
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
              <p className="mt-4 text-gray-600 dark:text-gray-400">Initializing wallet system...</p>
            </div>
          </div>
        </div>
      </PageTransition>
    )
  }

  return <UserAuthContent />
}
