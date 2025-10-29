import algosdk from 'algosdk'

// Algorand configuration
const ALGOD_TOKEN = process.env.ALGOD_TOKEN || ''
const ALGOD_SERVER = process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud'
const ALGOD_PORT = parseInt(process.env.ALGOD_PORT || '443') || 443

// Initialize Algorand client
const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT)

export interface WalletMintParams {
  nftId: string
  userAddress: string
  metadata: {
    name: string
    description: string
    image: string
    attributes: Array<{
      trait_type: string
      value: string
    }>
  }
  totalSupply: number
  royaltyPercentage?: number // Percentage (0-100) of sale price paid to creator
  royaltyRecipient?: string // Address that receives royalty payments
}

export class WalletMintService {
  /**
   * Create mint transaction that can be signed by user's wallet
   */
  static async createMintTransaction(params: WalletMintParams): Promise<{
    transaction: algosdk.Transaction
    transactionId: string
  }> {
    try {
      // Check account balance before creating transaction
      const accountInfo = await this.getAccountInfo(params.userAddress)
      const minRequiredBalance = 1000 + 1000 // 1000 for minimum balance + 1000 for fees
      
      if (accountInfo.balance < minRequiredBalance) {
        throw new Error(`Insufficient balance. Account has ${accountInfo.balance} microAlgos but needs at least ${minRequiredBalance} microAlgos. Please fund your account with testnet ALGO from https://testnet.algoexplorer.io/dispenser`)
      }
      
      // Get suggested parameters
      const suggestedParams = await algodClient.getTransactionParams().do()
      
      // Create asset creation transaction
      const assetCreateTxn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        sender: params.userAddress,
        suggestedParams,
        total: params.totalSupply,
        decimals: 0,
        defaultFrozen: false,
        unitName: params.metadata.name.substring(0, 8).toUpperCase(),
        assetName: params.metadata.name,
        assetURL: params.metadata.image,
        manager: params.userAddress,
        reserve: params.userAddress,
        freeze: params.userAddress,
        clawback: params.userAddress,
        note: new TextEncoder().encode(`NFT Mint: ${params.metadata.name}`),
      })

      return {
        transaction: assetCreateTxn,
        transactionId: assetCreateTxn.txID()
      }
    } catch (error) {
      console.error('Error creating mint transaction:', error)
      throw new Error('Failed to create mint transaction')
    }
  }

  /**
   * Submit signed transaction to the network
   */
  static async submitSignedTransaction(signedTransaction: Uint8Array): Promise<{
    assetId: number
    transactionId: string
  }> {
    try {
      // Submit the signed transaction
      const result = await algodClient.sendRawTransaction(signedTransaction).do()
      const txId = result.txid
      
      // Wait for confirmation
      const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4)
      const assetId = Number(confirmedTxn.assetIndex)

      return {
        assetId,
        transactionId: txId
      }
    } catch (error) {
      console.error('Error submitting transaction:', error)
      throw new Error('Failed to submit transaction to network')
    }
  }

  /**
   * Get transaction status
   */
  static async getTransactionStatus(transactionId: string): Promise<{
    status: string
    confirmedRound?: number
    assetId?: number
  }> {
    try {
      const txn = await algodClient.pendingTransactionInformation(transactionId).do()
      
      if (txn.confirmedRound) {
        return {
          status: 'confirmed',
          confirmedRound: Number(txn.confirmedRound),
          assetId: txn.assetIndex ? Number(txn.assetIndex) : undefined
        }
      } else {
        return {
          status: 'pending'
        }
      }
    } catch (error) {
      console.error('Error getting transaction status:', error)
      return {
        status: 'error'
      }
    }
  }

  /**
   * Get account information
   */
  static async getAccountInfo(address: string): Promise<{
    address: string
    balance: number
    assets: Array<{
      assetId: number
      amount: number
    }>
  }> {
    try {
      const accountInfo = await algodClient.accountInformation(address).do()
      console.log('Account info:', accountInfo);
      console.log('Raw assets:', accountInfo.assets);
      
      const mappedAssets = accountInfo.assets?.map((asset: any) => {
        console.log('Processing asset:', asset);
        const assetId = asset['asset-id'];
        const amount = Number(asset.amount);
        console.log('Mapped assetId:', assetId, 'amount:', amount);
        return {
          assetId: Number(assetId),
          amount: amount
        };
      }) || [];
      
      console.log('Mapped assets:', mappedAssets);
      
      return {
        address,
        balance: Number(accountInfo.amount),
        assets: mappedAssets
      }
    } catch (error) {
      console.error('Error getting account info:', error)
      throw new Error('Failed to get account information')
    }
  }

  /**
   * Get testnet dispenser URL for funding accounts
   */
  static getTestnetDispenserUrl(): string {
    return 'https://testnet.algoexplorer.io/dispenser'
  }

  /**
   * Check if account has sufficient balance for minting
   */
  static async checkAccountBalance(address: string): Promise<{
    hasSufficientBalance: boolean
    currentBalance: number
    requiredBalance: number
    dispenserUrl: string
  }> {
    try {
      const accountInfo = await this.getAccountInfo(address)
      const requiredBalance = 2000 // 1000 for minimum balance + 1000 for fees
      
      return {
        hasSufficientBalance: accountInfo.balance >= requiredBalance,
        currentBalance: accountInfo.balance,
        requiredBalance,
        dispenserUrl: this.getTestnetDispenserUrl()
      }
    } catch (error) {
      console.error('Error checking account balance:', error)
      throw new Error('Failed to check account balance')
    }
  }
}
