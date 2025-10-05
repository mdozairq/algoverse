"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  Wallet, 
  Zap, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Minus,
  Plus,
  RefreshCw,
  Shield,
  UserX
} from "lucide-react"

interface MintWidgetProps {
  projectId: string
  mintPrice: number
  currency: string
  maxPerWallet: number
  isWhitelist: boolean
  isActive: boolean
  minted: number
  total: number
  onMint: (quantity: number) => Promise<void>
  onConnectWallet: () => Promise<void>
  walletConnected: boolean
  walletAddress?: string
  isEligible?: boolean
  userMintCount?: number
  className?: string
}

export function MintWidget({
  projectId,
  mintPrice,
  currency,
  maxPerWallet,
  isWhitelist,
  isActive,
  minted,
  total,
  onMint,
  onConnectWallet,
  walletConnected,
  walletAddress,
  isEligible = true,
  userMintCount = 0,
  className
}: MintWidgetProps) {
  const [quantity, setQuantity] = useState(1)
  const [minting, setMinting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const progress = (minted / total) * 100
  const remaining = total - minted
  const totalCost = mintPrice * quantity
  const canMint = walletConnected && isActive && isEligible && quantity > 0 && quantity <= maxPerWallet

  const handleMint = async () => {
    if (!canMint) return

    setMinting(true)
    setError(null)

    try {
      await onMint(quantity)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Minting failed')
    } finally {
      setMinting(false)
    }
  }

  const incrementQuantity = () => {
    if (quantity < maxPerWallet) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Mint Your NFT
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Mint Progress</span>
            <span className="text-sm text-gray-600">
              {minted.toLocaleString()} / {total.toLocaleString()}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>{progress.toFixed(1)}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          {isActive ? (
            <Badge className="bg-green-500 text-white">
              <CheckCircle className="w-3 h-3 mr-1" />
              Live
            </Badge>
          ) : (
            <Badge variant="outline">
              <Clock className="w-3 h-3 mr-1" />
              Upcoming
            </Badge>
          )}
          {isWhitelist && (
            <Badge variant="outline" className="border-blue-500 text-blue-600">
              <Shield className="w-3 h-3 mr-1" />
              Whitelist
            </Badge>
          )}
        </div>

        {/* Wallet Connection */}
        {!walletConnected ? (
          <div className="text-center py-6">
            <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-sm text-gray-600 mb-4">
              Connect your wallet to start minting NFTs
            </p>
            <Button onClick={onConnectWallet} className="w-full">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Wallet Info */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Wallet Connected
                </span>
              </div>
              <div className="text-xs text-green-700 dark:text-green-300">
                {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
              </div>
            </div>

            {/* Eligibility Check */}
            {isWhitelist && (
              <div className={`border rounded-lg p-3 ${
                isEligible 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  {isEligible ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <UserX className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    isEligible 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {isEligible ? 'You are whitelisted!' : 'You are not whitelisted for this phase'}
                  </span>
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <div className="flex items-center gap-3 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center"
                  min="1"
                  max={maxPerWallet}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={incrementQuantity}
                  disabled={quantity >= maxPerWallet}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Max {maxPerWallet} per wallet
              </p>
            </div>

            {/* Price Display */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Price per NFT</span>
                <span className="font-semibold">{mintPrice} {currency}</span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t">
                <span className="font-semibold">Total Cost</span>
                <span className="text-lg font-bold">{totalCost.toFixed(4)} {currency}</span>
              </div>
            </div>

            {/* User Mint Count */}
            {userMintCount > 0 && (
              <div className="text-center text-sm text-gray-600">
                You have minted {userMintCount} NFT{userMintCount > 1 ? 's' : ''} in this phase
              </div>
            )}

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Mint Button */}
            <Button 
              onClick={handleMint}
              disabled={!canMint || minting}
              className="w-full"
              size="lg"
            >
              {minting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Minting...
                </>
              ) : !isActive ? (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Sale Not Active
                </>
              ) : !isEligible ? (
                <>
                  <UserX className="w-4 h-4 mr-2" />
                  Not Eligible
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Mint {quantity} NFT{quantity > 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
