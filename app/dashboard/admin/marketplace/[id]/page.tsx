"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import AuthGuard from "@/components/auth-guard"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Store, 
  Calendar, 
  Globe, 
  Wallet, 
  Palette, 
  Check, 
  X, 
  Loader2,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Clock,
  User,
  Settings
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminMarketplaceDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [marketplace, setMarketplace] = useState<any>(null)
  const [merchant, setMerchant] = useState<any>(null)

  const fetchMarketplaceDetails = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/marketplaces/${id}`)
      const data = await res.json()
      
      if (res.ok) {
        setMarketplace(data.marketplace)
        
        // Fetch merchant details if available
        if (data.marketplace.merchantId) {
          try {
            const merchantRes = await fetch(`/api/merchants`)
            const merchantData = await merchantRes.json()
            if (merchantData.merchants) {
              const foundMerchant = merchantData.merchants.find((m: any) => m.id === data.marketplace.merchantId)
              setMerchant(foundMerchant)
            }
          } catch (error) {
            console.error("Error fetching merchant details:", error)
          }
        }
      } else {
        throw new Error(data.error || "Failed to fetch marketplace")
      }
    } catch (error: any) {
      console.error("Error fetching marketplace:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load marketplace details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (status: "approved" | "rejected") => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/marketplaces/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      })

      const data = await res.json()

      if (res.ok) {
        toast({
          title: "Status Updated",
          description: `Marketplace ${status} successfully.`,
        })
        fetchMarketplaceDetails() // Refresh data
      } else {
        throw new Error(data.error || "Failed to update status")
      }
    } catch (error: any) {
      console.error("Error updating marketplace status:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update marketplace status.",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchMarketplaceDetails()
    }
  }, [id])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Approved</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Rejected</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Draft</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <AuthGuard requiredRole="admin">
        <DashboardLayout role="admin">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  if (!marketplace) {
    return (
      <AuthGuard requiredRole="admin">
        <DashboardLayout role="admin">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Marketplace Not Found</h1>
            </div>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="py-12 text-center">
                <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Marketplace Not Found</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">The marketplace you're looking for doesn't exist or has been removed.</p>
                <Button onClick={() => router.push("/dashboard/admin/marketplaces")}>
                  View All Marketplaces
                </Button>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole="admin">
      <DashboardLayout role="admin">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {marketplace.businessName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Marketplace Details & Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {marketplace.status === "pending" && (
                <>
                  <Button
                    onClick={() => handleStatusUpdate("approved")}
                    disabled={updating}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {updating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate("rejected")}
                    disabled={updating}
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    {updating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <X className="w-4 h-4 mr-2" />
                    )}
                    Reject
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                onClick={() => window.open(`/marketplace/${marketplace.id}`, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Public
              </Button>
            </div>
          </div>

          {/* Status Banner */}
          <Card className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${
            marketplace.status === "approved" ? "border-green-200 dark:border-green-800" :
            marketplace.status === "rejected" ? "border-red-200 dark:border-red-800" :
            "border-yellow-200 dark:border-yellow-800"
          }`}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Store className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">Status:</span>
                  {getStatusBadge(marketplace.status)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Created: {marketplace.createdAt ? new Date(marketplace.createdAt.seconds ? marketplace.createdAt.seconds * 1000 : marketplace.createdAt).toLocaleDateString() : "—"}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Business Information */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                    <Store className="w-5 h-5" />
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Business Name</label>
                    <p className="text-gray-900 dark:text-white font-medium">{marketplace.businessName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</label>
                    <p className="text-gray-900 dark:text-white">{marketplace.description}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Category</label>
                      <div className="mt-1">
                        <Badge variant="outline">{marketplace.category}</Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Template</label>
                      <div className="mt-1">
                        <Badge variant="secondary" className="capitalize">{marketplace.template}</Badge>
                      </div>
                    </div>
                  </div>
                  {marketplace.website && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Website</label>
                      <div className="mt-1">
                        <a 
                          href={marketplace.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <Globe className="w-4 h-4" />
                          {marketplace.website}
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment & Wallet */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Method</label>
                    <p className="text-gray-900 dark:text-white capitalize">{marketplace.paymentMethod}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Wallet Address</label>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <code className="text-sm text-gray-900 dark:text-white break-all">{marketplace.walletAddress}</code>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Design & Branding */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Design & Branding
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Primary Color</label>
                      <div className="mt-1 flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: marketplace.primaryColor }}
                        ></div>
                        <span className="text-sm text-gray-900 dark:text-white font-mono">{marketplace.primaryColor}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Secondary Color</label>
                      <div className="mt-1 flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: marketplace.secondaryColor }}
                        ></div>
                        <span className="text-sm text-gray-900 dark:text-white font-mono">{marketplace.secondaryColor}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Color Preview */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Color Preview</label>
                    <div 
                      className="mt-2 h-20 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                      style={{
                        background: `linear-gradient(45deg, ${marketplace.primaryColor}, ${marketplace.secondaryColor})`
                      }}
                    >
                      {marketplace.businessName}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Merchant Information */}
              {merchant && (
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Merchant Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Business Name</label>
                      <p className="text-gray-900 dark:text-white">{merchant.businessName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                      <p className="text-gray-900 dark:text-white">{merchant.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Category</label>
                      <p className="text-gray-900 dark:text-white">{merchant.category}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                      <div className="mt-1">
                        <Badge className={merchant.isApproved ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"}>
                          {merchant.isApproved ? "Approved" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push("/dashboard/admin/marketplaces")}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Marketplaces
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open(`/marketplace/${marketplace.id}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Public Page
                  </Button>
                  {merchant && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => router.push("/dashboard/admin/merchants")}
                    >
                      <User className="w-4 h-4 mr-2" />
                      View Merchant
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Metadata */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">ID:</span>
                    <code className="text-gray-900 dark:text-white">{marketplace.id}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Created:</span>
                    <span className="text-gray-900 dark:text-white">
                      {marketplace.createdAt ? new Date(marketplace.createdAt.seconds ? marketplace.createdAt.seconds * 1000 : marketplace.createdAt).toLocaleDateString() : "—"}
                    </span>
                  </div>
                  {marketplace.updatedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Updated:</span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(marketplace.updatedAt.seconds ? marketplace.updatedAt.seconds * 1000 : marketplace.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
