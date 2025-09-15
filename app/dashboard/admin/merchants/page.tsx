"use client"

import { useEffect, useState } from "react"
import AuthGuard from "@/components/auth-guard"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-context"

interface Merchant {
  id: string
  businessName: string
  email: string
  category: string
  walletAddress: string
  isApproved: boolean
  createdAt?: any
}

export default function AdminMerchantsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const { user, isAuthenticated } = useAuth()

  const fetchMerchants = async () => {
    // Don't fetch if user is not authenticated
    if (!isAuthenticated || !user) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/admin/merchants")
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

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMerchants()
    }
  }, [isAuthenticated, user])

  return (
    <AuthGuard requiredRole="admin">
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Merchants</h1>
            <p className="text-gray-600 dark:text-gray-400">Review and approve merchant applications</p>
          </div>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Pending Merchants</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">Applications awaiting approval</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 dark:border-gray-700">
                    <TableHead className="text-gray-600 dark:text-gray-400">Merchant</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Category</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Wallet</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow className="border-gray-200 dark:border-gray-700">
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">Loading...</TableCell>
                    </TableRow>
                  ) : merchants.length === 0 ? (
                    <TableRow className="border-gray-200 dark:border-gray-700">
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">No pending merchants</TableCell>
                    </TableRow>
                  ) : (
                    merchants.map((m) => (
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
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-500/20 dark:bg-yellow-900 dark:text-yellow-400">Pending</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => updateApproval(m.id, true)}>
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white bg-transparent" onClick={() => updateApproval(m.id, false)}>
                              Reject
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
