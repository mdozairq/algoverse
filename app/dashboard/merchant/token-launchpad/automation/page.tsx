"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Settings, 
  TrendingUp, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Play, 
  Pause,
  Clock,
  Target,
  RotateCw
} from "lucide-react"
import { toast } from "sonner"
import DashboardLayout from "@/components/dashboard-layout"
import AuthGuard from "@/components/auth-guard"

interface TradingRule {
  id: string
  tokenId: string
  type: 'dca' | 'rebalancing' | 'rotation'
  enabled: boolean
  config: Record<string, any>
  lastExecuted?: string
  nextExecution?: string
  executionCount: number
}

interface LiquidityPool {
  id: string
  dex: 'tinyman' | 'pact'
  poolId?: string
  poolAddress?: string
  tokenReserve: number
  algoReserve: number
  totalLiquidity: number
  price: number
  volume24h: number
  fees24h: number
  status: 'active' | 'inactive' | 'pending'
}

export default function TokenAutomationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tokenId = searchParams.get('tokenId') || ''
  const marketplaceId = searchParams.get('marketplaceId') || ''

  const [rules, setRules] = useState<TradingRule[]>([])
  const [pools, setPools] = useState<LiquidityPool[]>([])
  const [loading, setLoading] = useState(false)
  const [showDCADialog, setShowDCADialog] = useState(false)
  const [showRebalancingDialog, setShowRebalancingDialog] = useState(false)
  const [showRotationDialog, setShowRotationDialog] = useState(false)

  const [dcaConfig, setDcaConfig] = useState({
    interval: 24,
    amount: 10,
  })

  const [rebalancingConfig, setRebalancingConfig] = useState({
    targetAllocation: 50,
    threshold: 5,
  })

  const [rotationConfig, setRotationConfig] = useState({
    strategy: 'time' as 'performance' | 'time' | 'volume',
    rotationInterval: 24,
    performanceThreshold: 10,
    volumeThreshold: 1000,
  })

  useEffect(() => {
    if (tokenId && marketplaceId) {
      fetchData()
    }
  }, [tokenId, marketplaceId])

  const fetchData = async () => {
    if (!tokenId || !marketplaceId) return

    setLoading(true)
    try {
      const [rulesRes, poolsRes] = await Promise.all([
        fetch(`/api/marketplaces/${marketplaceId}/tokens/${tokenId}/trading-rules`),
        fetch(`/api/marketplaces/${marketplaceId}/tokens/${tokenId}/liquidity-pools`),
      ])

      if (rulesRes.ok) {
        const rulesData = await rulesRes.json()
        setRules(rulesData.rules || [])
      }

      if (poolsRes.ok) {
        const poolsData = await poolsRes.json()
        setPools(poolsData.pools || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDCA = async () => {
    try {
      const response = await fetch(
        `/api/marketplaces/${marketplaceId}/tokens/${tokenId}/trading-rules`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'dca',
            enabled: true,
            config: dcaConfig,
          }),
        }
      )

      const data = await response.json()

      if (data.success) {
        toast.success('DCA rule created successfully')
        setShowDCADialog(false)
        fetchData()
      } else {
        toast.error(data.error || 'Failed to create DCA rule')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create DCA rule')
    }
  }

  const handleCreateRebalancing = async () => {
    try {
      const response = await fetch(
        `/api/marketplaces/${marketplaceId}/tokens/${tokenId}/trading-rules`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'rebalancing',
            enabled: true,
            config: rebalancingConfig,
          }),
        }
      )

      const data = await response.json()

      if (data.success) {
        toast.success('Rebalancing rule created successfully')
        setShowRebalancingDialog(false)
        fetchData()
      } else {
        toast.error(data.error || 'Failed to create rebalancing rule')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create rebalancing rule')
    }
  }

  const handleCreateRotation = async () => {
    try {
      const response = await fetch(
        `/api/marketplaces/${marketplaceId}/tokens/${tokenId}/trading-rules`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'rotation',
            enabled: true,
            config: rotationConfig,
          }),
        }
      )

      const data = await response.json()

      if (data.success) {
        toast.success('Rotation rule created successfully')
        setShowRotationDialog(false)
        fetchData()
      } else {
        toast.error(data.error || 'Failed to create rotation rule')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create rotation rule')
    }
  }

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      const response = await fetch(
        `/api/marketplaces/${marketplaceId}/tokens/${tokenId}/trading-rules/${ruleId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled }),
        }
      )

      if (response.ok) {
        toast.success(`Rule ${enabled ? 'enabled' : 'disabled'}`)
        fetchData()
      } else {
        toast.error('Failed to update rule')
      }
    } catch (error) {
      toast.error('Failed to update rule')
    }
  }

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return

    try {
      const response = await fetch(
        `/api/marketplaces/${marketplaceId}/tokens/${tokenId}/trading-rules/${ruleId}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        toast.success('Rule deleted successfully')
        fetchData()
      } else {
        toast.error('Failed to delete rule')
      }
    } catch (error) {
      toast.error('Failed to delete rule')
    }
  }

  if (!tokenId || !marketplaceId) {
    return (
      <AuthGuard requiredRole="merchant">
        <DashboardLayout role="merchant">
          <div className="container mx-auto py-8 px-4">
            <div className="text-center py-12">
              <p className="text-gray-500">Invalid token or marketplace ID</p>
              <Button onClick={() => router.push('/dashboard/merchant/token-launchpad')} className="mt-4">
                Back to Token Launchpad
              </Button>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole="merchant">
      <DashboardLayout role="merchant">
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/merchant/token-launchpad')}
              className="mb-4"
            >
              ← Back to Token Launchpad
            </Button>
            <h1 className="text-3xl font-bold mb-2">Token Automation</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure automated trading rules and manage liquidity pools
            </p>
          </div>

          <Tabs defaultValue="rules" className="space-y-6">
            <TabsList>
              <TabsTrigger value="rules">Trading Rules</TabsTrigger>
              <TabsTrigger value="pools">Liquidity Pools</TabsTrigger>
            </TabsList>

            <TabsContent value="rules" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Automated Trading Rules</CardTitle>
                      <CardDescription>
                        Set up automated trading strategies for your token
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDCADialog(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        DCA Rule
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowRebalancingDialog(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Rebalancing
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowRotationDialog(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Rotation
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Loading rules...</div>
                  ) : rules.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      No trading rules configured. Create one to get started.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {rules.map((rule) => (
                        <Card key={rule.id}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  {rule.type === 'dca' && <Clock className="w-5 h-5 text-blue-500" />}
                                  {rule.type === 'rebalancing' && <Target className="w-5 h-5 text-green-500" />}
                                  {rule.type === 'rotation' && <RotateCw className="w-5 h-5 text-purple-500" />}
                                  <h3 className="font-semibold capitalize">{rule.type} Rule</h3>
                                  <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                                    {rule.enabled ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>
                                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                  {rule.type === 'dca' && (
                                    <>
                                      <p>Interval: Every {rule.config.interval} hours</p>
                                      <p>Amount: {rule.config.amount} ALGO per purchase</p>
                                    </>
                                  )}
                                  {rule.type === 'rebalancing' && (
                                    <>
                                      <p>Target Allocation: {rule.config.targetAllocation}%</p>
                                      <p>Threshold: {rule.config.threshold}% deviation</p>
                                    </>
                                  )}
                                  {rule.type === 'rotation' && (
                                    <>
                                      <p>Strategy: {rule.config.strategy}</p>
                                      {rule.config.rotationInterval && (
                                        <p>Interval: Every {rule.config.rotationInterval} hours</p>
                                      )}
                                    </>
                                  )}
                                  {rule.lastExecuted && (
                                    <p>Last executed: {new Date(rule.lastExecuted).toLocaleString()}</p>
                                  )}
                                  {rule.nextExecution && (
                                    <p>Next execution: {new Date(rule.nextExecution).toLocaleString()}</p>
                                  )}
                                  <p>Executions: {rule.executionCount}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={rule.enabled}
                                  onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteRule(rule.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pools" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Liquidity Pools</CardTitle>
                      <CardDescription>
                        Monitor and manage liquidity pools across DEXs
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchData}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Loading pools...</div>
                  ) : pools.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      No liquidity pools found. Pools will appear here once your token is deployed and has liquidity.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pools.map((pool) => (
                        <Card key={pool.id}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                  <h3 className="font-semibold capitalize">{pool.dex} Pool</h3>
                                  <Badge variant={pool.status === 'active' ? 'default' : 'secondary'}>
                                    {pool.status}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-500">Token Reserve</p>
                                    <p className="font-semibold">{pool.tokenReserve.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">ALGO Reserve</p>
                                    <p className="font-semibold">{pool.algoReserve.toFixed(2)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Price</p>
                                    <p className="font-semibold">{pool.price.toFixed(6)} ALGO</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Total Liquidity</p>
                                    <p className="font-semibold">{pool.totalLiquidity.toLocaleString()}</p>
                                  </div>
                                </div>
                                {pool.poolAddress && (
                                  <div className="mt-4">
                                    <p className="text-xs text-gray-500">Pool Address</p>
                                    <p className="text-xs font-mono break-all">{pool.poolAddress}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* DCA Dialog */}
          <Dialog open={showDCADialog} onOpenChange={setShowDCADialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create DCA Rule</DialogTitle>
                <DialogDescription>
                  Dollar Cost Averaging: Automatically purchase tokens at regular intervals
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Interval (hours)</Label>
                  <Input
                    type="number"
                    value={dcaConfig.interval}
                    onChange={(e) => setDcaConfig({ ...dcaConfig, interval: Number(e.target.value) })}
                    min="1"
                  />
                </div>
                <div>
                  <Label>Amount per Purchase (ALGO)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={dcaConfig.amount}
                    onChange={(e) => setDcaConfig({ ...dcaConfig, amount: Number(e.target.value) })}
                    min="0.001"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDCADialog(false)}>Cancel</Button>
                <Button onClick={handleCreateDCA}>Create Rule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Rebalancing Dialog */}
          <Dialog open={showRebalancingDialog} onOpenChange={setShowRebalancingDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Rebalancing Rule</DialogTitle>
                <DialogDescription>
                  Automatically rebalance your portfolio to maintain target allocation
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Target Allocation (%)</Label>
                  <Input
                    type="number"
                    value={rebalancingConfig.targetAllocation}
                    onChange={(e) => setRebalancingConfig({ ...rebalancingConfig, targetAllocation: Number(e.target.value) })}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label>Deviation Threshold (%)</Label>
                  <Input
                    type="number"
                    value={rebalancingConfig.threshold}
                    onChange={(e) => setRebalancingConfig({ ...rebalancingConfig, threshold: Number(e.target.value) })}
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Rebalance when allocation deviates by this amount
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRebalancingDialog(false)}>Cancel</Button>
                <Button onClick={handleCreateRebalancing}>Create Rule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Rotation Dialog */}
          <Dialog open={showRotationDialog} onOpenChange={setShowRotationDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Rotation Rule</DialogTitle>
                <DialogDescription>
                  Rotate between assets based on performance, time, or volume
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Strategy</Label>
                  <Select
                    value={rotationConfig.strategy}
                    onValueChange={(value: 'performance' | 'time' | 'volume') =>
                      setRotationConfig({ ...rotationConfig, strategy: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performance">Performance-based</SelectItem>
                      <SelectItem value="time">Time-based</SelectItem>
                      <SelectItem value="volume">Volume-based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {rotationConfig.strategy === 'time' && (
                  <div>
                    <Label>Rotation Interval (hours)</Label>
                    <Input
                      type="number"
                      value={rotationConfig.rotationInterval}
                      onChange={(e) => setRotationConfig({ ...rotationConfig, rotationInterval: Number(e.target.value) })}
                      min="1"
                    />
                  </div>
                )}
                {rotationConfig.strategy === 'performance' && (
                  <div>
                    <Label>Performance Threshold (%)</Label>
                    <Input
                      type="number"
                      value={rotationConfig.performanceThreshold}
                      onChange={(e) => setRotationConfig({ ...rotationConfig, performanceThreshold: Number(e.target.value) })}
                      min="0"
                    />
                  </div>
                )}
                {rotationConfig.strategy === 'volume' && (
                  <div>
                    <Label>Volume Threshold</Label>
                    <Input
                      type="number"
                      value={rotationConfig.volumeThreshold}
                      onChange={(e) => setRotationConfig({ ...rotationConfig, volumeThreshold: Number(e.target.value) })}
                      min="0"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRotationDialog(false)}>Cancel</Button>
                <Button onClick={handleCreateRotation}>Create Rule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}

