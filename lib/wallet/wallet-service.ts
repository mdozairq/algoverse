import { getPeraWalletInstance, disconnectPeraWallet } from './pera-wallet'
import { Buffer } from 'buffer'
import algosdk from 'algosdk'

export interface WalletAccount {
  address: string
  name?: string
  balance?: number
  isConnected: boolean
}

// ARC-0001/ARC-0025 compliant WalletTransaction interface for signing
export interface WalletTransaction {
  txn: string // base64-encoded unsigned transaction
  signers?: string[] // optional array of signer addresses
  authAddr?: string // optional auth address
  message?: string // optional message
}

// Internal transaction interface for wallet state management
export interface WalletTransactionRecord {
  id: string
  type: 'send' | 'receive' | 'swap' | 'mint' | 'burn'
  amount: number
  currency: string
  from?: string
  to?: string
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: Date
  hash?: string
}

export interface WalletState {
  isConnected: boolean
  isConnecting: boolean
  account: WalletAccount | null
  transactions: WalletTransactionRecord[]
  balance: number
  error: string | null
}

export class WalletService {
  private static instance: WalletService
  private state: WalletState = {
    isConnected: false,
    isConnecting: false,
    account: null,
    transactions: [],
    balance: 0,
    error: null
  }
  private listeners: Set<(state: WalletState) => void> = new Set()

