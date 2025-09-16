"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/lib/wallet/wallet-context"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { 
  Wallet, 
  Send, 
  ArrowDownLeft as Receive, 
  History, 
  Settings, 
  Plus,
  Copy,
  RefreshCw,
  Eye,
  EyeOff,
  Download,
  Trash2,
  ExternalLink,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import { WalletConnect } from "@/components/wallet/wallet-connect"

export default function WalletPage() {
  const { toast } = useToast()
  const {
    currentAccount,
    accounts,
    isConnected,
    isLoading,
    connectWallet,
    disconnectWallet,
    createWallet,
    importWallet,
    refreshWallet,
    sendAlgo,
    sendAsset,
    getTransactionHistory,
    getBalance,
    getAssets,
    formatAddress
  } = useWallet()

  const [balance, setBalance] = useState(0)
  const [assets, setAssets] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [sendForm, setSendForm] = useState({
    to: "",
    amount: "",
    assetId: "",
    note: ""
  })
  const [showMnemonic, setShowMnemonic] = useState(false)

  useEffect(() => {
    if (isConnected && currentAccount) {
      loadWalletData()
    }
  }, [isConnected, currentAccount])

  const loadWalletData = async () => {
    try {
      const [bal, txs] = await Promise.all([
        getBalance(),
        getTransactionHistory(20)
      ])
      
      setBalance(bal)
      setAssets(getAssets())
      setTransactions(txs)
    } catch (error) {
      console.error('Error loading wallet data:', error)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!sendForm.to || !sendForm.amount) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      if (sendForm.assetId) {
        await sendAsset(parseInt(sendForm.assetId), sendForm.to, parseFloat(sendForm.amount), sendForm.note)
      } else {
        await sendAlgo(sendForm.to, parseFloat(sendForm.amount), sendForm.note)
      }

      toast({
        title: "Transaction Sent",
        description: "Your transaction has been sent successfully",
      })

      setSendForm({ to: "", amount: "", assetId: "", note: "" })
      await loadWalletData()
    } catch (error: any) {
      toast({
        title: "Send Error",
        description: error.message || "Failed to send transaction",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    })
  }

  const handleRefresh = async () => {
    try {
      await refreshWallet()
      await loadWalletData()
      toast({
        title: "Refreshed",
        description: "Wallet data has been refreshed",
      })
    } catch (error) {
      toast({
        title: "Refresh Error",
        description: "Failed to refresh wallet data",
        variant: "destructive",
      })
    }
  }

  if (!isConnected) {
    return (
      <DashboardLayout role="user">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Wallet Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Connect your Pera wallet or create a local wallet to manage your assets
            </p>
          </div>
          <WalletConnect />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="user">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Wallet Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your Algorand wallet and assets
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={disconnectWallet}>
              Disconnect
            </Button>
          </div>
        </div>

        {/* Wallet Overview */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wallet Type</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {currentAccount?.name?.includes('Pera') ? 'Pera Wallet' : 'Local Wallet'}
              </div>
              <p className="text-xs text-muted-foreground">
                {currentAccount?.name || 'Connected'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{balance.toFixed(4)} ALGO</div>
              <p className="text-xs text-muted-foreground">
                ≈ ${(balance * 0.15).toFixed(2)} USD
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assets</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assets.length}</div>
              <p className="text-xs text-muted-foreground">
                {assets.length > 0 ? `${assets.length} different assets` : 'No assets yet'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.length}</div>
              <p className="text-xs text-muted-foreground">
                Recent activity
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="send">Send</TabsTrigger>
            <TabsTrigger value="receive">Receive</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Wallet Address */}
            <Card>
              <CardHeader>
                <CardTitle>Wallet Address</CardTitle>
                <CardDescription>Your Algorand wallet address</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input
                    value={currentAccount?.address || ""}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(currentAccount?.address || "")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Assets */}
            <Card>
              <CardHeader>
                <CardTitle>Assets</CardTitle>
                <CardDescription>Your token and NFT holdings</CardDescription>
              </CardHeader>
              <CardContent>
                {assets.length === 0 ? (
                  <div className="text-center py-8">
                    <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">No Assets</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      You don't have any assets yet. Purchase some to get started!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assets.map((asset) => (
                      <div key={asset.assetId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <Wallet className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">{asset.name}</div>
                            <div className="text-sm text-gray-600">
                              {asset.balance} {asset.unitName}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">ID: {asset.assetId}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="send" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Send Assets</CardTitle>
                <CardDescription>Send ALGO or other assets to another address</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSend} className="space-y-4">
                  <div>
                    <Label htmlFor="to">Recipient Address</Label>
                    <Input
                      id="to"
                      value={sendForm.to}
                      onChange={(e) => setSendForm({ ...sendForm, to: e.target.value })}
                      placeholder="Enter Algorand address"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="assetId">Asset (Optional)</Label>
                    <Input
                      id="assetId"
                      value={sendForm.assetId}
                      onChange={(e) => setSendForm({ ...sendForm, assetId: e.target.value })}
                      placeholder="Asset ID (leave empty for ALGO)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.000001"
                      value={sendForm.amount}
                      onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
                      placeholder="0.000000"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="note">Note (Optional)</Label>
                    <Input
                      id="note"
                      value={sendForm.note}
                      onChange={(e) => setSendForm({ ...sendForm, note: e.target.value })}
                      placeholder="Transaction note"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Transaction
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="receive" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Receive Assets</CardTitle>
                <CardDescription>Share your address to receive assets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Your Address</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={currentAccount?.address || ""}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(currentAccount?.address || "")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Alert>
                  <Wallet className="h-4 w-4" />
                  <AlertDescription>
                    Share this address with others to receive ALGO or other assets. 
                    Make sure the sender is sending to the correct address.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Your recent transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">No Transactions</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      You haven't made any transactions yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            tx.type === 'send' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                          }`}>
                            {tx.type === 'send' ? <Send className="h-4 w-4" /> : <Receive className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="font-medium capitalize">{tx.type}</div>
                            <div className="text-sm text-gray-600">
                              {tx.assetName || 'ALGO'} • {tx.timestamp.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${
                            tx.type === 'send' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {tx.type === 'send' ? '-' : '+'}{tx.amount}
                          </div>
                          <Badge variant={tx.status === 'confirmed' ? 'default' : 'secondary'}>
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Wallet Settings</CardTitle>
                <CardDescription>Manage your wallet preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Wallet Name</Label>
                  <Input
                    value={currentAccount?.name || ""}
                    readOnly
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Address</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={currentAccount?.address || ""}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(currentAccount?.address || "")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Security:</strong> Keep your wallet secure and never share your private keys or mnemonic phrase with anyone.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
