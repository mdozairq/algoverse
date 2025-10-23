"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, ExternalLink, Copy, CheckCircle2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AlgorandWalletConnectProps {
  onWalletConnected?: (address: string) => void
  onWalletDisconnected?: () => void
  connectedAddress?: string | null
}

export function AlgorandWalletConnect({ 
  onWalletConnected, 
  onWalletDisconnected,
  connectedAddress 
}: AlgorandWalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(connectedAddress || null)
  const [walletName, setWalletName] = useState<string | null>(null)
  const { toast } = useToast()

  // Check if we're in browser environment
  const isBrowser = typeof window !== 'undefined'

  // Check for available wallets
  const getAvailableWallets = () => {
    if (!isBrowser) return []
    
    const wallets = []
    
    // Check for Pera Wallet
    if (window.algorand && window.algorand.isPeraWallet) {
      wallets.push({ name: 'Pera Wallet', id: 'pera' })
    }
    
    // Check for MyAlgo Wallet
    if (window.myAlgo) {
      wallets.push({ name: 'MyAlgo Wallet', id: 'myalgo' })
    }
    
    // Check for AlgoSigner
    if (window.AlgoSigner) {
      wallets.push({ name: 'AlgoSigner', id: 'algosigner' })
    }
    
    return wallets
  }

  const connectPeraWallet = async () => {
    try {
      setIsConnecting(true)
      
      if (!window.algorand || !window.algorand.isPeraWallet) {
        throw new Error('Pera Wallet not detected. Please install Pera Wallet.')
      }

      const accounts = await window.algorand.connect()
      if (accounts.length > 0) {
        const address = accounts[0]
        setWalletAddress(address)
        setWalletName('Pera Wallet')
        onWalletConnected?.(address)
        
        toast({
          title: "Wallet Connected",
          description: `Connected to Pera Wallet: ${address.slice(0, 8)}...${address.slice(-8)}`,
        })
      }
    } catch (error: any) {
      console.error('Error connecting Pera Wallet:', error)
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to Pera Wallet",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const connectMyAlgoWallet = async () => {
    try {
      setIsConnecting(true)
      
      if (!window.myAlgo) {
        throw new Error('MyAlgo Wallet not detected. Please install MyAlgo Wallet.')
      }

      const accounts = await window.myAlgo.connect({
        shouldSelectOneAccount: true,
        openManager: false
      })

      if (accounts.length > 0) {
        const address = accounts[0].address
        setWalletAddress(address)
        setWalletName('MyAlgo Wallet')
        onWalletConnected?.(address)
        
        toast({
          title: "Wallet Connected",
          description: `Connected to MyAlgo Wallet: ${address.slice(0, 8)}...${address.slice(-8)}`,
        })
      }
    } catch (error: any) {
      console.error('Error connecting MyAlgo Wallet:', error)
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to MyAlgo Wallet",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setWalletAddress(null)
    setWalletName(null)
    onWalletDisconnected?.()
    
    toast({
      title: "Wallet Disconnected",
      description: "Wallet has been disconnected",
    })
  }

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress)
      toast({
        title: "Copied",
        description: "Wallet address copied to clipboard",
      })
    }
  }

  const openInExplorer = () => {
    if (walletAddress) {
      window.open(`https://testnet.algoexplorer.io/address/${walletAddress}`, '_blank')
    }
  }

  const availableWallets = getAvailableWallets()

  if (walletAddress) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Wallet Connected
          </CardTitle>
          <CardDescription>
            Connected to {walletName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              <code className="text-sm font-mono">
                {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
              </code>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyAddress}>
                <Copy className="w-3 h-3" />
              </Button>
              <Button variant="outline" size="sm" onClick={openInExplorer}>
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={disconnectWallet} className="flex-1">
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Connect Algorand Wallet
        </CardTitle>
        <CardDescription>
          Connect your Algorand wallet to mint NFTs on the blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {availableWallets.length === 0 ? (
          <div className="text-center py-6">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Wallets Detected</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Please install an Algorand wallet to continue
            </p>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={() => window.open('https://perawallet.app/', '_blank')}
                className="w-full"
              >
                Install Pera Wallet
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.open('https://wallet.myalgo.com/', '_blank')}
                className="w-full"
              >
                Install MyAlgo Wallet
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {availableWallets.map((wallet) => (
              <Button
                key={wallet.id}
                onClick={wallet.id === 'pera' ? connectPeraWallet : connectMyAlgoWallet}
                disabled={isConnecting}
                className="w-full justify-start"
              >
                <Wallet className="w-4 h-4 mr-2" />
                {isConnecting ? 'Connecting...' : `Connect ${wallet.name}`}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    algorand?: {
      connect: () => Promise<string[]>
      isPeraWallet: boolean
    }
    myAlgo?: {
      connect: (options: any) => Promise<Array<{ address: string }>>
    }
    AlgoSigner?: any
  }
}
