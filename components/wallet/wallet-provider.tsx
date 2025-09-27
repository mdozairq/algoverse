"use client"

import { WalletProvider as TxnLabWalletProvider, WalletManager, WalletId, NetworkId } from "@txnlab/use-wallet-react"
import { ReactNode, useEffect, useState } from "react"

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isClient, setIsClient] = useState(false)
  const [walletManager, setWalletManager] = useState<WalletManager | null>(null)

  useEffect(() => {
    setIsClient(true)
    
    // Initialize wallet manager
    const manager = new WalletManager({
      wallets: [
        WalletId.PERA,
        // Add other wallets if needed
      ],
      defaultNetwork: NetworkId.TESTNET, // Use MAINNET for production
    })
    
    setWalletManager(manager)
  }, [])

  if (!isClient || !walletManager) {
    return <>{children}</>
  }

  return (
    <TxnLabWalletProvider manager={walletManager}>
      {children}
    </TxnLabWalletProvider>
  )
}
