"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Plus, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Zap,
  ExternalLink,
  Copy,
  Wallet
} from "lucide-react"
import ImageUpload from "@/components/ui/image-upload"
import { useToast } from "@/hooks/use-toast"

interface NFTTrait {
  trait_type: string
  value: string
  rarity: number
}

interface NewNFT {
  name: string
  description: string
  image: string
  ipfsHash: string
  price: number
  mintPrice: number
  maxSupply: number
  rarity: string
  royaltyFee: number
  traits: { trait_type: string; value: string; rarity: number }[]
}

interface NFTMintWidgetProps {
  collectionId: string
  marketplaceId: string
  onNFTMinted?: (nftId: string, assetId: number) => void
}

export function NFTMintWidget({ collectionId, marketplaceId, onNFTMinted }: NFTMintWidgetProps) {
  const [activeTab, setActiveTab] = useState("create")
  const [newNFT, setNewNFT] = useState<NewNFT>({
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
  const [nftTraits, setNftTraits] = useState<NFTTrait[]>([])
  const [privateKey, setPrivateKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [createdNFTId, setCreatedNFTId] = useState<string | null>(null)
  const [mintResult, setMintResult] = useState<any>(null)
  const [showPrivateKeyDialog, setShowPrivateKeyDialog] = useState(false)
  
  const { toast } = useToast()

  const addTrait = () => {
    setNftTraits([...nftTraits, { trait_type: "", value: "", rarity: 1 }])
  }

  const updateTrait = (index: number, field: keyof NFTTrait, value: string | number) => {
    const updatedTraits = [...nftTraits]
    updatedTraits[index] = { ...updatedTraits[index], [field]: value }
    setNftTraits(updatedTraits)
  }

  const removeTrait = (index: number) => {
    setNftTraits(nftTraits.filter((_, i) => i !== index))
  }

  const handleCreateNFT = async () => {
    if (!newNFT.name || !newNFT.description) {
      toast({
        title: "Error",
        description: "NFT name and description are required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/nfts/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newNFT,
          collectionId,
          marketplaceId,
          traits: nftTraits
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setCreatedNFTId(result.nftId)
        setActiveTab("mint")
        toast({
          title: "Success",
          description: "NFT created successfully! Ready to mint on blockchain.",
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to create NFT")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create NFT",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMintNFT = async () => {
    if (!createdNFTId) return

    if (!privateKey) {
      toast({
        title: "Error",
        description: "Private key is required for minting",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/nfts/mint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nftId: createdNFTId,
          privateKey
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setMintResult(result)
        toast({
          title: "Success",
          description: `NFT minted successfully! Asset ID: ${result.assetId}`,
        })
        if (onNFTMinted) {
          onNFTMinted(createdNFTId, result.assetId)
        }
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to mint NFT")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mint NFT",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    })
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          NFT Creation & Minting
        </CardTitle>
        <CardDescription>
          Create and mint NFTs on the Algorand blockchain
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create NFT</TabsTrigger>
            <TabsTrigger value="mint" disabled={!createdNFTId}>Mint on Blockchain</TabsTrigger>
            <TabsTrigger value="result" disabled={!mintResult}>Mint Result</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nftName">NFT Name</Label>
                <Input
                  id="nftName"
                  value={newNFT.name}
                  onChange={(e) => setNewNFT({ ...newNFT, name: e.target.value })}
                  placeholder="Enter NFT name"
                />
              </div>
              <div>
                <Label htmlFor="nftRarity">Rarity</Label>
                <Select value={newNFT.rarity} onValueChange={(value) => setNewNFT({ ...newNFT, rarity: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="common">Common</SelectItem>
                    <SelectItem value="uncommon">Uncommon</SelectItem>
                    <SelectItem value="rare">Rare</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="legendary">Legendary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="nftDescription">Description</Label>
              <Textarea
                id="nftDescription"
                value={newNFT.description}
                onChange={(e) => setNewNFT({ ...newNFT, description: e.target.value })}
                placeholder="Describe your NFT"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="nftImage">NFT Image</Label>
              <ImageUpload
                onImageUpload={(ipfsHash: string, imageUrl: string) => {
                  setNewNFT({ ...newNFT, image: imageUrl, ipfsHash })
                }}
                onImageRemove={() => {
                  setNewNFT({ ...newNFT, image: "", ipfsHash: "" })
                }}
                currentImage={newNFT.image}
                maxSize={10}
                acceptedTypes={["image/jpeg", "image/png", "image/gif", "image/webp"]}
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="nftPrice">Price (ALGO)</Label>
                <Input
                  id="nftPrice"
                  type="number"
                  value={newNFT.price}
                  onChange={(e) => setNewNFT({ ...newNFT, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="nftMintPrice">Mint Price (ALGO)</Label>
                <Input
                  id="nftMintPrice"
                  type="number"
                  value={newNFT.mintPrice}
                  onChange={(e) => setNewNFT({ ...newNFT, mintPrice: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="nftMaxSupply">Max Supply</Label>
                <Input
                  id="nftMaxSupply"
                  type="number"
                  min="1"
                  value={newNFT.maxSupply}
                  onChange={(e) => setNewNFT({ ...newNFT, maxSupply: parseInt(e.target.value) || 1 })}
                  placeholder="1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="nftRoyaltyFee">Royalty Fee (%)</Label>
              <Input
                id="nftRoyaltyFee"
                type="number"
                min="0"
                max="100"
                value={newNFT.royaltyFee}
                onChange={(e) => setNewNFT({ ...newNFT, royaltyFee: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>

            {/* Traits Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Traits</Label>
                <Button type="button" variant="outline" size="sm" onClick={addTrait}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Trait
                </Button>
              </div>
              {nftTraits.map((trait, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                  <Input
                    placeholder="Trait Type"
                    value={trait.trait_type}
                    onChange={(e) => updateTrait(index, "trait_type", e.target.value)}
                  />
                  <Input
                    placeholder="Value"
                    value={trait.value}
                    onChange={(e) => updateTrait(index, "value", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Rarity"
                    value={trait.rarity}
                    onChange={(e) => updateTrait(index, "rarity", parseInt(e.target.value) || 1)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeTrait(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button onClick={handleCreateNFT} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Create NFT
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="mint" className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                To mint your NFT on the Algorand blockchain, you need to provide your private key. 
                This will create the NFT as an Algorand Standard Asset (ASA).
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label htmlFor="privateKey">Private Key (Mnemonic)</Label>
                <Input
                  id="privateKey"
                  type="password"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="Enter your 25-word mnemonic phrase"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Your private key is required to sign the blockchain transaction
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium mb-2">NFT Details:</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {newNFT.name}</div>
                  <div><strong>Description:</strong> {newNFT.description}</div>
                  <div><strong>Rarity:</strong> {newNFT.rarity}</div>
                  <div><strong>Price:</strong> {newNFT.price} ALGO</div>
                  <div><strong>Royalty:</strong> {newNFT.royaltyFee}%</div>
                  <div><strong>Traits:</strong> {nftTraits.length}</div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleMintNFT} disabled={isLoading || !privateKey}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  Mint on Blockchain
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="result" className="space-y-6">
            {mintResult && (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Your NFT has been successfully minted on the Algorand blockchain!
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Asset ID</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                          {mintResult.assetId}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(mintResult.assetId.toString())}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Transaction ID</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm truncate">
                          {mintResult.transactionId}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(mintResult.transactionId)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => window.open(`https://testnet.algoexplorer.io/asset/${mintResult.assetId}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on AlgoExplorer
                  </Button>
                  <Button
                    onClick={() => {
                      setActiveTab("create")
                      setCreatedNFTId(null)
                      setMintResult(null)
                      setPrivateKey("")
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
                    }}
                  >
                    Create Another NFT
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
