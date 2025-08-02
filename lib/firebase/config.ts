// Mock Firebase configuration for demo purposes
// This eliminates the Firebase component registration error

interface MockFirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

// Mock configuration - replace with real values when Firebase is set up
const firebaseConfig: MockFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
}

// Mock Firebase services for demo
export const mockAuth = {
  currentUser: null,
  signInWithEmailAndPassword: async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return { user: { uid: "mock-uid", email } }
  },
  createUserWithEmailAndPassword: async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return { user: { uid: "mock-uid", email } }
  },
  signOut: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500))
  },
}

export const mockDb = {
  collection: (name: string) => ({
    doc: (id: string) => ({
      set: async (data: any) => {
        console.log(`Mock: Setting document ${id} in ${name}:`, data)
        await new Promise((resolve) => setTimeout(resolve, 500))
      },
      get: async () => {
        await new Promise((resolve) => setTimeout(resolve, 500))
        return {
          exists: true,
          data: () => ({ id, ...(mockData[name]?.[id] || {}) }),
        }
      },
      update: async (data: any) => {
        console.log(`Mock: Updating document ${id} in ${name}:`, data)
        await new Promise((resolve) => setTimeout(resolve, 500))
      },
    }),
    add: async (data: any) => {
      console.log(`Mock: Adding document to ${name}:`, data)
      await new Promise((resolve) => setTimeout(resolve, 500))
      return { id: `mock-${Date.now()}` }
    },
    where: (field: string, operator: string, value: any) => ({
      get: async () => {
        await new Promise((resolve) => setTimeout(resolve, 500))
        return {
          docs: Object.entries(mockData[name] || {}).map(([id, data]) => ({
            id,
            data: () => data,
          })),
        }
      },
    }),
  }),
}

// Mock data for demo
const mockData: Record<string, Record<string, any>> = {
  users: {
    user1: { name: "John Doe", email: "john@example.com", role: "user" },
    user2: { name: "Jane Smith", email: "jane@example.com", role: "merchant" },
  },
  events: {
    event1: { title: "Summer Festival", price: "0.5 ALGO", category: "concerts" },
    event2: { title: "Tech Conference", price: "1.2 ALGO", category: "conferences" },
  },
  nfts: {
    nft1: { title: "VIP Pass", eventId: "event1", owner: "user1" },
    nft2: { title: "Premium Ticket", eventId: "event2", owner: "user2" },
  },
}

export { firebaseConfig }
export default firebaseConfig
