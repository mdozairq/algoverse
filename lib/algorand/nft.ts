// NFT creation and management utilities for Algorand
import algosdk from "algosdk"
import {
  getAlgodClient,
  waitForConfirmation,
  APP_CONFIG,
  uploadToIPFS,
  algosToMicroAlgos,
  getIndexerClient,
} from "./config"

export interface NFTMetadata {
  name: string
  description: string
  image: string
  external_url?: string
  attributes?: Array<{
    trait_type: string
    value: string | number
  }>
  properties?: {
    event_date?: string
    venue?: string
    tier?: string
    transferable?: boolean
    [key: string]: any
  }
}

export interface CreateNFTParams {
  creatorAddress: string
  creatorMnemonic: string
  metadata: NFTMetadata
  totalSupply: number
  unitName: string
  assetName: string
  royaltyPercentage?: number
}

export interface TransferNFTParams {
  fromAddress: string
  fromMnemonic: string
  toAddress: string
  assetId: number
  amount: number
}

// Create a new NFT asset
export const createNFT = async (params: CreateNFTParams) => {
  try {
    const algodClient = getAlgodClient()
    const creatorAccount = algosdk.mnemonicToSecretKey(params.creatorMnemonic)

    // Upload metadata to IPFS
    const metadataHash = await uploadToIPFS(params.metadata)
    const metadataURL = `https://ipfs.io/ipfs/${metadataHash}`

    // Get suggested transaction parameters
    const suggestedParams = await algodClient.getTransactionParams().do()

    // Create asset creation transaction
    const assetCreateTxn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      from: params.creatorAddress,
      total: params.totalSupply,
      decimals: APP_CONFIG.assetDecimals,
      assetName: params.assetName,
      unitName: params.unitName,
      assetURL: metadataURL,
      assetMetadataHash: new TextEncoder().encode(metadataHash),
      defaultFrozen: APP_CONFIG.defaultFrozen,
      freeze: params.creatorAddress,
      manager: params.creatorAddress,
      clawback: params.creatorAddress,
      reserve: params.creatorAddress,
      suggestedParams,
    })

    // Sign the transaction
    const signedTxn = assetCreateTxn.signTxn(creatorAccount.sk)

    // Submit the transaction
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do()

    // Wait for confirmation
    const confirmedTxn = await waitForConfirmation(txId)

    // Get the asset ID from the transaction
    const assetId = confirmedTxn["asset-index"]

    return {
      assetId,
      txId,
      metadataHash,
      metadataURL,
    }
  } catch (error) {
    console.error("Error creating NFT:", error)
    throw error
  }
}

// Transfer NFT to another address
export const transferNFT = async (params: TransferNFTParams) => {
  try {
    const algodClient = getAlgodClient()
    const fromAccount = algosdk.mnemonicToSecretKey(params.fromMnemonic)

    // Get suggested transaction parameters
    const suggestedParams = await algodClient.getTransactionParams().do()

    // Create asset transfer transaction
    const assetTransferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: params.fromAddress,
      to: params.toAddress,
      assetIndex: params.assetId,
      amount: params.amount,
      suggestedParams,
    })

    // Sign the transaction
    const signedTxn = assetTransferTxn.signTxn(fromAccount.sk)

    // Submit the transaction
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do()

    // Wait for confirmation
    await waitForConfirmation(txId)

    return { txId }
  } catch (error) {
    console.error("Error transferring NFT:", error)
    throw error
  }
}

// Opt-in to receive an asset
export const optInToAsset = async (userAddress: string, userMnemonic: string, assetId: number) => {
  try {
    const algodClient = getAlgodClient()
    const userAccount = algosdk.mnemonicToSecretKey(userMnemonic)

    // Get suggested transaction parameters
    const suggestedParams = await algodClient.getTransactionParams().do()

    // Create opt-in transaction (asset transfer to self with amount 0)
    const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: userAddress,
      to: userAddress,
      assetIndex: assetId,
      amount: 0,
      suggestedParams,
    })

    // Sign the transaction
    const signedTxn = optInTxn.signTxn(userAccount.sk)

    // Submit the transaction
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do()

    // Wait for confirmation
    await waitForConfirmation(txId)

    return { txId }
  } catch (error) {
    console.error("Error opting in to asset:", error)
    throw error
  }
}

