"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Store, Mail, Lock, Wallet, Check, Smartphone } from "lucide-react"
import { PageTransition, FadeIn, ScaleIn } from "@/components/animations/page-transition"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { getPeraWalletInstance } from "@/lib/wallet/pera-wallet"

type LoginStep = 'credentials' | 'wallet'

export default function MerchantLoginPage() {
  const router = useRouter()
  const { loginWithEmail, connectWallet, loading, logout } = useAuth()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState<LoginStep>('credentials')
  const [walletConnecting, setWalletConnecting] = useState(false)
  const [authenticatedUser, setAuthenticatedUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

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

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
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

      const user = await loginWithEmail(formData.email, formData.password, "merchant")
      setAuthenticatedUser(user)
      setCurrentStep('wallet')
      
      toast({
        title: "Step 1 Complete",
        description: "Credentials verified! Now connect your Pera wallet.",
      })
    } catch (error: any) {
      let errorMessage = "Invalid credentials"
      
      if (error.message) {
        if (error.message.includes("User not found")) {
          errorMessage = "No merchant account found with this email address"
        } else if (error.message.includes("Invalid password")) {
          errorMessage = "Incorrect password. Please try again"
        } else if (error.message.includes("Merchant account not yet approved")) {
          errorMessage = "Your merchant account is pending approval. Please wait for admin approval"
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

  const handleWalletConnect = async () => {
    setWalletConnecting(true)
    
    try {
      // Check if Pera Wallet is installed
      if (!getPeraWalletInstance()) {
        throw new Error("Pera Wallet not installed. Please install Pera Wallet from the App Store or Google Play Store.")
      }

      // Connect to Pera Wallet
      const peraWallet = getPeraWalletInstance()
      const peraAccount = await peraWallet.connect()
      
      const address = Array.isArray(peraAccount) ? peraAccount[0] : peraAccount

      // Connect wallet to auth system
      await connectWallet(address)

      toast({
        title: "Login Complete",
        description: "Welcome back, Merchant! Your wallet is connected.",
      })

      // Redirect to merchant dashboard
      setTimeout(() => {
        router.replace(`/dashboard/${authenticatedUser.role}`)
      }, 1500)
    } catch (error: any) {
      console.error("Pera wallet connection failed:", error)
      
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
    } finally {
      setWalletConnecting(false)
    }
  }

  const handleBackToCredentials = () => {
    setCurrentStep('credentials')
    setAuthenticatedUser(null)
  }

  const renderCredentialsStep = () => (
    <form onSubmit={handleCredentialsSubmit} className="space-y-6">
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
          {loading ? "VERIFYING..." : "VERIFY CREDENTIALS"}
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
            href="/auth/merchant/signup"
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
  )

  const renderWalletStep = () => (
    <div className="space-y-6">
      {/* Success indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center"
      >
        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Credentials Verified!
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Welcome back, {authenticatedUser?.email}
        </p>
      </motion.div>

      {/* Wallet connection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="space-y-4"
      >
        <div className="text-center">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
            Step 2: Connect Your Pera Wallet
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Connect your Pera wallet to complete the secure login process
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <h5 className="font-semibold">Pera Wallet</h5>
              <p className="text-sm text-blue-100">Mobile-first Algorand wallet</p>
            </div>
          </div>
          
          <Button
            onClick={handleWalletConnect}
            disabled={walletConnecting}
            className="w-full bg-white text-blue-600 hover:bg-blue-50 rounded-full py-3 text-sm font-medium"
            size="lg"
          >
            {walletConnecting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>CONNECTING...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Wallet className="h-4 w-4" />
                <span>CONNECT PERA WALLET</span>
              </div>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Back button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="text-center"
      >
        <Button
          variant="ghost"
          onClick={handleBackToCredentials}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          ← Back to credentials
        </Button>
      </motion.div>

      {/* Security notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="bg-green-900/20 border border-green-700 rounded-lg p-4"
      >
        <p className="text-xs text-green-300 text-center">
          🔐 Two-step authentication provides enhanced security for your merchant account.
        </p>
      </motion.div>
    </div>
  )

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
              <p className="text-gray-600 dark:text-gray-400">
                {currentStep === 'credentials' 
                  ? 'Access your merchant dashboard' 
                  : 'Complete secure authentication'
                }
              </p>
              
              {/* Step indicator */}
              <div className="flex items-center justify-center space-x-2 mt-4">
                <div className={`w-3 h-3 rounded-full ${currentStep === 'credentials' ? 'bg-blue-600' : 'bg-green-600'}`} />
                <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600" />
                <div className={`w-3 h-3 rounded-full ${currentStep === 'wallet' ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`} />
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <Card className="border-0 shadow-lg rounded-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                {currentStep === 'credentials' ? renderCredentialsStep() : renderWalletStep()}
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  )
}