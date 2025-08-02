"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  email?: string
  walletAddress?: string
  role: "user" | "merchant" | "admin"
  name?: string
  isVerified?: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  connectWallet: (address: string) => Promise<void>
  loginWithEmail: (email: string, password: string, role?: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const connectWallet = async (address: string) => {
    setLoading(true)
    try {
      // Simulate wallet connection delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockUser: User = {
        id: Math.random().toString(36).substring(7),
        walletAddress: address,
        role: "user",
        isVerified: true,
      }

      setUser(mockUser)
      localStorage.setItem("eventnft_user", JSON.stringify(mockUser))
    } catch (error) {
      console.error("Wallet connection failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const loginWithEmail = async (email: string, password: string, role = "user") => {
    setLoading(true)
    try {
      // Simulate login delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockUser: User = {
        id: Math.random().toString(36).substring(7),
        email,
        role: role as "user" | "merchant" | "admin",
        name: email.split("@")[0],
        isVerified: role === "admin" || role === "merchant",
      }

      setUser(mockUser)
      localStorage.setItem("eventnft_user", JSON.stringify(mockUser))
    } catch (error) {
      console.error("Email login failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("eventnft_user")
  }

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("eventnft_user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error("Failed to parse saved user:", error)
        localStorage.removeItem("eventnft_user")
      }
    }
  }, [])

  const value: AuthContextType = {
    user,
    loading,
    connectWallet,
    loginWithEmail,
    logout,
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
