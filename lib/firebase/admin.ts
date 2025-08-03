import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

// Mock Firebase Admin for build process
const createMockFirebaseAdmin = () => {
  return {
    auth: () => ({
      verifyIdToken: async () => ({ uid: "mock-uid", email: "mock@example.com" }),
      createCustomToken: async () => "mock-token",
      createUser: async () => ({ uid: "mock-uid" }),
      getUserByEmail: async () => ({ uid: "mock-uid", email: "mock@example.com" }),
      setCustomUserClaims: async () => {},
    }),
    firestore: () => ({
      collection: () => ({
        doc: () => ({
          set: async () => {},
          update: async () => {},
          get: async () => ({ exists: false, data: () => null }),
        }),
        add: async () => ({ id: "mock-id" }),
        where: () => ({
          get: async () => ({ docs: [] }),
          count: () => ({ get: async () => ({ data: () => ({ count: 0 }) }) }),
        }),
        count: () => ({ get: async () => ({ data: () => ({ count: 0 }) }) }),
      }),
    }),
  }
}

// Initialize Firebase Admin only if environment variables are properly set
let app
let adminDb : any
let adminAuth : any

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    const firebaseAdminConfig = {
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    }
    app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0]
    adminDb = getFirestore(app)
    adminAuth = getAuth(app)
  } catch (error) {
    console.warn("Firebase Admin initialization failed, using mock:", error)
    const mock = createMockFirebaseAdmin()
    adminDb = mock.firestore()
    adminAuth = mock.auth()
  }
} else {
  console.warn("Firebase environment variables not set, using mock configuration")
  const mock = createMockFirebaseAdmin()
  adminDb = mock.firestore()
  adminAuth = mock.auth()
}

export { adminDb, adminAuth }

// Helper functions for common operations
export const verifyIdToken = async (idToken: string) => {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    return decodedToken
  } catch (error) {
    console.error("Error verifying ID token:", error)
    throw error
  }
}

export const createCustomToken = async (uid: string, additionalClaims?: object) => {
  try {
    const customToken = await adminAuth.createCustomToken(uid, additionalClaims)
    return customToken
  } catch (error) {
    console.error("Error creating custom token:", error)
    throw error
  }
}

// User management functions
export const createUser = async (userData: {
  email: string
  password: string
  displayName?: string
  role?: string
}) => {
  try {
    const userRecord = await adminAuth.createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.displayName,
    })

    // Add user data to Firestore
    await adminDb
      .collection("users")
      .doc(userRecord.uid)
      .set({
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role || "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      })

    return userRecord
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export const getUserByEmail = async (email: string) => {
  try {
    const userRecord = await adminAuth.getUserByEmail(email)
    return userRecord
  } catch (error) {
    console.error("Error getting user by email:", error)
    throw error
  }
}

export const updateUserRole = async (uid: string, role: string) => {
  try {
    // Update custom claims
    await adminAuth.setCustomUserClaims(uid, { role })

    // Update Firestore document
    await adminDb.collection("users").doc(uid).update({
      role,
      updatedAt: new Date(),
    })

    return true
  } catch (error) {
    console.error("Error updating user role:", error)
    throw error
  }
}

// NFT and Event management functions
export const createEvent = async (eventData: {
  title: string
  description: string
  date: string
  location: string
  merchantId: string
  price: number
  totalSupply: number
}) => {
  try {
    const eventRef = await adminDb.collection("events").add({
      ...eventData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "pending", // pending, approved, rejected
    })

    return eventRef.id
  } catch (error) {
    console.error("Error creating event:", error)
    throw error
  }
}

export const approveEvent = async (eventId: string, adminId: string) => {
  try {
    await adminDb.collection("events").doc(eventId).update({
      status: "approved",
      approvedBy: adminId,
      approvedAt: new Date(),
      updatedAt: new Date(),
    })

    return true
  } catch (error) {
    console.error("Error approving event:", error)
    throw error
  }
}

export const rejectEvent = async (eventId: string, adminId: string, reason?: string) => {
  try {
    await adminDb.collection("events").doc(eventId).update({
      status: "rejected",
      rejectedBy: adminId,
      rejectedAt: new Date(),
      rejectionReason: reason,
      updatedAt: new Date(),
    })

    return true
  } catch (error) {
    console.error("Error rejecting event:", error)
    throw error
  }
}

export const createNFT = async (nftData: {
  eventId: string
  tokenId: string
  metadata: object
  price: number
  merchantId: string
}) => {
  try {
    const nftRef = await adminDb.collection("nfts").add({
      ...nftData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "active",
      sold: false,
    })

    return nftRef.id
  } catch (error) {
    console.error("Error creating NFT:", error)
    throw error
  }
}

// Analytics functions
export const getMarketplaceStats = async () => {
  try {
    const [usersSnapshot, eventsSnapshot, nftsSnapshot] = await Promise.all([
      adminDb.collection("users").count().get(),
      adminDb.collection("events").count().get(),
      adminDb.collection("nfts").count().get(),
    ])

    return {
      totalUsers: usersSnapshot.data().count,
      totalEvents: eventsSnapshot.data().count,
      totalNFTs: nftsSnapshot.data().count,
    }
  } catch (error) {
    console.error("Error getting marketplace stats:", error)
    throw error
  }
}

export const getMerchantStats = async (merchantId: string) => {
  try {
    const [eventsSnapshot, nftsSnapshot] = await Promise.all([
      adminDb.collection("events").where("merchantId", "==", merchantId).count().get(),
      adminDb.collection("nfts").where("merchantId", "==", merchantId).count().get(),
    ])

    return {
      totalEvents: eventsSnapshot.data().count,
      totalNFTs: nftsSnapshot.data().count,
    }
  } catch (error) {
    console.error("Error getting merchant stats:", error)
    throw error
  }
}

export default app
