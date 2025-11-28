// Trade execution utilities for atomic transaction groups
import algosdk from "algosdk"
import {
  getAlgodClient,
  algosToMicroAlgos,
  isValidAlgorandAddress,
  APP_CONFIG,
  PLATFORM_CONFIG,
} from "@/lib/algorand/config"
import { SignedOrder } from "./order-signing"

export interface TradeExecutionParams {
  signedOrder: SignedOrder
  buyerAddress: string
  nftOwnerAddress: string // Current owner of the NFT (may differ from seller if transferred)
  creatorAddress?: string // NFT creator for royalties
  royaltyPercentage?: number
}

export interface TradeTransactionGroup {
  transactions: algosdk.Transaction[]
  buyerTransactionIndices: number[]
  sellerTransactionIndices: number[]
  needsOptIn: boolean
  transactionInfo: {
    totalPrice: number
    sellerAmount: number
    platformFee: number
    royaltyAmount: number
    assetId: number
  }
}

/**
 * Check if buyer has opted in to an asset
 */
export async function hasOptedIn(
  address: string,
  assetId: number
): Promise<boolean> {
  try {
    const algodClient = getAlgodClient()
    const accountInfo = await algodClient.accountInformation(address).do()
    const assets = accountInfo.assets || []
    return assets.some((asset: any) => asset["asset-id"] === assetId)
  } catch (error) {
    console.error("Error checking opt-in status:", error)
    return false
  }
}

/**
 * Build atomic transaction group for trade execution
 */
export async function buildTradeTransactionGroup(
  params: TradeExecutionParams
): Promise<TradeTransactionGroup> {
  const {
    signedOrder,
    buyerAddress,
    nftOwnerAddress,
    creatorAddress,
    royaltyPercentage = 0,
  } = params

  // Validate addresses
  if (!isValidAlgorandAddress(buyerAddress)) {
    throw new Error("Invalid buyer address")
  }

  if (!isValidAlgorandAddress(nftOwnerAddress)) {
    throw new Error("Invalid NFT owner address")
  }

  // Validate buyer is not the seller
  if (buyerAddress.toLowerCase() === signedOrder.sellerAddress.toLowerCase()) {
    throw new Error("Buyer cannot be the same as seller")
  }

  const algodClient = getAlgodClient()
  const suggestedParams = await algodClient.getTransactionParams().do()

  // Calculate payment amounts
  const totalPriceMicro = algosToMicroAlgos(signedOrder.price)
  const platformFee = Math.floor(
    totalPriceMicro * (APP_CONFIG.platformFeePercentage / 100)
  )
  const royaltyAmount = Math.floor(
    totalPriceMicro * (royaltyPercentage / 100)
  )
  const sellerAmount = totalPriceMicro - platformFee - royaltyAmount

  const transactions: algosdk.Transaction[] = []

  // Check if buyer needs to opt-in
  const needsOptIn = !(await hasOptedIn(buyerAddress, signedOrder.assetId))

  // 1. Opt-in transaction (if needed) - buyer signs
  if (needsOptIn) {
    const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject(
      {
        sender: buyerAddress,
        receiver: buyerAddress,
        amount: 0,
        assetIndex: signedOrder.assetId,
        suggestedParams,
      }
    )
    transactions.push(optInTxn)
  }

  // 2. Payment transaction from buyer to seller - buyer signs
  const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: buyerAddress,
    receiver: signedOrder.sellerAddress,
    amount: sellerAmount,
    suggestedParams,
    note: new TextEncoder().encode(
      `NFT Trade: ${signedOrder.nftId} | Order: ${signedOrder.orderId}`
    ),
  })
  transactions.push(paymentTxn)

  // 3. Platform fee payment (if applicable) - buyer signs
  if (
    platformFee > 0 &&
    PLATFORM_CONFIG.platformFeeAddress &&
    PLATFORM_CONFIG.platformFeeAddress !== "PLATFORM_FEE_ADDRESS_NOT_SET" &&
    isValidAlgorandAddress(PLATFORM_CONFIG.platformFeeAddress)
  ) {
    const platformFeeTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject(
      {
        sender: buyerAddress,
        receiver: PLATFORM_CONFIG.platformFeeAddress,
        amount: platformFee,
        suggestedParams,
        note: new TextEncoder().encode(
          `Platform Fee: NFT ${signedOrder.nftId}`
        ),
      }
    )
    transactions.push(platformFeeTxn)
  }

  // 4. Royalty payment (if applicable) - buyer signs
  if (
    royaltyAmount > 0 &&
    creatorAddress &&
    creatorAddress !== signedOrder.sellerAddress &&
    isValidAlgorandAddress(creatorAddress)
  ) {
    const royaltyTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: buyerAddress,
      receiver: creatorAddress,
      amount: royaltyAmount,
      suggestedParams,
      note: new TextEncoder().encode(`Royalty: NFT ${signedOrder.nftId}`),
    })
    transactions.push(royaltyTxn)
  }

  // 5. Asset transfer from owner to buyer - owner/seller signs
  const assetTransferTxn =
    algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: nftOwnerAddress,
      receiver: buyerAddress,
      amount: 1, // NFTs are non-divisible
      assetIndex: signedOrder.assetId,
      suggestedParams,
      note: new TextEncoder().encode(
        `NFT Transfer: ${signedOrder.nftId} | Order: ${signedOrder.orderId}`
      ),
    })
  transactions.push(assetTransferTxn)

  // Assign group ID to all transactions
  algosdk.assignGroupID(transactions)

  // Identify which transactions need buyer signature vs seller/owner signature
  const buyerTransactionIndices: number[] = []
  const sellerTransactionIndices: number[] = []

  transactions.forEach((txn, index) => {
    const sender = algosdk.encodeAddress(txn.sender.publicKey)
    if (sender === buyerAddress) {
      buyerTransactionIndices.push(index)
    } else {
      sellerTransactionIndices.push(index)
    }
  })

  return {
    transactions,
    buyerTransactionIndices,
    sellerTransactionIndices,
    needsOptIn,
    transactionInfo: {
      totalPrice: signedOrder.price,
      sellerAmount: sellerAmount / 1000000,
      platformFee: platformFee / 1000000,
      royaltyAmount: royaltyAmount / 1000000,
      assetId: signedOrder.assetId,
    },
  }
}

/**
 * Submit signed transaction group
 */
export async function submitTradeTransactionGroup(
  signedTransactions: Uint8Array[]
): Promise<string> {
  const algodClient = getAlgodClient()
  const result = await algodClient.sendRawTransaction(signedTransactions).do()
  const txId = result.txid

  // Wait for confirmation
  await algosdk.waitForConfirmation(algodClient, txId, 4)

  return txId
}

