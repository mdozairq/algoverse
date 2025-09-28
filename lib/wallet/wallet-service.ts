import { getPeraWalletInstance, disconnectPeraWallet } from './pera-wallet'

export interface WalletAccount {
  address: string
  name?: string
  balance?: number
  isConnected: boolean
}

export interface WalletTransaction {
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
  transactions: WalletTransaction[]
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
        this.disconnect()
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

      // Connect to Pera Wallet
      const peraAccount = await peraWallet.connect()
      const address = Array.isArray(peraAccount) ? peraAccount[0] : peraAccount

      if (!address) {
        throw new Error('Failed to get wallet address')
      }

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

  public async disconnect(): Promise<void> {
    try {
      await disconnectPeraWallet()
      
      this.setState({
        isConnected: false,
        account: null,
        balance: 0,
        transactions: [],
        error: null
      })

      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('wallet-connected')
        localStorage.removeItem('wallet-address')
      }
    } catch (error: any) {
      this.setState({
        error: error.message || 'Failed to disconnect wallet'
      })
      throw error
    }
  }

  public async checkConnection(): Promise<boolean> {
    try {
      if (typeof window === 'undefined') return false

      const isConnected = localStorage.getItem('wallet-connected') === 'true'
      const address = localStorage.getItem('wallet-address')

      if (isConnected && address) {
        const balance = await this.getBalance(address)
        
        this.setState({
          isConnected: true,
          account: {
            address,
            isConnected: true,
            balance
          },
          balance
        })
        return true
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
  ): Promise<WalletTransaction> {
    if (!this.state.isConnected || !this.state.account) {
      throw new Error('Wallet not connected')
    }

    const transaction: WalletTransaction = {
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

  public getTransactionsByType(type: WalletTransaction['type']): WalletTransaction[] {
    return this.state.transactions.filter(t => t.type === type)
  }

  public getRecentTransactions(limit: number = 10): WalletTransaction[] {
    return this.state.transactions
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  public clearError(): void {
    this.setState({ error: null })
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
