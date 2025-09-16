// Pera Wallet Integration
// This is a mock implementation for demonstration purposes
// In a real implementation, you would use the actual Pera Wallet SDK

import algosdk from 'algosdk'

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

  static getInstance(): PeraWalletService {
    if (!PeraWalletService.instance) {
      PeraWalletService.instance = new PeraWalletService()
    }
    return PeraWalletService.instance
  }

  /**
   * Check if Pera Wallet is installed
   */
  static isInstalled(): boolean {
    // In a real implementation, check if window.algorand exists
    return typeof window !== 'undefined' && !!(window as any).algorand
  }

  /**
   * Connect to Pera Wallet
   */
  async connect(): Promise<PeraWalletAccount> {
    return new Promise((resolve, reject) => {
      // Simulate Pera Wallet connection
      setTimeout(() => {
        if (PeraWalletService.isInstalled()) {
          // Generate a proper Algorand address for mock purposes
          const account = algosdk.generateAccount()
          const mockAccount: PeraWalletAccount = {
            address: account.addr.toString(),
            name: 'Pera Wallet',
            type: 'pera',
            isConnected: true,
            balance: Math.random() * 100, // Mock balance
            assets: []
          }
          
          this.currentAccount = mockAccount
          resolve(mockAccount)
        } else {
          reject(new Error('Pera Wallet not installed'))
        }
      }, 1000)
    })
  }

  /**
   * Disconnect from Pera Wallet
   */
  disconnect(): void {
    this.currentAccount = null
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
    return this.currentAccount.balance
  }

  /**
   * Get account assets
   */
  async getAssets(): Promise<any[]> {
    if (!this.currentAccount) return []
    
    // In a real implementation, fetch from Algorand network
    return this.currentAccount.assets
  }

  /**
   * Sign transaction
   */
  async signTransaction(transaction: any): Promise<any> {
    if (!this.currentAccount) {
      throw new Error('No wallet connected')
    }

    // In a real implementation, use Pera Wallet SDK to sign
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

    // In a real implementation, submit to Algorand network
    const txId = `pera_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    return txId
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
