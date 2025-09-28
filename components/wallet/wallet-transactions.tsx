"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Send, 
  ArrowUpDown, 
  Zap, 
  Flame, 
  Copy, 
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'
import { useWallet } from '@/hooks/use-wallet'
import { WalletTransaction } from '@/lib/wallet/wallet-service'
import { useToast } from '@/hooks/use-toast'

interface WalletTransactionsProps {
  className?: string
}

const getTransactionIcon = (type: WalletTransaction['type']) => {
  switch (type) {
    case 'send':
      return <Send className="w-4 h-4" />
    case 'receive':
      return <ArrowUpDown className="w-4 h-4" />
    case 'swap':
      return <ArrowUpDown className="w-4 h-4" />
    case 'mint':
      return <Zap className="w-4 h-4" />
    case 'burn':
      return <Flame className="w-4 h-4" />
    default:
      return <ArrowUpDown className="w-4 h-4" />
  }
}

const getTransactionColor = (type: WalletTransaction['type']) => {
  switch (type) {
    case 'send':
      return 'text-red-600 bg-red-100'
    case 'receive':
      return 'text-green-600 bg-green-100'
    case 'swap':
      return 'text-blue-600 bg-blue-100'
    case 'mint':
      return 'text-purple-600 bg-purple-100'
    case 'burn':
      return 'text-orange-600 bg-orange-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

const getStatusIcon = (status: WalletTransaction['status']) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-4 h-4 text-yellow-500" />
    case 'confirmed':
      return <CheckCircle className="w-4 h-4 text-green-500" />
    case 'failed':
      return <XCircle className="w-4 h-4 text-red-500" />
    default:
      return <Clock className="w-4 h-4 text-gray-500" />
  }
}

const getStatusColor = (status: WalletTransaction['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'confirmed':
      return 'bg-green-100 text-green-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function WalletTransactions({ className = '' }: WalletTransactionsProps) {
  const { transactions, getTransactionsByType, getRecentTransactions } = useWallet()
  const { toast } = useToast()
  const [copiedHash, setCopiedHash] = useState<string | null>(null)

  const handleCopyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash)
      setCopiedHash(hash)
      toast({
        title: "Copied",
        description: "Transaction hash copied to clipboard",
      })
      setTimeout(() => setCopiedHash(null), 2000)
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy transaction hash",
        variant: "destructive",
      })
    }
  }

  const handleViewOnExplorer = (hash: string) => {
    window.open(`https://algoexplorer.io/tx/${hash}`, '_blank')
  }

  const renderTransaction = (transaction: WalletTransaction) => (
    <div key={transaction.id} className="flex items-center space-x-3 p-3 border rounded-lg">
      <div className={`p-2 rounded-full ${getTransactionColor(transaction.type)}`}>
        {getTransactionIcon(transaction.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium capitalize">{transaction.type}</span>
            <Badge className={getStatusColor(transaction.status)}>
              {transaction.status}
            </Badge>
          </div>
          <div className="flex items-center space-x-1">
            {getStatusIcon(transaction.status)}
            <span className="text-sm text-gray-500">
              {transaction.timestamp.toLocaleTimeString()}
            </span>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 mt-1">
          {transaction.amount} {transaction.currency}
        </div>
        
        {transaction.from && transaction.to && (
          <div className="text-xs text-gray-500 mt-1">
            From: {transaction.from.slice(0, 8)}...{transaction.from.slice(-8)} → 
            To: {transaction.to.slice(0, 8)}...{transaction.to.slice(-8)}
          </div>
        )}
        
        {transaction.hash && (
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-xs text-gray-500 font-mono">
              {transaction.hash.slice(0, 16)}...
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopyHash(transaction.hash!)}
              className="h-6 w-6 p-0"
            >
              {copiedHash === transaction.hash ? (
                <CheckCircle className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewOnExplorer(transaction.hash!)}
              className="h-6 w-6 p-0"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  const allTransactions = getRecentTransactions(20)
  const sendTransactions = getTransactionsByType('send')
  const receiveTransactions = getTransactionsByType('receive')
  const swapTransactions = getTransactionsByType('swap')
  const mintTransactions = getTransactionsByType('mint')

  if (transactions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your wallet transaction history will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ArrowUpDown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No transactions yet</p>
            <p className="text-sm text-gray-400">Start using your wallet to see transactions here</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>View and manage your wallet transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="send">Send</TabsTrigger>
            <TabsTrigger value="receive">Receive</TabsTrigger>
            <TabsTrigger value="swap">Swap</TabsTrigger>
            <TabsTrigger value="mint">Mint</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-3 mt-4">
            {allTransactions.map(renderTransaction)}
          </TabsContent>
          
          <TabsContent value="send" className="space-y-3 mt-4">
            {sendTransactions.length > 0 ? (
              sendTransactions.map(renderTransaction)
            ) : (
              <div className="text-center py-8">
                <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No send transactions</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="receive" className="space-y-3 mt-4">
            {receiveTransactions.length > 0 ? (
              receiveTransactions.map(renderTransaction)
            ) : (
              <div className="text-center py-8">
                <ArrowUpDown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No receive transactions</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="swap" className="space-y-3 mt-4">
            {swapTransactions.length > 0 ? (
              swapTransactions.map(renderTransaction)
            ) : (
              <div className="text-center py-8">
                <ArrowUpDown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No swap transactions</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="mint" className="space-y-3 mt-4">
            {mintTransactions.length > 0 ? (
              mintTransactions.map(renderTransaction)
            ) : (
              <div className="text-center py-8">
                <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No mint transactions</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
