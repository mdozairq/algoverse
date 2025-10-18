"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { walletService } from "@/lib/wallet/wallet-service"
import { Merchant } from "../firebase/collections"

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
  connectWallet: (address: string, role: string, merchantData?: Merchant) => Promise<void>
  loginWithEmail: (email: string, password: string, role?: string, adminKey?: string) => Promise<User>
  registerMerchant: (data: any) => Promise<void>
  logout: () => Promise<void>
  disconnectWallet: () => Promise<void>
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

  const connectWallet = async (address: string, role: string = "user", merchantData?: Merchant) => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/wallet-connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, role, merchantData }),
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

  const disconnectWallet = async () => {
    try {
      // Disconnect from wallet service (this will call Pera Connect disconnect)
      await walletService.disconnect()
      
      // Clear user state immediately
      setUser(null)
      
      // Also clear any auth-related localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token')
        localStorage.removeItem('user-data')
        localStorage.removeItem('auth-session')
        // Clear any other auth-related storage
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (
            key.includes('auth') || 
            key.includes('user') || 
            key.includes('session') ||
            key.includes('token')
          )) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
      }
      
      console.log("Wallet disconnected and user state cleared")
    } catch (error) {
      console.error("Wallet disconnect failed:", error)
      // Even if wallet disconnect fails, clear user state
      setUser(null)
      
      // Force clear auth localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token')
        localStorage.removeItem('user-data')
        localStorage.removeItem('auth-session')
      }
    }
  }

  const logout = async () => {
    try {
      // Disconnect wallet if connected
      await disconnectWallet()
      console.log("wallet disconnected");
      
      // Clear user state immediately for better UX
      setUser(null)
      setLoading(false) // Stop loading state
      
      // Clear all localStorage completely
      if (typeof window !== 'undefined') {
        // Clear all localStorage items
        localStorage.clear()
        // Also clear sessionStorage
        sessionStorage.clear()
        console.log("Cleared all localStorage and sessionStorage")
      }
      
      // Then call logout API to clear server-side session
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout failed:", error)
      // Even if logout fails, clear user state for security
      setUser(null)
      setLoading(false)
      
      // Force clear all storage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
    }
  }

  useEffect(() => {
    checkAuth()
    
    // Listen for wallet disconnect events
    const handleWalletDisconnected = () => {
      console.log("Wallet disconnect event received in auth context")
      setUser(null)
    }

    window.addEventListener('wallet-disconnected', handleWalletDisconnected as EventListener)
    
    return () => {
      window.removeEventListener('wallet-disconnected', handleWalletDisconnected as EventListener)
    }
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
