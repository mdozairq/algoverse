"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { SimpleWalletService, WalletAccount, WalletAsset } from './wallet-simple'

export interface Transaction {
  id: string
  type: 'send' | 'receive' | 'swap' | 'mint' | 'burn'
  amount: number
  assetId?: number
  assetName?: string
  from: string
  to: string
  timestamp: Date
  status: 'pending' | 'confirmed' | 'failed'
  fee: number
  note?: string
}

export interface WalletSettings {
  autoApprove: boolean
  defaultSlippage: number
  theme: 'light' | 'dark' | 'auto'
  notifications: {
    transactions: boolean
    priceAlerts: boolean
    security: boolean
  }
  security: {
    requirePassword: boolean
    sessionTimeout: number
    twoFactor: boolean
  }
}

interface WalletContextType {
  // Account management
  currentAccount: WalletAccount | null
  accounts: WalletAccount[]
  isConnected: boolean
  isLoading: boolean
  
  // Wallet operations
  connectWallet: (account: WalletAccount) => Promise<void>
  disconnectWallet: () => void
  createWallet: (name?: string) => WalletAccount
  importWallet: (mnemonic: string, name?: string) => WalletAccount
  refreshWallet: () => Promise<void>
  
  // Transactions
  sendAlgo: (to: string, amount: number, note?: string) => Promise<{ transactionId: string }>
  sendAsset: (assetId: number, to: string, amount: number, note?: string) => Promise<{ transactionId: string }>
  optInToAsset: (assetId: number) => Promise<{ transactionId: string }>
  getTransactionHistory: (limit?: number) => Promise<Transaction[]>
  
  // Account data
  getBalance: () => Promise<number>
  getAssets: () => WalletAsset[]
  getAsset: (assetId: number) => WalletAsset | null
  
  // Settings
  settings: WalletSettings
  updateSettings: (settings: Partial<WalletSettings>) => void
  
