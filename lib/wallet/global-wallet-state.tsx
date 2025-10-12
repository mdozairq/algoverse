"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { walletService } from './wallet-service'
import { useAuth } from '@/lib/auth/auth-context'

interface GlobalWalletState {
  isConnected: boolean
  isConnecting: boolean
  account: any
  balance: number
  error: string | null
  isAuthenticated: boolean
  user: any
}

const GlobalWalletContext = createContext<GlobalWalletState | undefined>(undefined)

export function GlobalWalletProvider({ children }: { children: React.ReactNode }) {
  const [walletState, setWalletState] = useState({
    isConnected: false,
    isConnecting: false,
    account: null,
    balance: 0,
    error: null
  })
  
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    const unsubscribe = walletService.subscribe(setWalletState)
    
    // Check for existing connection on mount
    walletService.checkConnection()
    
    return unsubscribe
  }, [])

  // Sync wallet and auth state
  useEffect(() => {
    if (walletState.isConnected && walletState.account?.address && !isAuthenticated) {
      // Try to sync with auth if wallet is connected but user is not authenticated
      console.log('Wallet connected but not authenticated, attempting sync...')
    }
  }, [walletState.isConnected, walletState.account?.address, isAuthenticated])

  const value: GlobalWalletState = {
    ...walletState,
    isAuthenticated,
    user
  }

  return (
    <GlobalWalletContext.Provider value={value}>
      {children}
    </GlobalWalletContext.Provider>
  )
}

export function useGlobalWallet() {
  const context = useContext(GlobalWalletContext)
  if (context === undefined) {
    throw new Error('useGlobalWallet must be used within a GlobalWalletProvider')
  }
  return context
}
