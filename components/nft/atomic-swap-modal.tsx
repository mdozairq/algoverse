"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ArrowRight, RefreshCw, AlertCircle, CheckCircle } from "lucide-react"

interface AtomicSwapModalProps {
  userAssetId: number
  userAddress: string
  onSwapCreated?: (swapId: string) => void
}

export function AtomicSwapModal({ userAssetId, userAddress, onSwapCreated }: AtomicSwapModalProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [swapData, setSwapData] = useState({
    assetId2: '',
    fromAddress2: '',
    amount1: 1,
    amount2: 1,
    expiryHours: 24
  })

  const handleCreateSwap = async () => {
    try {
      setLoading(true)

      // Validate form
      if (!swapData.assetId2 || !swapData.fromAddress2) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const response = await fetch('/api/nft/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          assetId1: userAssetId,
          assetId2: parseInt(swapData.assetId2),
          fromAddress1: userAddress,
          fromAddress2: swapData.fromAddress2,
          amount1: swapData.amount1,
          amount2: swapData.amount2,
          expiryTime: Date.now() + (swapData.expiryHours * 60 * 60 * 1000)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create swap')
      }

      toast({
        title: "Swap Created",
        description: "Atomic swap has been created successfully",
      })

      onSwapCreated?.(data.swapId)
      setIsOpen(false)
      setSwapData({
        assetId2: '',
        fromAddress2: '',
        amount1: 1,
        amount2: 1,
        expiryHours: 24
      })

    } catch (error: any) {
      console.error('Error creating swap:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create atomic swap",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Create Atomic Swap
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Atomic Swap</DialogTitle>
          <DialogDescription>
            Create a secure atomic swap to trade your NFT with another user. Both parties must agree for the swap to execute.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Your Asset */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Your Asset</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Asset ID:</span>
                  <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {userAssetId}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Your Address:</span>
                  <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {userAddress.slice(0, 8)}...{userAddress.slice(-8)}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <Badge variant="outline">{swapData.amount1}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Swap Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assetId2">Counterparty Asset ID *</Label>
                <Input
                  id="assetId2"
                  type="number"
                  value={swapData.assetId2}
                  onChange={(e) => setSwapData({ ...swapData, assetId2: e.target.value })}
                  placeholder="Enter asset ID to swap with"
                />
              </div>
              <div>
                <Label htmlFor="amount2">Counterparty Amount</Label>
                <Input
                  id="amount2"
                  type="number"
                  min="1"
                  value={swapData.amount2}
                  onChange={(e) => setSwapData({ ...swapData, amount2: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="fromAddress2">Counterparty Address *</Label>
              <Input
                id="fromAddress2"
                value={swapData.fromAddress2}
                onChange={(e) => setSwapData({ ...swapData, fromAddress2: e.target.value })}
                placeholder="Enter counterparty wallet address"
              />
            </div>

            <div>
              <Label htmlFor="expiryHours">Expiry Time (hours)</Label>
              <Input
                id="expiryHours"
                type="number"
                min="1"
                max="168"
                value={swapData.expiryHours}
                onChange={(e) => setSwapData({ ...swapData, expiryHours: parseInt(e.target.value) || 24 })}
              />
            </div>
          </div>

          {/* Swap Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Swap Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-sm font-medium">Your Asset</div>
                  <div className="text-xs text-gray-600">ID: {userAssetId}</div>
                  <div className="text-xs text-gray-600">Amount: {swapData.amount1}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <div className="text-center">
                  <div className="text-sm font-medium">Counterparty Asset</div>
                  <div className="text-xs text-gray-600">ID: {swapData.assetId2 || 'N/A'}</div>
                  <div className="text-xs text-gray-600">Amount: {swapData.amount2}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Notice:</strong> Atomic swaps are secure and trustless. Both parties must sign the transaction for it to execute. If either party doesn't sign within the expiry time, the swap will be cancelled.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSwap}
              disabled={loading || !swapData.assetId2 || !swapData.fromAddress2}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create Swap
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}