// Firestore collections using real Firebase Admin SDK
import { log } from "console"
import { adminDb } from "./admin"

export interface User {
  id: string
  email?: string
  name?: string
  role: "user" | "merchant" | "admin"
  walletAddress?: string
  address?: string
  createdAt: Date
  updatedAt?: Date
  isVerified?: boolean
  uid?: string
  password?: string
  
  // Merchant-specific fields (only present when role === "merchant")
  businessName?: string
  category?: string
  description?: string
  isApproved?: boolean
  status?: "pending" | "approved" | "rejected"
  permissions?: {
    allowMarketplace?: boolean
    allowMint?: boolean
    allowDutchMint?: boolean
    allowAIGenerated?: boolean
    allowTrade?: boolean
    allowSwap?: boolean
  }
}

export interface Event {
  id: string
  title: string
  description: string
  price: string
  merchantId: string
  category: string
  date: string
  time?: string
  location: string
  venue?: string
  website?: string
  imageUrl?: string
  totalSupply: number
  availableSupply: number
  currentSupply?: number
  status?: "draft" | "pending" | "approved" | "rejected" | "minted"
  createdAt: Date
  updatedAt?: Date
  featured?: boolean
  trending?: boolean
  nftAssetId?: number
  nftCreated?: boolean
  nftCreatedAt?: Date
  nftUnitName?: string
  assetId?: number
  transactionId?: string
  nftAssetName?: string
  nftUrl?: string
  royaltyPercentage?: number
  metadataUrl?: string
  ticketTiers?: Array<{
    id: number
    name: string
    price: string
    quantity: number
    description: string
  }>
  enableResale?: boolean
  royaltyFee?: number
}

export interface Purchase {
  id: string
  eventId: string
  userId: string
  quantity: number
  totalPrice: number
  paymentTransactionId: string
  nftTickets: Array<{
    transactionId: string
    metadataUrl: string
    assetId?: string
    status?: 'pending' | 'minted' | 'failed'
  }>
  status: 'pending' | 'completed' | 'failed'
  createdAt: Date
  updatedAt?: Date
}

export interface Collection {
  id: string
  name: string
  description: string
  image: string
  category: string
  type: "nft" | "event" | "merchandise"
  currency: string
  marketplaceId: string
  merchantId: string
  isEnabled: boolean
  allowSwap: boolean
  nftCount: number
  createdAt: Date
  updatedAt?: Date
  // Supply tracking
  availableSupply?: number
  maxSupply?: number
  // Royalty settings
  royaltyPercentage?: number // Default royalty percentage for NFTs in this collection
  royaltyRecipient?: string // Default royalty recipient address
  // Media category for NFT type restrictions
  mediaCategory?: "image" | "audio" | "video" | "file" | "any" // Restricts what type of NFTs can be created in this collection
}

export interface NFT {
  id: string
  eventId: string
  collectionId: string
  ownerId: string
  tokenId: string
  assetId?: number
  creatorId?: string
  creatorAddress?: string
  price?: number
  metadata: Record<string, any>
  createdAt: Date
  isUsed?: boolean
  listedForSale?: boolean
  marketplaceId?: string
  isEnabled: boolean
  allowSwap: boolean
  transactionId?: string
  status?: string
  // Quantity tracking
  maxSupply?: number
  availableSupply?: number
  ownerAddress?: string
  mintedAt?: Date
  forSale?: boolean
  // Royalty settings
  royaltyPercentage?: number // Percentage (0-100) of sale price paid to creator
  royaltyRecipient?: string // Address that receives royalty payments
}

export interface Merchant {
  id: string
  name: string
  businessName: string
  email: string
  category: string
  description: string
  walletAddress: string
  isApproved: boolean
  isVerified: boolean
  status?: "pending" | "approved" | "rejected"
  createdAt: Date
  uid: string
  updatedAt?: Date
  password?: string
  role: "merchant"
  // Merchant permissions
  permissions?: {
    allowMarketplace?: boolean
    allowMint?: boolean
    allowDutchMint?: boolean
    allowAIGenerated?: boolean
    allowTrade?: boolean
    allowSwap?: boolean
  }
}

export interface Marketplace {
  id: string
  merchantId: string
  businessName: string
  description: string
  category: string
  website?: string
  logo?: string
  banner?: string | string[]
  template: string
  primaryColor: string
  secondaryColor: string
  paymentMethod: string
  walletAddress: string
  status: "draft" | "pending" | "approved" | "rejected"
  isEnabled: boolean
  allowSwap: boolean
  createdAt: Date
  updatedAt?: Date
  // Enhanced marketplace features
  configuration?: MarketplaceConfiguration
  analytics?: MarketplaceAnalytics
  customDomain?: string
  // Marketplace permissions
  permissions?: {
    allowMarketplace?: boolean
    allowMint?: boolean
    allowDutchMint?: boolean
    allowAIGenerated?: boolean
    allowTrade?: boolean
    allowSwap?: boolean
  }
}

export interface MarketplaceConfiguration {
  mintingConfig: {
    enabled: boolean
    autoApprove: boolean
    requireKYC: boolean
    maxSupply: number
    defaultPrice: number
    currency: 'ALGO' | 'USDC'
  }
  tradingConfig: {
    auctionEnabled: boolean
    flashSaleEnabled: boolean
    auctionDuration: number // in hours
    flashSaleDuration: number // in hours
    minBidIncrement: number
    reservePrice: boolean
  }
  swapConfig: {
    enabled: boolean
    allowPartialSwaps: boolean
    requireApproval: boolean
    maxSwapValue: number
  }
  nftConfig: {
    transferable: boolean
    burnable: boolean
    pausable: boolean
    royaltyPercentage: number
  }
  addressConfig: {
    managerAddress: string
    reserveAddress: string
    freezeAddress: string
    clawbackAddress: string
  }
}

export interface MarketplaceAnalytics {
  totalMints: number
  totalTrades: number
  totalSwaps: number
  totalRevenue: number
  activeUsers: number
  monthlyStats: {
    mints: number
    trades: number
    revenue: number
    users: number
  }
  topNFTs: Array<{
    assetId: number
    name: string
    volume: number
    trades: number
  }>
}

export interface MarketplaceEvent {
  id: string
  marketplaceId: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  type: 'mint' | 'auction' | 'flash_sale' | 'swap'
  status: 'upcoming' | 'active' | 'ended' | 'cancelled'
  featured: boolean
  imageUrl?: string
  metadata: Record<string, any>
  createdAt: Date
  updatedAt?: Date
}

export interface MarketplacePage {
  id: string
  marketplaceId: string
  merchantId: string
  type: 'mint' | 'trade' | 'swap' | 'analytics' | 'events' | 'custom'
  title: string
  description?: string
  content: Record<string, any>
  isActive: boolean
  order: number
  slug: string
  seoTitle?: string
  seoDescription?: string
  createdAt: Date
  updatedAt?: Date
}

