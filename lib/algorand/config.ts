// Algorand blockchain configuration and utilities
import algosdk from "algosdk"

// Network configuration
export const ALGORAND_CONFIG = {
  // Testnet configuration
  testnet: {
    server: "https://testnet-api.algonode.cloud",
    port: "",
    token: "",
    indexerServer: "https://testnet-idx.algonode.cloud",
    indexerPort: "",
    indexerToken: "",
  },
  // Mainnet configuration
  mainnet: {
    server: "https://mainnet-api.algonode.cloud",
    port: "",
    token: "",
    indexerServer: "https://mainnet-idx.algonode.cloud",
    indexerPort: "",
    indexerToken: "",
  },
}

// Get current network configuration
const getCurrentNetwork = () => {
  const network = process.env.NEXT_PUBLIC_ALGORAND_NETWORK || "testnet"
  return ALGORAND_CONFIG[network as keyof typeof ALGORAND_CONFIG]
}

// Initialize Algorand client
export const getAlgodClient = () => {
  const config = getCurrentNetwork()
  return new algosdk.Algodv2(config.token, config.server, config.port)
}

// Initialize Indexer client
export const getIndexerClient = () => {
  const config = getCurrentNetwork()
  return new algosdk.Indexer(config.indexerToken, config.indexerServer, config.indexerPort)
}

// Application configuration
export const APP_CONFIG = {
  // EventNFT marketplace application ID (to be deployed)
  marketplaceAppId: Number.parseInt(process.env.NEXT_PUBLIC_MARKETPLACE_APP_ID || "0"),

  // Fee configuration
  platformFeePercentage: 2.5, // 2.5% platform fee
  creatorRoyaltyPercentage: 5.0, // 5% creator royalty

  // Transaction fees
  minTxnFee: 1000, // 0.001 ALGO minimum transaction fee

  // Asset configuration
  assetDecimals: 0, // NFTs are non-divisible
  defaultFrozen: false,

  // Metadata standards
  metadataStandard: "ARC-3", // Algorand Request for Comments 3
}

// Platform configuration for API routes
export const PLATFORM_CONFIG = {
  ...APP_CONFIG,
  // Platform wallet addresses
  platformFeeAddress: process.env.PLATFORM_FEE_ADDRESS || "PLATFORM_FEE_ADDRESS_NOT_SET",
  platformEscrowAddress: process.env.PLATFORM_ESCROW_ADDRESS || "PLATFORM_ESCROW_ADDRESS_NOT_SET",
  
  // Platform settings
  maxTransactionTimeout: 30000, // 30 seconds
  retryAttempts: 3,
  
  // Fee structure
  fees: {
    platform: APP_CONFIG.platformFeePercentage,
    creator: APP_CONFIG.creatorRoyaltyPercentage,
    network: 0.001, // 0.001 ALGO network fee
  }
}

// Utility functions
export const microAlgosToAlgos = (microAlgos: number): number => {
  return microAlgos / 1000000
}

export const algosToMicroAlgos = (algos: number): number => {
  return Math.round(algos * 1000000)
}

export const formatAlgoAmount = (microAlgos: number): string => {
  const algos = microAlgosToAlgos(microAlgos)
  return `${algos.toFixed(6)} ALGO`
}

// Address validation
export const isValidAlgorandAddress = (address: string): boolean => {
  try {
    return algosdk.isValidAddress(address)
  } catch {
    return false
  }
}

// Generate account from mnemonic
export const accountFromMnemonic = (mnemonic: string) => {
  try {
    return algosdk.mnemonicToSecretKey(mnemonic)
  } catch (error) {
    console.error("Error generating account from mnemonic:", error)
    throw error
  }
}

// Wait for transaction confirmation
export const waitForConfirmation = async (txId: string, timeout = 10) => {
  const algodClient = getAlgodClient()

  let lastRound = (await algodClient.status().do())["last-round"]

  while (timeout > 0) {
    const pendingInfo = await algodClient.pendingTransactionInformation(txId).do()

    if (pendingInfo["confirmed-round"] !== null && pendingInfo["confirmed-round"] > 0) {
      return pendingInfo
    }

    if (pendingInfo["pool-error"] != null && pendingInfo["pool-error"].length > 0) {
      throw new Error(`Transaction rejected: ${pendingInfo["pool-error"]}`)
    }

    await algodClient.statusAfterBlock(lastRound).do()
    lastRound++
    timeout--
  }

  throw new Error("Transaction confirmation timeout")
}

// Get account information
export const getAccountInfo = async (address: string) => {
  try {
    const algodClient = getAlgodClient()
    const accountInfo = await algodClient.accountInformation(address).do()
    return accountInfo
  } catch (error) {
    console.error("Error getting account info:", error)
    throw error
  }
}

// Get asset information
export const getAssetInfo = async (assetId: number) => {
  try {
    const algodClient = getAlgodClient()
    const assetInfo = await algodClient.getAssetByID(assetId).do()
    return assetInfo
  } catch (error) {
    console.error("Error getting asset info:", error)
    throw error
  }
}

// Transaction building utilities
export const buildPaymentTransaction = async (from: string, to: string, amount: number, note?: string) => {
  const algodClient = getAlgodClient()
  const params = await algodClient.getTransactionParams().do()

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from,
    to,
    amount,
    note: note ? new TextEncoder().encode(note) : undefined,
    suggestedParams: params,
  })

  return txn
}

export const buildAssetTransferTransaction = async (
  from: string,
  to: string,
  assetIndex: number,
  amount: number,
  note?: string,
) => {
  const algodClient = getAlgodClient()
  const params = await algodClient.getTransactionParams().do()

  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from,
    to,
    assetIndex,
    amount,
    note: note ? new TextEncoder().encode(note) : undefined,
    suggestedParams: params,
  })

  return txn
}

// Smart contract interaction utilities
export const compileProgram = async (programSource: string) => {
  const algodClient = getAlgodClient()
  const compileResponse = await algodClient.compile(programSource).do()
  return new Uint8Array(Buffer.from(compileResponse.result, "base64"))
}

export const getApplicationGlobalState = async (appId: number) => {
  try {
    const algodClient = getAlgodClient()
    const appInfo = await algodClient.getApplicationByID(appId).do()
    return appInfo.params["global-state"] || []
  } catch (error) {
    console.error("Error getting application global state:", error)
    throw error
  }
}

// IPFS utilities for metadata storage
export const uploadToIPFS = async (metadata: object): Promise<string> => {
  // This would integrate with IPFS service like Pinata or Infura
  // For now, return a mock IPFS hash
  const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}`
  console.log("Mock IPFS upload:", metadata)
  return mockHash
}

export const getFromIPFS = async (hash: string): Promise<object> => {
  // This would fetch from IPFS
  // For now, return mock metadata
  return {
    name: "Event NFT",
    description: "Exclusive event access token",
    image: `https://ipfs.io/ipfs/${hash}`,
    properties: {
      event_date: "2024-07-15",
      venue: "Central Park",
      tier: "VIP",
    },
  }
}
