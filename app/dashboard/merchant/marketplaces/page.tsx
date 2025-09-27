"use client"

import { useEffect, useState } from "react"
import AuthGuard from "@/components/auth-guard"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Store, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Loader2, 
  RefreshCw,
  Search,
  Globe
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-context"

interface Marketplace {
  id: string
  businessName: string
  description: string
  category: string
  template: string
  website?: string
  status: "draft" | "pending" | "approved" | "rejected"
  merchantId: string
  createdAt: any
  updatedAt?: any
}

export default function MerchantMarketplacesPage() {
  const [loading, setLoading] = useState(true)
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingMarketplace, setEditingMarketplace] = useState<Marketplace | null>(null)
  const [filter, setFilter] = useState<"all" | "draft" | "pending" | "approved" | "rejected">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuth()

  // Form state
  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    category: "",
    template: "",
    website: "",
  })

  const fetchMarketplaces = async () => {
    if (!isAuthenticated || !user?.userId) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/marketplaces?merchantId=${user.userId}`)
      const data = await res.json()
      if (res.ok) {
        setMarketplaces(data.marketplaces || [])
      } else {
        throw new Error(data.error || "Failed to fetch marketplaces")
      }
    } catch (error: any) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to load marketplaces",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }


  const handleEditMarketplace = async () => {
    if (!editingMarketplace) return

    try {
      const res = await fetch(`/api/marketplaces/${editingMarketplace.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (res.ok) {
        toast({
          title: "Success",
          description: "Marketplace updated successfully",
        })
        setIsEditDialogOpen(false)
        setEditingMarketplace(null)
        resetForm()
        fetchMarketplaces()
      } else {
        throw new Error(data.error || "Failed to update marketplace")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update marketplace",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMarketplace = async (marketplaceId: string) => {
    if (!confirm("Are you sure you want to delete this marketplace?")) return

    try {
      const res = await fetch(`/api/marketplaces/${marketplaceId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Marketplace deleted successfully",
        })
        fetchMarketplaces()
      } else {
        throw new Error("Failed to delete marketplace")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete marketplace",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      businessName: "",
      description: "",
      category: "",
      template: "",
      website: "",
    })
  }

  const openEditDialog = (marketplace: Marketplace) => {
    setEditingMarketplace(marketplace)
    setFormData({
      businessName: marketplace.businessName,
      description: marketplace.description,
      category: marketplace.category,
      template: marketplace.template,
      website: marketplace.website || "",
    })
    setIsEditDialogOpen(true)
  }

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

  const filteredMarketplaces = marketplaces.filter(marketplace => {
    const matchesFilter = filter === "all" || marketplace.status === filter
    const matchesSearch = marketplace.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         marketplace.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMarketplaces()
    }
  }, [isAuthenticated, user])

  return (
    <AuthGuard requiredRole="merchant">
      <DashboardLayout role="merchant">
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Marketplaces</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your marketplaces</p>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {filteredMarketplaces.length} marketplace{filteredMarketplaces.length !== 1 ? 's' : ''} found
                {filter !== "all" && ` (${filter})`}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchMarketplaces}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button asChild className="flex items-center gap-2">
                <a href="/dashboard/merchant/marketplaces/create-marketplace">
                  <Plus className="w-4 h-4" />
                  Create Marketplace
                </a>
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex gap-4">
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filter === "draft" ? "default" : "outline"}
                onClick={() => setFilter("draft")}
                size="sm"
              >
                Draft
              </Button>
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                onClick={() => setFilter("pending")}
                size="sm"
              >
                Pending
              </Button>
              <Button
                variant={filter === "approved" ? "default" : "outline"}
                onClick={() => setFilter("approved")}
                size="sm"
              >
                Approved
              </Button>
              <Button
                variant={filter === "rejected" ? "default" : "outline"}
                onClick={() => setFilter("rejected")}
                size="sm"
              >
                Rejected
              </Button>
            </div>
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search marketplaces..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">My Marketplaces</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Manage your marketplaces and track their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 dark:border-gray-700">
                    <TableHead className="text-gray-600 dark:text-gray-400">Marketplace</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Category</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Template</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Website</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow className="border-gray-200 dark:border-gray-700">
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-gray-500">Loading marketplaces...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredMarketplaces.length === 0 ? (
                    <TableRow className="border-gray-200 dark:border-gray-700">
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <Store className="h-8 w-8 text-gray-400" />
                          <span>No marketplaces found</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMarketplaces.map((marketplace) => (
                      <TableRow key={marketplace.id} className="border-gray-200 dark:border-gray-700">
                        <TableCell className="text-gray-900 dark:text-white">
                          <div>
                            <div className="font-medium">{marketplace.businessName}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {marketplace.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-300">
                          <Badge variant="outline" className="text-xs">
                            {marketplace.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-300">
                          <Badge variant="secondary" className="text-xs capitalize">
                            {marketplace.template}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-300">
                          {marketplace.website ? (
                            <a 
                              href={marketplace.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                            >
                              <Globe className="w-3 h-3" />
                              Visit
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">No website</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(marketplace.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(marketplace)}
                              title="Edit marketplace"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                              title="View marketplace"
                            >
                              <a href={`/marketplace/${marketplace.id}`} target="_blank" rel="noopener noreferrer">
                                <Eye className="w-4 h-4" />
                              </a>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteMarketplace(marketplace.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete marketplace"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Marketplace</DialogTitle>
                <DialogDescription>
                  Update the marketplace details
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
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
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter marketplace description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="fashion">Fashion</SelectItem>
                        <SelectItem value="food">Food & Beverage</SelectItem>
                        <SelectItem value="art">Art & Design</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="health">Health & Wellness</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-template">Template</Label>
                    <Select value={formData.template} onValueChange={(value) => setFormData({ ...formData, template: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-website">Website (Optional)</Label>
                  <Input
                    id="edit-website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditMarketplace}>Update Marketplace</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}