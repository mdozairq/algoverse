"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WalletConnectButton, WalletConnectButtonCompact, WalletConnectButtonFull } from '@/components/wallet/wallet-connect-button'
import { WalletStatus, WalletStatusCompact, WalletStatusLoading } from '@/components/wallet/wallet-status'
import { WalletTransactions } from '@/components/wallet/wallet-transactions'
import { useWallet } from '@/hooks/use-wallet'

export default function WalletDemoPage() {
  const { 
    isConnected, 
    isConnecting, 
    account, 
    balance, 
    error,
    sendTransaction,
    signMessage,
    formatAddress,
    copyToClipboard
  } = useWallet()

  const handleSendTransaction = async () => {
    try {
      await sendTransaction('0x1234567890123456789012345678901234567890', 1.5, 'ALGO')
    } catch (error) {
      console.error('Transaction failed:', error)
    }
  }

  const handleSignMessage = async () => {
    try {
      const signature = await signMessage('Hello, Algorand!')
      console.log('Signature:', signature)
    } catch (error) {
      console.error('Signing failed:', error)
    }
  }

  const handleCopyAddress = async () => {
    if (account?.address) {
      try {
        await copyToClipboard(account.address)
        console.log('Address copied!')
      } catch (error) {
        console.error('Copy failed:', error)
      }
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Wallet Components Demo</h1>
        <p className="text-gray-600">Demonstration of the global wallet management system</p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
          <CardDescription>Current wallet connection state</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-sm text-gray-600">Status</div>
              <div className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-sm text-gray-600">Address</div>
              <div className="font-mono text-sm">
                {account ? formatAddress(account.address, 8) : 'Not connected'}
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-sm text-gray-600">Balance</div>
              <div className="font-medium">{balance.toFixed(4)} ALGO</div>
            </div>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-800 text-sm">{error}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wallet Connect Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Connect Buttons</CardTitle>
          <CardDescription>Different variants of wallet connect buttons</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <WalletConnectButton />
            <WalletConnectButton variant="outline" />
            <WalletConnectButton variant="ghost" />
          </div>
          
          <div className="flex flex-wrap gap-4">
            <WalletConnectButtonCompact />
            <WalletConnectButtonFull />
          </div>
        </CardContent>
      </Card>

      {/* Wallet Status Components */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Status Components</CardTitle>
          <CardDescription>Different wallet status display components</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <WalletStatus />
            <WalletStatusCompact />
          </div>
        </CardContent>
      </Card>

      {/* Wallet Actions */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Wallet Actions</CardTitle>
            <CardDescription>Test wallet functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button onClick={handleSendTransaction} disabled={isConnecting}>
                Send Test Transaction
              </Button>
              <Button onClick={handleSignMessage} disabled={isConnecting} variant="outline">
                Sign Test Message
              </Button>
              <Button onClick={handleCopyAddress} variant="outline">
                Copy Address
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <WalletTransactions />

      {/* Loading State Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Loading State</CardTitle>
          <CardDescription>Wallet loading state component</CardDescription>
        </CardHeader>
        <CardContent>
          <WalletStatusLoading />
        </CardContent>
      </Card>
    </div>
  )
}
