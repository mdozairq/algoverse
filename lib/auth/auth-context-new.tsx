"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { authService } from "@/lib/auth/auth-service"
import { storage } from "@/lib/storage/storage"
import { useWallet, type WalletAccount, type Wallet } from "@txnlab/use-wallet-react"
import { toast } from "@/hooks/use-toast"
import type { AuthState, User } from "@/types/auth"
import { wallet } from "@/lib/wallet/wallet"

interface AuthContextType extends AuthState {
  login: (address?: string) => Promise<void>
  loginAdmin: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  activeAccount: WalletAccount | null
  isWalletReady: boolean
  refreshUser: () => Promise<void>
  connectWallet: () => Promise<void>
  account: WalletAccount | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })
  
  const [isClient, setIsClient] = useState(false)
  
  // Only use wallet hooks on client side
  const walletResult = isClient ? useWallet() : { activeAccount: null, wallets: [], isReady: false, transactionSigner: null }
  const { activeAccount, wallets, isReady, transactionSigner } = walletResult
  const isWalletReady = isReady && !authState.isLoading

  useEffect(() => {
    setIsClient(true)
  }, [])

  const fetchUser = useCallback(async (address: string): Promise<User | null> => {
    try {
      return await authService.authenticateUser(address)
    } catch (error) {
      console.error("Failed to fetch user:", error)
      return null
    }
  }, [])

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedAddress = storage.getAccount()?.address
        if (savedAddress && !activeAccount?.address) {
          const user = await fetchUser(savedAddress)
          if (user) {
            setAuthState({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
            return
          }
        }
        setAuthState(prev => ({ ...prev, isLoading: false }))
      } catch (error) {
        console.error("Initial auth error:", error)
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: "Failed to initialize authentication",
        })
      }
    }

    initializeAuth()
  }, [fetchUser, activeAccount?.address])

  // Handle wallet connection changes
  useEffect(() => {
    const handleWalletChange = async () => {
      if (!isReady) return

      try {
        if (isReady && activeAccount) {
          // Only initialize if not already initialized
          if (!authState.isAuthenticated) {
            // Initialize wallet service
            wallet.setWallet(wallets[0], activeAccount, transactionSigner!);
            
            const user = await fetchUser(activeAccount.address)
            if (user) {
              setAuthState({
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              })
              storage.setAccount({ address: activeAccount.address, balance: 0 })
              
              toast({
                title: "Welcome! 🎉",
                description: `Logged in as ${user.role}`,
              })
            }
          }
        } else if (!isReady && authState.isAuthenticated) {
          setAuthState(prev => ({
            ...prev,
            user: null,
            isAuthenticated: false,
          }))
          storage.setAccount(null)
        }
      } catch (error) {
        console.error("Wallet change error:", error)
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: "Failed to handle wallet connection",
        }))
      }
    }

    handleWalletChange()
  }, [isReady, activeAccount?.address, authState.isAuthenticated, fetchUser, transactionSigner])

  const refreshUser = useCallback(async () => {
    if (!activeAccount?.address) return
    
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      const user = await fetchUser(activeAccount.address)
      if (user) {
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
      }
    } catch (error) {
      console.error("Failed to refresh user:", error)
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: "Failed to refresh user data",
      }))
    }
  }, [activeAccount?.address, fetchUser])

  const loginAdmin = async (username: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      const user = await authService.authenticateAdmin(username, password)
      if (user) {
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })

        toast({
          title: "Admin Login Successful! 🔐",
          description: "Welcome back, Administrator",
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Admin login failed"
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }))
      toast({
        title: "Login Failed",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  }

  const login = async (address?: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      const userAddress = address || activeAccount?.address
      if (!userAddress) {
        throw new Error("No wallet address available")
      }

      const user = await fetchUser(userAddress)
      if (user) {
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
        storage.setAccount({ address: userAddress, balance: 0 })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed"
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }))
      throw error
    }
  }

  const logout = async () => {
    try {
      wallets?.forEach((provider: Wallet) => {
        if (provider.isConnected) {
          provider.disconnect()
        }
      })

      storage.clear()
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      })

      await authService.logout()
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Logout Error",
        description: "There was an issue during logout",
        variant: "destructive",
      })
    }
  }

  const connectWallet = async () => {
    try {
      if (wallets && wallets.length > 0) {
        const wallet = wallets[0]
        if (wallet.connect) {
          await wallet.connect()
        } else {
          throw new Error("Wallet does not support connection")
        }
      } else {
        throw new Error("No wallets available")
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        activeAccount,
        isWalletReady,
        login,
        loginAdmin,
        logout,
        refreshUser,
        connectWallet,
        account: activeAccount,
        loading: authState.isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
