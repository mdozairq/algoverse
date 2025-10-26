"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  Wallet,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Eye
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-context"
import { useWallet } from "@/hooks/use-wallet"
import { transactionSigner } from "@/lib/wallet/transaction-signer"
import { WalletMintService } from "@/lib/algorand/wallet-mint-service"
import DashboardLayout from "@/components/dashboard-layout"
import AuthGuard from "@/components/auth-guard"

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
    assetId?: string
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
  const { isConnected, account, connect, disconnect } = useWallet()
  const { toast } = useToast()
  
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [claimedTickets, setClaimedTickets] = useState<Purchase[]>([])

  useEffect(() => {
    if (isAuthenticated) {
      loadUserPurchases()
    }
  }, [isAuthenticated])

  // Set up the transaction signer
  useEffect(() => {
    transactionSigner.setUseWalletHook({ isConnected, account, connect, disconnect })
  }, [isConnected, account, connect, disconnect])

  const loadUserPurchases = async () => {
    try {
      const response = await fetch('/api/user/purchases')
      if (response.ok) {
        const data = await response.json()
        const allPurchases = data.purchases || []
        setPurchases(allPurchases)
        
        // Separate claimed tickets (those with NFT asset IDs)
        const claimed = allPurchases.filter((purchase: Purchase) => 
          purchase.nftTickets && purchase.nftTickets.some(ticket => ticket.assetId)
        )
        setClaimedTickets(claimed)
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
      toast({
        title: "Signing NFT Transactions",
        description: "Please sign the NFT minting transactions in your wallet.",
      })
      
      // Sign the single NFT transaction using transactionSigner
      let signedNftTransaction
      try {
        signedNftTransaction = await transactionSigner.signTransaction(claimData.nftTransaction.transaction, account.address)
      } catch (error: any) {
        console.error('Error signing NFT transaction:', error)
        throw new Error(`Failed to sign NFT transaction: ${error.message || 'Unknown error'}`)
      }
      
      // Submit NFT transaction
      toast({
        title: "Submitting NFT Transaction",
        description: "Submitting NFT asset creation to the blockchain...",
      })
      
      try {
        const signedTxnBytes = Buffer.from(signedNftTransaction, 'base64')
        const result = await WalletMintService.submitSignedTransaction(signedTxnBytes)
        
        if (result.transactionId) {
          toast({
            title: "NFT Tickets Created!",
            description: `Successfully created NFT asset with ${claimData.nftTransaction.totalSupply} ticket units for ${claimData.purchase.eventTitle}. Asset ID: ${result.assetId}. Check your wallet!`,
          })
          
          // Update the purchase record with NFT asset ID
          try {
            await fetch(`/api/user/update-purchase-nfts`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                purchaseId: purchaseId,
                nftAssetId: result.assetId,
                totalSupply: claimData.nftTransaction.totalSupply
              })
            })
          } catch (updateError) {
            console.error('Error updating purchase with NFT ID:', updateError)
          }
        } else {
          throw new Error('Failed to create NFT asset')
        }
      } catch (error) {
        console.error('Error submitting NFT transaction:', error)
        throw new Error('Failed to submit NFT transaction to blockchain')
      }
      
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
      <AuthGuard requiredRole="user">
        <DashboardLayout role="user">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole="user">
      <DashboardLayout role="user">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Claim NFT Tickets</h1>
              <p className="text-gray-600 dark:text-gray-400">Claim your NFT tickets for purchased events</p>
            </div>
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

          <Tabs defaultValue="claim" className="space-y-4">
            <TabsList className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <TabsTrigger
                value="claim"
                className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
              >
                <Ticket className="w-4 h-4 mr-2" />
                Claim Tickets
              </TabsTrigger>
              <TabsTrigger
                value="claimed"
                className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Claimed Tickets ({claimedTickets.length})
              </TabsTrigger>
            </TabsList>

            {/* Claim Tickets Tab */}
            <TabsContent value="claim" className="space-y-6">
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
                            <span>Purchased: {purchase.createdAt}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="w-4 h-4" />
                            <span>Transaction: {purchase.paymentTransactionId.slice(0, 8)}...</span>
                          </div>

                          {purchase.nftTickets && purchase.nftTickets.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Ticket className="w-4 h-4" />
                              <span>
                                NFTs: {purchase.nftTickets.filter(ticket => ticket.assetId).length}/{purchase.nftTickets.length} minted
                              </span>
                            </div>
                          )}

                          {purchase.status === 'completed' && !purchase.nftTickets?.some(ticket => ticket.assetId) && (
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
                          
                          {purchase.status === 'completed' && purchase.nftTickets?.some(ticket => ticket.assetId) && (
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                              <CheckCircle2 className="w-4 h-4" />
                              <span className="text-sm font-medium">NFT Tickets Claimed</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Claimed Tickets Tab */}
            <TabsContent value="claimed" className="space-y-6">
              {claimedTickets.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Claimed Tickets
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      You haven't claimed any NFT tickets yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {claimedTickets.map((purchase) => (
                    <Card key={purchase.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                              Purchase #{purchase.id.slice(-8)}
                            </CardTitle>
                            <CardDescription>
                              {purchase.quantity} ticket(s) • {purchase.totalPrice} ALGO
                            </CardDescription>
                          </div>
                          <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Claimed
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>Purchased: {purchase.createdAt}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="w-4 h-4" />
                            <span>Transaction: {purchase.paymentTransactionId.slice(0, 8)}...</span>
                          </div>

                          {purchase.nftTickets && purchase.nftTickets.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Ticket className="w-4 h-4" />
                              <span>
                                NFTs: {purchase.nftTickets.filter(ticket => ticket.assetId).length}/{purchase.nftTickets.length} minted
                              </span>
                            </div>
                          )}

                          {/* NFT Images Grid */}
                          {purchase.nftTickets && purchase.nftTickets.filter(ticket => ticket.assetId).length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" />
                                Your NFT Tickets
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {purchase.nftTickets
                                  .filter(ticket => ticket.assetId)
                                  .map((ticket, index) => (
                                    <div key={index} className="relative group">
                                      <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                        {ticket.metadataUrl ? (
                                          <img
                                            src={ticket.metadataUrl}
                                            alt={`NFT Ticket ${index + 1}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            onError={(e) => {
                                              const target = e.target as HTMLImageElement;
                                              target.style.display = 'none';
                                              target.nextElementSibling?.classList.remove('hidden');
                                            }}
                                          />
                                        ) : null}
                                        <div className={`w-full h-full flex items-center justify-center ${ticket.metadataUrl ? 'hidden' : ''}`}>
                                          <div className="text-center">
                                            <Ticket className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-xs text-gray-500">Ticket #{index + 1}</p>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="mt-2 text-center">
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                          Asset ID: {ticket.assetId}
                                        </p>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="mt-1 text-xs"
                                          onClick={() => window.open(`https://explorer.perawallet.app/asset/${ticket.assetId}`, '_blank')}
                                        >
                                          <Eye className="w-3 h-3 mr-1" />
                                          View
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