export interface MarketplaceTemplate {
  id: string
  name: string
  description: string
  preview: string
  category: string
  configuration: {
    layout: {
      headerStyle: 'fixed' | 'static'
      navigationStyle: 'horizontal' | 'vertical' | 'minimal'
      footerStyle: 'full' | 'minimal' | 'hidden'
    }
    theme: {
      primaryColor: string
      secondaryColor: string
      accentColor: string
      backgroundColor: string
      textColor: string
      cardStyle: 'flat' | 'elevated' | 'outlined'
      borderRadius: 'none' | 'small' | 'medium' | 'large'
    }
    features: {
      heroSection: boolean
      featuredProducts: boolean
      categories: boolean
      testimonials: boolean
      newsletter: boolean
      socialLinks: boolean
    }
    sections: {
      hero: {
        type: 'image' | 'video' | 'gradient'
        height: 'small' | 'medium' | 'large' | 'full'
        overlay: boolean
      }
      products: {
        layout: 'grid' | 'list' | 'carousel'
        itemsPerRow: number
        showFilters: boolean
        showSorting: boolean
      }
      footer: {
        showLinks: boolean
        showSocial: boolean
        showNewsletter: boolean
      }
    }
  }
  isActive: boolean
  createdAt: Date
  updatedAt?: Date
}

// Launchpad Project Interfaces
export interface LaunchpadProject {
  id: string
  name: string
  description: string
  longDescription: string
  category: string
  logo: string
  banner: string
  website?: string
  twitter?: string
  discord?: string
  instagram?: string
  socialLinks: {
    website?: string
    twitter?: string
    discord?: string
    instagram?: string
    telegram?: string
  }
  keyMetrics: {
    totalSupply: number
    mintPrice: number
    currency: string
    chain: string
    salePhase: 'upcoming' | 'live' | 'ended'
    startDate: string
    endDate?: string
    minted: number
    remaining: number
    floorPrice?: number
    volume?: number
    holders?: number
  }
  tokenomics: {
    totalSupply: number
    publicSale: number
    teamAllocation: number
    communityRewards: number
    treasury: number
    liquidity: number
  }
  roadmap: {
    phase: string
    title: string
    description: string
    status: 'completed' | 'in-progress' | 'upcoming'
    date: string
  }[]
  team: {
    name: string
    role: string
    bio: string
    avatar: string
    socialLinks: {
      twitter?: string
      linkedin?: string
      github?: string
    }
  }[]
  faq: {
    question: string
    answer: string
  }[]
  traits: {
    name: string
    values: {
      value: string
      count: number
      rarity: number
    }[]
  }[]
  primaryColor: string
  secondaryColor: string
  isVerified: boolean
  isFeatured: boolean
  createdAt: Date
  updatedAt?: Date
}

export interface MintPhase {
  id: string
  projectId: string
  name: string
  description: string
  startTime: string
  endTime?: string
  price: number
  maxPerWallet: number
  isWhitelist: boolean
  isActive: boolean
  minted: number
  total: number
  whitelistAddresses?: string[]
  createdAt: Date
  updatedAt?: Date
}

export interface SwapHistory {
  id: string
  userAddress: string
  marketplaceId: string
  merchantId: string
  inputAsset: {
    id: number
    name: string
    unitName: string
    amount: number
    decimals: number
  }
  outputAsset: {
    id: number
    name: string
    unitName: string
    amount: number
    decimals: number
  }
  swapDirection: 'ASA_TO_ALGO' | 'ALGO_TO_ASA'
  quoteType: 'direct' | 'router'
  fees: {
    swapFee: number
    priceImpact: number
  }
  slippage: number
  minAmountOut: number
  txId: string
  status: 'pending' | 'confirmed' | 'failed'
  confirmedAt?: Date
  createdAt: Date
  updatedAt?: Date
}

export interface LaunchpadNFT {
  id: string
  tokenId: string
  projectId: string
  ownerAddress: string
  phaseId: string
  mintPrice: number
  currency: string
  mintedAt: Date
  transactionHash: string
  metadata: {
    name: string
    description: string
    image: string
    attributes: {
      trait_type: string
      value: string
    }[]
  }
  traits: {
    trait_type: string
    value: string
    rarity: number
  }[]
  rarityScore: number
  rarityRank: number
  price?: number
  isListed: boolean
  lastSale?: {
    price: number
    currency: string
    date: string
  }
  views: number
  likes: number
  createdAt: Date
  updatedAt?: Date
}

export interface ActivityItem {
  id: string
  projectId: string
  type: 'mint' | 'sale' | 'transfer' | 'list' | 'delist' | 'offer' | 'bid'
  timestamp: Date
  fromAddress: string
  toAddress?: string
  tokenId: string
  nftName: string
  nftImage: string
  price?: number
  currency?: string
  transactionHash: string
  blockNumber: number
  gasUsed?: number
  gasPrice?: number
  status: 'pending' | 'confirmed' | 'failed'
  createdAt: Date
}

export interface SupportTicket {
  id: string
  projectId: string
  subject: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  userEmail: string
  userName: string
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  marketplaceId: string
  merchantId: string
  name: string
  description: string
  price: number
  currency: string
  image: string
  category: string
  type: 'nft' | 'event' | 'merchandise'
  inStock: boolean
  rating: number
  reviews: number
  isEnabled: boolean
  allowSwap: boolean
  assetId?: number
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt?: Date
}

export interface Transaction {
  id: string
  userId: string
  marketplaceId: string
  productId: string
  productType: 'nft' | 'event' | 'merchandise'
  quantity: number
  unitPrice: number
  totalPrice: number
  currency: string
  paymentMethod: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  merchantId: string
  buyerWalletAddress: string
  sellerWalletAddress: string
  blockchainTxId?: string
  createdAt: Date
  updatedAt?: Date
  completedAt?: Date
}

export interface Swap {
  id: string
  proposerId: string
  proposerWalletAddress: string
  targetNftId: string
  offeredNftId: string
  targetNftOwnerId: string
  marketplaceId: string
  message?: string
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'
  blockchainTxId?: string
  createdAt: Date
  updatedAt?: Date
  completedAt?: Date
}

