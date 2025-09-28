"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { walletService, WalletState, WalletAccount, WalletTransaction } from '@/lib/wallet/wallet-service'

interface WalletContextType {
  // State
  isConnected: boolean
  isConnecting: boolean
  account: WalletAccount | null
  transactions: WalletTransaction[]
  balance: number
  error: string | null

  // Actions
  connect: () => Promise<WalletAccount>
  disconnect: () => Promise<void>
  sendTransaction: (to: string, amount: number, currency?: string) => Promise<WalletTransaction>
  signMessage: (message: string) => Promise<string>
  switchAccount: () => Promise<WalletAccount>
  refreshBalance: () => Promise<number>
  clearError: () => void

  // Utilities
  formatAddress: (address: string, length?: number) => string
  copyToClipboard: (text: string) => Promise<void>
  getTransactionsByType: (type: WalletTransaction['type']) => WalletTransaction[]
  getRecentTransactions: (limit?: number) => WalletTransaction[]
  isWalletInstalled: () => boolean
  getWalletInfo: () => { name: string; version?: string; installed: boolean }
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

interface WalletProviderProps {
  children: React.ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [state, setState] = useState<WalletState>(walletService.getState())

  useEffect(() => {
    const unsubscribe = walletService.subscribe(setState)
    
    // Check connection on mount
    walletService.checkConnection()
    
    return unsubscribe
  }, [])

  const connect = async (): Promise<WalletAccount> => {
    return walletService.connect()
  }

  const disconnect = async (): Promise<void> => {
    return walletService.disconnect()
  }

  const sendTransaction = async (
    to: string, 
    amount: number, 
    currency: string = 'ALGO'
  ): Promise<WalletTransaction> => {
    return walletService.sendTransaction(to, amount, currency)
  }

  const signMessage = async (message: string): Promise<string> => {
    return walletService.signMessage(message)
  }

  const switchAccount = async (): Promise<WalletAccount> => {
    return walletService.switchAccount()
  }

  const refreshBalance = async (): Promise<number> => {
    if (!state.account?.address) return 0
    const balance = await walletService.getBalance(state.account.address)
    return balance
  }

  const clearError = (): void => {
    walletService.clearError()
  }

  const formatAddress = (address: string, length: number = 6): string => {
    return walletService.formatAddress(address, length)
  }

  const copyToClipboard = async (text: string): Promise<void> => {
    return walletService.copyToClipboard(text)
  }

  const getTransactionsByType = (type: WalletTransaction['type']): WalletTransaction[] => {
    return walletService.getTransactionsByType(type)
  }

  const getRecentTransactions = (limit: number = 10): WalletTransaction[] => {
    return walletService.getRecentTransactions(limit)
  }

  const isWalletInstalled = (): boolean => {
    return walletService.isWalletInstalled()
  }

  const getWalletInfo = () => {
    return walletService.getWalletInfo()
  }

  const value: WalletContextType = {
    // State
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    account: state.account,
    transactions: state.transactions,
    balance: state.balance,
    error: state.error,

    // Actions
    connect,
    disconnect,
    sendTransaction,
    signMessage,
    switchAccount,
    refreshBalance,
    clearError,

    // Utilities
    formatAddress,
    copyToClipboard,
    getTransactionsByType,
    getRecentTransactions,
    isWalletInstalled,
    getWalletInfo
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWalletContext(): WalletContextType {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider')
  }
  return context
}