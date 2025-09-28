"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Wallet, 
  Key, 
  Download, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Plus,
  Trash2,
  Settings,
  Smartphone,
  Globe
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useWallet } from "@/lib/wallet/wallet-context"
import { useAuth } from "@/lib/auth/auth-context"
import { useRouter } from "next/navigation"
import { getPeraWalletInstance } from "@/lib/wallet/pera-wallet"

interface WalletOption {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  color: string
}

const walletOptions: WalletOption[] = [
  {
    id: "pera",
    name: "Pera Wallet",
    icon: <Smartphone className="h-6 w-6" />,
    description: "Mobile-first Algorand wallet",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "myalgo",
    name: "MyAlgo Wallet",
    icon: <Wallet className="h-6 w-6" />,
    description: "Web-based Algorand wallet",
    color: "from-green-500 to-green-600",
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    icon: <Globe className="h-6 w-6" />,
    description: "Connect any compatible wallet",
    color: "from-purple-500 to-purple-600",
  },
]

export function WalletConnect() {
  const { toast } = useToast()
  const { connectWallet: authConnectWallet, loading: authLoading } = useAuth()
  const router = useRouter()
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
    getBalance,
    formatAddress
  } = useWallet()
  
  const [mnemonic, setMnemonic] = useState("")
  const [walletName, setWalletName] = useState("")
  const [showMnemonic, setShowMnemonic] = useState(false)
  const [balance, setBalance] = useState(0)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected">("idle")

  useEffect(() => {
    if (isConnected && currentAccount) {
      loadBalance()
    }
  }, [isConnected, currentAccount])

  const loadBalance = async () => {
    try {
      const bal = await getBalance()
      setBalance(bal)
    } catch (error) {
      console.error('Error loading balance:', error)
    }
  }

  const handleCreateWallet = () => {
    try {
      const account = createWallet(walletName || undefined)
      setShowCreateDialog(false)
      setWalletName("")
      
      toast({
        title: "Wallet Created",
        description: "New wallet has been created successfully!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create wallet",
        variant: "destructive",
      })
    }
  }

  const handleImportWallet = () => {
    try {
      if (!mnemonic.trim()) {
        toast({
          title: "Validation Error",
          description: "Please enter a mnemonic phrase",
          variant: "destructive",
        })
        return
      }

      const account = importWallet(mnemonic.trim(), walletName || undefined)
      setMnemonic("")
      setWalletName("")
      setShowImportDialog(false)
      
      toast({
        title: "Wallet Imported",
        description: "Wallet has been imported successfully!",
      })
    } catch (error: any) {
      toast({
        title: "Import Error",
        description: error.message || "Invalid mnemonic phrase",
        variant: "destructive",
      })
    }
  }

  const handleConnect = async (account: any) => {
    try {
      console.log('Connecting wallet:', account)
      console.log('Account address:', account.address, 'Type:', typeof account.address)
      await connectWallet(account)
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been connected successfully!",
      })
    } catch (error: any) {
      console.error('Wallet connection error:', error)
      toast({
        title: "Connection Error",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      })
    }
  }

  const handleDisconnect = () => {
    disconnectWallet()
    setBalance(0)
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    })
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
      await loadBalance()
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

  const handlePeraWalletConnect = async (walletId: string) => {
    setSelectedWallet(walletId)
    setConnectionStatus("connecting")

    try {
      // Check if Pera Wallet is installed
      if (!getPeraWalletInstance()) {
        throw new Error("Pera Wallet not installed. Please install Pera Wallet from the App Store or Google Play Store.")
      }

      // Connect to Pera Wallet
        const peraWallet = getPeraWalletInstance()
      const peraAccount = await peraWallet.connect()
      
      console.log('Pera wallet connected:', peraAccount)
      const address = Array.isArray(peraAccount.address) ? peraAccount.address[0] : peraAccount.address
      console.log('Pera account address:', address, 'Type:', typeof address)

      // Connect to auth system with Pera wallet address
      await authConnectWallet(address)

      setConnectionStatus("connected")

      toast({
        title: "Wallet Connected",
        description: "Your Pera wallet has been connected successfully!",
      })

      // Redirect after success animation
      setTimeout(() => {
        // Get the current user after wallet connection to determine role
        fetch("/api/auth/me")
          .then(res => res.json())
          .then(data => {
            if (data.user) {
              router.replace(`/dashboard/${data.user.role}`)
            } else {
              router.replace("/dashboard")
            }
          })
          .catch(() => {
            router.replace("/dashboard")
          })
      }, 1500)
    } catch (error: any) {
      console.error("Pera wallet connection failed:", error)
      setConnectionStatus("idle")
      setSelectedWallet(null)
      
      let errorMessage = "Failed to connect Pera wallet. Please try again."
      
      if (error.message) {
        if (error.message.includes("User rejected")) {
          errorMessage = "Wallet connection was rejected. Please try again."
        } else if (error.message.includes("Network error")) {
          errorMessage = "Network error. Please check your connection and try again."
        } else if (error.message.includes("not installed")) {
          errorMessage = "Pera Wallet not installed. Please install Pera Wallet from the App Store or Google Play Store."
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  if (isConnected && currentAccount) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-green-600" />
                {currentAccount.name}
              </CardTitle>
              <CardDescription>
                {formatAddress(currentAccount.address || '')}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Balance</Label>
              <div className="text-2xl font-bold text-green-600">
                {balance.toFixed(4)} ALGO
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Assets</Label>
              <div className="text-2xl font-bold">
                {currentAccount.assets.length}
              </div>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Wallet Address</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                value={currentAccount.address}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(currentAccount.address)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {currentAccount.assets.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Assets</Label>
              <div className="space-y-2 mt-2">
                {currentAccount.assets.slice(0, 3).map((asset) => (
                  <div key={asset.assetId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div>
                      <div className="font-medium">{asset.name}</div>
                      <div className="text-sm text-gray-600">{asset.balance} {asset.unitName}</div>
                    </div>
                    <Badge variant="outline">{asset.assetId}</Badge>
                  </div>
                ))}
                {currentAccount.assets.length > 3 && (
                  <div className="text-sm text-gray-600 text-center">
                    +{currentAccount.assets.length - 3} more assets
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Connect Wallet
        </CardTitle>
        <CardDescription>
          Connect your Algorand wallet to start using the platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wallet Options */}
        <div>
          <Label className="text-sm font-medium mb-4 block">Choose Wallet Type</Label>
          <div className="grid gap-3">
            {walletOptions.map((wallet) => (
              <Card
                key={wallet.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-gray-200 dark:border-gray-600 ${
                  selectedWallet === wallet.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => !authLoading && connectionStatus === "idle" && handlePeraWalletConnect(wallet.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${wallet.color} text-white`}>
                      {wallet.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold">{wallet.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{wallet.description}</p>
                    </div>
                    <div className="flex items-center">
                      {selectedWallet === wallet.id && connectionStatus === "connecting" && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      )}
                      {selectedWallet === wallet.id && connectionStatus === "connected" && (
                        <Check className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        {/* Local Wallet Management */}
        <div>
          <Label className="text-sm font-medium mb-4 block">Local Wallet Management</Label>
          
          {/* Existing Wallets */}
          {accounts.length > 0 && (
            <div className="mb-4">
              <Label className="text-sm font-medium mb-2 block">Saved Wallets</Label>
              <div className="space-y-2">
                {accounts.map((account) => (
                  <div key={account.address || 'unknown'} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{account.name}</div>
                      <div className="text-sm text-gray-600">{formatAddress(account.address || '')}</div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleConnect(account)}
                      disabled={isLoading}
                    >
                      Connect
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Wallet</DialogTitle>
                  <DialogDescription>
                    Generate a new Algorand wallet with a unique mnemonic phrase
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="walletName">Wallet Name (Optional)</Label>
                    <Input
                      id="walletName"
                      value={walletName}
                      onChange={(e) => setWalletName(e.target.value)}
                      placeholder="My Wallet"
                    />
                  </div>
                  <Button onClick={handleCreateWallet} className="w-full">
                    <Wallet className="h-4 w-4 mr-2" />
                    Create Wallet
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <Key className="h-4 w-4 mr-2" />
                  Import Existing
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Wallet</DialogTitle>
                  <DialogDescription>
                    Import an existing wallet using your mnemonic phrase
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="importWalletName">Wallet Name (Optional)</Label>
                    <Input
                      id="importWalletName"
                      value={walletName}
                      onChange={(e) => setWalletName(e.target.value)}
                      placeholder="Imported Wallet"
                    />
                  </div>
                  <div>
                    <Label htmlFor="importMnemonic">Mnemonic Phrase</Label>
                    <Input
                      id="importMnemonic"
                      value={mnemonic}
                      onChange={(e) => setMnemonic(e.target.value)}
                      placeholder="Enter your 25-word mnemonic phrase"
                    />
                  </div>
                  <Button onClick={handleImportWallet} className="w-full">
                    <Key className="h-4 w-4 mr-2" />
                    Import Wallet
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Alert>
          <Key className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Notice:</strong> Never share your mnemonic phrase with anyone. 
            Store it safely offline. Anyone with access to this phrase can control your wallet.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}