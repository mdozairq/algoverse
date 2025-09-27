// Storage service for managing local storage
interface StoredAccount {
  address: string
  balance: number
}

export const storage = {
  /**
   * Get stored account data
   */
  getAccount(): StoredAccount | null {
    try {
      if (typeof window === 'undefined') return null
      
      const stored = localStorage.getItem('algorand_account')
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('Error getting stored account:', error)
      return null
    }
  },

  /**
   * Set account data
   */
  setAccount(account: StoredAccount | null): void {
    try {
      if (typeof window === 'undefined') return
      
      if (account) {
        localStorage.setItem('algorand_account', JSON.stringify(account))
      } else {
        localStorage.removeItem('algorand_account')
      }
    } catch (error) {
      console.error('Error setting account:', error)
    }
  },

  /**
   * Clear all stored data
   */
  clear(): void {
    try {
      if (typeof window === 'undefined') return
      
      localStorage.removeItem('algorand_account')
      // Clear other wallet-related data
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('wallet_') || key.startsWith('algorand_')) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Error clearing storage:', error)
    }
  }
}
