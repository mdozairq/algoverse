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
  loginWithEmail: (email: string, password: string, role?: string, adminKey?: string) => Promise<void>
  registerMerchant: (data: any) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  // Function to get cookie value by name
  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return cookieValue || null;
    }
    return null;
  };

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
      // Set cookie for middleware
      document.cookie = `eventnft_user=${JSON.stringify(mockUser)}; path=/; max-age=86400`
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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role, adminKey }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      const userData = data.user
      const user: User = {
        id: userData.uid,
        email: userData.email,
        walletAddress: userData.walletAddress,
        role: userData.role,
        name: userData.displayName || userData.businessName,
        isVerified: userData.verified || userData.role === "admin",
      }

      setUser(user)
      localStorage.setItem("eventnft_user", JSON.stringify(user))
      // Set cookie for middleware
      document.cookie = `eventnft_user=${JSON.stringify(user)}; path=/; max-age=86400`
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          role: "merchant",
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Registration failed")
      }

      // Don't automatically log in after registration
      // User will need to wait for admin approval
    } catch (error) {
      console.error("Merchant registration failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("eventnft_user")
    // Remove cookie for middleware
    document.cookie = "eventnft_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  }

  // Check for existing session on mount - from both localStorage and cookies
  useEffect(() => {
    const initializeAuth = () => {
      setLoading(true);
      
      // First check localStorage
      const savedUser = localStorage.getItem("eventnft_user");
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setLoading(false);
          return;
        } catch (error) {
          console.error("Failed to parse saved user from localStorage:", error);
          localStorage.removeItem("eventnft_user");
        }
      }
      
      // If not in localStorage, check cookies (for SSR compatibility)
      const userCookie = getCookie("eventnft_user");
      if (userCookie) {
        try {
          const parsedUser = JSON.parse(decodeURIComponent(userCookie));
          setUser(parsedUser);
          // Also save to localStorage for future use
          localStorage.setItem("eventnft_user", JSON.stringify(parsedUser));
        } catch (error) {
          console.error("Failed to parse user from cookie:", error);
          // Clean up invalid cookie
          document.cookie = "eventnft_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Sync authentication state between tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "eventnft_user") {
        if (e.newValue) {
          try {
            setUser(JSON.parse(e.newValue));
          } catch (error) {
            console.error("Failed to parse user from storage event:", error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Check if user cookie exists and is valid to determine authentication status
  const isAuthenticated = () => {
    // First check our state
    if (user) return true;
    
    // If no user in state, check cookie (for edge cases)
    const userCookie = getCookie("eventnft_user");
    if (userCookie) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userCookie));
        // Update state if we found a valid cookie
        if (!user) {
          setUser(parsedUser);
          localStorage.setItem("eventnft_user", JSON.stringify(parsedUser));
        }
        return true;
      } catch (error) {
        console.error("Invalid user cookie:", error);
        return false;
      }
    }
    
    return false;
  };

  const value: AuthContextType = {
    user,
    loading,
    connectWallet,
    loginWithEmail,
    registerMerchant,
    logout,
    isAuthenticated: isAuthenticated(),
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