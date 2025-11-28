// Order signing and verification utilities for off-chain orderbook
import algosdk from "algosdk"
import { isValidAlgorandAddress } from "@/lib/algorand/config"

export interface TradingOrderPayload {
  marketplaceId: string
  nftId: string
  assetId: number
  sellerAddress: string
  buyerAddress?: string // Optional for buy orders
  price: number // Price in ALGO (will be converted to microAlgos)
  currency: string
  nonce: string // Unique identifier to prevent replay attacks
  expiresAt: number // Unix timestamp in seconds
  createdAt: number // Unix timestamp in seconds
}

export interface SignedOrder extends TradingOrderPayload {
  signature: string // Base64 encoded signature
  orderId: string // Unique order identifier
}

/**
 * Create order payload for signing
 */
export function createOrderPayload(params: {
  marketplaceId: string
  nftId: string
  assetId: number
  sellerAddress: string
  buyerAddress?: string
  price: number
  currency?: string
  nonce?: string
  expiresInSeconds?: number
}): TradingOrderPayload {
  const {
    marketplaceId,
    nftId,
    assetId,
    sellerAddress,
    buyerAddress,
    price,
    currency = "ALGO",
    nonce = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
    expiresInSeconds = 7 * 24 * 60 * 60, // 7 days default
  } = params

  if (!isValidAlgorandAddress(sellerAddress)) {
    throw new Error("Invalid seller address")
  }

  if (buyerAddress && !isValidAlgorandAddress(buyerAddress)) {
    throw new Error("Invalid buyer address")
  }

  const now = Math.floor(Date.now() / 1000)

  return {
    marketplaceId,
    nftId,
    assetId,
    sellerAddress,
    buyerAddress,
    price,
    currency,
    nonce,
    expiresAt: now + expiresInSeconds,
    createdAt: now,
  }
}

/**
 * Serialize order payload to string for signing
 */
export function serializeOrderPayload(payload: TradingOrderPayload): string {
  // Create a deterministic JSON string (sorted keys)
  return JSON.stringify({
    marketplaceId: payload.marketplaceId,
    nftId: payload.nftId,
    assetId: payload.assetId,
    sellerAddress: payload.sellerAddress,
    buyerAddress: payload.buyerAddress || null,
    price: payload.price,
    currency: payload.currency,
    nonce: payload.nonce,
    expiresAt: payload.expiresAt,
    createdAt: payload.createdAt,
  })
}

/**
 * Sign order with seller's private key
 * @param payload Order payload
 * @param sellerPrivateKey Seller's private key (Uint8Array or mnemonic)
 * @returns Signed order with signature
 */
export function signOrder(
  payload: TradingOrderPayload,
  sellerPrivateKey: Uint8Array | string
): SignedOrder {
  const serialized = serializeOrderPayload(payload)
  const message = new TextEncoder().encode(serialized)

  let account: algosdk.Account
  if (typeof sellerPrivateKey === "string") {
    // Assume it's a mnemonic
    account = algosdk.mnemonicToSecretKey(sellerPrivateKey)
  } else {
    // It's a private key Uint8Array
    account = algosdk.mnemonicToSecretKey(
      algosdk.secretKeyToMnemonic(sellerPrivateKey)
    )
  }

  // Sign the message
  const signature = algosdk.signBytes(message, account.sk)
  const signatureBase64 = Buffer.from(signature).toString("base64")

  // Generate order ID
  const orderId = `order-${payload.nonce}`

  return {
    ...payload,
    signature: signatureBase64,
    orderId,
  }
}

/**
 * Verify order signature
 * @param signedOrder Signed order to verify
 * @returns true if signature is valid
 */
export function verifyOrderSignature(signedOrder: SignedOrder): boolean {
  try {
    // Check if order is expired
    const now = Math.floor(Date.now() / 1000)
    if (signedOrder.expiresAt < now) {
      return false
    }

    // Reconstruct the message
    const payload: TradingOrderPayload = {
      marketplaceId: signedOrder.marketplaceId,
      nftId: signedOrder.nftId,
      assetId: signedOrder.assetId,
      sellerAddress: signedOrder.sellerAddress,
      buyerAddress: signedOrder.buyerAddress,
      price: signedOrder.price,
      currency: signedOrder.currency,
      nonce: signedOrder.nonce,
      expiresAt: signedOrder.expiresAt,
      createdAt: signedOrder.createdAt,
    }

    const serialized = serializeOrderPayload(payload)
    const message = new TextEncoder().encode(serialized)

    // Decode signature
    const signature = Buffer.from(signedOrder.signature, "base64")

    // Get seller's public key from address
    const sellerPublicKey = algosdk.decodeAddress(signedOrder.sellerAddress)
      .publicKey

    // Verify signature
    return algosdk.verifyBytes(message, signature, sellerPublicKey)
  } catch (error) {
    console.error("Error verifying order signature:", error)
    return false
  }
}

/**
 * Verify order and check if it's still valid
 */
export function validateOrder(signedOrder: SignedOrder): {
  valid: boolean
  error?: string
} {
  // Check expiration
  const now = Math.floor(Date.now() / 1000)
  if (signedOrder.expiresAt < now) {
    return { valid: false, error: "Order has expired" }
  }

  // Verify signature
  if (!verifyOrderSignature(signedOrder)) {
    return { valid: false, error: "Invalid signature" }
  }

  // Validate addresses
  if (!isValidAlgorandAddress(signedOrder.sellerAddress)) {
    return { valid: false, error: "Invalid seller address" }
  }

  if (signedOrder.buyerAddress && !isValidAlgorandAddress(signedOrder.buyerAddress)) {
    return { valid: false, error: "Invalid buyer address" }
  }

  // Validate price
  if (signedOrder.price <= 0) {
    return { valid: false, error: "Invalid price" }
  }

  return { valid: true }
}

