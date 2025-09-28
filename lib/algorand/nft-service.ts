import algosdk from 'algosdk'
import { adminDb } from '../firebase/admin'

// Algorand configuration
const ALGOD_TOKEN = process.env.ALGOD_TOKEN || ''
const ALGOD_SERVER = process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud'
const ALGOD_PORT = parseInt(process.env.ALGOD_PORT || '443')
const INDEXER_TOKEN = process.env.INDEXER_TOKEN || ''
const INDEXER_SERVER = process.env.INDEXER_SERVER || 'https://testnet-idx.algonode.cloud'
const INDEXER_PORT = parseInt(process.env.INDEXER_PORT || '443')

// Initialize Algorand clients
const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT)
const indexerClient = new algosdk.Indexer(INDEXER_TOKEN, INDEXER_SERVER, INDEXER_PORT)

export interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
  event_id: string
  event_title: string
  event_date: string
  event_location: string
  seat_number?: string
  section?: string
  ticket_type: 'general' | 'vip' | 'backstage' | 'reserved'
  price: number
  currency: 'ALGO' | 'USDC'
}

export interface NFTCreationParams {
  metadata: NFTMetadata
  totalSupply: number
  decimals: number
  defaultFrozen: boolean
  unitName: string
  assetName: string
  url: string
  managerAddress: string
  reserveAddress: string
  freezeAddress: string
  clawbackAddress: string
  royaltyPercentage?: number
}

export interface NFTSwapParams {
  assetId1: number
  assetId2: number
  fromAddress1: string
  fromAddress2: string
  amount1: number
  amount2: number
  expiryTime?: number
}

export class AlgorandNFTService {
  /**
   * Create an Algorand Standard Asset (ASA) for NFT tickets
   */
  static async createNFT(params: NFTCreationParams, creatorPrivateKey: string): Promise<{
    assetId: number
    transactionId: string
    metadata: NFTMetadata
  }> {
    try {
      const creatorAccount = algosdk.mnemonicToSecretKey(creatorPrivateKey)
      
      // Get suggested parameters
      const suggestedParams = await algodClient.getTransactionParams().do()
      
      // Create asset creation transaction
      const assetCreateTxn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        sender: creatorAccount.addr,
        suggestedParams,
        total: params.totalSupply,
        decimals: params.decimals,
        defaultFrozen: params.defaultFrozen,
        unitName: params.unitName,
        assetName: params.assetName,
        assetURL: params.url,
        manager: params.managerAddress,
        reserve: params.reserveAddress,
        freeze: params.freezeAddress,
        clawback: params.clawbackAddress,
        note: algosdk.encodeObj(params.metadata),
      })

      // Sign and send transaction
      const signedTxn = assetCreateTxn.signTxn(creatorAccount.sk)
      const result = await algodClient.sendRawTransaction(signedTxn).do()
      const txId = result.txid
      
