"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import ImageUpload from "@/components/ui/image-upload"
import { NFTCreationForm } from "@/components/nft/nft-creation-form"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Settings, 
  Palette, 
  Globe, 
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  Store,
  BarChart3,
  Calendar,
  Zap,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  XCircle,
  MoreVertical,
  Wallet,
  Package,
  TrendingUp,
  Users,
  DollarSign,
  Download,
  Upload,
  Search,
  Filter,
  SortAsc,
  Star,
  ShoppingCart,
  Heart,
  Share2
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import AuthGuard from "@/components/auth-guard"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-context"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { transactionSigner } from "@/lib/wallet/transaction-signer"
import { useWallet } from "@/hooks/use-wallet"

// Extend Window interface for TypeScript
declare global {
  interface Window {
    algorand?: {
      connect: () => Promise<string[]>
      signTransaction: (txn: Uint8Array) => Promise<Uint8Array>
      isPeraWallet: boolean
    }
    myAlgo?: {
      connect: (options: any) => Promise<Array<{ address: string }>>
      signTransaction: (txn: Uint8Array) => Promise<{ blob: Uint8Array }>
    }
    AlgoSigner?: {
      sign: (txn: Uint8Array) => Promise<{ blob: Uint8Array }>
    }
  }
}

interface Marketplace {
  id: string
  businessName: string
  description: string
  category: string
  status: "draft" | "pending" | "approved" | "rejected"
  primaryColor: string
  secondaryColor: string
  template: string
  isActive: boolean
  isEnabled: boolean
  allowSwap: boolean
  allowMint?: boolean
  allowTrading?: boolean
  allowCreate?: boolean
  walletAddress: string
  createdAt: Date
  updatedAt?: Date
  customDomain?: string
  configuration?: {
    mintingConfig: any
    tradingConfig: any
    swapConfig: any
    nftConfig: any
    addressConfig: any
  }
}

interface Collection {
  id: string
  name: string
  description: string
  price: number
  currency: string
  image: string
  category: string
  type: "nft" | "event" | "merchandise"
  inStock: boolean
  isEnabled: boolean
  allowSwap: boolean
  marketplaceId: string
  createdAt: Date
  views?: number
  sales?: number
  rating?: number
  reviews?: number
  nftCount: number // Minimum 1 NFT required
}

interface MarketplaceStats {
  totalViews: number
  totalSales: number
  totalRevenue: number
  activeProducts: number
  conversionRate: number
  averageRating: number
}

