"use client"

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Wallet, 
  Copy, 
  Check, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { useWallet } from '@/hooks/use-wallet'
import { useToast } from '@/hooks/use-toast'

interface WalletStatusProps {
  showDetails?: boolean
  showActions?: boolean
  className?: string
}

export function WalletStatus({ 
  showDetails = true, 
  showActions = true, 
  className = '' 
}: WalletStatusProps) {
  const {
    isConnected,
    isConnecting,
    account,
    balance,
    error,
    formatAddress,
    copyToClipboard,
    refreshBalance,
    clearError
  } = useWallet()

  const { toast } = useToast()

  const handleCopyAddress = async () => {
    if (!account?.address) return

    try {
      await copyToClipboard(account.address)
      toast({
        title: "Copied",
        description: "Wallet address copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy address to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleRefreshBalance = async () => {
    try {
      await refreshBalance()
      toast({
        title: "Balance Updated",
        description: "Wallet balance has been refreshed",
      })
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh wallet balance",
        variant: "destructive",
      })
    }
  }

  const handleClearError = () => {
    clearError()
  }

  if (!isConnected) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-full">
              <Wallet className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Wallet Not Connected</div>
              <div className="text-xs text-gray-500">Connect your wallet to get started</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-sm">Wallet Connected</CardTitle>
              <CardDescription className="text-xs">
                {formatAddress(account?.address || '', 8)}
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Connected
          </Badge>
        </div>
      </CardHeader>

      {showDetails && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {error && (
              <div className="flex items-center space-x-2 p-2 bg-red-50 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearError}
                  className="h-6 w-6 p-0 ml-auto"
                >
                  ×
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Balance</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{balance.toFixed(4)} ALGO</span>
                {showActions && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefreshBalance}
                    className="h-6 w-6 p-0"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            {showActions && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAddress}
                  className="flex-1"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy Address
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://algoexplorer.io/address/${account?.address}`, '_blank')}
                >
                  <Check className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// Compact status for headers
export function WalletStatusCompact({ className = '' }: { className?: string }) {
  const { isConnected, account, formatAddress } = useWallet()

  if (!isConnected) {
    return (
      <div className={`flex items-center space-x-2 text-gray-500 ${className}`}>
        <Wallet className="w-4 h-4" />
        <span className="text-sm">Not Connected</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      <span className="text-sm font-medium">
        {formatAddress(account?.address || '', 4)}
      </span>
    </div>
  )
}

// Loading status
export function WalletStatusLoading({ className = '' }: { className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          <div>
            <div className="text-sm font-medium text-gray-900">Connecting...</div>
            <div className="text-xs text-gray-500">Please wait while we connect your wallet</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