// Real Firestore collection services
export const usersCollection = {
  async create(userData: Omit<User, "id" | "createdAt">): Promise<string> {
    const doc = await adminDb.collection("users").add({
      ...userData,
      createdAt: new Date(),
    })
    return doc.id
  },

  async getById(id: string): Promise<User | null> {
    if (!id || id.trim() === "") {
      return null
    }
    const doc = await adminDb.collection("users").doc(id).get()
    if (doc.exists) {
      return { id, ...doc.data() } as User
    }
    return null
  },

  async getByEmail(email: string): Promise<User | null> {
    const snapshot = await adminDb.collection("users").where("email", "==", email).get()
    if (snapshot.docs.length > 0) {
      const doc = snapshot.docs[0]
      return { ...doc.data(), id: doc.id } as User
    }
    return null
  },

  async getByAddress(address: string): Promise<User | null> {
    const snapshot = await adminDb.collection("users").where("walletAddress", "==", address).get()
    if (snapshot.docs.length > 0) {
      const doc = snapshot.docs[0]
      return { ...doc.data(), id: doc.id } as User
    }
    return null
  },

  async update(id: string, updates: Partial<User>): Promise<void> {
    await adminDb.collection("users").doc(id).update(updates)
  },

  async getByRole(role: string): Promise<User[]> {
    const snapshot = await adminDb.collection("users").where("role", "==", role).get()
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as User[]
  },

  async getByRoleAndStatus(role: string, status: string): Promise<User[]> {
    const snapshot = await adminDb.collection("users")
      .where("role", "==", role)
      .where("status", "==", status)
      .get()
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as User[]
  },

  async getAll(): Promise<User[]> {
    const snapshot = await adminDb.collection("users").get()
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as User[]
  },
}

export const eventsCollection = {
  async create(eventData: Omit<Event, "id" | "createdAt">): Promise<string> {
    const doc = await adminDb.collection("events").add({
      ...eventData,
      createdAt: new Date(),
    })
    return doc.id
  },

  async getById(id: string): Promise<Event | null> {
    if (!id || id.trim() === "") {
      return null
    }
    const doc = await adminDb.collection("events").doc(id).get()
    if (doc.exists) {
      return { ...doc.data(), id } as Event
    }
    return null
  },

  async getByMerchant(merchantId: string): Promise<Event[]> {
    const snapshot = await adminDb.collection("events").where("merchantId", "==", merchantId).get()
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }) as Event)
  },

  async getAll(): Promise<Event[]> {
    const snapshot = await adminDb.collection("events").get()
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }) as Event)
  },

  async getPending(): Promise<Event[]> {
    const snapshot = await adminDb.collection("events").where("status", "==", "pending").get()
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }) as Event)
  },

  async getApproved(): Promise<Event[]> {
    const snapshot = await adminDb.collection("events").where("status", "==", "approved").get()
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }) as Event)
  },

  async getRejected(): Promise<Event[]> {
    const snapshot = await adminDb.collection("events").where("status", "==", "rejected").get()
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }) as Event)
  },

  async update(id: string, updates: Partial<Event>): Promise<void> {
    await adminDb.collection("events").doc(id).update(updates)
  },

  async delete(id: string): Promise<void> {
    await adminDb.collection("events").doc(id).delete()
  },
}

export const nftsCollection = {
  async create(nftData: Omit<NFT, "id" | "createdAt">): Promise<string> {
    const doc = await adminDb.collection("nfts").add({
      ...nftData,
      createdAt: new Date(),
    })
    return doc.id
  },

  async getById(id: string): Promise<NFT | null> {
    if (!id || id.trim() === "") {
      return null
    }
    const doc = await adminDb.collection("nfts").doc(id).get()
    if (doc.exists) {
      return { ...doc.data(), id } as NFT
    }
    return null
  },

  async getByOwner(ownerId: string): Promise<NFT[]> {
    const snapshot = await adminDb.collection("nfts").where("ownerId", "==", ownerId).get()
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }) as NFT)
  },

  async update(id: string, updates: Partial<NFT>): Promise<void> {
    await adminDb.collection("nfts").doc(id).update(updates)
  },
}

export const merchantsCollection = {
  async create(merchantData: Omit<Merchant, "id" | "createdAt">): Promise<string> {
    const doc = await adminDb.collection("merchants").add({
      ...merchantData,
      createdAt: new Date(),
      isApproved: false,
    })
    return doc.id
  },

  async getById(id: string): Promise<Merchant | null> {
    if (!id || id.trim() === "") {
      return null
    }
    const doc = await adminDb.collection("merchants").doc(id).get()
    if (doc.exists) {
      return { ...doc.data(), id } as Merchant
    }
    return null
  },

  async getPending(): Promise<Merchant[]> {
    const snapshot = await adminDb.collection("merchants").where("isApproved", "==", false).get()
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }) as Merchant)
  },

  async getApproved(): Promise<Merchant[]> {
    const snapshot = await adminDb.collection("merchants").where("isApproved", "==", true).get()
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }) as Merchant)
  },

  async getAll(): Promise<Merchant[]> {
    const snapshot = await adminDb.collection("merchants").get()
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }) as Merchant)
  },

  async update(id: string, updates: Partial<Merchant>): Promise<void> {
    await adminDb.collection("merchants").doc(id).update(updates)
  },

  async getByEmail(email: string): Promise<Merchant | null> {
    const snapshot = await adminDb.collection("merchants").where("email", "==", email).get()
    if (snapshot.docs.length > 0) {
      const doc = snapshot.docs[0]
      return { ...doc.data(), id: doc.id } as Merchant
    }
    return null
  },

  async getByAddress(address: string): Promise<Merchant | null> {
    const snapshot = await adminDb.collection("merchants").where("walletAddress", "==", address).get()
    if (snapshot.docs.length > 0) {
      const doc = snapshot.docs[0]
      return { ...doc.data(), id: doc.id } as Merchant
    }
    return null
  },
}

export const marketplacesCollection = {
  async create(marketplaceData: Omit<Marketplace, "id" | "createdAt">): Promise<string> {
    const doc = await adminDb.collection("marketplaces").add({
      ...marketplaceData,
      createdAt: new Date(),
    })
    return doc.id
  },

  async getById(id: string): Promise<Marketplace | null> {
    if (!id || id.trim() === "") {
      return null
    }
    const doc = await adminDb.collection("marketplaces").doc(id).get()
    if (doc.exists) {
      return { ...doc.data(), id } as Marketplace
    }
    return null
  },

  async getByMerchant(merchantId: string): Promise<Marketplace[]> {
    const snapshot = await adminDb.collection("marketplaces").where("merchantId", "==", merchantId).get()
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }) as Marketplace)
  },

  async getPending(): Promise<Marketplace[]> {
    const snapshot = await adminDb.collection("marketplaces").where("status", "==", "pending").get()
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }) as Marketplace)
  },

  async getApproved(): Promise<Marketplace[]> {
    const snapshot = await adminDb.collection("marketplaces").where("status", "==", "approved").get()
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }) as Marketplace)
  },

  async getAll(): Promise<Marketplace[]> {
    const snapshot = await adminDb.collection("marketplaces").get()
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }) as Marketplace)
  },

  async update(id: string, updates: Partial<Marketplace>): Promise<void> {
    await adminDb.collection("marketplaces").doc(id).update({
      ...updates,
      updatedAt: new Date(),
    })
  },

  async delete(id: string): Promise<void> {
    await adminDb.collection("marketplaces").doc(id).delete()
  },
}