      // Wait for confirmation
      const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4)
      const assetId = Number(confirmedTxn.assetIndex)

      // Store NFT metadata in Firestore
      await adminDb.collection('nfts').add({
        assetId,
        metadata: params.metadata,
        totalSupply: params.totalSupply,
        currentSupply: 0,
        creator: creatorAccount.addr,
        manager: params.managerAddress,
        reserve: params.reserveAddress,
        freeze: params.freezeAddress,
        clawback: params.clawbackAddress,
        createdAt: new Date(),
        status: 'active',
        royaltyPercentage: params.royaltyPercentage || 0,
      })

      return {
        assetId,
        transactionId: txId,
        metadata: params.metadata,
      }
    } catch (error) {
      console.error('Error creating NFT:', error)
      throw new Error('Failed to create NFT')
    }
  }

  /**
   * Mint NFT tickets to a specific address
   */
  static async mintNFT(
    assetId: number,
    toAddress: string,
    amount: number,
    minterPrivateKey: string
  ): Promise<{
    transactionId: string
    amount: number
  }> {
    try {
      const minterAccount = algosdk.mnemonicToSecretKey(minterPrivateKey)
      
      // Get suggested parameters
      const suggestedParams = await algodClient.getTransactionParams().do()
      
      // Create asset transfer transaction
      const mintTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        sender: minterAccount.addr,
        receiver: toAddress,
        amount: amount,
        assetIndex: assetId,
        suggestedParams,
      })

      // Sign and send transaction
      const signedTxn = mintTxn.signTxn(minterAccount.sk)
      const result = await algodClient.sendRawTransaction(signedTxn).do()
      const txId = result.txid
      
      // Wait for confirmation
      await algosdk.waitForConfirmation(algodClient, txId, 4)

      // Update NFT supply in Firestore
      const nftRef = adminDb.collection('nfts').where('assetId', '==', assetId)
      const nftSnapshot = await nftRef.get()
      
      if (!nftSnapshot.empty) {
        const nftDoc = nftSnapshot.docs[0]
        const currentSupply = nftDoc.data().currentSupply || 0
        await nftDoc.ref.update({
          currentSupply: currentSupply + amount,
        })
      }

      return {
        transactionId: txId,
        amount,
      }
    } catch (error) {
      console.error('Error minting NFT:', error)
      throw new Error('Failed to mint NFT')
    }
  }

  /**
   * Transfer NFT between addresses
   */
  static async transferNFT(
    assetId: number,
    fromAddress: string,
    toAddress: string,
    amount: number,
    fromPrivateKey: string
  ): Promise<{
    transactionId: string
  }> {
    try {
      const fromAccount = algosdk.mnemonicToSecretKey(fromPrivateKey)
      
      // Get suggested parameters
      const suggestedParams = await algodClient.getTransactionParams().do()
      
      // Create asset transfer transaction
      const transferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        sender: fromAddress,
        receiver: toAddress,
        amount: amount,
        assetIndex: assetId,
        suggestedParams,
      })

      // Sign and send transaction
      const signedTxn = transferTxn.signTxn(fromAccount.sk)
      const result = await algodClient.sendRawTransaction(signedTxn).do()
      const txId = result.txid
      
      // Wait for confirmation
      await algosdk.waitForConfirmation(algodClient, txId, 4)

      return {
        transactionId: txId,
      }
    } catch (error) {
      console.error('Error transferring NFT:', error)
      throw new Error('Failed to transfer NFT')
    }
  }

  /**
   * Create atomic swap between two NFTs
   */
  static async createAtomicSwap(params: NFTSwapParams): Promise<{
    swapId: string
    transactionId: string
  }> {
    try {
      // Generate unique swap ID
      const swapId = `swap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Get suggested parameters
      const suggestedParams = await algodClient.getTransactionParams().do()
      
      // Create atomic transfer group
      const txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        sender: params.fromAddress1,
        receiver: params.fromAddress2,
        amount: params.amount1,
        assetIndex: params.assetId1,
        suggestedParams,
      })

      const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        sender: params.fromAddress2,
        receiver: params.fromAddress1,
        amount: params.amount2,
        assetIndex: params.assetId2,
        suggestedParams,
      })

      // Group transactions atomically
      const groupedTxn = algosdk.assignGroupID([txn1, txn2])
      
      // Store swap details in Firestore
      await adminDb.collection('nft_swaps').add({
        swapId,
        assetId1: params.assetId1,
        assetId2: params.assetId2,
        fromAddress1: params.fromAddress1,
        fromAddress2: params.fromAddress2,
        amount1: params.amount1,
        amount2: params.amount2,
        status: 'pending',
        createdAt: new Date(),
        expiryTime: params.expiryTime || Date.now() + 24 * 60 * 60 * 1000, // 24 hours default
      })

      return {
        swapId,
        transactionId: groupedTxn[0].txID(),
      }
    } catch (error) {
      console.error('Error creating atomic swap:', error)
      throw new Error('Failed to create atomic swap')
    }
  }

  /**
   * Execute atomic swap
   */
  static async executeAtomicSwap(
    swapId: string,
    privateKey1: string,
    privateKey2: string
  ): Promise<{
    transactionId: string
  }> {
    try {
      // Get swap details
      const swapRef = adminDb.collection('nft_swaps').where('swapId', '==', swapId)
      const swapSnapshot = await swapRef.get()
      
      if (swapSnapshot.empty) {
        throw new Error('Swap not found')
      }

      const swapData = swapSnapshot.docs[0].data()
      
      // Check if swap has expired
      if (Date.now() > swapData.expiryTime) {
        throw new Error('Swap has expired')
      }

      const account1 = algosdk.mnemonicToSecretKey(privateKey1)
      const account2 = algosdk.mnemonicToSecretKey(privateKey2)
      
      // Get suggested parameters
      const suggestedParams = await algodClient.getTransactionParams().do()
      
      // Create atomic transfer group
      const txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        sender: swapData.fromAddress1,
        receiver: swapData.fromAddress2,
        amount: swapData.amount1,
        assetIndex: swapData.assetId1,
        suggestedParams,
      })

      const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        sender: swapData.fromAddress2,
        receiver: swapData.fromAddress1,
        amount: swapData.amount2,
        assetIndex: swapData.assetId2,
        suggestedParams,
      })

      // Group and sign transactions
      const groupedTxn = algosdk.assignGroupID([txn1, txn2])
      const signedTxn1 = groupedTxn[0].signTxn(account1.sk)
      const signedTxn2 = groupedTxn[1].signTxn(account2.sk)
      
      // Send grouped transaction
      const result = await algodClient.sendRawTransaction([signedTxn1, signedTxn2]).do()
      const txId = result.txid
      
      // Wait for confirmation
      await algosdk.waitForConfirmation(algodClient, txId, 4)

      // Update swap status
      await swapSnapshot.docs[0].ref.update({
        status: 'completed',
        completedAt: new Date(),
        transactionId: txId,
      })

      return {
        transactionId: txId,
      }
    } catch (error) {
      console.error('Error executing atomic swap:', error)
      throw new Error('Failed to execute atomic swap')
    }
  }

  /**
   * Get NFT details by asset ID
   */
  static async getNFTDetails(assetId: number): Promise<any> {
    try {
      const assetInfo = await algodClient.getAssetByID(assetId).do()
      return assetInfo
    } catch (error) {
      console.error('Error getting NFT details:', error)
      throw new Error('Failed to get NFT details')
    }
  }

  /**
   * Get user's NFT holdings
   */
  static async getUserNFTs(address: string): Promise<any[]> {
    try {
      const accountInfo = await algodClient.accountInformation(address).do()
      return accountInfo.assets || []
    } catch (error) {
      console.error('Error getting user NFTs:', error)
      throw new Error('Failed to get user NFTs')
    }
  }

  /**
   * Opt-in to an asset (required before receiving)
   */
  static async optInToAsset(
    assetId: number,
    address: string,
    privateKey: string
  ): Promise<{
    transactionId: string
  }> {
    try {
      const account = algosdk.mnemonicToSecretKey(privateKey)
      
      // Get suggested parameters
      const suggestedParams = await algodClient.getTransactionParams().do()
      
      // Create asset opt-in transaction
      const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        sender: address,
        receiver: address,
        amount: 0,
        assetIndex: assetId,
        suggestedParams,
      })

      // Sign and send transaction
      const signedTxn = optInTxn.signTxn(account.sk)
      const result = await algodClient.sendRawTransaction(signedTxn).do()
      const txId = result.txid
      
      // Wait for confirmation
      await algosdk.waitForConfirmation(algodClient, txId, 4)

      return {
        transactionId: txId,
      }
    } catch (error) {
      console.error('Error opting in to asset:', error)
      throw new Error('Failed to opt-in to asset')
    }
  }

  /**
   * Generate QR code data for NFT verification
   */
  static generateQRData(assetId: number, address: string, eventId: string): string {
    return JSON.stringify({
      assetId,
      address,
      eventId,
      timestamp: Date.now(),
      type: 'nft_ticket_verification'
    })
  }

  /**
   * Verify NFT ticket for event entry
   */
  static async verifyNFTTicket(
    assetId: number,
    address: string,
    eventId: string
  ): Promise<{
    isValid: boolean
    owner: string
    metadata: any
  }> {
    try {
      // Get asset information
      const assetInfo = await this.getNFTDetails(assetId)
      
      // Get account information
      const accountInfo = await algodClient.accountInformation(address).do()
      
      // Check if address owns the asset
      const assetHolding = accountInfo.assets?.find((asset: any) => asset['asset-id'] === assetId)
      
      if (!assetHolding || assetHolding.amount === BigInt(0)) {
        return {
          isValid: false,
          owner: '',
          metadata: null
        }
      }

      // Get NFT metadata from Firestore
      const nftRef = adminDb.collection('nfts').where('assetId', '==', assetId)
      const nftSnapshot = await nftRef.get()
      
      let metadata = null
      if (!nftSnapshot.empty) {
        metadata = nftSnapshot.docs[0].data().metadata
      }

      return {
        isValid: true,
        owner: address,
        metadata
      }
    } catch (error) {
      console.error('Error verifying NFT ticket:', error)
      return {
        isValid: false,
        owner: '',
        metadata: null
      }
    }
  }
}
