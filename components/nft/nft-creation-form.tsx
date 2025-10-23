"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ImageUpload from "@/components/ui/image-upload"
import { WalletConnectButtonCompact } from "@/components/wallet/wallet-connect-button"
import { Plus, Trash2, Loader2, Zap, CheckCircle2 } from "lucide-react"

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

interface NFTCreationFormProps {
  newNFT: NewNFT
  setNewNFT: (nft: NewNFT) => void
  nftTraits: NFTTrait[]
  setNftTraits: (traits: NFTTrait[]) => void
  onCancel: () => void
  onCreate: () => void
  onMint?: (nftId: string, userAddress: string) => void
  isLoading: boolean
  createdNFTId?: string | null
  showMintOption?: boolean
}

export function NFTCreationForm({
  newNFT,
  setNewNFT,
  nftTraits,
  setNftTraits,
  onCancel,
  onCreate,
  onMint,
  isLoading,
  createdNFTId,
  showMintOption = false
}: NFTCreationFormProps) {
  const addTrait = () => {
    setNftTraits([...nftTraits, { trait_type: "", value: "", rarity: 1 }])
  }

  console.log("LOG", isLoading,
    createdNFTId,
    showMintOption);
  
  const updateTrait = (index: number, field: keyof NFTTrait, value: string | number) => {
    const updatedTraits = [...nftTraits]
    updatedTraits[index] = { ...updatedTraits[index], [field]: value }
    setNftTraits(updatedTraits)
  }

  const removeTrait = (index: number) => {
    setNftTraits(nftTraits.filter((_, i) => i !== index))
  }

  const [showMintDialog, setShowMintDialog] = useState(false)
  const [mintStatus, setMintStatus] = useState<'idle' | 'creating' | 'signing' | 'submitting' | 'success' | 'error'>('idle')
  const [mintResult, setMintResult] = useState<any>(null)
  const { user, isAuthenticated } = useAuth()

  const handleMint = async () => {
    if (onMint && createdNFTId && user?.walletAddress) {
      setMintStatus('creating')
      try {
        await onMint(createdNFTId, user.walletAddress)
        setMintStatus('success')
      } catch (error) {
        setMintStatus('error')
      }
    }
  }

  return (
    <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-4">Create New NFT</h3>
      <div className="space-y-4">
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

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onCreate} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Create NFT
          </Button>
          {showMintOption && createdNFTId && onMint && (
            <Dialog open={showMintDialog} onOpenChange={setShowMintDialog}>
              <DialogTrigger asChild>
                <Button variant="default">
                  <Zap className="w-4 h-4 mr-2" />
                  Mint on Blockchain
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Mint NFT on Algorand</DialogTitle>
                  <DialogDescription>
                    Connect your Algorand wallet to mint the NFT on the blockchain.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  {!isAuthenticated || !user?.walletAddress ? (
                    <div className="space-y-4">
                      <Alert>
                        <AlertDescription>
                          You need to connect your Algorand wallet to mint NFTs. This is more secure than entering private keys.
                        </AlertDescription>
                      </Alert>
                      <div className="flex justify-center">
                        <WalletConnectButtonCompact />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>
                          Wallet connected! You can now mint your NFT on the blockchain.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-sm">
                          <div className="font-medium">Connected Wallet:</div>
                          <div className="font-mono text-xs text-gray-600 dark:text-gray-400">
                            {user.walletAddress}
                          </div>
                        </div>
                      </div>
                      
                      {mintStatus === 'success' && mintResult && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                            NFT Minted Successfully!
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div><strong>Asset ID:</strong> {mintResult.assetId}</div>
                            <div><strong>Transaction ID:</strong> {mintResult.transactionId}</div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowMintDialog(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleMint} 
                          disabled={mintStatus === 'creating' || mintStatus === 'signing' || mintStatus === 'submitting'}
                        >
                          {mintStatus === 'creating' || mintStatus === 'signing' || mintStatus === 'submitting' ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Zap className="w-4 h-4 mr-2" />
                          )}
                          {mintStatus === 'creating' ? 'Creating Transaction...' :
                           mintStatus === 'signing' ? 'Signing...' :
                           mintStatus === 'submitting' ? 'Submitting...' :
                           'Mint NFT'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  )
}