export const marketplaceEventsCollection = {
  async create(eventData: Omit<MarketplaceEvent, "id" | "createdAt">): Promise<string> {
    const doc = await adminDb.collection("marketplace_events").add({
      ...eventData,
      createdAt: new Date(),
    })
    return doc.id
  },

  async getById(id: string): Promise<MarketplaceEvent | null> {
    if (!id || id.trim() === "") {
      return null
    }
    const doc = await adminDb.collection("marketplace_events").doc(id).get()
    if (doc.exists) {
      return { ...doc.data(), id } as MarketplaceEvent
    }
    return null
  },

  async getByMarketplace(marketplaceId: string): Promise<MarketplaceEvent[]> {
    const snapshot = await adminDb.collection("marketplace_events")
      .where("marketplaceId", "==", marketplaceId)
      .orderBy("startDate", "asc")
      .get()
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }) as MarketplaceEvent)
  },

  async getUpcoming(marketplaceId: string): Promise<MarketplaceEvent[]> {
    const now = new Date()
    const snapshot = await adminDb.collection("marketplace_events")
      .where("marketplaceId", "==", marketplaceId)
      .where("status", "==", "upcoming")
      .where("startDate", ">", now)
      .orderBy("startDate", "asc")
      .get()
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }) as MarketplaceEvent)
  },

  async getActive(marketplaceId: string): Promise<MarketplaceEvent[]> {
    const now = new Date()
    const snapshot = await adminDb.collection("marketplace_events")
      .where("marketplaceId", "==", marketplaceId)
      .where("status", "==", "active")
      .where("startDate", "<=", now)
      .where("endDate", ">=", now)
      .orderBy("startDate", "asc")
      .get()
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }) as MarketplaceEvent)
  },

  async update(id: string, updates: Partial<MarketplaceEvent>): Promise<void> {
    await adminDb.collection("marketplace_events").doc(id).update({
      ...updates,
      updatedAt: new Date(),
    })
  },

  async delete(id: string): Promise<void> {
    await adminDb.collection("marketplace_events").doc(id).delete()
  },
}

export const marketplacePagesCollection = {
  async create(pageData: Omit<MarketplacePage, "id" | "createdAt">): Promise<string> {
    const doc = await adminDb.collection("marketplace_pages").add({
      ...pageData,
      createdAt: new Date(),
    })
    return doc.id
  },

  async getById(id: string): Promise<MarketplacePage | null> {
    if (!id || id.trim() === "") {
      return null
    }
    const doc = await adminDb.collection("marketplace_pages").doc(id).get()
    if (!doc.exists) return null
    return { id: doc.id, ...doc.data() } as MarketplacePage
  },

  async getByMarketplace(marketplaceId: string): Promise<MarketplacePage[]> {
    const snapshot = await adminDb
      .collection("marketplace_pages")
      .where("marketplaceId", "==", marketplaceId)
      .orderBy("order", "asc")
      .get()
    
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as MarketplacePage[]
  },

  async getByType(marketplaceId: string, type: string): Promise<MarketplacePage[]> {
    const snapshot = await adminDb
      .collection("marketplace_pages")
      .where("marketplaceId", "==", marketplaceId)
      .where("type", "==", type)
      .where("isActive", "==", true)
      .orderBy("order", "asc")
      .get()
    
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as MarketplacePage[]
  },

  async getBySlug(marketplaceId: string, slug: string): Promise<MarketplacePage | null> {
    const snapshot = await adminDb
      .collection("marketplace_pages")
      .where("marketplaceId", "==", marketplaceId)
      .where("slug", "==", slug)
      .where("isActive", "==", true)
      .limit(1)
      .get()
    
    if (snapshot.empty) return null
    const doc = snapshot.docs[0]
    return { id: doc.id, ...doc.data() } as MarketplacePage
  },

  async update(id: string, updates: Partial<MarketplacePage>): Promise<void> {
    await adminDb.collection("marketplace_pages").doc(id).update(updates)
  },

  async delete(id: string): Promise<void> {
    await adminDb.collection("marketplace_pages").doc(id).delete()
  },
}

export const marketplaceTemplatesCollection = {
  async create(templateData: Omit<MarketplaceTemplate, "id" | "createdAt">): Promise<string> {
    const doc = await adminDb.collection("marketplace_templates").add({
      ...templateData,
      createdAt: new Date(),
    })
    return doc.id
  },

  async getById(id: string): Promise<MarketplaceTemplate | null> {
    if (!id || id.trim() === "") {
      return null
    }
    const doc = await adminDb.collection("marketplace_templates").doc(id).get()
    if (!doc.exists) return null
    return { id: doc.id, ...doc.data() } as MarketplaceTemplate
  },

  async getAll(): Promise<MarketplaceTemplate[]> {
    const snapshot = await adminDb
      .collection("marketplace_templates")
      .where("isActive", "==", true)
      .orderBy("name", "asc")
      .get()
    
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as MarketplaceTemplate[]
  },

  async getByCategory(category: string): Promise<MarketplaceTemplate[]> {
    const snapshot = await adminDb
      .collection("marketplace_templates")
      .where("category", "==", category)
      .where("isActive", "==", true)
      .orderBy("name", "asc")
      .get()
    
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as MarketplaceTemplate[]
  },

  async update(id: string, updates: Partial<MarketplaceTemplate>): Promise<void> {
    await adminDb.collection("marketplace_templates").doc(id).update({
      ...updates,
      updatedAt: new Date(),
    })
  },

  async delete(id: string): Promise<void> {
    await adminDb.collection("marketplace_templates").doc(id).delete()
  },
}

export const transactionsCollection = {
  async create(transactionData: Omit<Transaction, "id" | "createdAt">): Promise<string> {
    const doc = await adminDb.collection("transactions").add({
      ...transactionData,
      createdAt: new Date(),
    })
    return doc.id
  },

  async getById(id: string): Promise<Transaction | null> {
    if (!id || id.trim() === "") {
      return null
    }
    const doc = await adminDb.collection("transactions").doc(id).get()
    if (!doc.exists) return null
    return { id: doc.id, ...doc.data() } as Transaction
  },

  async getByUser(userId: string): Promise<Transaction[]> {
    const snapshot = await adminDb
      .collection("transactions")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get()
    
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as Transaction[]
  },

  async getByMarketplace(marketplaceId: string): Promise<Transaction[]> {
    const snapshot = await adminDb
      .collection("transactions")
      .where("marketplaceId", "==", marketplaceId)
      .orderBy("createdAt", "desc")
      .get()
    
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as Transaction[]
  },

  async update(id: string, updates: Partial<Transaction>): Promise<void> {
    await adminDb.collection("transactions").doc(id).update({
      ...updates,
      updatedAt: new Date(),
    })
  },

  async delete(id: string): Promise<void> {
    await adminDb.collection("transactions").doc(id).delete()
  },
}

