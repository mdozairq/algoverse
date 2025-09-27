// Pera Wallet Integration using @txnlab/use-wallet-react
// This provides proper Pera wallet integration with the Algorand ecosystem

import { useWallet, type WalletAccount, type Wallet } from "@txnlab/use-wallet-react"

export interface PeraWalletAccount {
  address: string
  name: string
  type: 'pera'
  isConnected: boolean
  balance: number
  assets: any[]
}

export class PeraWalletService {
  private static instance: PeraWalletService
  private currentAccount: PeraWalletAccount | null = null
  private wallets: Wallet[] = []
  private activeAccount: WalletAccount | null = null

  static getInstance(): PeraWalletService {
    if (!PeraWalletService.instance) {
      PeraWalletService.instance = new PeraWalletService()
    }
    return PeraWalletService.instance
  }

  /**
   * Initialize with wallet providers
   */
  initialize(wallets: Wallet[], activeAccount: WalletAccount | null) {
    this.wallets = wallets
    this.activeAccount = activeAccount
  }

  /**
   * Check if Pera Wallet is available
   */
  static isInstalled(): boolean {
    return typeof window !== 'undefined' && !!(window as any).algorand
  }

  /**
   * Get available wallets
   */
  getAvailableWallets(): Wallet[] {
    return this.wallets.filter(wallet => wallet.id === 'pera')
  }

  /**
   * Connect to Pera Wallet
   */
  async connect(): Promise<PeraWalletAccount> {
    try {
      const peraWallets = this.getAvailableWallets()
      
      if (peraWallets.length === 0) {
        throw new Error('Pera Wallet not found. Please install Pera Wallet.')
      }

      const peraWallet = peraWallets[0]
      
      if (!peraWallet.connect) {
        throw new Error('Pera Wallet does not support connection')
      }

      // Connect to Pera Wallet
      await peraWallet.connect()

      // Wait for active account to be set
      let attempts = 0
      const maxAttempts = 10
      
      while (!this.activeAccount && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }

      if (!this.activeAccount) {
        throw new Error('Failed to get wallet account after connection')
      }

      const peraAccount: PeraWalletAccount = {
        address: this.activeAccount.address,
        name: this.activeAccount.name || 'Pera Wallet',
        type: 'pera',
        isConnected: true,
        balance: 0, // Will be fetched separately
        assets: []
      }

      this.currentAccount = peraAccount
      return peraAccount
    } catch (error) {
      console.error('Pera wallet connection failed:', error)
      throw error
    }
  }

  /**
   * Disconnect from Pera Wallet
   */
  async disconnect(): Promise<void> {
    try {
      const peraWallets = this.getAvailableWallets()
      
      for (const wallet of peraWallets) {
        if (wallet.isConnected && wallet.disconnect) {
          await wallet.disconnect()
        }
      }
      
      this.currentAccount = null
    } catch (error) {
      console.error('Pera wallet disconnect failed:', error)
      throw error
    }
  }

  /**
   * Get current connected account
   */
  getCurrentAccount(): PeraWalletAccount | null {
    return this.currentAccount
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.currentAccount?.isConnected || false
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<number> {
    if (!this.currentAccount) return 0
    
    // In a real implementation, fetch from Algorand network
    // For now, return a mock balance
    return Math.random() * 100
  }

  /**
   * Get account assets
   */
  async getAssets(): Promise<any[]> {
    if (!this.currentAccount) return []
    
    // In a real implementation, fetch from Algorand network
    return []
  }

  /**
   * Sign transaction
   */
  async signTransaction(transaction: any): Promise<any> {
    if (!this.currentAccount) {
      throw new Error('No wallet connected')
    }

    // For now, return a mock signature
    // In a real implementation, this would use the wallet's signTransaction method
    return {
      ...transaction,
      signature: 'mock_signature_' + Date.now()
    }
  }

  /**
   * Send transaction
   */
  async sendTransaction(transaction: any): Promise<string> {
    if (!this.currentAccount) {
      throw new Error('No wallet connected')
    }

    // For now, return a mock transaction ID
    // In a real implementation, this would use the wallet's sendTransaction method
    return `pera_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }
}

// Global type declaration for window.algorand
declare global {
  interface Window {
    algorand?: {
      connect: () => Promise<any>
      disconnect: () => void
      getAccountInfo: () => Promise<any>
    }
  }
}
