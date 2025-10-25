"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  Wallet,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-context"
import { useWallet } from "@/hooks/use-wallet"
import { walletService } from "@/lib/wallet/wallet-service"
import { WalletMintService } from "@/lib/algorand/wallet-mint-service"

interface Purchase {
  id: string
  eventId: string
  userId: string
  quantity: number
  totalPrice: number
  paymentTransactionId: string
  nftTickets: Array<{
    transactionId: string
    metadataUrl: string
  }>
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
}

interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  imageUrl?: string
  price: string
}

export default function ClaimTicketsPage() {
  const { user, isAuthenticated } = useAuth()
  const { isConnected, account } = useWallet()
  const { toast } = useToast()
  
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      loadUserPurchases()
    }
  }, [isAuthenticated])

  const loadUserPurchases = async () => {
    try {
      const response = await fetch('/api/user/purchases')
      if (response.ok) {
        const data = await response.json()
        setPurchases(data.purchases)
      }
    } catch (error) {
      console.error('Error loading purchases:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClaimNFTs = async (purchaseId: string) => {
    if (!isConnected || !account) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to claim NFT tickets.",
        variant: "destructive"
      })
      return
    }

    setClaiming(purchaseId)
    try {
      // Get NFT minting transactions
      const claimResponse = await fetch('/api/user/claim-nft-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: account.address,
          purchaseId: purchaseId
        })
      })

      if (!claimResponse.ok) {
        const errorData = await claimResponse.json()
        throw new Error(errorData.error || 'Failed to create NFT transactions')
      }

      const claimData = await claimResponse.json()
      
      // Sign NFT minting transactions
      const nftTransactions = claimData.nftTransactions.map((tx: any) => tx.transaction)
      const signedNftTransactions = await walletService.signTransactions(nftTransactions)
      
      // Submit NFT transactions
      let successCount = 0
      for (const signedTxn of signedNftTransactions) {
        try {
          const signedTxnBytes = Buffer.from(signedTxn, 'base64')
          await WalletMintService.submitSignedTransaction(signedTxnBytes)
          successCount++
        } catch (error) {
          console.error('Error submitting NFT transaction:', error)
        }
      }
      
      toast({
        title: "NFT Tickets Claimed!",
        description: `Successfully minted ${successCount} NFT ticket(s) for ${claimData.purchase.eventTitle}`,
      })
      
      // Reload purchases to update status
      loadUserPurchases()
      
    } catch (error: any) {
      console.error('Error claiming NFT tickets:', error)
      toast({
        title: "Claim Failed",
        description: error.message || "Failed to claim NFT tickets. Please try again.",
        variant: "destructive"
      })
    } finally {
      setClaiming(null)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Claim NFT Tickets
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Claim your NFT tickets for purchased events
        </p>
      </div>

      {!isConnected && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-yellow-800 dark:text-yellow-200">
              <Wallet className="w-5 h-5" />
              <span className="font-medium">Wallet Required</span>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Please connect your wallet to claim NFT tickets
            </p>
          </CardContent>
        </Card>
      )}

      {purchases.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Purchases Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You haven't purchased any event tickets yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {purchases.map((purchase) => (
            <Card key={purchase.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Ticket className="w-5 h-5" />
                      Purchase #{purchase.id.slice(-8)}
                    </CardTitle>
                    <CardDescription>
                      {purchase.quantity} ticket(s) • {purchase.totalPrice} ALGO
                    </CardDescription>
                  </div>
                  <Badge variant={purchase.status === 'completed' ? 'default' : 'secondary'}>
                    {purchase.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Purchased: {new Date(purchase.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>Transaction: {purchase.paymentTransactionId.slice(0, 8)}...</span>
                  </div>

                  {purchase.status === 'completed' && (
                    <div className="flex items-center gap-2">
                      {isConnected ? (
                        <Button
                          onClick={() => handleClaimNFTs(purchase.id)}
                          disabled={claiming === purchase.id}
                          className="w-full"
                        >
                          {claiming === purchase.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Claiming NFTs...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Claim NFT Tickets
                            </>
                          )}
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">Connect wallet to claim NFTs</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
