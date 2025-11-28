"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import AuthGuard from "@/components/auth-guard"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-context"
import { ArrowLeft, Loader2, Save, Store, Zap, Sparkles, ArrowRightLeft, Settings } from "lucide-react"

interface Merchant {
  id: string
  businessName: string
  email: string
  category: string
  walletAddress: string
  isApproved: boolean
  status?: "pending" | "approved" | "rejected"
  permissions?: {
    allowMarketplace?: boolean
    allowMint?: boolean
    allowDutchMint?: boolean
    allowAIGenerated?: boolean
    allowTrade?: boolean
    allowSwap?: boolean
  }
}

export default function MerchantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [permissions, setPermissions] = useState({
    allowMarketplace: false,
    allowMint: false,
    allowDutchMint: false,
    allowAIGenerated: false,
    allowTrade: false,
    allowSwap: false,
  })

  useEffect(() => {
    if (isAuthenticated && user && params.id) {
      fetchMerchant()
    }
  }, [isAuthenticated, user, params.id])

  const fetchMerchant = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/merchants/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setMerchant(data.merchant)
        setPermissions({
          allowMarketplace: data.merchant?.permissions?.allowMarketplace ?? false,
          allowMint: data.merchant?.permissions?.allowMint ?? false,
          allowDutchMint: data.merchant?.permissions?.allowDutchMint ?? false,
          allowAIGenerated: data.merchant?.permissions?.allowAIGenerated ?? false,
          allowTrade: data.merchant?.permissions?.allowTrade ?? false,
          allowSwap: data.merchant?.permissions?.allowSwap ?? false,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch merchant details",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching merchant:", error)
      toast({
        title: "Error",
        description: "Failed to fetch merchant details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSavePermissions = async () => {
    if (!merchant) return

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/merchants/${params.id}/permissions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ permissions }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Merchant permissions updated successfully",
        })
        fetchMerchant()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to update permissions")
      }
    } catch (error: any) {
      console.error("Error updating permissions:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update permissions",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AuthGuard requiredRole="admin">
        <DashboardLayout role="admin">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  if (!merchant) {
    return (
      <AuthGuard requiredRole="admin">
        <DashboardLayout role="admin">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Merchant not found</p>
            <Button onClick={() => router.push("/dashboard/admin/merchants")} className="mt-4">
              Back to Merchants
            </Button>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole="admin">
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/admin/merchants")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {merchant.businessName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{merchant.email}</p>
              </div>
            </div>
            <Badge
              variant={
                merchant.status === "approved"
                  ? "default"
                  : merchant.status === "rejected"
                  ? "destructive"
                  : "secondary"
              }
            >
              {merchant.status || (merchant.isApproved ? "approved" : "pending")}
            </Badge>
          </div>

          {/* Merchant Info */}
          <Card>
            <CardHeader>
              <CardTitle>Merchant Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600 dark:text-gray-400">Business Name</Label>
                  <p className="font-medium">{merchant.businessName}</p>
                </div>
                <div>
                  <Label className="text-gray-600 dark:text-gray-400">Category</Label>
                  <p className="font-medium">{merchant.category}</p>
                </div>
                <div>
                  <Label className="text-gray-600 dark:text-gray-400">Email</Label>
                  <p className="font-medium">{merchant.email}</p>
                </div>
                <div>
                  <Label className="text-gray-600 dark:text-gray-400">Wallet Address</Label>
                  <p className="font-medium font-mono text-sm">
                    {merchant.walletAddress.slice(0, 10)}...{merchant.walletAddress.slice(-8)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Permissions</CardTitle>
              <CardDescription>
                Control which features this merchant can access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {/* Marketplace */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Store className="w-5 h-5 text-gray-400" />
                    <div>
                      <Label className="text-base font-medium">Marketplace</Label>
                      <p className="text-sm text-gray-500">
                        Allow merchant to create and manage marketplaces
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={permissions.allowMarketplace}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, allowMarketplace: checked })
                    }
                  />
                </div>

                {/* Mint */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-gray-400" />
                    <div>
                      <Label className="text-base font-medium">Mint</Label>
                      <p className="text-sm text-gray-500">
                        Allow merchant to mint NFTs
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={permissions.allowMint}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, allowMint: checked })
                    }
                  />
                </div>

                {/* Dutch Mint */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-gray-400" />
                    <div>
                      <Label className="text-base font-medium">Dutch Mint</Label>
                      <p className="text-sm text-gray-500">
                        Allow merchant to use Dutch auction minting
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={permissions.allowDutchMint}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, allowDutchMint: checked })
                    }
                  />
                </div>

                {/* AI Generated */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-gray-400" />
                    <div>
                      <Label className="text-base font-medium">AI Generated</Label>
                      <p className="text-sm text-gray-500">
                        Allow merchant to generate NFTs using AI
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={permissions.allowAIGenerated}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, allowAIGenerated: checked })
                    }
                  />
                </div>

                {/* Trade */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <ArrowRightLeft className="w-5 h-5 text-gray-400" />
                    <div>
                      <Label className="text-base font-medium">Trade</Label>
                      <p className="text-sm text-gray-500">
                        Allow merchant to list and trade NFTs
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={permissions.allowTrade}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, allowTrade: checked })
                    }
                  />
                </div>

                {/* Swap */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <ArrowRightLeft className="w-5 h-5 text-gray-400" />
                    <div>
                      <Label className="text-base font-medium">Swap</Label>
                      <p className="text-sm text-gray-500">
                        Allow merchant to enable NFT swaps
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={permissions.allowSwap}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, allowSwap: checked })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSavePermissions} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Permissions
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}

