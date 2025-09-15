"use client"

import { useEffect, useState } from "react"
import AuthGuard from "@/components/auth-guard"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Eye, Loader2, Store, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function AdminMarketplacesPage() {
  const [loading, setLoading] = useState(true)
  const [marketplaces, setMarketplaces] = useState<any[]>([])
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchMarketplaces = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/marketplaces${filter !== "all" ? `?status=${filter}` : ""}`)
      const data = await res.json()
      if (res.ok) {
        setMarketplaces(data.marketplaces || [])
      } else {
        throw new Error(data.error || "Failed to fetch marketplaces")
      }
    } catch (e) {
      console.error(e)
      toast({
        title: "Error",
        description: "Failed to load marketplaces",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (marketplaceId: string, status: "approved" | "rejected") => {
    setUpdatingId(marketplaceId)
    try {
      const res = await fetch(`/api/marketplaces/${marketplaceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify({ status }),
      })

      const data = await res.json()

      if (res.ok) {
        toast({
          title: "Status Updated",
          description: `Marketplace ${status} successfully.`,
        })
        fetchMarketplaces() // Refresh the list
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
      setUpdatingId(null)
    }
  }

  useEffect(() => {
    fetchMarketplaces()
  }, [filter])

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

  return (
    <AuthGuard requiredRole="admin">
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Marketplaces</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage marketplace applications and approvals</p>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {marketplaces.length} marketplace{marketplaces.length !== 1 ? 's' : ''} found
                {filter !== "all" && ` (${filter})`}
              </div>
            </div>
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
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              size="sm"
            >
              All
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

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Marketplace Applications</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Review and manage marketplace applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 dark:border-gray-700">
                    <TableHead className="text-gray-600 dark:text-gray-400">Business</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Category</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Template</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Created</TableHead>
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
                  ) : marketplaces.length === 0 ? (
                    <TableRow className="border-gray-200 dark:border-gray-700">
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <Store className="h-8 w-8 text-gray-400" />
                          <span>No marketplaces found</span>
                          {filter !== "all" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setFilter("all")}
                            >
                              View All
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    marketplaces.map((marketplace) => (
                      <TableRow key={marketplace.id} className="border-gray-200 dark:border-gray-700">
                        <TableCell className="text-gray-900 dark:text-white">
                          <div>
                            <div className="font-medium">{marketplace.businessName}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {marketplace.description}
                            </div>
                            {marketplace.website && (
                              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                {marketplace.website}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-300">
                          <Badge variant="outline" className="text-xs">
                            {marketplace.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(marketplace.status)}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-300 capitalize">
                          <Badge variant="secondary" className="text-xs">
                            {marketplace.template}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-300">
                          {marketplace.createdAt ? new Date(marketplace.createdAt.seconds ? marketplace.createdAt.seconds * 1000 : marketplace.createdAt).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {marketplace.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(marketplace.id, "approved")}
                                  disabled={updatingId === marketplace.id}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  title="Approve marketplace"
                                >
                                  {updatingId === marketplace.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Check className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(marketplace.id, "rejected")}
                                  disabled={updatingId === marketplace.id}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Reject marketplace"
                                >
                                  {updatingId === marketplace.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <X className="w-4 h-4" />
                                  )}
                                </Button>
                              </>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              asChild
                              title="View marketplace details"
                            >
                              <Link href={`/marketplace/${marketplace.id}`}>
                                <Eye className="w-4 h-4" />
                              </Link>
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
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
