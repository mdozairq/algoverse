// Mock Firestore collections for demo purposes
import { mockDb } from "./config"

export interface User {
  id: string
  email: string
  name?: string
  role: "user" | "merchant" | "admin"
  walletAddress?: string
  createdAt: Date
  isVerified?: boolean
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
  createdAt: Date
}

export interface NFT {
  id: string
  eventId: string
  ownerId: string
  tokenId: string
  metadata: Record<string, any>
  createdAt: Date
  isUsed?: boolean
}

export interface Merchant {
  id: string
  businessName: string
  email: string
  category: string
  description: string
  walletAddress: string
  isApproved: boolean
  createdAt: Date
}

// Mock collection services
export const usersCollection = {
  async create(userData: Omit<User, "id" | "createdAt">): Promise<string> {
    const doc = await mockDb.collection("users").add({
      ...userData,
      createdAt: new Date(),
    })
    return doc.id
  },

  async getById(id: string): Promise<User | null> {
    const doc = await mockDb.collection("users").doc(id).get()
    if (doc.exists) {
      return { id, ...doc.data() } as User
    }
    return null
  },

  async getByEmail(email: string): Promise<User | null> {
    const snapshot = await mockDb.collection("users").where("email", "==", email).get()
    if (snapshot.docs.length > 0) {
      const doc = snapshot.docs[0]
      return { id: doc.id, ...doc.data() } as User
    }
    return null
  },

  async update(id: string, updates: Partial<User>): Promise<void> {
    await mockDb.collection("users").doc(id).update(updates)
  },
}

export const eventsCollection = {
  async create(eventData: Omit<Event, "id" | "createdAt">): Promise<string> {
    const doc = await mockDb.collection("events").add({
      ...eventData,
      createdAt: new Date(),
    })
    return doc.id
  },

  async getById(id: string): Promise<Event | null> {
    const doc = await mockDb.collection("events").doc(id).get()
    if (doc.exists) {
      return { id, ...doc.data() } as Event
    }
    return null
  },

  async getByMerchant(merchantId: string): Promise<Event[]> {
    const snapshot = await mockDb.collection("events").where("merchantId", "==", merchantId).get()
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Event)
  },

  async getAll(): Promise<Event[]> {
    const snapshot = await mockDb.collection("events").where("availableSupply", ">", 0).get()
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Event)
  },

  async update(id: string, updates: Partial<Event>): Promise<void> {
    await mockDb.collection("events").doc(id).update(updates)
  },
}

export const nftsCollection = {
  async create(nftData: Omit<NFT, "id" | "createdAt">): Promise<string> {
    const doc = await mockDb.collection("nfts").add({
      ...nftData,
      createdAt: new Date(),
    })
    return doc.id
  },

  async getById(id: string): Promise<NFT | null> {
    const doc = await mockDb.collection("nfts").doc(id).get()
    if (doc.exists) {
      return { id, ...doc.data() } as NFT
    }
    return null
  },

  async getByOwner(ownerId: string): Promise<NFT[]> {
    const snapshot = await mockDb.collection("nfts").where("ownerId", "==", ownerId).get()
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as NFT)
  },

  async update(id: string, updates: Partial<NFT>): Promise<void> {
    await mockDb.collection("nfts").doc(id).update(updates)
  },
}

export const merchantsCollection = {
  async create(merchantData: Omit<Merchant, "id" | "createdAt">): Promise<string> {
    const doc = await mockDb.collection("merchants").add({
      ...merchantData,
      createdAt: new Date(),
      isApproved: false,
    })
    return doc.id
  },

  async getById(id: string): Promise<Merchant | null> {
    const doc = await mockDb.collection("merchants").doc(id).get()
    if (doc.exists) {
      return { id, ...doc.data() } as Merchant
    }
    return null
  },

  async getPending(): Promise<Merchant[]> {
    const snapshot = await mockDb.collection("merchants").where("isApproved", "==", false).get()
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Merchant)
  },

  async getApproved(): Promise<Merchant[]> {
    const snapshot = await mockDb.collection("merchants").where("isApproved", "==", true).get()
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Merchant)
  },

  async update(id: string, updates: Partial<Merchant>): Promise<void> {
    await mockDb.collection("merchants").doc(id).update(updates)
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

  static async updateEvent(id: string, updates: Partial<Event>): Promise<void> {
    return eventsCollection.update(id, updates)
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

  static async updateMerchant(id: string, updates: Partial<Merchant>): Promise<void> {
    return merchantsCollection.update(id, updates)
  }
}
