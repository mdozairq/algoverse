"use client"

import { useEffect, useState } from "react"
import AuthGuard from "@/components/auth-guard"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, Edit, ExternalLink, Store } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function MerchantMarketplacesPage() {
  const [loading, setLoading] = useState(true)
  const [marketplaces, setMarketplaces] = useState<any[]>([])
  const { toast } = useToast()

  const fetchMarketplaces = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/marketplaces")
      const data = await res.json()
      if (res.ok) setMarketplaces(data.marketplaces || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMarketplaces()
  }, [])

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
    <AuthGuard requiredRole="merchant">
      <DashboardLayout role="merchant">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">My Marketplaces</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your marketplace applications and listings</p>
            </div>
            <Link href="/dashboard/merchant/create-marketplace">
              <Button className="rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                Create Marketplace
              </Button>
            </Link>
          </div>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Marketplace Applications</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Track the status of your marketplace applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 dark:border-gray-700">
                    <TableHead className="text-gray-600 dark:text-gray-400">Business Name</TableHead>
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
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">Loading...</TableCell>
                    </TableRow>
                  ) : marketplaces.length === 0 ? (
                    <TableRow className="border-gray-200 dark:border-gray-700">
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        <div className="flex flex-col items-center gap-4">
                          <Store className="w-12 h-12 text-gray-400" />
                          <div>
                            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">No marketplaces yet</p>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first marketplace to start selling event NFTs</p>
                            <Link href="/dashboard/merchant/create-marketplace">
                              <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Marketplace
                              </Button>
                            </Link>
                          </div>
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
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-300">{marketplace.category}</TableCell>
                        <TableCell>{getStatusBadge(marketplace.status)}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-300 capitalize">{marketplace.template}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-300">
                          {marketplace.createdAt ? new Date(marketplace.createdAt.seconds ? marketplace.createdAt.seconds * 1000 : marketplace.createdAt).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/marketplace/${marketplace.id}`}>
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                            {marketplace.status === "draft" && (
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/dashboard/merchant/create-marketplace?edit=${marketplace.id}`}>
                                  <Edit className="w-4 h-4" />
                                </Link>
                              </Button>
                            )}
                            {marketplace.website && (
                              <Button size="sm" variant="outline" asChild>
                                <Link href={marketplace.website} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4" />
                                </Link>
                              </Button>
                            )}
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