  private constructor() {
    this.initializeWallet()
  }

  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService()
    }
    return WalletService.instance
  }

  private initializeWallet() {
    // Check if wallet is already connected
    this.checkConnection()
    
    // Listen for wallet events
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        // Don't disconnect on page unload, keep connection persistent
        console.log('Page unloading, keeping wallet connection persistent')
      })
      
      // Listen for storage changes (from other tabs)
      window.addEventListener('storage', (e) => {
        if (e.key === 'wallet-connected' || e.key === 'wallet-address') {
          this.checkConnection()
        }
      })
      
      // Listen for focus events to check connection
      window.addEventListener('focus', () => {
        this.checkConnection()
      })
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state))
  }

  private setState(updates: Partial<WalletState>) {
    this.state = { ...this.state, ...updates }
    this.notifyListeners()
  }

  public subscribe(listener: (state: WalletState) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  public getState(): WalletState {
    return { ...this.state }
  }

  public async connect(): Promise<WalletAccount> {
    if (this.state.isConnecting) {
      throw new Error('Wallet connection already in progress')
    }

    this.setState({ isConnecting: true, error: null })

    try {
      // Check if Pera Wallet is installed
      const peraWallet = getPeraWalletInstance()
      if (!peraWallet) {
        throw new Error('Pera Wallet not installed. Please install Pera Wallet from the App Store or Google Play Store.')
      }

      // Connect to Pera Wallet using the official method
      const peraAccount = await peraWallet.connect()
      const address = Array.isArray(peraAccount) ? peraAccount[0] : peraAccount

      if (!address) {
        throw new Error('Failed to get wallet address')
      }

      // Setup disconnect event listener as per Pera Connect docs
      peraWallet.connector?.on("disconnect", () => {
        this.handleDisconnectEvent()
      })

      // Get account balance
      const balance = await this.getBalance(address)

      const account: WalletAccount = {
        address,
        isConnected: true,
        balance
      }

      this.setState({
        isConnected: true,
        isConnecting: false,
        account,
        balance,
        error: null
      })

      // Store connection in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('wallet-connected', 'true')
        localStorage.setItem('wallet-address', address)
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('wallet-connected', { 
          detail: { address, balance } 
        }))
      }

      return account
    } catch (error: any) {
      this.setState({
        isConnecting: false,
        error: error.message || 'Failed to connect wallet'
      })
      throw error
    }
  }

  private handleDisconnectEvent() {
    console.log('Pera Wallet disconnect event received')
    this.clearWalletState()
  }

  private clearWalletState() {
    // Clear wallet state
    this.setState({
      isConnected: false,
      isConnecting: false,
      account: null,
      balance: 0,
      transactions: [],
      error: null
    })

    // Clear localStorage completely
    if (typeof window !== 'undefined') {
      // Remove all wallet-related localStorage items
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (
          key.includes('wallet') || 
          key.includes('pera') || 
          key.includes('connect') ||
          key.includes('address') ||
          key.includes('account')
        )) {
          keysToRemove.push(key)
        }
      }
      
      // Remove all identified keys
      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
      })
      
      // Also clear sessionStorage
      const sessionKeysToRemove = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && (
          key.includes('wallet') || 
          key.includes('pera') || 
          key.includes('connect') ||
          key.includes('address') ||
          key.includes('account')
        )) {
          sessionKeysToRemove.push(key)
        }
      }
      
      sessionKeysToRemove.forEach(key => {
        sessionStorage.removeItem(key)
      })
      
      console.log('Cleared wallet localStorage and sessionStorage')
      
      // Dispatch disconnect event to notify other components
      window.dispatchEvent(new CustomEvent('wallet-disconnected'))
    }
  }

  public async disconnect(): Promise<void> {
    try {
      // Disconnect from Pera Wallet using the official method
      const peraWallet = getPeraWalletInstance()
      if (peraWallet) {
        peraWallet.disconnect()
      }
      
      // Clear wallet state
      this.clearWalletState()
      
      console.log('Wallet disconnected successfully')
    } catch (error: any) {
      console.error('Wallet disconnect error:', error)
      
      // Force clear state even if disconnect fails
      this.clearWalletState()
      
      console.log('Wallet force-disconnected due to error')
    }
  }

  public async checkConnection(): Promise<boolean> {
    try {
      if (typeof window === 'undefined') return false

      const peraWallet = getPeraWalletInstance()
      if (!peraWallet) return false

      // Use Pera Connect's reconnectSession method as per documentation
      try {
        const accounts = await peraWallet.reconnectSession()
        
        if (peraWallet.isConnected && accounts.length > 0) {
          const address = accounts[0]
          const balance = await this.getBalance(address)
          
          // Setup disconnect event listener
          peraWallet.connector?.on("disconnect", () => {
            this.handleDisconnectEvent()
          })
          
          this.setState({
            isConnected: true,
            account: {
              address,
              isConnected: true,
              balance
            },
            balance
          })
          
          // Store connection in localStorage
          localStorage.setItem('wallet-connected', 'true')
          localStorage.setItem('wallet-address', address)
          
          // Dispatch custom event to notify other components
          window.dispatchEvent(new CustomEvent('wallet-connected', { 
            detail: { address, balance } 
          }))
          
          return true
        }
      } catch (reconnectError) {
        console.log('No active session found:', reconnectError)
      }

      return false
    } catch (error) {
      console.error('Error checking wallet connection:', error)
      return false
    }
  }

  public async getBalance(address?: string): Promise<number> {
    try {
      const targetAddress = address || this.state.account?.address
      if (!targetAddress) return 0

      // This would typically call an Algorand API to get the balance
      // For now, returning a mock balance
      return Math.random() * 1000
    } catch (error) {
      console.error('Error getting balance:', error)
      return 0
    }
  }

  public async sendTransaction(
    to: string,
    amount: number,
    currency: string = 'ALGO'
  ): Promise<WalletTransactionRecord> {
    if (!this.state.isConnected || !this.state.account) {
      throw new Error('Wallet not connected')
    }

    const transaction: WalletTransactionRecord = {
      id: Date.now().toString(),
      type: 'send',
      amount,
      currency,
      from: this.state.account.address,
      to,
      status: 'pending',
      timestamp: new Date()
    }

    // Add to transactions list
    this.setState({
      transactions: [transaction, ...this.state.transactions]
    })

    try {
      // This would typically call Pera Wallet to sign and send the transaction
      // For now, simulating the transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      transaction.status = 'confirmed'
      transaction.hash = `0x${Math.random().toString(16).substr(2, 64)}`
      
      // Update transaction in state
      this.setState({
        transactions: this.state.transactions.map(t => 
          t.id === transaction.id ? transaction : t
        )
      })

      return transaction
    } catch (error: any) {
      transaction.status = 'failed'
      
      // Update transaction in state
      this.setState({
        transactions: this.state.transactions.map(t => 
          t.id === transaction.id ? transaction : t
        ),
        error: error.message || 'Transaction failed'
      })
      
      throw error
    }
  }

  public async signMessage(message: string): Promise<string> {
    if (!this.state.isConnected || !this.state.account) {
      throw new Error('Wallet not connected')
    }

    try {
      // This would typically call Pera Wallet to sign the message
      // For now, returning a mock signature
      return `0x${Math.random().toString(16).substr(2, 128)}`
    } catch (error: any) {
      this.setState({ error: error.message || 'Failed to sign message' })
      throw error
    }
  }

  public async signTransactions(transactions: string[]): Promise<string[]> {
    if (!this.state.isConnected || !this.state.account) {
      throw new Error('Wallet not connected')
    }

    try {
      const peraWallet = getPeraWalletInstance()
      const signedTransactions: string[] = []
      
      // Sign each transaction individually
      for (const transaction of transactions) {
        try {
          // Create ARC-compliant WalletTransaction objects
          const walletTransactions: WalletTransaction[] = [{ txn: transaction }]
          
          console.log('Signing transaction with Pera Wallet Connect:', {
            transactionLength: transaction.length,
            walletTransactions
          })
          
          // Use signTransaction method (Pera Wallet Connect API)
          console.log('Pera Wallet instance:', peraWallet)
          console.log('Available methods:', Object.getOwnPropertyNames(peraWallet))
          console.log('signTransaction method:', typeof peraWallet.signTransaction)
          
          if (typeof peraWallet.signTransaction === 'function') {
            console.log('Using signTransaction method (Pera Wallet Connect)')
            
            // Decode the base64 transaction back to algosdk.Transaction
            const txnBytes = Buffer.from(transaction, 'base64')
            const decodedTxn = algosdk.decodeUnsignedTransaction(txnBytes)
            
            // Create the transaction group format that Pera Wallet expects
            const transactionGroup = [{
              txn: decodedTxn,
              signers: [this.state.account?.address].filter(Boolean)
            }]
            
            console.log('Transaction group:', transactionGroup)
            
            // Pera Wallet expects an array of transaction groups
            const signedTxns = await peraWallet.signTransaction([transactionGroup] as any)
            console.log('signTransaction result:', signedTxns)
            
            if (Array.isArray(signedTxns) && signedTxns.length > 0) {
              // Convert Uint8Array to base64 string
              const signedTxnBase64 = Buffer.from(signedTxns[0]).toString('base64')
              signedTransactions.push(signedTxnBase64)
            } else {
              throw new Error('No signed transactions returned from signTransaction')
            }
          } else {
            // If signTransaction is not available, throw an error with helpful message
            console.error('Pera Wallet methods available:', Object.getOwnPropertyNames(peraWallet))
            throw new Error('Pera Wallet signTransaction method not available. Please ensure you are using a compatible version of Pera Wallet.')
          }
        } catch (txnError: any) {
          console.error('Error signing individual transaction:', txnError)
          throw new Error(`Failed to sign transaction: ${txnError.message}`)
        }
      }
      
      return signedTransactions
    } catch (error: any) {
      this.setState({ error: error.message || 'Failed to sign transactions' })
      throw error
    }
  }

  public async switchAccount(): Promise<WalletAccount> {
    if (!this.state.isConnected) {
      throw new Error('Wallet not connected')
    }

    try {
      const peraWallet = getPeraWalletInstance()
      if (!peraWallet) {
        throw new Error('Pera Wallet not available')
      }

      // This would typically call Pera Wallet to switch accounts
      // For now, simulating account switch
      const newAddress = `0x${Math.random().toString(16).substr(2, 40)}`
      const balance = await this.getBalance(newAddress)

      const account: WalletAccount = {
        address: newAddress,
        isConnected: true,
        balance
      }

      this.setState({
        account,
        balance
      })

      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('wallet-address', newAddress)
      }

      return account
    } catch (error: any) {
      this.setState({ error: error.message || 'Failed to switch account' })
      throw error
    }
  }

  public formatAddress(address: string, length: number = 6): string {
    if (!address) return ''
    if (address.length <= length * 2) return address
    return `${address.slice(0, length)}...${address.slice(-length)}`
  }

  public copyToClipboard(text: string): Promise<void> {
    if (typeof window === 'undefined') {
      return Promise.reject(new Error('Clipboard not available'))
    }

    return navigator.clipboard.writeText(text)
  }

  public getTransactionsByType(type: WalletTransactionRecord['type']): WalletTransactionRecord[] {
    return this.state.transactions.filter(t => t.type === type)
  }

  public getRecentTransactions(limit: number = 10): WalletTransactionRecord[] {
    return this.state.transactions
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  public clearError(): void {
    this.setState({ error: null })
  }

  public forceDisconnect(): void {
    // Force clear all wallet state without calling Pera Wallet disconnect
    this.setState({
      isConnected: false,
      isConnecting: false,
      account: null,
      balance: 0,
      transactions: [],
      error: null
    })

    // Use the same comprehensive clearing method
    this.clearWalletState()
    
    console.log('Wallet force-disconnected')
  }

  public async refreshConnection(): Promise<boolean> {
    // Force refresh the connection state
    return await this.checkConnection()
  }

  public clearAllStorage(): void {
    // Completely clear all storage
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
      console.log('Cleared all storage completely')
    }
  }

  public debugStorage(): void {
    // Debug method to see what's in storage
    if (typeof window !== 'undefined') {
      console.log('localStorage contents:')
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          console.log(`${key}: ${localStorage.getItem(key)}`)
        }
      }
      console.log('sessionStorage contents:')
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key) {
          console.log(`${key}: ${sessionStorage.getItem(key)}`)
        }
      }
    }
  }

  public isWalletInstalled(): boolean {
    return !!getPeraWalletInstance()
  }

  public getWalletInfo(): { name: string; version?: string; installed: boolean } {
    const installed = this.isWalletInstalled()
    return {
      name: 'Pera Wallet',
      installed,
      version: installed ? '1.0.0' : undefined
    }
  }
}

// Export singleton instance
export const walletService = WalletService.getInstance()
