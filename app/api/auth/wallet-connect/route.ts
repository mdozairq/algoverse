import { NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { signJWT } from "@/lib/auth/jwt"

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()

    if (!address) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    // Check if user exists with this address
    let user = await FirebaseService.getUserByAddress(address)
    
    if (!user) {
      // Create new user with wallet address
      const newUser = {
        walletAddress: address,
        role: "user" as const,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      const userId = await FirebaseService.createUser(newUser)
      if (!userId) {
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
      }
      user = { ...newUser, id: userId }
    } else {
      // Update existing user's wallet address if not already set
      if (!user.walletAddress) {
        await FirebaseService.updateUser(user.id, { 
          walletAddress: address,
          updatedAt: new Date()
        })
        user.walletAddress = address
      }
    }

    // Generate JWT token using the existing auth system
    const token = await signJWT({
      userId: user.id,
      email: user.email || '',
      role: user.role,
      walletAddress: user.address,
      isVerified: user.isVerified || false
    })

    // Set cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        walletAddress: user.walletAddress,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error: any) {
    console.error("Wallet connect error:", error)
    return NextResponse.json({ 
      error: "Failed to connect wallet",
      details: error.message 
    }, { status: 500 })
  }
}