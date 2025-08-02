"use client"

import { CardContent } from "@/components/ui/card"

import { CardTitle } from "@/components/ui/card"

import { CardHeader } from "@/components/ui/card"

import { Card } from "@/components/ui/card"

import { motion } from "framer-motion"
import { PlusCircle, Coins, Wallet, ArrowRightLeft, RefreshCw, CheckSquare, Clock, LinkIcon } from "lucide-react"
import Link from "next/link"

interface NftLifecycleTimelineProps {
  currentNftId: string | string[]
}

export function NftLifecycleTimeline({ currentNftId }: NftLifecycleTimelineProps) {
  // Mock data for NFT lifecycle stages
  const lifecycleStages = [
    {
      id: "created",
      name: "Created",
      description: "NFT metadata and properties defined.",
      icon: PlusCircle,
      status: "completed",
      date: "2024-01-01",
      txHash: "0x1a2b3c...",
    },
    {
      id: "minted",
      name: "Minted as ASA",
      description: "Asset created on Algorand blockchain.",
      icon: Coins,
      status: "completed",
      date: "2024-01-02",
      txHash: "0x2b3c4d...",
    },
    {
      id: "opted-in",
      name: "Opted-in (User)",
      description: "User opted into receiving the NFT.",
      icon: Wallet,
      status: "completed",
      date: "2024-01-05",
      txHash: "0x3c4d5e...",
    },
    {
      id: "first-sale",
      name: "First Sale",
      description: "NFT transferred from merchant to first buyer.",
      icon: ArrowRightLeft,
      status: "completed",
      date: "2024-01-10",
      txHash: "0x4d5e6f...",
    },
    {
      id: "secondary-trade",
      name: "Secondary Trade/Swap",
      description: "NFT traded or swapped on secondary market.",
      icon: RefreshCw,
      status: "active", // This is the current active stage for demonstration
      date: "2024-01-15",
      txHash: "0x5e6f7a...",
    },
    {
      id: "redeemed-expired",
      name: "Redeemed/Expired",
      description: "NFT used for event access or expired.",
      icon: CheckSquare,
      status: "pending",
      date: "2024-07-15", // Example event date
      txHash: null,
    },
  ]

  const currentStageIndex = lifecycleStages.findIndex((stage) => stage.status === "active")

  return (
    <div className="relative py-8">
      <div className="absolute left-1/2 top-0 h-full w-0.5 bg-gray-700 transform -translate-x-1/2"></div>
      {lifecycleStages.map((stage, index) => (
        <motion.div
          key={stage.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.2, duration: 0.5 }}
          className={`relative flex items-center mb-8 ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
        >
          <div
            className={`absolute z-10 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-gray-900 ${
              stage.status === "completed"
                ? "bg-green-500"
                : stage.status === "active"
                  ? "bg-blue-500 animate-pulse"
                  : "bg-gray-500"
            }`}
            style={{ left: "50%", transform: "translateX(-50%)" }}
          >
            {stage.status === "completed" && <CheckSquare className="w-3 h-3 text-white" />}
            {stage.status === "active" && <Clock className="w-3 h-3 text-white" />}
            {stage.status === "pending" && <Clock className="w-3 h-3 text-white" />}
          </div>

          <Card
            className={`w-[calc(50%-20px)] p-4 rounded-lg shadow-lg border border-gray-700 bg-gray-800 ${
              index % 2 === 0 ? "mr-auto" : "ml-auto"
            }`}
          >
            <CardHeader className="p-0 mb-2">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <stage.icon className="w-5 h-5 text-gray-400" />
                {stage.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-sm text-gray-300 mb-2">{stage.description}</p>
              <div className="text-xs text-gray-400">
                <p>Date: {stage.date}</p>
                {stage.txHash && (
                  <Link
                    href={`https://testnet.algoexplorer.io/tx/${stage.txHash}`} // Replace with actual explorer link
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:underline mt-1"
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>Tx Hash: {stage.txHash.substring(0, 8)}...</span>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