export default function MarketplaceManagement() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([])
  const [selectedMarketplace, setSelectedMarketplace] = useState<Marketplace | null>(null)
  const [collections, setCollections] = useState<Collection[]>([])
  const [marketplaceStats, setMarketplaceStats] = useState<MarketplaceStats | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showWalletDialog, setShowWalletDialog] = useState(false)
  const [editingMarketplace, setEditingMarketplace] = useState<Marketplace | null>(null)
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)
  const [showEditCollectionDialog, setShowEditCollectionDialog] = useState(false)
  const [showNFTManagementDialog, setShowNFTManagementDialog] = useState(false)
  const [selectedCollectionForNFTs, setSelectedCollectionForNFTs] = useState<Collection | null>(null)
  const [newCollection, setNewCollection] = useState({
    name: "",
    description: "",
    price: 0,
    currency: "ALGO",
    category: "",
    type: "nft" as "nft" | "event" | "merchandise",
    image: "",
    ipfsHash: "",
    nftCount: 1 // Minimum 1 NFT required
  })
  const [editCollectionData, setEditCollectionData] = useState({
    name: "",
    description: "",
    price: 0,
    currency: "ALGO",
    category: "",
    type: "nft" as "nft" | "event" | "merchandise",
    image: "",
    ipfsHash: "",
    nftCount: 1
  })
  const [newNFT, setNewNFT] = useState({
    name: "",
    description: "",
    image: "",
    ipfsHash: "",
    price: 0,
    rarity: "common",
    traits: [] as { trait_type: string; value: string; rarity: number }[],
    mintPrice: 0,
    maxSupply: 1,
    royaltyFee: 0
  })
  const [createdNFTId, setCreatedNFTId] = useState<string | null>(null)
  const [nftTraits, setNftTraits] = useState<{ trait_type: string; value: string; rarity: number }[]>([])
  const [showNFTForm, setShowNFTForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [filterBy, setFilterBy] = useState("all")
  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    category: "",
    template: "modern",
    primaryColor: "#3B82F6",
    secondaryColor: "#1E40AF",
    customDomain: ""
  })
  const [walletAddress, setWalletAddress] = useState("")
  
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()
  const useWalletHook = useWallet()

  // Set up the useWallet hook for the transaction signer
  useEffect(() => {
    transactionSigner.setUseWalletHook(useWalletHook)
  }, [useWalletHook])

  const fetchMarketplaces = async (isRefresh = false) => {
    if (!user) return

    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await fetch(`/api/marketplaces?merchantId=${user.userId}`)
      if (response.ok) {
        const data = await response.json()
        const marketplacesData = data.marketplaces || []
        setMarketplaces(marketplacesData)
        
        // Update selected marketplace if it exists in the new data
        if (selectedMarketplace) {
          const updatedSelected = marketplacesData.find((m: Marketplace) => m.id === selectedMarketplace.id)
          if (updatedSelected) {
            setSelectedMarketplace(updatedSelected)
          }
        } else if (marketplacesData.length > 0) {
          // Auto-select first marketplace if none selected
          setSelectedMarketplace(marketplacesData[0] as Marketplace)
        }
      } else {
        throw new Error("Failed to fetch marketplaces")
      }
    } catch (error) {
      console.error("Error fetching marketplaces:", error)
      toast({
        title: "Error",
        description: "Failed to fetch marketplaces",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchCollections = async (marketplaceId: string) => {
    try {
      const response = await fetch(`/api/marketplaces/${marketplaceId}/collections`)
      if (response.ok) {
        const data = await response.json()
        // Filter out deleted collections (soft delete)
        const activeCollections = (data.collections || []).filter((collection: any) => !collection.isDeleted)
        setCollections(activeCollections)
      }
    } catch (error) {
      console.error("Error fetching collections:", error)
    }
  }

  const fetchMarketplaceStats = async (marketplaceId: string) => {
    try {
      // Mock stats for now - replace with actual API call
      const mockStats: MarketplaceStats = {
        totalViews: Math.floor(Math.random() * 10000) + 1000,
        totalSales: Math.floor(Math.random() * 100) + 10,
        totalRevenue: Math.floor(Math.random() * 50000) + 5000,
        activeProducts: collections.filter(c => c.isEnabled).length,
        conversionRate: Math.random() * 10 + 2,
        averageRating: Math.random() * 2 + 3
      }
      setMarketplaceStats(mockStats)
    } catch (error) {
      console.error("Error fetching marketplace stats:", error)
    }
  }

  useEffect(() => {
    fetchMarketplaces()
  }, [user])

  useEffect(() => {
    if (selectedMarketplace) {
      fetchCollections(selectedMarketplace.id)
      fetchMarketplaceStats(selectedMarketplace.id)
    }
  }, [selectedMarketplace])

  const handleCreateMarketplace = async () => {
    if (!user) return

    setActionLoading("create")
    try {
      const response = await fetch("/api/marketplaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          merchantId: user.userId,
          walletAddress: user.walletAddress || user.address
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Marketplace created successfully!",
        })
        setShowCreateDialog(false)
        setFormData({
          businessName: "",
          description: "",
          category: "",
          template: "modern",
          primaryColor: "#3B82F6",
          secondaryColor: "#1E40AF",
          customDomain: ""
        })
        fetchMarketplaces(true)
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to create marketplace")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create marketplace",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpdateMarketplace = async (marketplaceId: string) => {
    setActionLoading(marketplaceId)
    try {
      const response = await fetch(`/api/marketplaces/${marketplaceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Marketplace updated successfully!",
        })
        setEditingMarketplace(null)
        setFormData({
          businessName: "",
          description: "",
          category: "",
          template: "modern",
          primaryColor: "#3B82F6",
          secondaryColor: "#1E40AF",
          customDomain: ""
        })
        fetchMarketplaces(true)
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to update marketplace")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update marketplace",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteMarketplace = async (marketplaceId: string) => {
    setActionLoading(marketplaceId)
    try {
      const response = await fetch(`/api/marketplaces/${marketplaceId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Marketplace deleted successfully!",
        })
        fetchMarketplaces(true)
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete marketplace")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete marketplace",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const copyMarketplaceUrl = (marketplaceId: string) => {
    const url = `${window.location.origin}/merchant/${user?.userId}/marketplace/${marketplaceId}`
    navigator.clipboard.writeText(url)
    toast({
      title: "Copied",
      description: "Marketplace URL copied to clipboard",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "draft": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const handleSelectMarketplace = (marketplace: Marketplace) => {
    setSelectedMarketplace(marketplace)
  }

  const handleToggleMarketplaceEnabled = async (marketplaceId: string, enabled: boolean) => {
    console.log('Toggle marketplace enabled:', marketplaceId, enabled)
    setActionLoading(marketplaceId)
    try {
      const response = await fetch(`/api/marketplaces/${marketplaceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: enabled }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Marketplace ${enabled ? 'enabled' : 'disabled'} successfully!`,
        })
        
        // Update the selected marketplace state immediately
        if (selectedMarketplace && selectedMarketplace.id === marketplaceId) {
          setSelectedMarketplace({
            ...selectedMarketplace,
            isEnabled: enabled
          })
        }
        
        // Refresh the marketplaces list
        fetchMarketplaces(true)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update marketplace")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update marketplace",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleMarketplaceSwap = async (marketplaceId: string, allowSwap: boolean) => {
    console.log('Toggle marketplace swap:', marketplaceId, allowSwap)
    setActionLoading(marketplaceId)
    try {
      const response = await fetch(`/api/marketplaces/${marketplaceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowSwap }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Swap functionality ${allowSwap ? 'enabled' : 'disabled'} successfully!`,
        })
        
        // Update the selected marketplace state immediately
        if (selectedMarketplace && selectedMarketplace.id === marketplaceId) {
          setSelectedMarketplace({
            ...selectedMarketplace,
            allowSwap: allowSwap
          })
        }
        
        // Refresh the marketplaces list
        fetchMarketplaces(true)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update marketplace")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update marketplace",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleMarketplaceMint = async (marketplaceId: string, allowMint: boolean) => {
    console.log('Toggle marketplace mint:', marketplaceId, allowMint)
    setActionLoading(marketplaceId)
    try {
      const response = await fetch(`/api/marketplaces/${marketplaceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowMint }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Minting functionality ${allowMint ? 'enabled' : 'disabled'} successfully!`,
        })
        
        // Update the selected marketplace state immediately
        if (selectedMarketplace && selectedMarketplace.id === marketplaceId) {
          setSelectedMarketplace({
            ...selectedMarketplace,
            allowMint: allowMint
          })
        }
        
        // Refresh the marketplaces list
        fetchMarketplaces(true)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update marketplace")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update marketplace",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleMarketplaceTrading = async (marketplaceId: string, allowTrading: boolean) => {
    console.log('Toggle marketplace trading:', marketplaceId, allowTrading)
    setActionLoading(marketplaceId)
    try {
      const response = await fetch(`/api/marketplaces/${marketplaceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowTrading }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Trading functionality ${allowTrading ? 'enabled' : 'disabled'} successfully!`,
        })
        
        // Update the selected marketplace state immediately
        if (selectedMarketplace && selectedMarketplace.id === marketplaceId) {
          setSelectedMarketplace({
            ...selectedMarketplace,
            allowTrading: allowTrading
          })
        }
        
        // Refresh the marketplaces list
        fetchMarketplaces(true)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update marketplace")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update marketplace",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleMarketplaceCreating = async (marketplaceId: string, allowCreate: boolean) => {
    console.log('Toggle marketplace creating:', marketplaceId, allowCreate)
    setActionLoading(marketplaceId)
    try {
      const response = await fetch(`/api/marketplaces/${marketplaceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowCreate }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Creating collections/NFTs functionality ${allowCreate ? 'enabled' : 'disabled'} successfully!`,
        })
        
        // Update the selected marketplace state immediately
        if (selectedMarketplace && selectedMarketplace.id === marketplaceId) {
          setSelectedMarketplace({
            ...selectedMarketplace,
            allowCreate: allowCreate
          })
        }
        
        // Refresh the marketplaces list
        fetchMarketplaces(true)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update marketplace")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update marketplace",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  } 

  
  const handleAddCollection = async () => {
    if (!selectedMarketplace) return

    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    // Validate that collection has at least 1 NFT
    if (newCollection.nftCount < 1) {
      toast({
        title: "Error",
        description: "Collection must have at least 1 NFT",
        variant: "destructive",
      })
      return
    }

    setActionLoading("add-collection")
    try {
      const response = await fetch(`/api/marketplaces/${selectedMarketplace.id}/collections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newCollection,
          marketplaceId: selectedMarketplace.id,
          merchantId: user.userId,
          userAddress: user.walletAddress || user.address,
          isEnabled: true,
          allowSwap: selectedMarketplace.allowSwap
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Collection added successfully!",
        })
        setNewCollection({
          name: "",
          description: "",
          price: 0,
          currency: "ALGO",
          category: "",
          type: "nft",
          image: "",
          ipfsHash: "",
          nftCount: 1
        })
        fetchCollections(selectedMarketplace.id)
      } else {
        throw new Error("Failed to add collection")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add collection",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleCollectionEnabled = async (collectionId: string, enabled: boolean) => {
    setActionLoading(collectionId)
    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: enabled }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Collection ${enabled ? 'enabled' : 'disabled'} successfully!`,
        })
        if (selectedMarketplace) {
          fetchCollections(selectedMarketplace.id)
        }
      } else {
        throw new Error("Failed to update collection")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update collection",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleCollectionSwap = async (collectionId: string, allowSwap: boolean) => {
    setActionLoading(collectionId)
    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowSwap }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Swap functionality ${allowSwap ? 'enabled' : 'disabled'} for collection!`,
        })
        if (selectedMarketplace) {
          fetchCollections(selectedMarketplace.id)
        }
      } else {
        throw new Error("Failed to update collection")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update collection",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleEditCollection = (collection: Collection) => {
    setEditingCollection(collection)
    setEditCollectionData({
      name: collection.name,
      description: collection.description,
      price: collection.price,
      currency: collection.currency,
      category: collection.category,
      type: collection.type,
      image: collection.image,
      ipfsHash: (collection as any).ipfsHash || "",
      nftCount: collection.nftCount
    })
    setShowEditCollectionDialog(true)
  }

  const handleUpdateCollection = async () => {
    if (!editingCollection || !user) return

    // Validate that collection has at least 1 NFT
    if (editCollectionData.nftCount < 1) {
      toast({
        title: "Error",
        description: "Collection must have at least 1 NFT",
        variant: "destructive",
      })
      return
    }

    setActionLoading("update-collection")
    try {
      const response = await fetch(`/api/collections/${editingCollection.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editCollectionData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Collection updated successfully!",
        })
        setShowEditCollectionDialog(false)
        setEditingCollection(null)
        if (selectedMarketplace) {
          fetchCollections(selectedMarketplace.id)
        }
      } else {
        throw new Error("Failed to update collection")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update collection",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteCollection = async (collectionId: string) => {
    if (!user) return

    setActionLoading(collectionId)
    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          isDeleted: true,
          deletedAt: new Date().toISOString()
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Collection deleted successfully!",
        })
        if (selectedMarketplace) {
          fetchCollections(selectedMarketplace.id)
        }
      } else {
        throw new Error("Failed to delete collection")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete collection",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleManageNFTs = (collection: Collection) => {
    setSelectedCollectionForNFTs(collection)
    setShowNFTManagementDialog(true)
  }

  const handleCreateNFT = async () => {
    if (!selectedCollectionForNFTs || !user) return

    if (!newNFT.name || !newNFT.description) {
      toast({
        title: "Error",
        description: "NFT name and description are required",
        variant: "destructive",
      })
      return
    }

    setActionLoading("create-nft")
    try {
      const response = await fetch(`/api/nfts/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newNFT,
          collectionId: selectedCollectionForNFTs.id,
          marketplaceId: selectedMarketplace?.id,
          merchantId: user.userId,
          userAddress: user.walletAddress || user.address,
          traits: nftTraits
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setCreatedNFTId(result.nftId) // Capture the NFT ID
        toast({
          title: "Success",
          description: "NFT created successfully! You can now mint it on the blockchain.",
        })
        // setShowNFTForm(false)
        setNewNFT({
          name: "",
          description: "",
          image: "",
          ipfsHash: "",
          price: 0,
          rarity: "common",
          traits: [],
          mintPrice: 0,
          maxSupply: 1,
          royaltyFee: 0
        })
        setNftTraits([])
        if (selectedMarketplace) {
          fetchCollections(selectedMarketplace.id)
        }
      } else {
        throw new Error("Failed to create NFT")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create NFT",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleMintNFT = async (nftId: string, userAddress: string) => {
    if (!user) return

    setActionLoading("mint-nft")
    try {
      // Step 1: Create mint transaction
      const createResponse = await fetch(`/api/nfts/mint-wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nftId,
          userAddress
        }),
      })

      if (!createResponse.ok) {
        const error = await createResponse.json()
        throw new Error(error.error || "Failed to create mint transaction")
      }

      const { transaction } = await createResponse.json()

      // Step 2: Sign transaction with wallet using the transaction signer
      let signedTransaction
      
      try {
        // Use the transaction signer service
        signedTransaction = await transactionSigner.signTransaction(transaction.txn, userAddress)
        
        console.log('Transaction signed successfully with Pera Wallet')
      } catch (error: any) {
        console.error('Wallet signing failed:', error)
        throw new Error(`Failed to sign transaction: ${error.message || 'Unknown error'}`)
      }

      // Step 3: Submit signed transaction
      const submitResponse = await fetch(`/api/nfts/mint-wallet`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nftId,
          signedTransaction // already base64
        }),
      })

      if (submitResponse.ok) {
        const result = await submitResponse.json()
        toast({
          title: "Success",
          description: `NFT minted successfully! Asset ID: ${result.assetId}`,
        })
        if (selectedMarketplace) {
          fetchCollections(selectedMarketplace.id)
        }
      } else {
        const error = await submitResponse.json()
        throw new Error(error.error || "Failed to submit mint transaction")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mint NFT",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const addTrait = () => {
    setNftTraits([...nftTraits, { trait_type: "", value: "", rarity: 1 }])
  }

  const removeTrait = (index: number) => {
    setNftTraits(nftTraits.filter((_, i) => i !== index))
  }

  const updateTrait = (index: number, field: string, value: string | number) => {
    const updatedTraits = [...nftTraits]
    updatedTraits[index] = { ...updatedTraits[index], [field]: value }
    setNftTraits(updatedTraits)
  }

  const handleUpdateWalletAddress = async () => {
    if (!selectedMarketplace) return

    setActionLoading("update-wallet")
    try {
      const response = await fetch(`/api/marketplaces/${selectedMarketplace.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Wallet address updated successfully!",
        })
        setShowWalletDialog(false)
        setWalletAddress("")
        fetchMarketplaces(true)
      } else {
        throw new Error("Failed to update wallet address")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update wallet address",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const openEditDialog = (marketplace: Marketplace) => {
    setEditingMarketplace(marketplace)
    setFormData({
      businessName: marketplace.businessName,
      description: marketplace.description,
      category: marketplace.category,
      template: marketplace.template,
      primaryColor: marketplace.primaryColor,
      secondaryColor: marketplace.secondaryColor,
      customDomain: marketplace.customDomain || ""
    })
  }

  const openWalletDialog = (marketplace: Marketplace) => {
    setSelectedMarketplace(marketplace)
    setWalletAddress(marketplace.walletAddress)
    setShowWalletDialog(true)
  }

  return (
    <TooltipProvider>
      <AuthGuard requiredRole="merchant">
      <DashboardLayout role="merchant">
          <motion.div 
            className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="container mx-auto px-6 py-8">
              <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
                    <h1 className="text-4xl font-bold bbg-clip-text">
                      Marketplace Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                      Create and manage your independent marketplaces with full control
              </p>
            </div>
                  <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchMarketplaces(true)}
                disabled={refreshing}
                      className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                className="flex items-center gap-2"
                onClick={() => router.push("/dashboard/merchant/marketplaces/create-marketplace")}
              >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Marketplace
                  </Button>
            </div>
          </div>

                {/* Marketplace Selection & Management */}
                <Tabs defaultValue="marketplaces" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="marketplaces">Marketplaces</TabsTrigger>
                    <TabsTrigger value="collections" disabled={!selectedMarketplace}>Collections</TabsTrigger>
                    <TabsTrigger value="analytics" disabled={!selectedMarketplace}>Analytics</TabsTrigger>
                    <TabsTrigger value="settings" disabled={!selectedMarketplace}>Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="marketplaces" className="space-y-6">
                    {/* Marketplace Cards */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
          ) : marketplaces.length === 0 ? (
                      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                          <Store className="w-16 h-16 text-gray-400 mb-4" />
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Marketplaces Yet
                </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
                            Create your first independent marketplace to start selling NFTs and managing your digital assets
                </p>
                          <Button 
                            onClick={() => setShowCreateDialog(true)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Marketplace
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketplaces.map((marketplace) => (
                          <motion.div
                            key={marketplace.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Card 
                              className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
                                selectedMarketplace?.id === marketplace.id 
                                  ? 'ring-2 ring-blue-500 shadow-lg' 
                                  : 'hover:shadow-md'
                              }`}
                              onClick={() => handleSelectMarketplace(marketplace)}
                            >
                              <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      {marketplace.businessName}
                                      {selectedMarketplace?.id === marketplace.id && (
                                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                      )}
                                    </CardTitle>
                                    <CardDescription className="mt-1 line-clamp-2">
                          {marketplace.description}
                        </CardDescription>
                      </div>
                                  <Badge className={`${getStatusColor(marketplace.status)} flex items-center gap-1`}>
                                    {marketplace.status === "approved" && <CheckCircle2 className="w-3 h-3" />}
                                    {marketplace.status === "pending" && <Clock className="w-3 h-3" />}
                                    {marketplace.status === "rejected" && <XCircle className="w-3 h-3" />}
                        {marketplace.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                                <div className="space-y-4">
                                  {/* Color Preview & Template */}
                                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: marketplace.primaryColor }}
                        />
                        <div 
                                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: marketplace.secondaryColor }}
                        />
                                      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {marketplace.template} template
                        </span>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      {marketplace.isEnabled ? 'Enabled' : 'Disabled'}
                                    </Badge>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            copyMarketplaceUrl(marketplace.id)
                                          }}
                                          className="flex-1"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy URL
                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Copy marketplace URL</p>
                                      </TooltipContent>
                                    </Tooltip>
                        {marketplace.status === "approved" && (
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        asChild
                                        className="flex-1"
                                      >
                                        <Link href={`/marketplace/${user?.userId}/${marketplace.id}`}>
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View
                            </Link>
                          </Button>
                        )}
                      </div>

                      {/* Action Buttons */}
                                  <div className="flex items-center gap-1 pt-2 border-t">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            openEditDialog(marketplace)
                                          }}
                          disabled={actionLoading === marketplace.id}
                                          className="flex-1"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Edit marketplace</p>
                                      </TooltipContent>
                                    </Tooltip>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                                          <MoreVertical className="w-3 h-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => openWalletDialog(marketplace)}>
                                          <Wallet className="w-4 h-4 mr-2" />
                                          Update Wallet
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => handleDeleteMarketplace(marketplace.id)}
                                          className="text-red-600"
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="collections" className="space-y-6">
                    {selectedMarketplace && (
                      <div className="space-y-6">
                        {/* Collection Management Header */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                              Collections & NFTs
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                              Manage collections for {selectedMarketplace.businessName}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                              className="hover:bg-green-50 dark:hover:bg-green-900/20"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Import
                        </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Export
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Collection
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Add New Collection</DialogTitle>
                                  <DialogDescription>
                                    Add a new collection with at least 1 NFT to your marketplace
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="collectionName">Collection Name</Label>
                                      <Input
                                        id="collectionName"
                                        value={newCollection.name}
                                        onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
                                        placeholder="Enter collection name"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="collectionType">Type</Label>
                                      <Select value={newCollection.type} onValueChange={(value: "nft" | "event" | "merchandise") => setNewCollection({ ...newCollection, type: value })}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="nft">NFT</SelectItem>
                                          <SelectItem value="event">Event</SelectItem>
                                          <SelectItem value="merchandise">Merchandise</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <div>
                                    <Label htmlFor="collectionDescription">Description</Label>
                                    <Textarea
                                      id="collectionDescription"
                                      value={newCollection.description}
                                      onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                                      placeholder="Describe your collection"
                                      rows={3}
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 gap-4">
                                    <div>
                                      <Label htmlFor="collectionPrice">Price</Label>
                                      <Input
                                        id="collectionPrice"
                                        type="number"
                                        value={newCollection.price}
                                        onChange={(e) => setNewCollection({ ...newCollection, price: parseFloat(e.target.value) || 0 })}
                                        placeholder="0.00"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="collectionCurrency">Currency</Label>
                                      <Select value={newCollection.currency} onValueChange={(value) => setNewCollection({ ...newCollection, currency: value })}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="ALGO">ALGO</SelectItem>
                                          <SelectItem value="USDC">USDC</SelectItem>
                                          <SelectItem value="USD">USD</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label htmlFor="collectionCategory">Category</Label>
                                      <Input
                                        id="collectionCategory"
                                        value={newCollection.category}
                                        onChange={(e) => setNewCollection({ ...newCollection, category: e.target.value })}
                                        placeholder="Category"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="nftCount">NFT Count (Min: 1)</Label>
                                      <Input
                                        id="nftCount"
                                        type="number"
                                        min="1"
                                        value={newCollection.nftCount}
                                        onChange={(e) => setNewCollection({ ...newCollection, nftCount: Math.max(1, parseInt(e.target.value) || 1) })}
                                        placeholder="1"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <Label htmlFor="collectionImage">Collection Image</Label>
                                    <ImageUpload
                                      onImageUpload={(ipfsHash, imageUrl) => {
                                        setNewCollection({ ...newCollection, image: imageUrl, ipfsHash })
                                      }}
                                      onImageRemove={() => {
                                        setNewCollection({ ...newCollection, image: "", ipfsHash: "" })
                                      }}
                                      currentImage={newCollection.image}
                                      maxSize={10}
                                      acceptedTypes={["image/jpeg", "image/png", "image/gif", "image/webp"]}
                                      className="mt-2"
                                    />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setNewCollection({
                                      name: "",
                                      description: "",
                                      price: 0,
                                      currency: "ALGO",
                                      category: "",
                                      type: "nft",
                                      image: "",
                                      ipfsHash: "",
                                      nftCount: 1
                                    })}>
                                      Cancel
                                    </Button>
                                    <Button onClick={handleAddCollection} disabled={actionLoading === "add-collection"}>
                                      {actionLoading === "add-collection" ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      ) : (
                                        <Plus className="w-4 h-4 mr-2" />
                                      )}
                                      Add Collection
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>

                        {/* Edit Collection Dialog */}
                        <Dialog open={showEditCollectionDialog} onOpenChange={setShowEditCollectionDialog}>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Collection</DialogTitle>
                              <DialogDescription>
                                Update collection details and NFT count
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="editCollectionName">Collection Name</Label>
                                  <Input
                                    id="editCollectionName"
                                    value={editCollectionData.name}
                                    onChange={(e) => setEditCollectionData({ ...editCollectionData, name: e.target.value })}
                                    placeholder="Enter collection name"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="editCollectionType">Type</Label>
                                  <Select value={editCollectionData.type} onValueChange={(value: "nft" | "event" | "merchandise") => setEditCollectionData({ ...editCollectionData, type: value })}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="nft">NFT</SelectItem>
                                      <SelectItem value="event">Event</SelectItem>
                                      <SelectItem value="merchandise">Merchandise</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="editCollectionDescription">Description</Label>
                                <Textarea
                                  id="editCollectionDescription"
                                  value={editCollectionData.description}
                                  onChange={(e) => setEditCollectionData({ ...editCollectionData, description: e.target.value })}
                                  placeholder="Describe your collection"
                                  rows={3}
                                />
                              </div>
                              <div className="grid grid-cols-4 gap-4">
                                <div>
                                  <Label htmlFor="editCollectionPrice">Price</Label>
                                  <Input
                                    id="editCollectionPrice"
                                    type="number"
                                    value={editCollectionData.price}
                                    onChange={(e) => setEditCollectionData({ ...editCollectionData, price: parseFloat(e.target.value) || 0 })}
                                    placeholder="0.00"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="editCollectionCurrency">Currency</Label>
                                  <Select value={editCollectionData.currency} onValueChange={(value) => setEditCollectionData({ ...editCollectionData, currency: value })}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="ALGO">ALGO</SelectItem>
                                      <SelectItem value="USDC">USDC</SelectItem>
                                      <SelectItem value="USD">USD</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="editCollectionCategory">Category</Label>
                                  <Input
                                    id="editCollectionCategory"
                                    value={editCollectionData.category}
                                    onChange={(e) => setEditCollectionData({ ...editCollectionData, category: e.target.value })}
                                    placeholder="Category"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="editNftCount">NFT Count (Min: 1)</Label>
                                  <Input
                                    id="editNftCount"
                                    type="number"
                                    min="1"
                                    value={editCollectionData.nftCount}
                                    onChange={(e) => setEditCollectionData({ ...editCollectionData, nftCount: Math.max(1, parseInt(e.target.value) || 1) })}
                                    placeholder="1"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="editCollectionImage">Collection Image</Label>
                                <ImageUpload
                                  onImageUpload={(ipfsHash, imageUrl) => {
                                    setEditCollectionData({ ...editCollectionData, image: imageUrl, ipfsHash })
                                  }}
                                  onImageRemove={() => {
                                    setEditCollectionData({ ...editCollectionData, image: "", ipfsHash: "" })
                                  }}
                                  currentImage={editCollectionData.image}
                                  maxSize={10}
                                  acceptedTypes={["image/jpeg", "image/png", "image/gif", "image/webp"]}
                                  className="mt-2"
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowEditCollectionDialog(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleUpdateCollection} disabled={actionLoading === "update-collection"}>
                                  {actionLoading === "update-collection" ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  ) : (
                                    <Edit className="w-4 h-4 mr-2" />
                                  )}
                                  Update Collection
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* NFT Management Dialog */}
                        <Dialog open={showNFTManagementDialog} onOpenChange={setShowNFTManagementDialog}>
                          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Manage NFTs - {selectedCollectionForNFTs?.name}</DialogTitle>
                              <DialogDescription>
                                Add, edit, and manage NFTs in this collection
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Collection has {selectedCollectionForNFTs?.nftCount || 0} NFTs
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    onClick={() => setShowNFTForm(!showNFTForm)}
                                  >
                                    {showNFTForm ? "Abort" : "Create NFT"}
                                  </Button>
                                  <Button onClick={() => {
                                    if (selectedCollectionForNFTs && user) {
                                      router.push(`/marketplace/${user.userId}/${selectedMarketplace?.id}/collection/${selectedCollectionForNFTs.id}`)
                                    }
                                  }}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Collection
                                  </Button>
                                </div>
                              </div>

                              {/* NFT Creation Form */}
                              {showNFTForm && (
                                <NFTCreationForm
                                  newNFT={newNFT}
                                  setNewNFT={setNewNFT}
                                  nftTraits={nftTraits}
                                  setNftTraits={setNftTraits}
                                  onCancel={() => setShowNFTForm(false)}
                                  onCreate={handleCreateNFT}
                                  onMint={handleMintNFT}
                                  isLoading={actionLoading === "create-nft"}
                                  createdNFTId={createdNFTId}
                                  showMintOption={true}
                                />
                              )}

                              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                <h4 className="font-medium mb-2">NFT Management Features:</h4>
                                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                  <li>• Create new NFTs for this collection</li>
                                  <li>• Edit existing NFT properties</li>
                                  <li>• Set NFT rarity and traits</li>
                                  <li>• Manage NFT pricing and availability</li>
                                  <li>• View NFT analytics and performance</li>
                                </ul>
                              </div>

                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowNFTManagementDialog(false)}>
                                  Close
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Collection Filters */}
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                              <Input
                                placeholder="Search collections..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                              />
                            </div>
                          </div>
                          <Select value={filterBy} onValueChange={setFilterBy}>
                            <SelectTrigger className="select-theme-filter">
                              <Filter className="w-4 h-4 mr-2" />
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Collections</SelectItem>
                              <SelectItem value="enabled">Enabled</SelectItem>
                              <SelectItem value="disabled">Disabled</SelectItem>
                              <SelectItem value="nft">NFTs</SelectItem>
                              <SelectItem value="event">Events</SelectItem>
                              <SelectItem value="merchandise">Merchandise</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="select-theme-sort">
                              <SortAsc className="w-4 h-4 mr-2" />
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="name">Name</SelectItem>
                              <SelectItem value="price">Price</SelectItem>
                              <SelectItem value="created">Created</SelectItem>
                              <SelectItem value="sales">Sales</SelectItem>
                              <SelectItem value="nftCount">NFT Count</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Collections Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {collections.map((collection) => (
                            <motion.div
                              key={collection.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Card className="group hover:shadow-lg transition-all duration-200">
                                <div className="relative">
                                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-t-lg overflow-hidden">
                                    {collection.image ? (
                                      <img
                                        src={collection.image}
                                        alt={collection.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-12 h-12 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="absolute top-2 right-2 flex gap-1">
                                    <Badge variant={collection.isEnabled ? "default" : "secondary"} className="text-xs">
                                      {collection.isEnabled ? "Enabled" : "Disabled"}
                                    </Badge>
                                    {collection.allowSwap && (
                                      <Badge variant="outline" className="text-xs">
                                        <ArrowRightLeft className="w-3 h-3 mr-1" />
                                        Swap
                                      </Badge>
                                    )}
                                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                                      {collection.nftCount} NFTs
                                    </Badge>
                                  </div>
                                </div>
                                <CardContent className="p-4">
                                  <div className="space-y-3">
                                    <div>
                                      <CardTitle className="text-lg line-clamp-1">{collection.name}</CardTitle>
                                      <CardDescription className="line-clamp-2 mt-1">
                                        {collection.description}
                                      </CardDescription>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="text-lg font-semibold">{collection.price} {collection.currency}</span>
                                        <Badge variant="outline" className="text-xs capitalize">
                                          {collection.type}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {collection.rating && (
                                          <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                              {collection.rating.toFixed(1)}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t">
                                      <div className="flex items-center gap-2">
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Switch
                                              checked={collection.isEnabled}
                                              onCheckedChange={(checked) => handleToggleCollectionEnabled(collection.id, checked)}
                                              disabled={actionLoading === collection.id}
                                            />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>{collection.isEnabled ? 'Disable' : 'Enable'} collection</p>
                                          </TooltipContent>
                                        </Tooltip>
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                          {collection.isEnabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {collection.type === "nft" && (
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Switch
                                                checked={collection.allowSwap}
                                                onCheckedChange={(checked) => handleToggleCollectionSwap(collection.id, checked)}
                                                disabled={actionLoading === collection.id}
                                              />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>{collection.allowSwap ? 'Disable' : 'Enable'} swap</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        )}
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                              <MoreVertical className="w-4 h-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                              <Eye className="w-4 h-4 mr-2" />
                                              Preview
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleEditCollection(collection)}>
                                              <Edit className="w-4 h-4 mr-2" />
                                              Edit Collection
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleManageNFTs(collection)}>
                                              <Package className="w-4 h-4 mr-2" />
                                              Manage NFTs
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                              <BarChart3 className="w-4 h-4 mr-2" />
                                              Analytics
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                              <Copy className="w-4 h-4 mr-2" />
                                              Duplicate
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                              className="text-red-600"
                                              onClick={() => handleDeleteCollection(collection.id)}
                                            >
                                              <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                            </motion.div>
              ))}
            </div>

                        {collections.length === 0 && (
                          <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                              <Package className="w-16 h-16 text-gray-400 mb-4" />
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                No Collections Yet
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
                                Add your first collection with at least 1 NFT to start selling on your marketplace
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="analytics" className="space-y-6">
                    {selectedMarketplace && marketplaceStats && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Analytics Dashboard
                          </h2>
                          <p className="text-gray-600 dark:text-gray-400">
                            Performance insights for {selectedMarketplace.businessName}
                          </p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Views</p>
                                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                    {marketplaceStats.totalViews.toLocaleString()}
                                  </p>
                                </div>
                                <Eye className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="mt-4">
                                <Progress value={75} className="h-2" />
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">+12% from last month</p>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Sales</p>
                                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                    {marketplaceStats.totalSales}
                                  </p>
                                </div>
                                <ShoppingCart className="w-8 h-8 text-green-600 dark:text-green-400" />
                              </div>
                              <div className="mt-4">
                                <Progress value={60} className="h-2" />
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">+8% from last month</p>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Revenue</p>
                                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                    ${marketplaceStats.totalRevenue.toLocaleString()}
                                  </p>
                                </div>
                                <DollarSign className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                              </div>
                              <div className="mt-4">
                                <Progress value={85} className="h-2" />
                                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">+15% from last month</p>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Conversion Rate</p>
                                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                                    {marketplaceStats.conversionRate.toFixed(1)}%
                                  </p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                              </div>
                              <div className="mt-4">
                                <Progress value={marketplaceStats.conversionRate * 10} className="h-2" />
                                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">+3% from last month</p>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Top Collections */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Star className="w-5 h-5" />
                              Top Performing Collections
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {collections.slice(0, 5).map((collection, index) => (
                                <div key={collection.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                      {index + 1}
                                    </div>
                                    <div>
                                      <p className="font-medium">{collection.name}</p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {collection.sales || 0} sales • {collection.views || 0} views • {collection.nftCount} NFTs
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold">{collection.price} {collection.currency}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      Rating: {collection.rating?.toFixed(1) || 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-6">
                    {selectedMarketplace && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Marketplace Settings
                          </h2>
                          <p className="text-gray-600 dark:text-gray-400">
                            Configure settings for {selectedMarketplace.businessName}
                          </p>
                        </div>

                        {/* Marketplace Controls */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Settings className="w-5 h-5" />
                              Marketplace Controls
                            </CardTitle>
                            <CardDescription>
                              Enable or disable your marketplace and its features
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                  <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <p className="font-medium">Marketplace Status</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedMarketplace.isEnabled ? 'Your marketplace is live and accessible' : 'Your marketplace is currently disabled'}
                                  </p>
                                </div>
                              </div>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Switch
                                    checked={selectedMarketplace.isEnabled}
                                    onCheckedChange={(checked) => {
                                      console.log('Switch clicked:', checked)
                                      handleToggleMarketplaceEnabled(selectedMarketplace.id, checked)
                                    }}
                                    disabled={actionLoading === selectedMarketplace.id}
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{selectedMarketplace.isEnabled ? 'Disable' : 'Enable'} marketplace</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                  <ArrowRightLeft className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                  <p className="font-medium">Swap Functionality</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedMarketplace.allowSwap ? 'Users can swap NFTs in your marketplace' : 'Swap functionality is disabled'}
                                  </p>
                                </div>
                              </div>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Switch
                                    checked={selectedMarketplace.allowSwap}
                                    onCheckedChange={(checked) => {
                                      console.log('Swap switch clicked:', checked)
                                      handleToggleMarketplaceSwap(selectedMarketplace.id, checked)
                                    }}
                                    disabled={actionLoading === selectedMarketplace.id}
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{selectedMarketplace.allowSwap ? 'Disable' : 'Enable'} swap functionality</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                                  <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                  <p className="font-medium">Minting Functionality</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedMarketplace.allowMint ? 'Users can mint NFTs in your marketplace' : 'Minting functionality is disabled'}
                                  </p>
                                </div>
                              </div>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Switch
                                    checked={selectedMarketplace.allowMint || false}
                                    onCheckedChange={(checked) => {
                                      console.log('Mint switch clicked:', checked)
                                      handleToggleMarketplaceMint(selectedMarketplace.id, checked)
                                    }}
                                    disabled={actionLoading === selectedMarketplace.id}
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{selectedMarketplace.allowMint ? 'Disable' : 'Enable'} minting functionality</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                                  <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                  <p className="font-medium">Trading Functionality</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedMarketplace.allowTrading ? 'Users can trade NFTs in your marketplace' : 'Trading functionality is disabled'}
                                  </p>
                                </div>
                              </div>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Switch
                                    checked={selectedMarketplace.allowTrading || false}
                                    onCheckedChange={(checked) => {
                                      console.log('Trading switch clicked:', checked)
                                      handleToggleMarketplaceTrading(selectedMarketplace.id, checked)
                                    }}
                                    disabled={actionLoading === selectedMarketplace.id}
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{selectedMarketplace.allowTrading ? 'Disable' : 'Enable'} trading functionality</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                                  <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                  <p className="font-medium">Creating Collections/NFTs Functionality</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedMarketplace.allowCreate ? 'Users can create collections/NFTs in your marketplace' : 'Creating collections/NFTs functionality is disabled'}
                                  </p>
                                </div>
                              </div>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Switch
                                    checked={selectedMarketplace.allowCreate || false}
                                    onCheckedChange={(checked) => {
                                      console.log('Creating collections/NFTs switch clicked:', checked)
                                      handleToggleMarketplaceCreating(selectedMarketplace.id, checked)
                                    }}
                                    disabled={actionLoading === selectedMarketplace.id}
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{selectedMarketplace.allowCreate ? 'Disable' : 'Enable'} creating collections/NFTs functionality</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Wallet Settings */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Wallet className="w-5 h-5" />
                              Wallet Settings
                            </CardTitle>
                            <CardDescription>
                              Manage your wallet address for receiving payments
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">Current Wallet Address</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                                    {selectedMarketplace.walletAddress || 'No wallet address set'}
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openWalletDialog(selectedMarketplace)}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Update
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Marketplace Preview */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Eye className="w-5 h-5" />
                              Marketplace Preview
                            </CardTitle>
                            <CardDescription>
                              Preview and share your marketplace
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">Marketplace URL</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                                    {typeof window !== 'undefined' ? `${window.location.origin}/marketplace/${user?.userId}/${selectedMarketplace.id}` : ''}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const url = `${window.location.origin}/marketplace/${user?.userId}/${selectedMarketplace.id}`
                                      navigator.clipboard.writeText(url)
                                      toast({
                                        title: "Copied",
                                        description: "Marketplace URL copied to clipboard",
                                      })
                                    }}
                                  >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                  >
                                    <Link href={`/marketplace/${user?.userId}/${selectedMarketplace.id}`} target="_blank">
                                      <ExternalLink className="w-4 h-4 mr-2" />
                                      Preview
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Dialogs */}
          <Dialog open={!!editingMarketplace} onOpenChange={() => setEditingMarketplace(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Marketplace</DialogTitle>
                <DialogDescription>
                  Update your marketplace settings and branding
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-businessName">Business Name</Label>
                    <Input
                      id="edit-businessName"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      placeholder="Enter business name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="art">Art & Culture</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your marketplace"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-template">Template</Label>
                    <Select value={formData.template} onValueChange={(value) => setFormData({ ...formData, template: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="classic">Classic</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-customDomain">Custom Domain (Optional)</Label>
                    <Input
                      id="edit-customDomain"
                      value={formData.customDomain}
                      onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                      placeholder="yourmarketplace.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-primaryColor">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="edit-primaryColor"
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-secondaryColor">Secondary Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="edit-secondaryColor"
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingMarketplace(null)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => editingMarketplace && handleUpdateMarketplace(editingMarketplace.id)} 
                    disabled={actionLoading === editingMarketplace?.id}
                  >
                    {actionLoading === editingMarketplace?.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Edit className="w-4 h-4 mr-2" />
                    )}
                    Update Marketplace
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

                <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Wallet Address</DialogTitle>
                      <DialogDescription>
                        Update the wallet address for receiving payments
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="walletAddress">Wallet Address</Label>
                        <Input
                          id="walletAddress"
                          value={walletAddress}
                          onChange={(e) => setWalletAddress(e.target.value)}
                          placeholder="Enter wallet address"
                        />
        </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowWalletDialog(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleUpdateWalletAddress}
                          disabled={actionLoading === "update-wallet"}
                        >
                          {actionLoading === "update-wallet" ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Wallet className="w-4 h-4 mr-2" />
                          )}
                          Update Wallet
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </motion.div>
      </DashboardLayout>
    </AuthGuard>
    </TooltipProvider>
  )
}
