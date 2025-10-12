import { PeraWalletConnect } from "@perawallet/connect"

// Global type declaration for Pera wallet
declare global {
  interface Window {
    peraWallet?: {
      disconnect: () => void
    }
  }
}

// Create the PeraWalletConnect instance
export const peraWallet = new PeraWalletConnect()

// Common wallet disconnect function
export const disconnectPeraWallet = async () => {
  try {
    // Disconnect from Pera Wallet Connect
    await peraWallet.disconnect()
    
    // Also try to disconnect from global window object if available
    if (typeof window !== 'undefined' && window.peraWallet) {
      window.peraWallet.disconnect()
    }
    
    console.log("Pera Wallet disconnected successfully")
  } catch (walletError) {
    console.error("Pera Wallet disconnect error:", walletError)
    // Don't throw error, just log it as disconnect might still work
  }
}

// Check if Pera wallet is available
export const isPeraWalletAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!window.peraWallet
}

// Get the global peraWallet instance
export const getPeraWalletInstance = () => {
  return peraWallet
}