"use client"

import { useEffect, useState } from "react"
import AuthGuard from "@/components/auth-guard"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [platformFeePercentage, setPlatformFeePercentage] = useState<number>(2.5)
  const [creatorRoyaltyPercentage, setCreatorRoyaltyPercentage] = useState<number>(5.0)
  const [networkFeeAlgo, setNetworkFeeAlgo] = useState<number>(0.001)
  const [requireManualMerchantApproval, setRequireManualMerchantApproval] = useState<boolean>(true)
  const [autoApproveVerifiedMerchants, setAutoApproveVerifiedMerchants] = useState<boolean>(true)

  const loadSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/settings")
      const data = await res.json()
      if (res.ok && data.config) {
        setPlatformFeePercentage(data.config.platformFeePercentage ?? 2.5)
        setCreatorRoyaltyPercentage(data.config.creatorRoyaltyPercentage ?? 5.0)
        setNetworkFeeAlgo(data.config.networkFeeAlgo ?? 0.001)
        setRequireManualMerchantApproval(data.config.requireManualMerchantApproval ?? true)
        setAutoApproveVerifiedMerchants(data.config.autoApproveVerifiedMerchants ?? true)
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
        body: JSON.stringify({
          platformFeePercentage,
          creatorRoyaltyPercentage,
          networkFeeAlgo,
          requireManualMerchantApproval,
          autoApproveVerifiedMerchants,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save")
      toast({ title: "Settings saved" })
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
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Platform Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Configure global platform parameters</p>
          </div>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">General</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">Platform-wide configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
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
                  <label className="text-sm text-gray-600 dark:text-gray-400">Creator Royalty (%)</label>
                  <input
                    type="number"
                    value={loading ? 0 : creatorRoyaltyPercentage}
                    step="0.1"
                    onChange={(e) => setCreatorRoyaltyPercentage(Number(e.target.value))}
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

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Approval Settings</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={requireManualMerchantApproval}
                      onChange={(e) => setRequireManualMerchantApproval(e.target.checked)}
                      className="rounded border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                    />
                    <span className="text-gray-900 dark:text-gray-300">Require manual approval for new merchants</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={autoApproveVerifiedMerchants}
                      onChange={(e) => setAutoApproveVerifiedMerchants(e.target.checked)}
                      className="rounded border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                    />
                    <span className="text-gray-900 dark:text-gray-300">Auto-approve verified merchants</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={save} className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