export const swapsCollection = {
  async create(swapData: Omit<Swap, "id" | "createdAt">): Promise<string> {
    const doc = await adminDb.collection("swaps").add({
      ...swapData,
      createdAt: new Date(),
    })
    return doc.id
  },

  async getById(id: string): Promise<Swap | null> {
    if (!id || id.trim() === "") {
      return null
    }
    const doc = await adminDb.collection("swaps").doc(id).get()
    if (!doc.exists) return null
    return { id: doc.id, ...doc.data() } as Swap
  },

  async getByProposer(proposerId: string): Promise<Swap[]> {
    const snapshot = await adminDb
      .collection("swaps")
      .where("proposerId", "==", proposerId)
      .orderBy("createdAt", "desc")
      .get()
    
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as Swap[]
  },

  async getByTargetNft(targetNftId: string): Promise<Swap[]> {
    const snapshot = await adminDb
      .collection("swaps")
      .where("targetNftId", "==", targetNftId)
      .orderBy("createdAt", "desc")
      .get()
    
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as Swap[]
  },

  async update(id: string, updates: Partial<Swap>): Promise<void> {
    await adminDb.collection("swaps").doc(id).update({
      ...updates,
      updatedAt: new Date(),
    })
  },

  async delete(id: string): Promise<void> {
    await adminDb.collection("swaps").doc(id).delete()
  },
}

export const purchasesCollection = {
  async create(purchaseData: Omit<Purchase, "id" | "createdAt">): Promise<string> {
    const doc = await adminDb.collection("purchases").add({
      ...purchaseData,
      createdAt: new Date(),
    })
    return doc.id
  },

  async getById(id: string): Promise<Purchase | null> {
    if (!id || id.trim() === "") {
      return null
    }
    const doc = await adminDb.collection("purchases").doc(id).get()
    if (doc.exists) {
      return { ...doc.data(), id } as Purchase
    }
    return null
  },

  async getByUser(userId: string): Promise<Purchase[]> {
    const snapshot = await adminDb.collection("purchases").where("userId", "==", userId).get()
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }) as Purchase)
  },

  async getByEvent(eventId: string): Promise<Purchase[]> {
    const snapshot = await adminDb.collection("purchases").where("eventId", "==", eventId).get()
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }) as Purchase)
  },

  async getAll(): Promise<Purchase[]> {
    const snapshot = await adminDb.collection("purchases").get()
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }) as Purchase)
  },

  async update(id: string, updates: Partial<Purchase>): Promise<void> {
    await adminDb.collection("purchases").doc(id).update(updates)
  },

  async delete(id: string): Promise<void> {
    await adminDb.collection("purchases").doc(id).delete()
  },
}

// FirebaseService class for API routes
export class FirebaseService {
  static async createUser(userData: Omit<User, "id" | "createdAt">): Promise<string> {
    return usersCollection.create(userData)
  }

  static async getUserById(id: string): Promise<User | null> {
    return usersCollection.getById(id)
  }

  static async getUserByEmail(email: string, role: string): Promise<User | Merchant |null> {
    if(role === "merchant"){
      return merchantsCollection.getByEmail(email)
    }
    return usersCollection.getByEmail(email)
  }

  static async getUserByAddress(address: string): Promise<User | null> {
    return usersCollection.getByAddress(address)
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<void> {
    return usersCollection.update(id, updates)
  }

  static async getMerchantByAddress(address: string): Promise<Merchant | null> {
    return merchantsCollection.getByAddress(address)
  }

  static async updateMerchantAddress(id: string, updates: Partial<Merchant>): Promise<void> {
    return merchantsCollection.update(id, updates)
  }

  static async getMerchants(): Promise<Merchant[]> {
    return merchantsCollection.getAll()
  }

  static async getApprovedMerchants(): Promise<User[]> {
    return merchantsCollection.getApproved()
  }

  static async getPendingMerchants(): Promise<User[]> {
    return merchantsCollection.getPending()
  }

  static async createMerchant(merchantData: Omit<Merchant, "id" | "createdAt" | "role">): Promise<string> {
    const merchantPayload = {
      ...merchantData,
      role: "merchant" as const,
      isApproved: false,
      status: "pending" as const,
      isVerified: false
    }
    return merchantsCollection.create(merchantPayload)
  }

  static async approveMerchant(id: string): Promise<void> {
    return merchantsCollection.update(id, {
      isApproved: true,
      status: "approved",
      isVerified: true,
      updatedAt: new Date()
    })
  }

  static async rejectMerchant(id: string): Promise<void> {
    return merchantsCollection.update(id, {
      isApproved: false,
      status: "rejected",
      updatedAt: new Date()
    })
  }

  static async createEvent(eventData: Omit<Event, "id" | "createdAt">): Promise<string> {
    return eventsCollection.create(eventData)
  }

  static async getEventById(id: string): Promise<Event | null> {
    return eventsCollection.getById(id)
  }

  static async getEventsByMerchant(merchantId: string): Promise<Event[]> {
    return eventsCollection.getByMerchant(merchantId)
  }

  static async getAllEvents(): Promise<Event[]> {
    return eventsCollection.getAll()
  }

  static async getPendingEvents(): Promise<Event[]> {
    return eventsCollection.getPending()
  }

  static async getApprovedEvents(): Promise<Event[]> {
    return eventsCollection.getApproved()
  }

  static async getRejectedEvents(): Promise<Event[]> {
    return eventsCollection.getRejected()
  }

  static async updateEvent(id: string, updates: Partial<Event>): Promise<void> {
    return eventsCollection.update(id, updates)
  }

  static async deleteEvent(id: string): Promise<void> {
    return eventsCollection.delete(id)
  }

  // Purchase methods
  static async createPurchase(purchaseData: Omit<Purchase, "id" | "createdAt">): Promise<string> {
    return purchasesCollection.create(purchaseData)
  }

  static async getPurchaseById(id: string): Promise<Purchase | null> {
    return purchasesCollection.getById(id)
  }

  static async getPurchasesByUser(userId: string): Promise<Purchase[]> {
    return purchasesCollection.getByUser(userId)
  }

  static async getPurchasesByEvent(eventId: string): Promise<Purchase[]> {
    return purchasesCollection.getByEvent(eventId)
  }

  static async updatePurchase(id: string, updates: Partial<Purchase>): Promise<void> {
    return purchasesCollection.update(id, updates)
  }

  static async createNFT(nftData: Omit<NFT, "id" | "createdAt">): Promise<string> {
    return nftsCollection.create(nftData)
  }

  static async getNFTById(id: string): Promise<NFT | null> {
    return nftsCollection.getById(id)
  }

  static async getNFTsByOwner(ownerId: string): Promise<NFT[]> {
    return nftsCollection.getByOwner(ownerId)
  }

  // Royalty calculation utilities
  static calculateRoyalty(salePrice: number, royaltyPercentage: number): number {
    return (salePrice * royaltyPercentage) / 100
  }

  static calculateSellerAmount(salePrice: number, royaltyPercentage: number): number {
    return salePrice - this.calculateRoyalty(salePrice, royaltyPercentage)
  }

  static async createTransaction(transactionData: Omit<Transaction, "id" | "createdAt">): Promise<string> {
    return transactionsCollection.create(transactionData)
  }

  static async updateNFT(id: string, updates: Partial<NFT>): Promise<void> {
    // Filter out undefined values to prevent Firestore errors
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    )
    return nftsCollection.update(id, filteredUpdates)
  }

