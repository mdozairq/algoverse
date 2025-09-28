"use client"

import { useState, useEffect, useCallback } from 'react'
import { walletService, WalletState, WalletAccount, WalletTransaction } from '@/lib/wallet/wallet-service'

export interface UseWalletReturn {
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

export function useWallet(): UseWalletReturn {
  const [state, setState] = useState<WalletState>(walletService.getState())

  useEffect(() => {
    const unsubscribe = walletService.subscribe(setState)
    
    // Check connection on mount
    walletService.checkConnection()
    
    return unsubscribe
  }, [])

  const connect = useCallback(async (): Promise<WalletAccount> => {
    return walletService.connect()
  }, [])

  const disconnect = useCallback(async (): Promise<void> => {
    return walletService.disconnect()
  }, [])

  const sendTransaction = useCallback(async (
    to: string, 
    amount: number, 
    currency: string = 'ALGO'
  ): Promise<WalletTransaction> => {
    return walletService.sendTransaction(to, amount, currency)
  }, [])

  const signMessage = useCallback(async (message: string): Promise<string> => {
    return walletService.signMessage(message)
  }, [])

  const switchAccount = useCallback(async (): Promise<WalletAccount> => {
    return walletService.switchAccount()
  }, [])

  const refreshBalance = useCallback(async (): Promise<number> => {
    if (!state.account?.address) return 0
    const balance = await walletService.getBalance(state.account.address)
    return balance
  }, [state.account?.address])

  const clearError = useCallback((): void => {
    walletService.clearError()
  }, [])

  const formatAddress = useCallback((address: string, length: number = 6): string => {
    return walletService.formatAddress(address, length)
  }, [])

  const copyToClipboard = useCallback(async (text: string): Promise<void> => {
    return walletService.copyToClipboard(text)
  }, [])

  const getTransactionsByType = useCallback((type: WalletTransaction['type']): WalletTransaction[] => {
    return walletService.getTransactionsByType(type)
  }, [])

  const getRecentTransactions = useCallback((limit: number = 10): WalletTransaction[] => {
    return walletService.getRecentTransactions(limit)
  }, [])

  const isWalletInstalled = useCallback((): boolean => {
    return walletService.isWalletInstalled()
  }, [])

  const getWalletInfo = useCallback(() => {
    return walletService.getWalletInfo()
  }, [])

  return {
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
}
