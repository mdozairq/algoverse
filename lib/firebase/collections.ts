// Firestore collections using real Firebase Admin SDK
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
}

export interface Event {
  id: string
  title: string
  description: string
  price: string
  merchantId: string
  category: string
  date: string
  location: string
  imageUrl?: string
  totalSupply: number
  availableSupply: number
  status?: "draft" | "pending" | "approved" | "rejected"
  createdAt: Date
  updatedAt?: Date
  featured?: boolean
  trending?: boolean
  nftAssetId?: number
  nftCreated?: boolean
  nftCreatedAt?: Date
  nftUnitName?: string
  nftAssetName?: string
  nftUrl?: string
  royaltyPercentage?: number
}

export interface NFT {
  id: string
  eventId: string
  ownerId: string
  tokenId: string
  assetId?: number
  creatorId?: string
  price?: number
  metadata: Record<string, any>
  createdAt: Date
  isUsed?: boolean
  listedForSale?: boolean
}

export interface Merchant {
  id: string
  businessName: string
  email: string
  category: string
  description: string
  walletAddress: string
  isApproved: boolean
  status?: "pending" | "approved" | "rejected"
  createdAt: Date
  uid: string
  updatedAt?: Date
}

export interface Marketplace {
  id: string
  merchantId: string
  businessName: string
  description: string
  category: string
  website?: string
  logo?: string
  banner?: string
  template: string
  primaryColor: string
  secondaryColor: string
  paymentMethod: string
  walletAddress: string
  status: "draft" | "pending" | "approved" | "rejected"
  createdAt: Date
  updatedAt?: Date
  // Enhanced marketplace features
  configuration?: MarketplaceConfiguration
  analytics?: MarketplaceAnalytics
  customDomain?: string
  isActive: boolean
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
    const snapshot = await adminDb.collection("users").where("address", "==", address).get()
    if (snapshot.docs.length > 0) {
      const doc = snapshot.docs[0]
      return { ...doc.data(), id: doc.id } as User
    }
    return null
  },

  async update(id: string, updates: Partial<User>): Promise<void> {
    await adminDb.collection("users").doc(id).update(updates)
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

// FirebaseService class for API routes
export class FirebaseService {
  static async createUser(userData: Omit<User, "id" | "createdAt">): Promise<string> {
    return usersCollection.create(userData)
  }

  static async getUserById(id: string): Promise<User | null> {
    return usersCollection.getById(id)
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    return usersCollection.getByEmail(email)
  }

  static async getUserByAddress(address: string): Promise<User | null> {
    return usersCollection.getByAddress(address)
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<void> {
    return usersCollection.update(id, updates)
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

  static async createNFT(nftData: Omit<NFT, "id" | "createdAt">): Promise<string> {
    return nftsCollection.create(nftData)
  }

  static async getNFTById(id: string): Promise<NFT | null> {
    return nftsCollection.getById(id)
  }

  static async getNFTsByOwner(ownerId: string): Promise<NFT[]> {
    return nftsCollection.getByOwner(ownerId)
  }

  static async updateNFT(id: string, updates: Partial<NFT>): Promise<void> {
    return nftsCollection.update(id, updates)
  }

  static async createMerchant(merchantData: Omit<Merchant, "id" | "createdAt">): Promise<string> {
    return merchantsCollection.create(merchantData)
  }

  static async getMerchantById(id: string): Promise<Merchant | null> {
    return merchantsCollection.getById(id)
  }

  static async getPendingMerchants(): Promise<Merchant[]> {
    return merchantsCollection.getPending()
  }

  static async getApprovedMerchants(): Promise<Merchant[]> {
    return merchantsCollection.getApproved()
  }

  static async getAllMerchants(): Promise<Merchant[]> {
    return merchantsCollection.getAll()
  }

  static async updateMerchant(id: string, updates: Partial<Merchant>): Promise<void> {
    return merchantsCollection.update(id, updates)
  }

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
    const snapshot = await adminDb.collection("merchants").where("uid", "==", uid).get()
    if (snapshot.docs.length > 0) {
      const doc = snapshot.docs[0]
      return { ...doc.data(), id: doc.id } as Merchant
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
}