  // Legacy merchant methods removed - use unified methods above

  // Additional methods for events
  static async getFeaturedEvents(limit = 10): Promise<Event[]> {
    const snapshot = await adminDb.collection("events").where("featured", "==", true).get()
    return snapshot.docs.slice(0, limit).map((doc: any) => ({ ...doc.data(), id: doc.id }) as Event)
  }

  static async getTrendingEvents(limit = 10): Promise<Event[]> {
    const snapshot = await adminDb.collection("events").where("trending", "==", true).get()
    return snapshot.docs.slice(0, limit).map((doc: any) => ({ ...doc.data(), id: doc.id }) as Event)
  }

  static async getMerchantByUid(uid: string): Promise<Merchant | null> {
    const snapshot = await adminDb.collection("merchants")
      .where("uid", "==", uid)
      .get()
    if (snapshot.exists) {
      return { ...snapshot.data(), id: snapshot.id } as Merchant
    }
    return null
  }

  static async getMerchantById(id: string): Promise<Merchant | null> {
    if (!id || id.trim() === "") {
      return null
    }
    const snapshot = await adminDb.collection("merchants")
      .doc(id)
      .get()
    if (snapshot.exists) {
      return { ...snapshot.data(), id: snapshot.id } as Merchant
    }
    return null
  }

