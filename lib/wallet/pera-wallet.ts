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
export const disconnectPeraWallet = () => {
  try {
    if (typeof window !== 'undefined' && window.peraWallet) {
      window.peraWallet.disconnect()
    }
  } catch (walletError) {
    console.log("Wallet disconnect error:", walletError)
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