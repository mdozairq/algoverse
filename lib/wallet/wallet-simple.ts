import algosdk from 'algosdk'

// Algorand configuration
const ALGOD_TOKEN = process.env.ALGOD_TOKEN || ''
const ALGOD_SERVER = process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud'
const ALGOD_PORT = parseInt(process.env.ALGOD_PORT || '443')

// Initialize Algorand client
const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT)

export interface WalletAccount {
  address: string
  name?: string
  isConnected: boolean
  balance: number
  assets: WalletAsset[]
  mnemonic?: string
  privateKey?: Uint8Array
}

export interface WalletAsset {
  assetId: number
  name: string
  unitName: string
  balance: number
  decimals: number
  creator: string
  frozen: boolean
  url?: string
  metadata?: any
}

export class SimpleWalletService {
  /**
   * Generate a new wallet account
   */
  static generateAccount(name?: string): WalletAccount {
    const account = algosdk.generateAccount()
    const mnemonic = algosdk.secretKeyToMnemonic(account.sk)
    
    return {
      address: account.addr.toString(),
      name: name || `Wallet ${Date.now()}`,
      isConnected: false,
      balance: 0,
      assets: [],
      mnemonic,
      privateKey: account.sk
    }
  }

  /**
   * Import wallet from mnemonic
   */
  static importFromMnemonic(mnemonic: string, name?: string): WalletAccount {
    try {
      const account = algosdk.mnemonicToSecretKey(mnemonic)
      
      return {
        address: account.addr.toString(),
        name: name || `Imported Wallet`,
        isConnected: false,
        balance: 0,
        assets: [],
        mnemonic,
        privateKey: account.sk
      }
    } catch (error) {
      throw new Error('Invalid mnemonic phrase')
    }
  }

  /**
   * Get account balance
   */
  static async getBalance(address: string): Promise<number> {
    try {
      const accountInfo = await algodClient.accountInformation(address).do()
      return Number(accountInfo.amount) / 1e6
    } catch (error) {
      console.error('Error fetching balance:', error)
      return 0
    }
  }

  /**
   * Get account assets
   */
  static async getAssets(address: string): Promise<WalletAsset[]> {
    try {
      const accountInfo = await algodClient.accountInformation(address).do()
      const assets: WalletAsset[] = []
      
      if (accountInfo.assets) {
        for (const asset of accountInfo.assets) {
          try {
            const assetInfo = await algodClient.getAssetByID(asset.assetId).do()
            assets.push({
              assetId: Number(asset.assetId),
              name: assetInfo.params.name || `Asset ${asset.assetId}`,
              unitName: assetInfo.params.unitName || '',
              balance: Number(asset.amount as bigint),
              decimals: assetInfo.params.decimals,
              creator: assetInfo.params.creator,
              frozen: asset.isFrozen || false,
              url: assetInfo.params.url,
              metadata: assetInfo.params.metadataHash
            })
          } catch (error) {
            console.warn(`Failed to load asset ${asset.assetId}:`, error)
          }
        }
      }
      
      return assets
    } catch (error) {
      console.error('Error fetching assets:', error)
      return []
    }
  }

  /**
   * Validate Algorand address
   */
  static isValidAddress(address: string): boolean {
    try {
      return algosdk.isValidAddress(address)
    } catch {
      return false
    }
  }

  /**
   * Format address for display
   */
  static formatAddress(address: string, length = 8): string {
    if (!address) {
      console.warn('formatAddress: address is null or undefined')
      return 'No Address'
    }
    if (typeof address !== 'string') {
      console.warn('formatAddress: address is not a string:', typeof address, address)
      return 'Invalid Address Type'
    }
    if (address.length === 0) {
      console.warn('formatAddress: address is empty string')
      return 'Empty Address'
    }
    if (address.length <= length * 2) return address
    return `${address.slice(0, length)}...${address.slice(-length)}`
  }

  /**
   * Convert microAlgos to ALGO
   */
  static microAlgosToAlgos(microAlgos: number): number {
    return microAlgos / 1e6
  }

  /**
   * Convert ALGO to microAlgos
   */
  static algosToMicroAlgos(algos: number): number {
    return Math.round(algos * 1e6)
  }
}