// Create atomic swap transaction group
export const createAtomicSwap = async (
  user1Address: string,
  user1Mnemonic: string,
  user1AssetId: number,
  user2Address: string,
  user2Mnemonic: string,
  user2AssetId: number,
) => {
  try {
    const algodClient = getAlgodClient()
    const user1Account = algosdk.mnemonicToSecretKey(user1Mnemonic)
    const user2Account = algosdk.mnemonicToSecretKey(user2Mnemonic)

    // Get suggested transaction parameters
    const suggestedParams = await algodClient.getTransactionParams().do()

    // Create transfer transactions
    const txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: user1Address,
      to: user2Address,
      assetIndex: user1AssetId,
      amount: 1,
      suggestedParams,
    })

    const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: user2Address,
      to: user1Address,
      assetIndex: user2AssetId,
      amount: 1,
      suggestedParams,
    })

    // Group transactions
    const txnGroup = [txn1, txn2]
    const groupId = algosdk.computeGroupID(txnGroup)

    // Assign group ID to transactions
    txn1.group = groupId
    txn2.group = groupId

    // Sign transactions
    const signedTxn1 = txn1.signTxn(user1Account.sk)
    const signedTxn2 = txn2.signTxn(user2Account.sk)

    // Submit transaction group
    const { txId } = await algodClient.sendRawTransaction([signedTxn1, signedTxn2]).do()

    // Wait for confirmation
    await waitForConfirmation(txId)

    return { txId }
  } catch (error) {
    console.error("Error creating atomic swap:", error)
    throw error
  }
}

// Purchase NFT with ALGO payment
export const purchaseNFT = async (
  buyerAddress: string,
  buyerMnemonic: string,
  sellerAddress: string,
  assetId: number,
  priceInAlgos: number,
  platformFeeAddress: string,
) => {
  try {
    const algodClient = getAlgodClient()
    const buyerAccount = algosdk.mnemonicToSecretKey(buyerMnemonic)

    // Calculate fees
    const totalPrice = algosToMicroAlgos(priceInAlgos)
    const platformFee = Math.round(totalPrice * (APP_CONFIG.platformFeePercentage / 100))
    const sellerAmount = totalPrice - platformFee

    // Get suggested transaction parameters
    const suggestedParams = await algodClient.getTransactionParams().do()

    // Create payment to seller
    const paymentToSeller = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: buyerAddress,
      to: sellerAddress,
      amount: sellerAmount,
      suggestedParams,
    })

    // Create payment to platform
    const paymentToPlatform = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: buyerAddress,
      to: platformFeeAddress,
      amount: platformFee,
      suggestedParams,
    })

    // Create asset transfer from seller to buyer
    // Note: This would typically be handled by a smart contract escrow
    const assetTransfer = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: sellerAddress,
      to: buyerAddress,
      assetIndex: assetId,
      amount: 1,
      suggestedParams,
    })

    // Group transactions
    const txnGroup = [paymentToSeller, paymentToPlatform, assetTransfer]
    const groupId = algosdk.computeGroupID(txnGroup)

    // Assign group ID
    txnGroup.forEach((txn) => (txn.group = groupId))

    // Sign buyer transactions
    const signedPaymentToSeller = paymentToSeller.signTxn(buyerAccount.sk)
    const signedPaymentToPlatform = paymentToPlatform.signTxn(buyerAccount.sk)

    // Note: In a real implementation, the asset transfer would be signed by an escrow
    // or handled through a smart contract

    return {
      groupId: Buffer.from(groupId).toString("base64"),
      signedTransactions: [signedPaymentToSeller, signedPaymentToPlatform],
      totalPrice,
      platformFee,
      sellerAmount,
    }
  } catch (error) {
    console.error("Error creating purchase transaction:", error)
    throw error
  }
}

