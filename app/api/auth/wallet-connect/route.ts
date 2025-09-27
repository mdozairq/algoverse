import { NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"

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
        address,
        role: "user" as const,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      user = await FirebaseService.createUser(newUser)
    }

    // Generate JWT token
    const token = await generateAuthToken(user.id, user.role)

    // Set cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        address: user.address,
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

async function generateAuthToken(userId: string, role: string): Promise<string> {
  // This would typically use a JWT library
  // For now, return a simple token
  return Buffer.from(`${userId}:${role}:${Date.now()}`).toString('base64')
}