  // Additional methods for NFTs
  static async getAllNFTs(): Promise<NFT[]> {
    const snapshot = await adminDb.collection("nfts").get()
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }) as NFT)
  }

  static async getNFTsByEvent(eventId: string): Promise<NFT[]> {
    const snapshot = await adminDb.collection("nfts").where("eventId", "==", eventId).get()
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }) as NFT)
  }

  static async getNFTsByMarketplace(marketplaceId: string): Promise<NFT[]> {
    const snapshot = await adminDb.collection("nfts").where("marketplaceId", "==", marketplaceId).get()
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }) as NFT)
  }

  static async getNFTsByCollection(collectionId: string): Promise<NFT[]> {
    const snapshot = await adminDb.collection("nfts").where("collectionId", "==", collectionId).get()
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }) as NFT)
  }

  static async getNFTsForSale(): Promise<NFT[]> {
    const snapshot = await adminDb.collection("nfts").where("listedForSale", "==", true).get()
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }) as NFT)
  }

  static async getUserByUid(uid: string): Promise<User | null> {
    const snapshot = await adminDb.collection("users").where("uid", "==", uid).get()
    if (snapshot.docs.length > 0) {
      const doc = snapshot.docs[0]
      return { ...doc.data(), id: doc.id } as User
    }
    return null
  }

  // Marketplace methods
  static async createMarketplace(marketplaceData: Omit<Marketplace, "id" | "createdAt">): Promise<string> {
    return marketplacesCollection.create(marketplaceData)
  }

  static async getMarketplaceById(id: string): Promise<Marketplace | null> {
    return marketplacesCollection.getById(id)
  }

  static async getMarketplacesByMerchant(merchantId: string): Promise<Marketplace[]> {
    return marketplacesCollection.getByMerchant(merchantId)
  }

  static async getPendingMarketplaces(): Promise<Marketplace[]> {
    return marketplacesCollection.getPending()
  }

  static async getApprovedMarketplaces(): Promise<Marketplace[]> {
    return marketplacesCollection.getApproved()
  }

  static async getAllMarketplaces(): Promise<Marketplace[]> {
    return marketplacesCollection.getAll()
  }

  static async updateMarketplace(id: string, updates: Partial<Marketplace>): Promise<void> {
    return marketplacesCollection.update(id, updates)
  }

  static async deleteMarketplace(id: string): Promise<void> {
    return marketplacesCollection.delete(id)
  }

  // Marketplace Pages methods
  static async createMarketplacePage(pageData: Omit<MarketplacePage, "id" | "createdAt">): Promise<string> {
    return marketplacePagesCollection.create(pageData)
  }

  static async getMarketplacePageById(id: string): Promise<MarketplacePage | null> {
    return marketplacePagesCollection.getById(id)
  }

  static async getMarketplacePages(marketplaceId: string): Promise<MarketplacePage[]> {
    return marketplacePagesCollection.getByMarketplace(marketplaceId)
  }

  static async getMarketplacePagesByType(marketplaceId: string, type: string): Promise<MarketplacePage[]> {
    return marketplacePagesCollection.getByType(marketplaceId, type)
  }

  static async getMarketplacePageBySlug(marketplaceId: string, slug: string): Promise<MarketplacePage | null> {
    return marketplacePagesCollection.getBySlug(marketplaceId, slug)
  }

  static async updateMarketplacePage(id: string, updates: Partial<MarketplacePage>): Promise<void> {
    return marketplacePagesCollection.update(id, updates)
  }

  static async deleteMarketplacePage(id: string): Promise<void> {
    return marketplacePagesCollection.delete(id)
  }

  // Marketplace Template methods
  static async createMarketplaceTemplate(templateData: Omit<MarketplaceTemplate, "id" | "createdAt">): Promise<string> {
    return marketplaceTemplatesCollection.create(templateData)
  }

  static async getMarketplaceTemplateById(id: string): Promise<MarketplaceTemplate | null> {
    return marketplaceTemplatesCollection.getById(id)
  }

  static async getAllMarketplaceTemplates(): Promise<MarketplaceTemplate[]> {
    return marketplaceTemplatesCollection.getAll()
  }

  static async getMarketplaceTemplatesByCategory(category: string): Promise<MarketplaceTemplate[]> {
    return marketplaceTemplatesCollection.getByCategory(category)
  }

  static async updateMarketplaceTemplate(id: string, updates: Partial<MarketplaceTemplate>): Promise<void> {
    return marketplaceTemplatesCollection.update(id, updates)
  }

  static async deleteMarketplaceTemplate(id: string): Promise<void> {
    return marketplaceTemplatesCollection.delete(id)
  }

  // Transaction methods
  static async getTransactionById(id: string): Promise<Transaction | null> {
    return transactionsCollection.getById(id)
  }

  static async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return transactionsCollection.getByUser(userId)
  }

  static async getTransactionsByMarketplace(marketplaceId: string): Promise<Transaction[]> {
    return transactionsCollection.getByMarketplace(marketplaceId)
  }

  static async updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
    return transactionsCollection.update(id, updates)
  }

  static async deleteTransaction(id: string): Promise<void> {
    return transactionsCollection.delete(id)
  }

  // Swap methods
  static async createSwap(swapData: Omit<Swap, "id" | "createdAt">): Promise<string> {
    return swapsCollection.create(swapData)
  }

  static async getSwapById(id: string): Promise<Swap | null> {
    return swapsCollection.getById(id)
  }

  static async getSwapsByProposer(proposerId: string): Promise<Swap[]> {
    return swapsCollection.getByProposer(proposerId)
  }

  static async getSwapsByTargetNft(targetNftId: string): Promise<Swap[]> {
    return swapsCollection.getByTargetNft(targetNftId)
  }

  static async updateSwap(id: string, updates: Partial<Swap>): Promise<void> {
    return swapsCollection.update(id, updates)
  }

  static async deleteSwap(id: string): Promise<void> {
    return swapsCollection.delete(id)
  }

  // Launchpad Project methods
  static async getLaunchpadProjectById(id: string): Promise<LaunchpadProject | null> {
    try {
      if (!id || id.trim() === "") {
        return null
      }
      const doc = await adminDb.collection('launchpadProjects').doc(id).get()
      if (!doc.exists) return null
      
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data()?.createdAt?.toDate() || new Date(),
        updatedAt: doc.data()?.updatedAt?.toDate()
      } as LaunchpadProject
    } catch (error) {
      console.error('Error fetching launchpad project:', error)
      return null
    }
  }

  static async getAllLaunchpadProjects(): Promise<LaunchpadProject[]> {
    try {
      const snapshot = await adminDb.collection('launchpadProjects')
        .orderBy('createdAt', 'desc')
        .get()
      
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as LaunchpadProject[]
    } catch (error) {
      console.error('Error fetching launchpad projects:', error)
      return []
    }
  }

  static async createLaunchpadProject(projectData: Omit<LaunchpadProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await adminDb.collection('launchpadProjects').add({
        ...projectData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating launchpad project:', error)
      throw error
    }
  }

  static async updateLaunchpadProject(id: string, updates: Partial<LaunchpadProject>): Promise<void> {
    try {
      await adminDb.collection('launchpadProjects').doc(id).update({
        ...updates,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating launchpad project:', error)
      throw error
    }
  }

  static async deleteLaunchpadProject(id: string): Promise<void> {
    try {
      await adminDb.collection('launchpadProjects').doc(id).delete()
    } catch (error) {
      console.error('Error deleting launchpad project:', error)
      throw error
    }
  }

  // Mint Phase methods
  static async getMintPhaseById(id: string): Promise<MintPhase | null> {
    try {
      if (!id || id.trim() === "") {
        return null
      }
      const doc = await adminDb.collection('mintPhases').doc(id).get()
      if (!doc.exists) return null
      
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data()?.createdAt?.toDate() || new Date(),
        updatedAt: doc.data()?.updatedAt?.toDate()
      } as MintPhase
    } catch (error) {
      console.error('Error fetching mint phase:', error)
      return null
    }
  }

  static async getMintPhasesByProject(projectId: string): Promise<MintPhase[]> {
    try {
      const snapshot = await adminDb.collection('mintPhases')
        .where('projectId', '==', projectId)
        .orderBy('startTime', 'asc')
        .get()
      
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as MintPhase[]
    } catch (error) {
      console.error('Error fetching mint phases:', error)
      return []
    }
  }

  static async updateMintPhase(id: string, updates: Partial<MintPhase>): Promise<void> {
    try {
      await adminDb.collection('mintPhases').doc(id).update({
        ...updates,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating mint phase:', error)
      throw error
    }
  }

  // Launchpad NFT methods
  static async getLaunchpadNFTsByProject(projectId: string): Promise<LaunchpadNFT[]> {
    try {
      const snapshot = await adminDb.collection('launchpadNFTs')
        .where('projectId', '==', projectId)
        .orderBy('mintedAt', 'desc')
        .get()
      
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        mintedAt: doc.data().mintedAt?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as LaunchpadNFT[]
    } catch (error) {
      console.error('Error fetching launchpad NFTs:', error)
      return []
    }
  }

  static async createLaunchpadNFT(nftData: Omit<LaunchpadNFT, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await adminDb.collection('launchpadNFTs').add({
        ...nftData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating launchpad NFT:', error)
      throw error
    }
  }

  // Activity methods
  static async getActivityByProject(projectId: string): Promise<ActivityItem[]> {
    try {
      const snapshot = await adminDb.collection('activity')
        .where('projectId', '==', projectId)
        .orderBy('timestamp', 'desc')
        .get()
      
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as ActivityItem[]
    } catch (error) {
      console.error('Error fetching activity:', error)
      return []
    }
  }

  static async createActivity(activityData: Omit<ActivityItem, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await adminDb.collection('activity').add({
        ...activityData,
        createdAt: new Date()
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating activity:', error)
      throw error
    }
  }

  // Support Ticket methods
  static async createSupportTicket(ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await adminDb.collection('supportTickets').add({
        ...ticketData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating support ticket:', error)
      throw error
    }
  }

  // Whitelist and Eligibility methods
  static async checkWhitelistEligibility(walletAddress: string, phaseId: string): Promise<boolean> {
    try {
      const phase = await this.getMintPhaseById(phaseId)
      if (!phase || !phase.isWhitelist || !phase.whitelistAddresses) return false
      
      return phase.whitelistAddresses.includes(walletAddress.toLowerCase())
    } catch (error) {
      console.error('Error checking whitelist eligibility:', error)
      return false
    }
  }

  static async getUserMintCount(walletAddress: string, phaseId: string): Promise<number> {
    try {
      const snapshot = await adminDb.collection('launchpadNFTs')
        .where('ownerAddress', '==', walletAddress.toLowerCase())
        .where('phaseId', '==', phaseId)
        .get()
      
      return snapshot.size
    } catch (error) {
      console.error('Error getting user mint count:', error)
      return 0
    }
  }

  // Mint Phase CRUD methods
  static async createMintPhase(phaseData: Omit<MintPhase, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await adminDb.collection('mintPhases').add({
        ...phaseData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating mint phase:', error)
      throw error
    }
  }

  static async deleteMintPhase(id: string): Promise<void> {
    try {
      await adminDb.collection('mintPhases').doc(id).delete()
    } catch (error) {
      console.error('Error deleting mint phase:', error)
      throw error
    }
  }

  // Product methods
  static async getProductById(id: string): Promise<Product | null> {
    try {
      if (!id || id.trim() === "") {
        return null
      }
      const doc = await adminDb.collection('products').doc(id).get()
      if (!doc.exists) return null
      
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data()?.createdAt?.toDate() || new Date(),
        updatedAt: doc.data()?.updatedAt?.toDate()
      } as Product
    } catch (error) {
      console.error('Error fetching product:', error)
      return null
    }
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    try {
      await adminDb.collection('products').doc(id).update({
        ...updates,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  }

  static async deleteProduct(id: string): Promise<void> {
    try {
      await adminDb.collection('products').doc(id).delete()
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  }

  // Collection methods
  static async createCollection(collectionData: Partial<Collection>): Promise<string> {
    try {
      const doc = await adminDb.collection('collections').add({
        ...collectionData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      return doc.id
    } catch (error) {
      console.error('Error creating collection:', error)
      throw error
    }
  }

  static async getCollectionById(id: string): Promise<Collection | null> {
    try {
      if (!id || id.trim() === "") {
        return null
      }
      const doc = await adminDb.collection('collections').doc(id).get()
      if (!doc.exists) return null
      
      const collectionData = doc.data()
      
      // Fetch NFTs for this collection
      const nftsSnapshot = await adminDb.collection('nfts')
        .where('collectionId', '==', id)
        .get()
      
      const nfts = nftsSnapshot.docs.map((nftDoc: any) => ({
        id: nftDoc.id,
        ...nftDoc.data(),
        createdAt: nftDoc.data()?.createdAt?.toDate() || new Date(),
        updatedAt: nftDoc.data()?.updatedAt?.toDate()
      }))
      
      return {
        id: doc.id,
        ...collectionData,
        createdAt: collectionData?.createdAt?.toDate() || new Date(),
        updatedAt: collectionData?.updatedAt?.toDate(),
        nfts,
        nftCount: nfts.length
      }
    } catch (error) {
      console.error('Error fetching collection:', error)
      return null
    }
  }

  static async getCollectionsByMarketplace(marketplaceId: string): Promise<Collection[]> {
    try {
      const snapshot = await adminDb.collection('collections')
        .where('marketplaceId', '==', marketplaceId)
        .orderBy('createdAt', 'desc')
        .get()
      
      const collections = await Promise.all(
        snapshot.docs.map(async (doc: any) => {
          const collectionData = doc.data()
          const collectionId = doc.id
          
          // Fetch NFTs for this collection
          const nftsSnapshot = await adminDb.collection('nfts')
            .where('collectionId', '==', collectionId)
            .get()
          
          const nfts = nftsSnapshot.docs.map((nftDoc: any) => ({
            id: nftDoc.id,
            ...nftDoc.data(),
            createdAt: nftDoc.data()?.createdAt?.toDate() || new Date(),
            updatedAt: nftDoc.data()?.updatedAt?.toDate()
          }))
          
          return {
            id: collectionId,
            ...collectionData,
            createdAt: collectionData?.createdAt?.toDate() || new Date(),
            updatedAt: collectionData?.updatedAt?.toDate(),
            nfts,
            nftCount: nfts.length
          }
        })
      )
      
      return collections
    } catch (error) {
      console.error('Error fetching collections:', error)
      return []
    }
  }

  static async updateCollection(collectionId: string, updateData: Partial<Collection>): Promise<void> {
    try {
      if (!collectionId || collectionId.trim() === "") {
        throw new Error("Collection ID is required")
      }

      await adminDb.collection('collections').doc(collectionId).update({
        ...updateData,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating collection:', error)
      throw error
    }
  }

  static async getUserMintsInCollection(collectionId: string, userAddress: string): Promise<any[]> {
    try {
      const snapshot = await adminDb.collection('nfts')
        .where('collectionId', '==', collectionId)
        .where('ownerAddress', '==', userAddress)
        .get()
      
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data()?.createdAt?.toDate() || new Date(),
        updatedAt: doc.data()?.updatedAt?.toDate(),
        mintedAt: doc.data()?.mintedAt?.toDate() || new Date()
      }))
    } catch (error) {
      console.error('Error fetching user mints:', error)
      return []
    }
  }
}

export const swapHistoryCollection = {
  async create(swapData: Omit<SwapHistory, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const doc = await adminDb.collection("swap_history").add({
      ...swapData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return doc.id
  },

  async getByUserAddress(userAddress: string): Promise<SwapHistory[]> {
    try {
      const snapshot = await adminDb
        .collection("swap_history")
        .where("userAddress", "==", userAddress)
        .orderBy("createdAt", "desc")
        .get()
      
      return snapshot.docs.map((doc: any) => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data()?.createdAt?.toDate() || new Date(),
        updatedAt: doc.data()?.updatedAt?.toDate(),
        confirmedAt: doc.data()?.confirmedAt?.toDate(),
      })) as SwapHistory[]
    } catch (error) {
      console.error('Error fetching swap history:', error)
      return []
    }
  },

  async getByMarketplace(marketplaceId: string): Promise<SwapHistory[]> {
    try {
      const snapshot = await adminDb
        .collection("swap_history")
        .where("marketplaceId", "==", marketplaceId)
        .orderBy("createdAt", "desc")
        .get()
      
      return snapshot.docs.map((doc: any) => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data()?.createdAt?.toDate() || new Date(),
        updatedAt: doc.data()?.updatedAt?.toDate(),
        confirmedAt: doc.data()?.confirmedAt?.toDate(),
      })) as SwapHistory[]
    } catch (error) {
      console.error('Error fetching marketplace swap history:', error)
      return []
    }
  },

  async updateStatus(id: string, status: SwapHistory['status'], confirmedAt?: Date): Promise<void> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    }
    
    if (confirmedAt) {
      updateData.confirmedAt = confirmedAt
    }
    
    await adminDb.collection("swap_history").doc(id).update(updateData)
  },

  async getById(id: string): Promise<SwapHistory | null> {
    try {
      const doc = await adminDb.collection("swap_history").doc(id).get()
      if (doc.exists) {
        const data = doc.data()
        return {
          ...data,
          id: doc.id,
          createdAt: data?.createdAt?.toDate() || new Date(),
          updatedAt: data?.updatedAt?.toDate(),
          confirmedAt: data?.confirmedAt?.toDate(),
        } as SwapHistory
      }
      return null
    } catch (error) {
      console.error('Error fetching swap history by ID:', error)
      return null
    }
  }
}
