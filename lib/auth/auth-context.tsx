"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { disconnectPeraWallet } from "@/lib/wallet/pera-wallet"

interface User {
  userId: string
  email: string
  address?: string
  walletAddress?: string
  role: "user" | "merchant" | "admin"
  isVerified: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  connectWallet: (address: string) => Promise<void>
  loginWithEmail: (email: string, password: string, role?: string, adminKey?: string) => Promise<User>
  registerMerchant: (data: any) => Promise<void>
  logout: () => Promise<void>
  disconnectWallet: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const connectWallet = async (address: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/wallet-connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Wallet connection failed")
      }

      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      console.error("Wallet connection failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const loginWithEmail = async (email: string, password: string, role = "user", adminKey?: string) => {
    setLoading(true)
    try {
      // Always logout first to clear any existing session
      await logout()
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role, adminKey }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      setUser(data.user)
      
      // Return the user data so components can handle redirects
      return data.user
    } catch (error) {
      console.error("Email login failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const registerMerchant = async (data: any) => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, role: "merchant" }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Registration failed")
      }
    } catch (error) {
      console.error("Merchant registration failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const disconnectWallet = () => {
    disconnectPeraWallet()
  }

  const logout = async () => {
    try {
      // Disconnect Pera wallet if connected
      disconnectWallet()
      
      // Clear user state immediately for better UX
      setUser(null)
      setLoading(false) // Stop loading state
      
      // Then call logout API to clear server-side session
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout failed:", error)
      // User state is already cleared above
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const value: AuthContextType = {
    user,
    loading,
    connectWallet,
    loginWithEmail,
    registerMerchant,
    logout,
    disconnectWallet,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