// Get NFT ownership information
export const getNFTOwnership = async (assetId: number) => {
  try {
    const indexerClient = getIndexerClient()

    // Get asset information
    const assetInfo = await indexerClient.lookupAssetByID(assetId).do()

    // Get asset balances (holders)
    const assetBalances = await indexerClient.lookupAssetBalances(assetId).do()

    return {
      asset: assetInfo.asset,
      balances: assetBalances.balances,
    }
  } catch (error) {
    console.error("Error getting NFT ownership:", error)
    throw error
  }
}

// Get user's NFT collection
export const getUserNFTs = async (userAddress: string) => {
  try {
    const indexerClient = getIndexerClient()

    // Get account information including assets
    const accountInfo = await indexerClient.lookupAccountByID(userAddress).do()

    // Filter for NFTs (assets with 0 decimals and total supply of 1)
    const nfts =
      accountInfo.account.assets?.filter((asset: any) => {
        return asset.amount > 0 // User owns the asset
      }) || []

    // Get detailed information for each NFT
    const nftDetails = await Promise.all(
      nfts.map(async (asset: any) => {
        try {
          const assetInfo = await indexerClient.lookupAssetByID(asset["asset-id"]).do()
          return {
            assetId: asset["asset-id"],
            amount: asset.amount,
            ...assetInfo.asset.params,
          }
        } catch (error) {
          console.error(`Error getting details for asset ${asset["asset-id"]}:`, error)
          return null
        }
      }),
    )

    return nftDetails.filter((nft) => nft !== null)
  } catch (error) {
    console.error("Error getting user NFTs:", error)
    throw error
  }
}

// Validate NFT for event access
export const validateEventNFT = async (userAddress: string, assetId: number, eventId: string) => {
  try {
    // Check if user owns the NFT
    const userNFTs = await getUserNFTs(userAddress)
    const ownedNFT = userNFTs.find((nft) => nft?.assetId === assetId)

    if (!ownedNFT) {
      return {
        valid: false,
        reason: "NFT not owned by user",
      }
    }

    // Additional validation logic would go here
    // - Check if NFT is for the correct event
    // - Check if NFT is still valid (not expired)
    // - Check if NFT has been used already

    return {
      valid: true,
      nft: ownedNFT,
    }
  } catch (error) {
    console.error("Error validating event NFT:", error)
    throw error
  }
}

// AlgorandNFTService class for API routes
export class AlgorandNFTService {
  static async createNFT(params: CreateNFTParams) {
    return createNFT(params)
  }

  static async transferNFT(params: TransferNFTParams) {
    return transferNFT(params)
  }

  static async optInToAsset(userAddress: string, userMnemonic: string, assetId: number) {
    return optInToAsset(userAddress, userMnemonic, assetId)
  }

  static async createAtomicSwap(
    user1Address: string,
    user1Mnemonic: string,
    user1AssetId: number,
    user2Address: string,
    user2Mnemonic: string,
    user2AssetId: number,
  ) {
    return createAtomicSwap(user1Address, user1Mnemonic, user1AssetId, user2Address, user2Mnemonic, user2AssetId)
  }

  static async purchaseNFT(
    buyerAddress: string,
    buyerMnemonic: string,
    sellerAddress: string,
    assetId: number,
    priceInAlgos: number,
    platformFeeAddress: string,
  ) {
    return purchaseNFT(buyerAddress, buyerMnemonic, sellerAddress, assetId, priceInAlgos, platformFeeAddress)
  }

  static async getNFTOwnership(assetId: number) {
    return getNFTOwnership(assetId)
  }

  static async getUserNFTs(userAddress: string) {
    return getUserNFTs(userAddress)
  }

  static async validateEventNFT(userAddress: string, assetId: number, eventId: string) {
    return validateEventNFT(userAddress, assetId, eventId)
  }
}
