"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"

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
  featured?: boolean
  trending?: boolean
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
  uid: string
}

export interface Analytics {
  totalUsers: number
  totalEvents: number
  totalNFTs: number
  totalMerchants: number
}

interface DataContextType {
  // Events data
  events: Event[]
  featuredEvents: Event[]
  trendingEvents: Event[]
  userEvents: Event[]

  // NFTs data
  nfts: NFT[]
  userNFTs: NFT[]

  // Merchants data
  merchants: Merchant[]
  pendingMerchants: Merchant[]

  // Analytics data
  analytics: Analytics | null

  // Loading states
  loading: {
    events: boolean
    nfts: boolean
    merchants: boolean
    analytics: boolean
  }

  // Refresh functions
  refreshEvents: () => Promise<void>
  refreshNFTs: () => Promise<void>
  refreshMerchants: () => Promise<void>
  refreshAnalytics: () => Promise<void>
  refreshAll: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()

  const [events, setEvents] = useState<Event[]>([])
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([])
  const [trendingEvents, setTrendingEvents] = useState<Event[]>([])
  const [userEvents, setUserEvents] = useState<Event[]>([])

  const [nfts, setNFTs] = useState<NFT[]>([])
  const [userNFTs, setUserNFTs] = useState<NFT[]>([])

  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [pendingMerchants, setPendingMerchants] = useState<Merchant[]>([])

  const [analytics, setAnalytics] = useState<Analytics | null>(null)

  const [loading, setLoading] = useState({
    events: true,
    nfts: true,
    merchants: true,
    analytics: true,
  })

  const refreshEvents = async () => {
    setLoading((prev) => ({ ...prev, events: true }))
    try {
      const [allEventsRes, featuredRes, trendingRes] = await Promise.all([
        fetch("/api/events"),
        fetch("/api/events?featured=true"),
        fetch("/api/events?trending=true"),
      ])

      if (allEventsRes.ok) {
        const allEventsData = await allEventsRes.json()
        setEvents(allEventsData.events || [])
      }

      if (featuredRes.ok) {
        const featuredData = await featuredRes.json()
        setFeaturedEvents(featuredData.events || [])
      }

      if (trendingRes.ok) {
        const trendingData = await trendingRes.json()
        setTrendingEvents(trendingData.events || [])
      }

      // Fetch user-specific events if authenticated and user is merchant
      if (isAuthenticated && user?.role === "merchant") {
        const userEventsRes = await fetch(`/api/events?merchantId=${user.userId}`)
        if (userEventsRes.ok) {
          const userEventsData = await userEventsRes.json()
          setUserEvents(userEventsData.events || [])
        }
      }
    } catch (error) {
      console.error("Failed to fetch events:", error)
    } finally {
      setLoading((prev) => ({ ...prev, events: false }))
    }
  }

  const refreshNFTs = async () => {
    setLoading((prev) => ({ ...prev, nfts: true }))
    try {
      // Fetch user NFTs if authenticated
      if (isAuthenticated && user?.userId) {
        const userNFTsRes = await fetch(`/api/nft?ownerId=${user.userId}`)
        if (userNFTsRes.ok) {
          const userNFTsData = await userNFTsRes.json()
          setUserNFTs(userNFTsData.nfts || [])
        }
      }

      // Fetch all NFTs for marketplace
      const allNFTsRes = await fetch("/api/nft")
      if (allNFTsRes.ok) {
        const allNFTsData = await allNFTsRes.json()
        setNFTs(allNFTsData.nfts || [])
      }
    } catch (error) {
      console.error("Failed to fetch NFTs:", error)
    } finally {
      setLoading((prev) => ({ ...prev, nfts: false }))
    }
  }

  const refreshMerchants = async () => {
    setLoading((prev) => ({ ...prev, merchants: true }))
    try {
      const [approvedRes, pendingRes] = await Promise.all([
        fetch("/api/merchants?approved=true"),
        fetch("/api/merchants?pending=true"),
      ])

      if (approvedRes.ok) {
        const approvedData = await approvedRes.json()
        setMerchants(approvedData.merchants || [])
      }

      if (pendingRes.ok) {
        const pendingData = await pendingRes.json()
        setPendingMerchants(pendingData.merchants || [])
      }
    } catch (error) {
      console.error("Failed to fetch merchants:", error)
    } finally {
      setLoading((prev) => ({ ...prev, merchants: false }))
    }
  }

  const refreshAnalytics = async () => {
    setLoading((prev) => ({ ...prev, analytics: true }))
    try {
      const analyticsRes = await fetch("/api/analytics")
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json()
        setAnalytics(analyticsData)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading((prev) => ({ ...prev, analytics: false }))
    }
  }

  const refreshAll = async () => {
    await Promise.all([refreshEvents(), refreshNFTs(), refreshMerchants(), refreshAnalytics()])
  }

  useEffect(() => {
    refreshAll()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      // Refetch user-specific data when auth state changes
      refreshEvents()
      refreshNFTs()
    }
  }, [isAuthenticated, user?.userId])

  const value: DataContextType = {
    events,
    featuredEvents,
    trendingEvents,
    userEvents,
    nfts,
    userNFTs,
    merchants,
    pendingMerchants,
    analytics,
    loading,
    refreshEvents,
    refreshNFTs,
    refreshMerchants,
    refreshAnalytics,
    refreshAll,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
