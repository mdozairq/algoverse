import { type NextRequest, NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebase/admin"
import { FirebaseService } from "@/lib/firebase/collections"

export async function POST(request: NextRequest) {
  try {
    const { email, password, role, adminKey } = await request.json()

    // Verify admin key if admin login
    if (role === "admin") {
      const expectedAdminKey = process.env.ADMIN_MASTER_KEY || "admin123"
      if (adminKey !== expectedAdminKey) {
        return NextResponse.json({ error: "Invalid admin master key" }, { status: 401 })
      }
    }

    // For demo purposes, we'll simulate authentication by checking Firestore directly
    // In production, you would use Firebase Auth for actual authentication
    let userData = null
    
    if (role === "merchant") {
      // Try to find merchant by email in both collections
      userData = await FirebaseService.getUserByEmail(email)
      if (!userData) {
        // If not found in users, try merchants collection
        const merchants = await FirebaseService.getApprovedMerchants()
        userData = merchants.find(m => m.email === email)
      }
    } else {
      userData = await FirebaseService.getUserByEmail(email)
    }

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if merchant is approved (for merchant login)
    if (role === "merchant" && !(userData as any).isApproved) {
      return NextResponse.json({ error: "Merchant account not yet approved" }, { status: 403 })
    }

    // Simulate password verification (in production, use Firebase Auth)
    const expectedPasswords: Record<string, string> = {
      "admin@eventnft.app": "Admin123!",
      "merchant@eventnft.app": "Merchant123!",
      "user@eventnft.app": "User123!"
    }

    if (expectedPasswords[email] !== password) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: {
        ...userData,
        uid: userData.id || email,
        email: (userData as any)?.email,
        displayName: (userData as any)?.displayName || (userData as any)?.businessName || (userData as any)?.name,
        role: (userData as any).role,
        walletAddress: userData.walletAddress,
        isVerified: (userData as any).isVerified || (userData as any).isApproved || (userData as any).role === "admin",
      },
    })
  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json({ error: error.message || "Login failed" }, { status: 400 })
  }
} 