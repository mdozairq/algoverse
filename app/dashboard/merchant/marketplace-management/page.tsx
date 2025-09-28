"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Settings, 
  Palette, 
  Globe, 
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  Store,
  BarChart3,
  Calendar,
  Zap,
  ArrowRightLeft,
  Mint
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import AuthGuard from "@/components/auth-guard"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-context"
import Link from "next/link"

interface Marketplace {
  id: string
  businessName: string
  description: string
  category: string
  status: "draft" | "pending" | "approved" | "rejected"
  primaryColor: string
  secondaryColor: string
  template: string
  isActive: boolean
  createdAt: Date
  updatedAt?: Date
  customDomain?: string
  configuration?: {
    mintingConfig: any
    tradingConfig: any
    swapConfig: any
    nftConfig: any
    addressConfig: any
  }
}

export default function MarketplaceManagement() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingMarketplace, setEditingMarketplace] = useState<Marketplace | null>(null)
  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    category: "",
    template: "modern",
    primaryColor: "#3B82F6",
    secondaryColor: "#1E40AF",
    customDomain: ""
  })
  
  const { toast } = useToast()
  const { user } = useAuth()

  const fetchMarketplaces = async (isRefresh = false) => {
    if (!user) return

    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await fetch(`/api/marketplaces?merchantId=${user.userId}`)
      if (response.ok) {
        const data = await response.json()
        setMarketplaces(data.marketplaces || [])
      } else {
        throw new Error("Failed to fetch marketplaces")
      }
    } catch (error) {
      console.error("Error fetching marketplaces:", error)
      toast({
        title: "Error",
        description: "Failed to fetch marketplaces",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchMarketplaces()
  }, [user])

  const handleCreateMarketplace = async () => {
    if (!user) return

    setActionLoading("create")
    try {
      const response = await fetch("/api/marketplaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          merchantId: user.userId,
          walletAddress: user.walletAddress || user.address
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Marketplace created successfully!",
        })
        setShowCreateDialog(false)
        setFormData({
          businessName: "",
          description: "",
          category: "",
          template: "modern",
          primaryColor: "#3B82F6",
          secondaryColor: "#1E40AF",
          customDomain: ""
        })
        fetchMarketplaces(true)
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to create marketplace")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create marketplace",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpdateMarketplace = async (marketplaceId: string) => {
    setActionLoading(marketplaceId)
    try {
      const response = await fetch(`/api/marketplaces/${marketplaceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Marketplace updated successfully!",
        })
        setEditingMarketplace(null)
        setFormData({
          businessName: "",
          description: "",
          category: "",
          template: "modern",
          primaryColor: "#3B82F6",
          secondaryColor: "#1E40AF",
          customDomain: ""
        })
        fetchMarketplaces(true)
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to update marketplace")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update marketplace",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteMarketplace = async (marketplaceId: string) => {
    setActionLoading(marketplaceId)
    try {
      const response = await fetch(`/api/marketplaces/${marketplaceId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Marketplace deleted successfully!",
        })
        fetchMarketplaces(true)
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete marketplace")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete marketplace",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const copyMarketplaceUrl = (marketplaceId: string) => {
    const url = `${window.location.origin}/merchant/${user?.userId}/marketplace/${marketplaceId}`
    navigator.clipboard.writeText(url)
    toast({
      title: "Copied",
      description: "Marketplace URL copied to clipboard",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "draft": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const openEditDialog = (marketplace: Marketplace) => {
    setEditingMarketplace(marketplace)
    setFormData({
      businessName: marketplace.businessName,
      description: marketplace.description,
      category: marketplace.category,
      template: marketplace.template,
      primaryColor: marketplace.primaryColor,
      secondaryColor: marketplace.secondaryColor,
      customDomain: marketplace.customDomain || ""
    })
  }

  return (
    <AuthGuard allowedRoles={["merchant"]}>
      <DashboardLayout role="merchant">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Marketplace Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Create and manage your independent marketplaces
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchMarketplaces(true)}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Marketplace
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Marketplace</DialogTitle>
                    <DialogDescription>
                      Set up your independent marketplace with custom branding and features
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input
                          id="businessName"
                          value={formData.businessName}
                          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                          placeholder="Enter business name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="entertainment">Entertainment</SelectItem>
                            <SelectItem value="sports">Sports</SelectItem>
                            <SelectItem value="art">Art & Culture</SelectItem>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe your marketplace"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="template">Template</Label>
                        <Select value={formData.template} onValueChange={(value) => setFormData({ ...formData, template: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="modern">Modern</SelectItem>
                            <SelectItem value="classic">Classic</SelectItem>
                            <SelectItem value="minimal">Minimal</SelectItem>
                            <SelectItem value="creative">Creative</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="customDomain">Custom Domain (Optional)</Label>
                        <Input
                          id="customDomain"
                          value={formData.customDomain}
                          onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                          placeholder="yourmarketplace.com"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="primaryColor"
                            type="color"
                            value={formData.primaryColor}
                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={formData.primaryColor}
                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="secondaryColor">Secondary Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="secondaryColor"
                            type="color"
                            value={formData.secondaryColor}
                            onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={formData.secondaryColor}
                            onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateMarketplace} disabled={actionLoading === "create"}>
                        {actionLoading === "create" ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        Create Marketplace
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Marketplaces Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
          ) : marketplaces.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Store className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Marketplaces Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                  Create your first independent marketplace to start selling NFTs
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Marketplace
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketplaces.map((marketplace) => (
                <Card key={marketplace.id} className="relative">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{marketplace.businessName}</CardTitle>
                        <CardDescription className="mt-1">
                          {marketplace.description}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(marketplace.status)}>
                        {marketplace.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Color Preview */}
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: marketplace.primaryColor }}
                        />
                        <div 
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: marketplace.secondaryColor }}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {marketplace.template} template
                        </span>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyMarketplaceUrl(marketplace.id)}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy URL
                        </Button>
                        {marketplace.status === "approved" && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/merchant/${user?.userId}/marketplace/${marketplace.id}`}>
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View
                            </Link>
                          </Button>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(marketplace)}
                          disabled={actionLoading === marketplace.id}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/dashboard/merchant/marketplace-management/${marketplace.id}/pages`}>
                            <Settings className="w-3 h-3 mr-1" />
                            Pages
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={actionLoading === marketplace.id}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Marketplace</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{marketplace.businessName}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteMarketplace(marketplace.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Edit Dialog */}
          <Dialog open={!!editingMarketplace} onOpenChange={() => setEditingMarketplace(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Marketplace</DialogTitle>
                <DialogDescription>
                  Update your marketplace settings and branding
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-businessName">Business Name</Label>
                    <Input
                      id="edit-businessName"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      placeholder="Enter business name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="art">Art & Culture</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your marketplace"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-template">Template</Label>
                    <Select value={formData.template} onValueChange={(value) => setFormData({ ...formData, template: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="classic">Classic</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-customDomain">Custom Domain (Optional)</Label>
                    <Input
                      id="edit-customDomain"
                      value={formData.customDomain}
                      onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                      placeholder="yourmarketplace.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-primaryColor">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="edit-primaryColor"
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-secondaryColor">Secondary Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="edit-secondaryColor"
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingMarketplace(null)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => editingMarketplace && handleUpdateMarketplace(editingMarketplace.id)} 
                    disabled={actionLoading === editingMarketplace?.id}
                  >
                    {actionLoading === editingMarketplace?.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Edit className="w-4 h-4 mr-2" />
                    )}
                    Update Marketplace
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
