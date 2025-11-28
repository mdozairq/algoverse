"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Rocket, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink,
  TrendingUp,
  Layers,
  Settings
} from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import DashboardLayout from "@/components/dashboard-layout"
import AuthGuard from "@/components/auth-guard"
import { useAuth } from "@/lib/auth/auth-context"

interface MarketplaceToken {
  id: string
  marketplaceId: string
  name: string
  symbol: string
  description: string
  totalSupply: number
  decimals: number
  assetId?: number
  status: "draft" | "pending" | "approved" | "rejected" | "deployed"
  initialPrice: number
  initialLiquidity: number
  createdAt: string
  approvedAt?: string
  deployedAt?: string
  rejectionReason?: string
}

interface Marketplace {
  id: string
  businessName: string
  status: string
}

export default function TokenLaunchpadPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([])
  const [tokens, setTokens] = useState<MarketplaceToken[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>("")
  
  const [formData, setFormData] = useState({
    marketplaceId: "",
    name: "",
    symbol: "",
    description: "",
    totalSupply: "",
    decimals: "6",
    initialPrice: "",
    initialLiquidity: "",
    logoUrl: "",
    website: "",
    whitepaper: "",
    tinymanEnabled: true,
    pactEnabled: false,
  })

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMarketplaces()
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (marketplaces.length > 0) {
      fetchTokens()
    }
  }, [marketplaces])

  const fetchMarketplaces = async () => {
    if (!user?.userId) return

    try {
      const response = await fetch(`/api/marketplaces?merchantId=${user.userId}`)
      const data = await response.json()
      
      if (data.marketplaces) {
        const approvedMarketplaces = data.marketplaces.filter(
          (m: Marketplace) => m.status === "approved"
        )
        setMarketplaces(approvedMarketplaces)
      }
    } catch (error) {
      console.error("Error fetching marketplaces:", error)
      toast.error("Failed to load marketplaces")
    }
  }

  const fetchTokens = async () => {
    try {
      // Fetch tokens for all marketplaces
      const allTokens: MarketplaceToken[] = []
      for (const marketplace of marketplaces) {
        const response = await fetch(`/api/marketplaces/${marketplace.id}/tokens`)
        const data = await response.json()
        if (data.tokens) {
          allTokens.push(...data.tokens)
        }
      }
      setTokens(allTokens)
    } catch (error) {
      console.error("Error fetching tokens:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/marketplaces/${formData.marketplaceId}/tokens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          symbol: formData.symbol,
          description: formData.description,
          totalSupply: Number(formData.totalSupply),
          decimals: Number(formData.decimals),
          initialPrice: Number(formData.initialPrice),
          initialLiquidity: Number(formData.initialLiquidity),
          logoUrl: formData.logoUrl || undefined,
          website: formData.website || undefined,
          whitepaper: formData.whitepaper || undefined,
          liquidityPools: {
            tinyman: { enabled: formData.tinymanEnabled },
            pact: { enabled: formData.pactEnabled },
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Token launchpad request submitted successfully!")
        setFormData({
          marketplaceId: "",
          name: "",
          symbol: "",
          description: "",
          totalSupply: "",
          decimals: "6",
          initialPrice: "",
          initialLiquidity: "",
          logoUrl: "",
          website: "",
          whitepaper: "",
          tinymanEnabled: true,
          pactEnabled: false,
        })
        fetchTokens()
      } else {
        toast.error(data.error || "Failed to submit token request")
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit token request")
    } finally {
      setLoading(false)
    }
  }

  const handleDeploy = async (tokenId: string, marketplaceId: string) => {
    if (!confirm("Deploy this token to Algorand blockchain? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(
        `/api/marketplaces/${marketplaceId}/tokens/${tokenId}/deploy`,
        { method: "POST" }
      )

      const data = await response.json()

      if (data.success) {
        toast.success("Token deployed successfully!")
        fetchTokens()
      } else {
        toast.error(data.error || "Failed to deploy token")
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to deploy token")
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
    <AuthGuard requiredRole="merchant">
      <DashboardLayout role="merchant">
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Token Launchpad</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Launch your marketplace token and enable custom payment methods
            </p>
          </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList>
          <TabsTrigger value="create">Create Token</TabsTrigger>
          <TabsTrigger value="tokens">My Tokens</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                Create New Token
              </CardTitle>
              <CardDescription>
                Submit a token launchpad request for your marketplace. Admin approval required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="marketplaceId">Marketplace *</Label>
                  <Select
                    value={formData.marketplaceId}
                    onValueChange={(value) => {
                      setFormData({ ...formData, marketplaceId: value })
                      setSelectedMarketplace(value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select marketplace" />
                    </SelectTrigger>
                    <SelectContent>
                      {marketplaces.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.businessName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Token Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="My Marketplace Token"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="symbol">Token Symbol *</Label>
                    <Input
                      id="symbol"
                      value={formData.symbol}
                      onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                      placeholder="MMT"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your token and its use case..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="totalSupply">Total Supply *</Label>
                    <Input
                      id="totalSupply"
                      type="number"
                      value={formData.totalSupply}
                      onChange={(e) => setFormData({ ...formData, totalSupply: e.target.value })}
                      placeholder="1000000"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="decimals">Decimals</Label>
                    <Input
                      id="decimals"
                      type="number"
                      value={formData.decimals}
                      onChange={(e) => setFormData({ ...formData, decimals: e.target.value })}
                      placeholder="6"
                      min="0"
                      max="18"
                    />
                  </div>
                  <div>
                    <Label htmlFor="initialPrice">Initial Price (ALGO) *</Label>
                    <Input
                      id="initialPrice"
                      type="number"
                      step="0.000001"
                      value={formData.initialPrice}
                      onChange={(e) => setFormData({ ...formData, initialPrice: e.target.value })}
                      placeholder="0.01"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="initialLiquidity">Initial Liquidity (ALGO) *</Label>
                  <Input
                    id="initialLiquidity"
                    type="number"
                    step="0.000001"
                    value={formData.initialLiquidity}
                    onChange={(e) => setFormData({ ...formData, initialLiquidity: e.target.value })}
                    placeholder="1000"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Amount of ALGO to provide as initial liquidity
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input
                      id="logoUrl"
                      type="url"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="whitepaper">Whitepaper URL</Label>
                  <Input
                    id="whitepaper"
                    type="url"
                    value={formData.whitepaper}
                    onChange={(e) => setFormData({ ...formData, whitepaper: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-4">
                  <Label>Liquidity Pool Configuration</Label>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Tinyman V2</p>
                      <p className="text-sm text-gray-500">0.30% trading fee</p>
                    </div>
                    <Switch
                      checked={formData.tinymanEnabled}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, tinymanEnabled: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Pact Finance</p>
                      <p className="text-sm text-gray-500">0.25% trading fee</p>
                    </div>
                    <Switch
                      checked={formData.pactEnabled}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, pactEnabled: checked })
                      }
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Submitting..." : "Submit for Approval"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tokens">
          <div className="grid gap-4">
            {tokens.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">No tokens created yet</p>
                </CardContent>
              </Card>
            ) : (
              tokens.map((token) => (
                <Card key={token.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {token.name} ({token.symbol})
                          {getStatusBadge(token.status)}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {token.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Total Supply</p>
                        <p className="font-semibold">{token.totalSupply.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Initial Price</p>
                        <p className="font-semibold">{token.initialPrice} ALGO</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Liquidity</p>
                        <p className="font-semibold">{token.initialLiquidity} ALGO</p>
                      </div>
                      {token.assetId && (
                        <div>
                          <p className="text-sm text-gray-500">Asset ID</p>
                          <p className="font-semibold">{token.assetId}</p>
                        </div>
                      )}
                    </div>

                    {token.status === "rejected" && token.rejectionReason && (
                      <Alert className="mb-4">
                        <AlertDescription>
                          <strong>Rejection Reason:</strong> {token.rejectionReason}
                        </AlertDescription>
                      </Alert>
                    )}

                    {token.status === "approved" && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDeploy(token.id, token.marketplaceId)}
                          className="flex-1"
                        >
                          <Rocket className="w-4 h-4 mr-2" />
                          Deploy to Blockchain
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/dashboard/merchant/token-launchpad/automation?tokenId=${token.id}&marketplaceId=${token.marketplaceId}`)}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Automation
                        </Button>
                      </div>
                    )}
                    {token.status === "deployed" && (
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/dashboard/merchant/token-launchpad/automation?tokenId=${token.id}&marketplaceId=${token.marketplaceId}`)}
                        className="w-full"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Manage Automation
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}

