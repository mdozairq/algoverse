"use client"

import { WalletProvider as TxnLabWalletProvider } from "@txnlab/use-wallet-react"
import { ReactNode, useEffect, useState } from "react"

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <>{children}</>
  }

  const wallets = [
    {
      id: "pera",
      name: "Pera Wallet",
      icon: "https://perawallet.app/favicon.ico",
    },
    {
      id: "defly",
      name: "Defly Wallet",
      icon: "https://defly.app/favicon.ico",
    },
  ]

  return (
    <TxnLabWalletProvider
      value={{
        wallets,
        appMetadata: {
          name: "NFT Marketplace",
          description: "Algorand NFT Marketplace for Events and Tickets",
          url: "https://nft-marketplace.com",
          icon: "https://nft-marketplace.com/icon.png",
        },
        algosdkStatic: undefined,
        algodClient: undefined,
        network: "testnet",
      }}
    >
      {children}
    </TxnLabWalletProvider>
  )
}
