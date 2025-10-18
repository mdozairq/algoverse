import { PeraWalletConnect } from "@perawallet/connect"

// Create the PeraWalletConnect instance with proper configuration
export const peraWallet = new PeraWalletConnect({
  shouldShowSignTxnToast: true
})

// Common wallet disconnect function following Pera Connect documentation
export const disconnectPeraWallet = async () => {
  try {
    // Disconnect from Pera Wallet Connect using the official method
    peraWallet.disconnect()
    
    console.log("Pera Wallet disconnected successfully")
  } catch (walletError) {
    console.error("Pera Wallet disconnect error:", walletError)
    // Don't throw error, just log it as disconnect might still work
  }
}

// Check if Pera wallet is available
export const isPeraWalletAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!(window as any).peraWallet
}

// Get the global peraWallet instance
export const getPeraWalletInstance = () => {
  return peraWallet
}