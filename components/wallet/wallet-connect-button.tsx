"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  Wallet, 
  Copy, 
  Check, 
  LogOut, 
  RefreshCw, 
  ExternalLink,
  Loader2,
  AlertCircle,
  Download
} from 'lucide-react'
import { useWallet } from '@/hooks/use-wallet'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/lib/auth/auth-context'
import { walletService } from '@/lib/wallet/wallet-service'

interface WalletConnectButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  showBalance?: boolean
  showTransactions?: boolean
  className?: string
}

export function WalletConnectButton({
  variant = 'default',
  size = 'default',
  showBalance = true,
  showTransactions = false,
  className = ''
}: WalletConnectButtonProps) {
  const {
    isConnected,
    isConnecting,
    account,
    balance,
    error,
    connect,
    disconnect,
    formatAddress,
    copyToClipboard,
    isWalletInstalled,
    getWalletInfo,
    clearError
  } = useWallet()

  const { user , isAuthenticated, logout, disconnectWallet, connectWallet } = useAuth()

  const [copied, setCopied] = useState(false)
  const [showInstallDialog, setShowInstallDialog] = useState(false)
  const { toast } = useToast()

  // Sync wallet and auth state
  useEffect(() => {
    if (isConnected && account?.address && !isAuthenticated) {
      // Wallet is connected but auth is not, try to sync
      connectWallet(account.address, "user").catch(error => {
        console.log("Failed to sync wallet with auth:", error)
      })
    }
  }, [isConnected, account?.address, isAuthenticated, connectWallet])

  // Force refresh connection on mount
  useEffect(() => {
    const refreshConnection = async () => {
      try {
        await walletService.refreshConnection()
      } catch (error) {
        console.log("Failed to refresh wallet connection:", error)
      }
    }
    
    refreshConnection()
  }, [])

  // Listen for wallet connection and disconnect events
  useEffect(() => {
    const handleWalletConnected = (event: CustomEvent) => {
      const { address } = event.detail
      if (address && !isAuthenticated) {
        connectWallet(address, "user").catch(error => {
          console.log("Failed to sync wallet with auth on event:", error)
        })
      }
    }

    const handleWalletDisconnected = () => {
      console.log("Wallet disconnect event received in button")
      // The wallet service will handle clearing the state
      // This just ensures the UI updates properly
    }

    window.addEventListener('wallet-connected', handleWalletConnected as EventListener)
    window.addEventListener('wallet-disconnected', handleWalletDisconnected as EventListener)
    
    return () => {
      window.removeEventListener('wallet-connected', handleWalletConnected as EventListener)
      window.removeEventListener('wallet-disconnected', handleWalletDisconnected as EventListener)
    }
  }, [isAuthenticated, connectWallet])

  const handleConnect = async () => {
    try {
      if (!isWalletInstalled()) {
        setShowInstallDialog(true)
        return
      }

      // Connect to wallet service
      const walletAccount = await connect()
      
      // Also connect to auth service to sync user state
      if (walletAccount?.address) {
        try {
          await connectWallet(walletAccount.address, "user")
        } catch (authError) {
          console.log("Auth connection failed, but wallet is connected:", authError)
          // Don't throw error here as wallet is still connected
        }
      }
      
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been connected successfully!",
      })
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      })
    }
  }

  const handleDisconnect = async () => {
    try {
      // Disconnect from wallet service (this will call Pera Connect disconnect)
      await disconnect()
      
      // Then disconnect from auth context (clears user state)
      await disconnectWallet()
      
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected.",
      })
    } catch (error: any) {
      console.error("Disconnect error:", error)
      
      // Try force disconnect as fallback
      try {
        walletService.forceDisconnect()
        walletService.clearAllStorage() // Clear all storage completely
        await disconnectWallet()
        toast({
          title: "Wallet Disconnected",
          description: "Your wallet has been force-disconnected.",
        })
      } catch (forceError: any) {
        console.error("Force disconnect error:", forceError)
        // Even if everything fails, clear all storage
        walletService.clearAllStorage()
        toast({
          title: "Disconnect Failed",
          description: "Failed to disconnect wallet. Please refresh the page.",
          variant: "destructive",
        })
      }
    }
  }

  const handleCopyAddress = async () => {
    if (!user?.walletAddress) return

    try {
      await copyToClipboard(user?.walletAddress)
      setCopied(true)
      toast({
        title: "Copied",
        description: "Wallet address copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy address to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleClearError = () => {
    clearError()
  }

  const walletInfo = getWalletInfo()
  console.log("walletInfo", walletInfo, account, user, isConnected)

  if (!isAuthenticated) {
    return (
      <>
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          variant={variant}
          size={size}
          className={className}
        >
          {isConnecting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Wallet className="w-4 h-4 mr-2" />
          )}
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>

        <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Download className="w-5 h-5 mr-2" />
                Install {walletInfo.name}
              </DialogTitle>
              <DialogDescription>
                To connect your wallet, you need to install {walletInfo.name} first.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-gray-600">
                  {walletInfo.name} is not installed on your device.
                </span>
              </div>
              <div className="flex space-x-2">
                <Button asChild className="flex-1">
                  <a
                    href="https://perawallet.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Install {walletInfo.name}
                  </a>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowInstallDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      {error && (
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearError}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} className={className}>
            <Wallet className="w-4 h-4 mr-2" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">
                {formatAddress(user?.walletAddress || '', 4)}
              </span>
              {showBalance && (
                <span className="text-xs text-gray-500">
                  {balance.toFixed(2)} ALGO
                </span>
              )}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="px-2 py-1.5">
            <div className="text-sm font-medium">Connected Wallet</div>
            <div className="text-xs text-gray-500">{walletInfo.name}</div>
          </div>
          
          <DropdownMenuSeparator />
          
          <div className="px-2 py-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Address</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAddress}
                className="h-6 w-6 p-0"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
            <div className="text-xs font-mono text-gray-700 break-all">
              {user?.walletAddress}
            </div>
          </div>

          {showBalance && (
            <div className="px-2 py-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Balance</span>
                <Badge variant="secondary">
                  {balance.toFixed(4)} ALGO
                </Badge>
              </div>
            </div>
          )}

          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleCopyAddress}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Address
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => window.open(`https://algoexplorer.io/address/${user?.walletAddress}`, '_blank')}>
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Explorer
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleDisconnect} className="text-red-600">
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// Compact version for headers/navbars
export function WalletConnectButtonCompact({ className = '' }: { className?: string }) {
  return (
    <WalletConnectButton
      variant="outline"
      size="sm"
      showBalance={false}
      className={className}
    />
  )
}

// Full version with all features
export function WalletConnectButtonFull({ className = '' }: { className?: string }) {
  return (
    <WalletConnectButton
      variant="default"
      size="default"
      showBalance={true}
      showTransactions={true}
      className={className}
    />
  )
}
