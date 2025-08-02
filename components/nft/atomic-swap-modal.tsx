"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle2, XCircle, ArrowRightLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface AtomicSwapModalProps {
  isOpen: boolean
  onClose: () => void
  nftToSwap: any // The NFT the user wants to offer
  userNFTs: any[] // Other NFTs the user owns to select for receiving
}

export function AtomicSwapModal({ isOpen, onClose, nftToSwap, userNFTs }: AtomicSwapModalProps) {
  const [selectedReceivingNft, setSelectedReceivingNft] = useState<string | null>(null)
  const [swapStatus, setSwapStatus] = useState<"idle" | "pending" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSwap = async () => {
    if (!nftToSwap || !selectedReceivingNft) {
      setErrorMessage("Please select an NFT to receive.")
      return
    }

    setSwapStatus("pending")
    setErrorMessage(null)

    try {
      // Simulate atomic swap API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const success = Math.random() > 0.3 // Simulate success/failure
      if (success) {
        setSwapStatus("success")
      } else {
        throw new Error("Swap failed due to network congestion.")
      }
    } catch (error: any) {
      setSwapStatus("error")
      setErrorMessage(error.message || "An unexpected error occurred during swap.")
    }
  }

  const resetModal = () => {
    setSelectedReceivingNft(null)
    setSwapStatus("idle")
    setErrorMessage(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={resetModal}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Propose Atomic Swap</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Exchange your NFT for another NFT with a direct, trustless swap.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {swapStatus === "idle" && (
            <motion.div
              key="swap-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 py-4"
            >
              <div className="grid grid-cols-2 gap-4 items-center">
                <Card className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Your NFT (Offering)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center text-center">
                    <img
                      src={nftToSwap?.image || "/placeholder.svg?height=80&width=80&text=NFT"}
                      alt={nftToSwap?.name}
                      className="w-20 h-20 object-cover rounded-md mb-2"
                    />
                    <p className="font-semibold text-sm">{nftToSwap?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{nftToSwap?.price}</p>
                  </CardContent>
                </Card>

                <div className="flex justify-center">
                  <ArrowRightLeft className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                </div>

                <Card className="col-span-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      NFT to Receive
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select onValueChange={setSelectedReceivingNft} value={selectedReceivingNft || ""}>
                      <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                        <SelectValue placeholder="Select an NFT from your collection" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                        {userNFTs.length === 0 && (
                          <SelectItem value="no-nfts" disabled>
                            No other NFTs available for swap
                          </SelectItem>
                        )}
                        {userNFTs.map((nft) => (
                          <SelectItem key={nft.id} value={nft.id.toString()}>
                            <div className="flex items-center gap-2">
                              <img
                                src={nft.image || "/placeholder.svg?height=24&width=24&text=NFT"}
                                alt={nft.name}
                                className="w-6 h-6 rounded-sm object-cover"
                              />
                              {nft.name} ({nft.price})
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedReceivingNft && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          You are proposing to swap <span className="font-semibold">{nftToSwap?.name}</span> for{" "}
                          <span className="font-semibold">
                            {userNFTs.find((nft) => nft.id.toString() === selectedReceivingNft)?.name}
                          </span>
                          .
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              {errorMessage && <p className="text-red-500 text-sm text-center">{errorMessage}</p>}
            </motion.div>
          )}

          {swapStatus === "pending" && (
            <motion.div
              key="swap-pending"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-8 space-y-4"
            >
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              <p className="text-lg font-semibold">Initiating Atomic Swap...</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Please confirm the transaction in your wallet.</p>
            </motion.div>
          )}

          {swapStatus === "success" && (
            <motion.div
              key="swap-success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-8 space-y-4 text-center"
            >
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="text-lg font-semibold">Swap Successful!</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your NFTs have been exchanged. Check your collection.
              </p>
            </motion.div>
          )}

          {swapStatus === "error" && (
            <motion.div
              key="swap-error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-8 space-y-4 text-center"
            >
              <XCircle className="h-12 w-12 text-red-500" />
              <p className="text-lg font-semibold">Swap Failed!</p>
              <p className="text-sm text-red-500">{errorMessage}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Please try again or contact support.</p>
            </motion.div>
          )}
        </AnimatePresence>

        <DialogFooter className="pt-4">
          {swapStatus === "idle" && (
            <Button
              onClick={handleSwap}
              disabled={!selectedReceivingNft}
              className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Propose Swap
            </Button>
          )}
          {(swapStatus === "success" || swapStatus === "error") && (
            <Button
              onClick={resetModal}
              className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
