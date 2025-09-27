"use client"

import { useEffect, useState } from "react"
import AuthGuard from "@/components/auth-guard"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-context"

interface Merchant {
  id: string
  businessName: string
  email: string
  category: string
  walletAddress: string
  isApproved: boolean
  status?: 'pending' | 'approved' | 'rejected'
  createdAt?: any
}

export default function AdminMerchantsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const { user, isAuthenticated } = useAuth()

  // Helper function to get merchant status
  const getMerchantStatus = (merchant: Merchant): 'pending' | 'approved' | 'rejected' => {
    if (merchant.status) return merchant.status
    return merchant.isApproved ? 'approved' : 'pending'
  }

  // Filter merchants by status
  const getMerchantsByStatus = (status: 'all' | 'pending' | 'approved' | 'rejected') => {
    if (status === 'all') return merchants
    return merchants.filter(merchant => getMerchantStatus(merchant) === status)
  }

  const fetchMerchants = async (status?: 'all' | 'pending' | 'approved' | 'rejected') => {
    // Don't fetch if user is not authenticated
    if (!isAuthenticated || !user) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const url = status && status !== 'all' ? `/api/admin/merchants?status=${status}` : '/api/admin/merchants'
      const res = await fetch(url)
      const data = await res.json()
      if (res.ok) {
        setMerchants(data.merchants || [])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const updateApproval = async (merchantId: string, approved: boolean) => {
    // Don't update if user is not authenticated
    if (!isAuthenticated || !user) {
      return
    }

    try {
      const res = await fetch("/api/admin/merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantId, approved }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      toast({ title: approved ? "Merchant approved" : "Merchant rejected" })
      fetchMerchants()
    } catch (error: any) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" })
    }
  }

  // Reusable table component for merchants
  const MerchantTable = ({ merchantsList, showActions = true }: { merchantsList: Merchant[], showActions?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-200 dark:border-gray-700">
          <TableHead className="text-gray-600 dark:text-gray-400">Merchant</TableHead>
          <TableHead className="text-gray-600 dark:text-gray-400">Category</TableHead>
          <TableHead className="text-gray-600 dark:text-gray-400">Wallet</TableHead>
          <TableHead className="text-gray-600 dark:text-gray-400">Status</TableHead>
          {showActions && <TableHead className="text-gray-600 dark:text-gray-400">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow className="border-gray-200 dark:border-gray-700">
            <TableCell colSpan={showActions ? 5 : 4} className="text-center py-8 text-gray-500">Loading...</TableCell>
          </TableRow>
        ) : merchantsList.length === 0 ? (
          <TableRow className="border-gray-200 dark:border-gray-700">
            <TableCell colSpan={showActions ? 5 : 4} className="text-center py-8 text-gray-500">No merchants found</TableCell>
          </TableRow>
        ) : (
          merchantsList.map((m) => (
            <TableRow key={m.id} className="border-gray-200 dark:border-gray-700">
              <TableCell>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{m.businessName}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{m.email}</div>
                </div>
              </TableCell>
              <TableCell className="text-gray-900 dark:text-gray-300">{m.category}</TableCell>
              <TableCell className="text-gray-900 dark:text-gray-300 truncate max-w-[180px]">{m.walletAddress || "-"}</TableCell>
              <TableCell>
                {getMerchantStatus(m) === 'approved' && (
                  <Badge className="bg-green-100 text-green-800 border-green-500/20 dark:bg-green-900 dark:text-green-400">Approved</Badge>
                )}
                {getMerchantStatus(m) === 'pending' && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-500/20 dark:bg-yellow-900 dark:text-yellow-400">Pending</Badge>
                )}
                {getMerchantStatus(m) === 'rejected' && (
                  <Badge className="bg-red-100 text-red-800 border-red-500/20 dark:bg-red-900 dark:text-red-400">Rejected</Badge>
                )}
              </TableCell>
              {showActions && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getMerchantStatus(m) === 'pending' && (
                      <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => updateApproval(m.id, true)}>
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white bg-transparent" onClick={() => updateApproval(m.id, false)}>
                          Reject
                        </Button>
                      </>
                    )}
                    {getMerchantStatus(m) === 'approved' && (
                      <Button size="sm" variant="outline" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white bg-transparent" onClick={() => updateApproval(m.id, false)}>
                        Disable
                      </Button>
                    )}
                    {getMerchantStatus(m) === 'rejected' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => updateApproval(m.id, true)}>
                        Approve/Enable
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )

  // Handle tab change
  const handleTabChange = (value: string) => {
    const tabValue = value as 'all' | 'pending' | 'approved' | 'rejected'
    setActiveTab(tabValue)
    fetchMerchants(tabValue)
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMerchants('all') // Fetch all merchants initially
    }
  }, [isAuthenticated, user])

  return (
    <AuthGuard requiredRole="admin">
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Merchants</h1>
            <p className="text-gray-600 dark:text-gray-400">Review and manage merchant applications</p>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                All ({merchants.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({getMerchantsByStatus('pending').length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({getMerchantsByStatus('approved').length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({getMerchantsByStatus('rejected').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">All Merchants</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Complete list of all merchant applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <MerchantTable merchantsList={getMerchantsByStatus('all')} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pending">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Pending Merchants</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Applications awaiting approval</CardDescription>
                </CardHeader>
                <CardContent>
                  <MerchantTable merchantsList={getMerchantsByStatus('pending')} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="approved">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Approved Merchants</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Successfully approved merchant applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <MerchantTable merchantsList={getMerchantsByStatus('approved')} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rejected">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Rejected Merchants</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Rejected merchant applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <MerchantTable merchantsList={getMerchantsByStatus('rejected')} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
