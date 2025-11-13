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
import MultimediaUpload, { MediaCategory } from "@/components/ui/multimedia-upload"
import { WalletConnectButtonCompact } from "@/components/wallet/wallet-connect-button"
import { Plus, Trash2, Loader2, Zap, CheckCircle2 } from "lucide-react"

interface NFTTrait {
  trait_type: string
  value: string
  rarity: number
}

interface AudioMetadata {
  thumbnail?: string
  thumbnailHash?: string
  composerName?: string
  singerName?: string
  creationDate?: string
  publishDate?: string
  duration?: string
  genre?: string
}

interface VideoMetadata {
  thumbnail?: string
  thumbnailHash?: string
  director?: string
  cast?: string
  creationDate?: string
  publishDate?: string
  duration?: string
  genre?: string
}

interface ImageMetadata {
  artist?: string
  creationDate?: string
  location?: string
  technique?: string
  dimensions?: string
}

interface FileMetadata {
  author?: string
  creationDate?: string
  documentType?: string
  pages?: number
  language?: string
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
  category?: MediaCategory
  fileType?: string
  audioMetadata?: AudioMetadata
  videoMetadata?: VideoMetadata
  imageMetadata?: ImageMetadata
  fileMetadata?: FileMetadata
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
  collectionMediaCategory?: MediaCategory // Restricts allowed categories based on collection
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
  showMintOption = false,
  collectionMediaCategory
}: NFTCreationFormProps) {
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
          <Label htmlFor="nftCategory">Media Category</Label>
          <Select 
            value={newNFT.category || collectionMediaCategory || "any"} 
            onValueChange={(value: MediaCategory) => {
              // Reset image/file and category-specific metadata when category changes
              setNewNFT({ 
                ...newNFT, 
                category: value,
                image: "",
                ipfsHash: "",
                fileType: undefined,
                audioMetadata: value === "audio" ? newNFT.audioMetadata : undefined,
                videoMetadata: value === "video" ? newNFT.videoMetadata : undefined,
                imageMetadata: value === "image" ? newNFT.imageMetadata : undefined,
                fileMetadata: value === "file" ? newNFT.fileMetadata : undefined
              })
            }}
            disabled={!!collectionMediaCategory && collectionMediaCategory !== "any"}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(!collectionMediaCategory || collectionMediaCategory === "any") && (
                <SelectItem value="any">Any (All Types)</SelectItem>
              )}
              {(!collectionMediaCategory || collectionMediaCategory === "any" || collectionMediaCategory === "image") && (
                <SelectItem value="image">Image</SelectItem>
              )}
              {(!collectionMediaCategory || collectionMediaCategory === "any" || collectionMediaCategory === "audio") && (
                <SelectItem value="audio">Audio</SelectItem>
              )}
              {(!collectionMediaCategory || collectionMediaCategory === "any" || collectionMediaCategory === "video") && (
                <SelectItem value="video">Video</SelectItem>
              )}
              {(!collectionMediaCategory || collectionMediaCategory === "any" || collectionMediaCategory === "file") && (
                <SelectItem value="file">File/Document</SelectItem>
              )}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            {collectionMediaCategory && collectionMediaCategory !== "any" 
              ? `This collection only allows ${collectionMediaCategory} NFTs`
              : "Select the category to filter allowed file types for upload"}
          </p>
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
          <Label htmlFor="nftMedia">
            {newNFT.category === "audio" ? "NFT Audio" : 
             newNFT.category === "video" ? "NFT Video" : 
             newNFT.category === "file" ? "NFT File" : 
             "NFT Media"}
          </Label>
          <MultimediaUpload
            onFileUpload={(ipfsHash: string, fileUrl: string, fileType: string) => {
              setNewNFT({ 
                ...newNFT, 
                image: fileUrl, 
                ipfsHash,
                fileType 
              })
            }}
            onFileRemove={() => {
              setNewNFT({ 
                ...newNFT, 
                image: "", 
                ipfsHash: "",
                fileType: undefined
              })
            }}
            currentFile={newNFT.image}
            category={newNFT.category || "any"}
            maxSize={newNFT.category === "image" ? 10 : 50}
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

        {/* Category-Specific Metadata */}
        {newNFT.category === "audio" && (
          <div className="border-t pt-4 mt-4">
            <h4 className="text-md font-semibold mb-4">Audio Metadata</h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="audioThumbnail">Thumbnail Image</Label>
                <ImageUpload
                  onImageUpload={(ipfsHash: string, imageUrl: string) => {
                    setNewNFT({
                      ...newNFT,
                      audioMetadata: {
                        ...newNFT.audioMetadata,
                        thumbnail: imageUrl,
                        thumbnailHash: ipfsHash
                      }
                    })
                  }}
                  onImageRemove={() => {
                    setNewNFT({
                      ...newNFT,
                      audioMetadata: {
                        ...newNFT.audioMetadata,
                        thumbnail: undefined,
                        thumbnailHash: undefined
                      }
                    })
                  }}
                  currentImage={newNFT.audioMetadata?.thumbnail}
                  maxSize={5}
                  className="mt-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="composerName">Composer Name</Label>
                  <Input
                    id="composerName"
                    value={newNFT.audioMetadata?.composerName || ""}
                    onChange={(e) => setNewNFT({
                      ...newNFT,
                      audioMetadata: { ...newNFT.audioMetadata, composerName: e.target.value }
                    })}
                    placeholder="Enter composer name"
                  />
                </div>
                <div>
                  <Label htmlFor="singerName">Singer/Artist Name</Label>
                  <Input
                    id="singerName"
                    value={newNFT.audioMetadata?.singerName || ""}
                    onChange={(e) => setNewNFT({
                      ...newNFT,
                      audioMetadata: { ...newNFT.audioMetadata, singerName: e.target.value }
                    })}
                    placeholder="Enter singer/artist name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="audioCreationDate">Creation Date</Label>
                  <Input
                    id="audioCreationDate"
                    type="date"
                    value={newNFT.audioMetadata?.creationDate || ""}
                    onChange={(e) => setNewNFT({
                      ...newNFT,
                      audioMetadata: { ...newNFT.audioMetadata, creationDate: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="audioPublishDate">Publish Date</Label>
                  <Input
                    id="audioPublishDate"
                    type="date"
                    value={newNFT.audioMetadata?.publishDate || ""}
                    onChange={(e) => setNewNFT({
                      ...newNFT,
                      audioMetadata: { ...newNFT.audioMetadata, publishDate: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="audioDuration">Duration (e.g., 3:45)</Label>
                  <Input
                    id="audioDuration"
                    value={newNFT.audioMetadata?.duration || ""}
                    onChange={(e) => setNewNFT({
                      ...newNFT,
                      audioMetadata: { ...newNFT.audioMetadata, duration: e.target.value }
                    })}
                    placeholder="3:45"
                  />
                </div>
                <div>
                  <Label htmlFor="audioGenre">Genre</Label>
                  <Input
                    id="audioGenre"
                    value={newNFT.audioMetadata?.genre || ""}
                    onChange={(e) => setNewNFT({
                      ...newNFT,
                      audioMetadata: { ...newNFT.audioMetadata, genre: e.target.value }
                    })}
                    placeholder="Rock, Pop, Classical, etc."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {newNFT.category === "video" && (
          <div className="border-t pt-4 mt-4">
            <h4 className="text-md font-semibold mb-4">Video Metadata</h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="videoThumbnail">Thumbnail Image</Label>
                <ImageUpload
                  onImageUpload={(ipfsHash: string, imageUrl: string) => {
                    setNewNFT({
                      ...newNFT,
                      videoMetadata: {
                        ...newNFT.videoMetadata,
                        thumbnail: imageUrl,
                        thumbnailHash: ipfsHash
                      }
                    })
                  }}
                  onImageRemove={() => {
                    setNewNFT({
                      ...newNFT,
                      videoMetadata: {
                        ...newNFT.videoMetadata,
                        thumbnail: undefined,
                        thumbnailHash: undefined
                      }
                    })
                  }}
                  currentImage={newNFT.videoMetadata?.thumbnail}
                  maxSize={5}
                  className="mt-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="director">Director</Label>
                  <Input
                    id="director"
                    value={newNFT.videoMetadata?.director || ""}
                    onChange={(e) => setNewNFT({
                      ...newNFT,
                      videoMetadata: { ...newNFT.videoMetadata, director: e.target.value }
                    })}
                    placeholder="Enter director name"
                  />
                </div>
                <div>
                  <Label htmlFor="cast">Cast</Label>
                  <Input
                    id="cast"
                    value={newNFT.videoMetadata?.cast || ""}
                    onChange={(e) => setNewNFT({
                      ...newNFT,
                      videoMetadata: { ...newNFT.videoMetadata, cast: e.target.value }
                    })}
                    placeholder="Enter cast names (comma separated)"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="videoCreationDate">Creation Date</Label>
                  <Input
                    id="videoCreationDate"
                    type="date"
                    value={newNFT.videoMetadata?.creationDate || ""}
                    onChange={(e) => setNewNFT({
                      ...newNFT,
                      videoMetadata: { ...newNFT.videoMetadata, creationDate: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="videoPublishDate">Publish Date</Label>
                  <Input
                    id="videoPublishDate"
                    type="date"
                    value={newNFT.videoMetadata?.publishDate || ""}
                    onChange={(e) => setNewNFT({
                      ...newNFT,
                      videoMetadata: { ...newNFT.videoMetadata, publishDate: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="videoDuration">Duration (e.g., 1:23:45)</Label>
                  <Input
                    id="videoDuration"
                    value={newNFT.videoMetadata?.duration || ""}
                    onChange={(e) => setNewNFT({
                      ...newNFT,
                      videoMetadata: { ...newNFT.videoMetadata, duration: e.target.value }
                    })}
                    placeholder="1:23:45"
                  />
                </div>
                <div>
                  <Label htmlFor="videoGenre">Genre</Label>
                  <Input
                    id="videoGenre"
                    value={newNFT.videoMetadata?.genre || ""}
                    onChange={(e) => setNewNFT({
                      ...newNFT,
                      videoMetadata: { ...newNFT.videoMetadata, genre: e.target.value }
                    })}
                    placeholder="Action, Drama, Comedy, etc."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {newNFT.category === "image" && (
          <div className="border-t pt-4 mt-4">
            <h4 className="text-md font-semibold mb-4">Image Metadata</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="artist">Artist Name</Label>
                  <Input
                    id="artist"
                    value={newNFT.imageMetadata?.artist || ""}
                    onChange={(e) => setNewNFT({
                      ...newNFT,
                      imageMetadata: { ...newNFT.imageMetadata, artist: e.target.value }
                    })}
                    placeholder="Enter artist name"
                  />
                </div>
                <div>
                  <Label htmlFor="imageCreationDate">Creation Date</Label>
                  <Input
                    id="imageCreationDate"
                    type="date"
                    value={newNFT.imageMetadata?.creationDate || ""}
                    onChange={(e) => setNewNFT({
                      ...newNFT,
                      imageMetadata: { ...newNFT.imageMetadata, creationDate: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newNFT.imageMetadata?.location || ""}
                    onChange={(e) => setNewNFT({
                      ...newNFT,
                      imageMetadata: { ...newNFT.imageMetadata, location: e.target.value }
                    })}
                    placeholder="Where was this created?"
                  />
                </div>
                <div>
                  <Label htmlFor="technique">Technique</Label>
                  <Input
                    id="technique"
                    value={newNFT.imageMetadata?.technique || ""}
                    onChange={(e) => setNewNFT({
                      ...newNFT,
                      imageMetadata: { ...newNFT.imageMetadata, technique: e.target.value }
                    })}
                    placeholder="Digital, Oil, Watercolor, etc."
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input
                  id="dimensions"
                  value={newNFT.imageMetadata?.dimensions || ""}
                  onChange={(e) => setNewNFT({
                    ...newNFT,
                    imageMetadata: { ...newNFT.imageMetadata, dimensions: e.target.value }
                  })}
                  placeholder="e.g., 1920x1080 or 8x10 inches"
                />
              </div>
            </div>
          </div>
        )}

        {newNFT.category === "file" && (
          <div className="border-t pt-4 mt-4">
            <h4 className="text-md font-semibold mb-4">File Metadata</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={newNFT.fileMetadata?.author || ""}
                    onChange={(e) => setNewNFT({
                      ...newNFT,
                      fileMetadata: { ...newNFT.fileMetadata, author: e.target.value }
                    })}
                    placeholder="Enter author name"
                  />
                </div>
                <div>
                  <Label htmlFor="fileCreationDate">Creation Date</Label>
                  <Input
                    id="fileCreationDate"
                    type="date"
                    value={newNFT.fileMetadata?.creationDate || ""}
                    onChange={(e) => setNewNFT({
                      ...newNFT,
                      fileMetadata: { ...newNFT.fileMetadata, creationDate: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="documentType">Document Type</Label>
                  <Input
                    id="documentType"
                    value={newNFT.fileMetadata?.documentType || ""}
                    onChange={(e) => setNewNFT({
                      ...newNFT,
                      fileMetadata: { ...newNFT.fileMetadata, documentType: e.target.value }
                    })}
                    placeholder="PDF, Contract, Certificate, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="pages">Pages</Label>
                  <Input
                    id="pages"
                    type="number"
                    min="0"
                    value={newNFT.fileMetadata?.pages || ""}
                    onChange={(e) => setNewNFT({
                      ...newNFT,
                      fileMetadata: { ...newNFT.fileMetadata, pages: parseInt(e.target.value) || undefined }
                    })}
                    placeholder="Number of pages"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  value={newNFT.fileMetadata?.language || ""}
                  onChange={(e) => setNewNFT({
                    ...newNFT,
                    fileMetadata: { ...newNFT.fileMetadata, language: e.target.value }
                  })}
                  placeholder="English, Spanish, etc."
                />
              </div>
            </div>
          </div>
        )}

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
