"use client"

import { useEffect, useState } from "react"
import AuthGuard from "@/components/auth-guard"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AdminMarketplacesPage() {
  const [loading, setLoading] = useState(true)
  const [merchants, setMerchants] = useState<any[]>([])

  const fetchApprovedMerchants = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/merchants?approved=true")
      const data = await res.json()
      if (res.ok) setMerchants(data.merchants || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApprovedMerchants()
  }, [])

  return (
    <AuthGuard requiredRole="admin">
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Marketplaces</h1>
            <p className="text-gray-600 dark:text-gray-400">Approved merchants and their marketplaces</p>
          </div>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Approved Merchants</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">Merchants with active access</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 dark:border-gray-700">
                    <TableHead className="text-gray-600 dark:text-gray-400">Business</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Email</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Category</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow className="border-gray-200 dark:border-gray-700">
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">Loading...</TableCell>
                    </TableRow>
                  ) : merchants.length === 0 ? (
                    <TableRow className="border-gray-200 dark:border-gray-700">
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">No approved merchants yet</TableCell>
                    </TableRow>
                  ) : (
                    merchants.map((m) => (
                      <TableRow key={m.id} className="border-gray-200 dark:border-gray-700">
                        <TableCell className="text-gray-900 dark:text-white">{m.businessName}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-300">{m.email}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-300">{m.category}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-300">{m.createdAt ? new Date(m.createdAt.seconds ? m.createdAt.seconds * 1000 : m.createdAt).toLocaleDateString() : "—"}</TableCell>
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


