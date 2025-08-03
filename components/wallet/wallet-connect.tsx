"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, Smartphone, Globe, Check, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
import { useRouter } from "next/navigation"

interface WalletOption {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  color: string
}

const walletOptions: WalletOption[] = [
  {
    id: "pera",
    name: "Pera Wallet",
    icon: <Smartphone className="h-6 w-6" />,
    description: "Mobile-first Algorand wallet",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "myalgo",
    name: "MyAlgo Wallet",
    icon: <Wallet className="h-6 w-6" />,
    description: "Web-based Algorand wallet",
    color: "from-green-500 to-green-600",
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    icon: <Globe className="h-6 w-6" />,
    description: "Connect any compatible wallet",
    color: "from-purple-500 to-purple-600",
  },
]

export function WalletConnect() {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected">("idle")
  const { connectWallet, loading } = useAuth()
  const router = useRouter()

  const handleConnect = async (walletId: string) => {
    setSelectedWallet(walletId)
    setConnectionStatus("connecting")

    try {
      // Generate a mock wallet address
      const mockAddress = `ALGO${Math.random().toString(36).substring(2, 15).toUpperCase()}`

      await connectWallet(mockAddress)

      setConnectionStatus("connected")

      // Redirect after success animation
      setTimeout(() => {
        router.push("/user/dashboard")
      }, 1500)
    } catch (error) {
      console.error("Wallet connection failed:", error)
      setConnectionStatus("idle")
      setSelectedWallet(null)
    }
  }

  return (
          <div className="space-y-4 sm:space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Connect Your Wallet</h2>
          <p className="text-sm sm:text-base text-gray-400">Choose your preferred Algorand wallet to get started</p>
        </div>

      <div className="grid gap-4">
        <AnimatePresence mode="wait">
          {walletOptions.map((wallet) => (
            <motion.div
              key={wallet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg bg-gray-700 border-gray-600 ${
                  selectedWallet === wallet.id ? "ring-2 ring-white" : ""
                }`}
                onClick={() => !loading && connectionStatus === "idle" && handleConnect(wallet.id)}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className={`p-2 sm:p-3 rounded-lg bg-gradient-to-r ${wallet.color} text-white`}>{wallet.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-sm sm:text-base font-semibold text-white">{wallet.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-400">{wallet.description}</p>
                    </div>
                    <div className="flex items-center">
                      {selectedWallet === wallet.id && connectionStatus === "connecting" && (
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                      )}
                      {selectedWallet === wallet.id && connectionStatus === "connected" && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <Check className="h-5 w-5 text-green-400" />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {connectionStatus === "connecting" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-2">
          <p className="text-sm text-gray-400">
            Connecting to {walletOptions.find((w) => w.id === selectedWallet)?.name}...
          </p>
          <div className="flex justify-center">
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {connectionStatus === "connected" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-2"
        >
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center"
            >
              <Check className="h-6 w-6 text-white" />
            </motion.div>
          </div>
          <p className="text-green-400 font-medium">Wallet Connected Successfully!</p>
          <p className="text-sm text-gray-400">Redirecting to dashboard...</p>
        </motion.div>
      )}
    </div>
  )
}
