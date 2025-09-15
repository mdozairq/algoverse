"use client"

import { useEffect, useState } from "react"
import AuthGuard from "@/components/auth-guard"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function AdminFeesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [platformFeePercentage, setPlatformFeePercentage] = useState<number>(2.5)
  const [networkFeeAlgo, setNetworkFeeAlgo] = useState<number>(0.001)

  const loadSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/settings")
      const data = await res.json()
      if (res.ok && data.config) {
        setPlatformFeePercentage(data.config.platformFeePercentage ?? 2.5)
        setNetworkFeeAlgo(data.config.networkFeeAlgo ?? 0.001)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const save = async () => {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platformFeePercentage, networkFeeAlgo }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save")
      toast({ title: "Fees saved" })
    } catch (error: any) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" })
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  return (
    <AuthGuard requiredRole="admin">
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Fee Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Configure platform and network fees</p>
          </div>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Fees</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">Update current fee structure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Platform Fee (%)</label>
                  <input
                    type="number"
                    value={loading ? 0 : platformFeePercentage}
                    step="0.1"
                    onChange={(e) => setPlatformFeePercentage(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Network Fee (ALGO)</label>
                  <input
                    type="number"
                    value={loading ? 0 : networkFeeAlgo}
                    step="0.001"
                    onChange={(e) => setNetworkFeeAlgo(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={save} className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">Save</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
