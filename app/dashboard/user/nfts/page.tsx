"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, QrCode, ExternalLink, Wallet, Plus } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import AuthGuard from "@/components/auth-guard"
import Link from "next/link"
import { AtomicSwapModal } from "@/components/nft/atomic-swap-modal"

export default function UserNFTsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [nfts, setNfts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || authLoading) {
      setLoading(false)
      return
    }

    const loadNFTs = async () => {
      try {
        const response = await fetch('/api/user/nfts')
        if (response.ok) {
          const data = await response.json()
          setNfts(data.nfts || [])
        }
      } catch (error) {
        console.error('Error loading NFTs:', error)
      } finally {
        setLoading(false)
      }
    }
    loadNFTs()
  }, [isAuthenticated, authLoading])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Active</Badge>
      case "upcoming":
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Upcoming</Badge>
      case "used":
        return <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/20">Used</Badge>
      case "expired":
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Expired</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <AuthGuard requiredRole="user">
      <DashboardLayout role="user">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">My NFT Collection</h1>
              <p className="text-gray-600 dark:text-gray-400">View and manage your event NFTs</p>
            </div>
            <div className="flex gap-3">
              <Link href="/marketplace">
                <Button className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                  <Plus className="w-4 h-4 mr-2" />
                  Browse Marketplace
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total NFTs</CardTitle>
                <Wallet className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{nfts.length}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Owned NFTs</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Active NFTs</CardTitle>
                <QrCode className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {nfts.filter(nft => !nft.isUsed).length}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Available for use</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Used NFTs</CardTitle>
                <Calendar className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {nfts.filter(nft => nft.isUsed).length}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Already used</p>
              </CardContent>
            </Card>
          </div>

          {/* NFT Grid */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">NFT Collection</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Manage your event NFTs and access check-in features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                  <div className="col-span-full text-center py-8 text-gray-500">Loading NFTs...</div>
                ) : nfts.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No NFTs found</p>
                    <p className="text-sm text-gray-400 mt-2">Start by purchasing NFTs from the marketplace</p>
                  </div>
                ) : (
                  nfts.map((nft) => (
                    <Card key={nft.id} className="bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                      <div className="aspect-square bg-gray-200 dark:bg-gray-600 relative overflow-hidden rounded-t-lg">
                        <img
                          src={nft.metadata?.image || "/placeholder.svg"}
                          alt={nft.metadata?.name || `NFT ${nft.id}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">{getStatusBadge(nft.isUsed ? "used" : "active")}</div>
                        {nft.listedForSale && (
                          <Badge className="absolute top-2 left-2 bg-purple-500/10 text-purple-400 border-purple-500/20">
                            For Sale
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                          {nft.metadata?.name || `NFT ${nft.id}`}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Token: {nft.tokenId}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <Calendar className="w-4 h-4" />
                          {new Date(nft.createdAt?.seconds ? nft.createdAt.seconds * 1000 : nft.createdAt || Date.now()).toLocaleDateString()}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {nft.metadata?.price || "—"}
                          </span>
                          <div className="flex gap-2">
                            {!nft.isUsed && (
                              <Link href={`/dashboard/user/event-checkin/${nft.eventId || nft.id}`}>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                  <QrCode className="w-4 h-4" />
                                </Button>
                              </Link>
                            )}
                            <Link href={`/nft/${nft.id}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 bg-transparent"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </Link>
                            {!nft.isUsed && !nft.listedForSale && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 bg-transparent"
                                >
                                  Sell
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 bg-transparent"
                                  onClick={() => setIsSwapModalOpen(true)}
                                >
                                  Swap
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <AtomicSwapModal 
            isOpen={isSwapModalOpen} 
            onClose={() => setIsSwapModalOpen(false)}
            nftToSwap={nfts[0]}
            userNFTs={nfts}
          />
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