  // Utility functions
  isValidAddress: (address: string) => boolean
  formatAddress: (address: string, length?: number) => string
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [currentAccount, setCurrentAccount] = useState<WalletAccount | null>(null)
  const [accounts, setAccounts] = useState<WalletAccount[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<WalletSettings>({
    autoApprove: false,
    defaultSlippage: 0.5,
    theme: 'auto',
    notifications: {
      transactions: true,
      priceAlerts: true,
      security: true
    },
    security: {
      requirePassword: true,
      sessionTimeout: 30, // minutes
      twoFactor: false
    }
  })

  const walletService = SimpleWalletService

  // Load saved accounts on mount
  useEffect(() => {
    loadSavedAccounts()
  }, [])

  const loadSavedAccounts = async () => {
    try {
      setIsLoading(true)
      // Load from localStorage
      const savedWallets: WalletAccount[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('wallet_')) {
          const walletData = localStorage.getItem(key)
          if (walletData) {
            try {
              const account = JSON.parse(walletData)
              // Validate account data
              if (account && typeof account.address === 'string' && account.address.length > 0) {
                savedWallets.push(account)
              } else {
                console.warn('Invalid wallet data found, skipping:', key)
                // Remove invalid data
                localStorage.removeItem(key)
              }
            } catch (parseError) {
              console.warn('Failed to parse wallet data, removing:', key, parseError)
              localStorage.removeItem(key)
            }
          }
        }
      }
      setAccounts(savedWallets)
      
      // Try to restore last connected account
      const lastConnected = localStorage.getItem('lastConnectedWallet')
      if (lastConnected) {
        const account = savedWallets.find(acc => acc.address === lastConnected)
        if (account) {
          await connectWallet(account)
        }
      }
    } catch (error) {
      console.error('Error loading saved accounts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const connectWallet = async (account: WalletAccount) => {
    try {
      setIsLoading(true)
      
      // Validate account data
      if (!account || typeof account.address !== 'string' || account.address.length === 0) {
        throw new Error('Invalid account data')
      }
      
      // Load account data from blockchain
      const [balance, assets] = await Promise.all([
        SimpleWalletService.getBalance(account.address),
        SimpleWalletService.getAssets(account.address)
      ])
      
      const connectedAccount = {
        ...account,
        balance,
        assets,
        isConnected: true
      }
      
      setCurrentAccount(connectedAccount)
      setAccounts(prev => {
        const existing = prev.find(acc => acc.address === account.address)
        if (existing) {
          return prev.map(acc => acc.address === account.address ? connectedAccount : acc)
        }
        return [...prev, connectedAccount]
      })
      
      // Save to localStorage
      localStorage.setItem(`wallet_${account.address}`, JSON.stringify(connectedAccount))
      localStorage.setItem('lastConnectedWallet', account.address)
    } catch (error) {
      console.error('Error connecting wallet:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = () => {
    setCurrentAccount(null)
    localStorage.removeItem('lastConnectedWallet')
  }

  const createWallet = (name?: string): WalletAccount => {
    const account = SimpleWalletService.generateAccount(name)
    setAccounts(prev => [...prev, account])
    return account
  }

  const importWallet = (mnemonic: string, name?: string): WalletAccount => {
    const account = SimpleWalletService.importFromMnemonic(mnemonic, name)
    setAccounts(prev => [...prev, account])
    return account
  }

  const refreshWallet = async () => {
    if (!currentAccount) return
    
    try {
      setIsLoading(true)
      const [balance, assets] = await Promise.all([
        SimpleWalletService.getBalance(currentAccount.address),
        SimpleWalletService.getAssets(currentAccount.address)
      ])
      
      const updatedAccount = {
        ...currentAccount,
        balance,
        assets
      }
      
      setCurrentAccount(updatedAccount)
      setAccounts(prev => 
        prev.map(acc => acc.address === updatedAccount.address ? updatedAccount : acc)
      )
      
      // Update localStorage
      localStorage.setItem(`wallet_${currentAccount.address}`, JSON.stringify(updatedAccount))
    } catch (error) {
      console.error('Error refreshing wallet:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendAlgo = async (to: string, amount: number, note?: string) => {
    if (!currentAccount?.privateKey) throw new Error('No wallet connected')
    
    const response = await fetch('/api/wallet/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        amount,
        note,
        privateKey: Buffer.from(currentAccount.privateKey).toString('base64')
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to send ALGO')
    }
    
    return response.json()
  }

  const sendAsset = async (assetId: number, to: string, amount: number, note?: string) => {
    if (!currentAccount?.privateKey) throw new Error('No wallet connected')
    
    const response = await fetch('/api/wallet/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        amount,
        assetId,
        note,
        privateKey: Buffer.from(currentAccount.privateKey).toString('base64')
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to send asset')
    }
    
    return response.json()
  }

  const optInToAsset = async (assetId: number) => {
    if (!currentAccount?.privateKey) throw new Error('No wallet connected')
    
    const response = await fetch('/api/wallet/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: currentAccount.address,
        amount: 0,
        assetId,
        privateKey: Buffer.from(currentAccount.privateKey).toString('base64')
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to opt-in to asset')
    }
    
    return response.json()
  }

  const getTransactionHistory = async (limit = 50) => {
    if (!currentAccount) return []
    
    const response = await fetch(`/api/wallet/transactions?address=${currentAccount.address}&limit=${limit}`)
    if (!response.ok) {
      console.error('Failed to fetch transactions')
      return []
    }
    
    const data = await response.json()
    return data.transactions || []
  }

  const getBalance = async () => {
    if (!currentAccount) return 0
    
    const response = await fetch(`/api/wallet/balance?address=${currentAccount.address}`)
    if (!response.ok) {
      console.error('Failed to fetch balance')
      return 0
    }
    
    const data = await response.json()
    return data.balance || 0
  }

  const getAssets = (): WalletAsset[] => {
    return currentAccount?.assets || []
  }

  const getAsset = (assetId: number): WalletAsset | null => {
    return currentAccount?.assets.find(asset => asset.assetId === assetId) || null
  }

  const updateSettings = (newSettings: Partial<WalletSettings>) => {
    setSettings((prev: WalletSettings) => ({ ...prev, ...newSettings }))
    localStorage.setItem('walletSettings', JSON.stringify({ ...settings, ...newSettings }))
  }

  const isValidAddress = (address: string): boolean => {
    return SimpleWalletService.isValidAddress(address)
  }

  const formatAddress = (address: string, length = 8): string => {
    return SimpleWalletService.formatAddress(address, length)
  }

  const value: WalletContextType = {
    currentAccount,
    accounts,
    isConnected: !!currentAccount?.isConnected,
    isLoading,
    connectWallet,
    disconnectWallet,
    createWallet,
    importWallet,
    refreshWallet,
    sendAlgo,
    sendAsset,
    optInToAsset,
    getTransactionHistory,
    getBalance,
    getAssets,
    getAsset,
    settings,
    updateSettings,
    isValidAddress,
    formatAddress
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
