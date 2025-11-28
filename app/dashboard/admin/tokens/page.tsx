"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Rocket,
  ExternalLink,
  TrendingUp,
  Layers,
  Filter
} from "lucide-react"
import { toast } from "sonner"
import DashboardLayout from "@/components/dashboard-layout"
import AuthGuard from "@/components/auth-guard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MarketplaceToken {
  id: string
  marketplaceId: string
  merchantId: string
  name: string
  symbol: string
  description: string
  totalSupply: number
  decimals: number
  assetId?: number
  status: "draft" | "pending" | "approved" | "rejected" | "deployed"
  initialPrice: number
  initialLiquidity: number
  logoUrl?: string
  website?: string
  whitepaper?: string
  liquidityPools?: {
    tinyman?: { enabled: boolean }
    pact?: { enabled: boolean }
  }
  tradingRules?: any
  createdAt: string
  approvedAt?: string
  rejectionReason?: string
  approvedBy?: string
}

export default function AdminTokensPage() {
  const [tokens, setTokens] = useState<MarketplaceToken[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedToken, setSelectedToken] = useState<MarketplaceToken | null>(null)
  const [approvalNotes, setApprovalNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "all">("pending")

  useEffect(() => {
    fetchTokens()
  }, [statusFilter])

  const fetchTokens = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/tokens?status=${statusFilter}`)
      const data = await response.json()
      if (data.success) {
        setTokens(data.tokens)
      }
    } catch (error) {
      console.error("Error fetching tokens:", error)
      toast.error("Failed to fetch tokens")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedToken) return

    try {
      const response = await fetch("/api/admin/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: selectedToken.id,
          action: "approve",
          notes: approvalNotes,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Token approved successfully")
        setShowApproveDialog(false)
        setSelectedToken(null)
        setApprovalNotes("")
        fetchTokens()
      } else {
        toast.error(data.error || "Failed to approve token")
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to approve token")
    }
  }

  const handleReject = async () => {
    if (!selectedToken || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason")
      return
    }

    try {
      const response = await fetch("/api/admin/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: selectedToken.id,
          action: "reject",
          rejectionReason,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Token rejected")
        setShowRejectDialog(false)
        setSelectedToken(null)
        setRejectionReason("")
        fetchTokens()
      } else {
        toast.error(data.error || "Failed to reject token")
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to reject token")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      case "deployed":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Rocket className="w-3 h-3 mr-1" />Deployed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <AuthGuard requiredRole="admin">
      <DashboardLayout role="admin">
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Token Launchpad Approval</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Review and approve token launchpad requests from merchants
            </p>
          </div>

          <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as "pending" | "approved" | "all")} className="space-y-6">
            <TabsList>
              <TabsTrigger value="pending">
                <Clock className="w-4 h-4 mr-2" />
                Pending
              </TabsTrigger>
              <TabsTrigger value="approved">
                <CheckCircle className="w-4 h-4 mr-2" />
                Approved
              </TabsTrigger>
              <TabsTrigger value="all">
                <Filter className="w-4 h-4 mr-2" />
                All Tokens
              </TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="space-y-4">
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading tokens...</p>
        </div>
      ) : tokens.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No pending token requests</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tokens.map((token) => (
            <Card key={token.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 mb-2">
                      {token.name} ({token.symbol})
                      {getStatusBadge(token.status)}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Marketplace ID: {token.marketplaceId}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedToken(token)
                        setShowApproveDialog(true)
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedToken(token)
                        setShowRejectDialog(true)
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Description</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {token.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Supply</p>
                      <p className="font-semibold">{token.totalSupply.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Decimals</p>
                      <p className="font-semibold">{token.decimals}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Initial Price</p>
                      <p className="font-semibold">{token.initialPrice} ALGO</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Initial Liquidity</p>
                      <p className="font-semibold">{token.initialLiquidity} ALGO</p>
                    </div>
                  </div>

                  {token.liquidityPools && (
                    <div>
                      <p className="text-sm font-medium mb-2">Liquidity Pools</p>
                      <div className="flex gap-2">
                        {token.liquidityPools.tinyman?.enabled && (
                          <Badge variant="outline">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Tinyman V2
                          </Badge>
                        )}
                        {token.liquidityPools.pact?.enabled && (
                          <Badge variant="outline">
                            <Layers className="w-3 h-3 mr-1" />
                            Pact Finance
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {(token.website || token.whitepaper) && (
                    <div className="flex gap-4">
                      {token.website && (
                        <a
                          href={token.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          Website <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {token.whitepaper && (
                        <a
                          href={token.whitepaper}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          Whitepaper <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(token.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Token</DialogTitle>
            <DialogDescription>
              Approve {selectedToken?.name} ({selectedToken?.symbol}) for deployment?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="approvalNotes">Approval Notes (Optional)</Label>
              <Textarea
                id="approvalNotes"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Add any notes about this approval..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Token</DialogTitle>
            <DialogDescription>
              Reject {selectedToken?.name} ({selectedToken?.symbol})?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason *</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}

