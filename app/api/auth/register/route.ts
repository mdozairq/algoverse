import { type NextRequest, NextResponse } from "next/server"
import { FirebaseService } from "@/lib/firebase/collections"
import { hashPassword } from "@/lib/auth/password"

export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName, role, walletAddress, businessName, category, description } =
      await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    const existingUser = await FirebaseService.getUserByEmail(email, role)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)
    const userId = `${role || "user"}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    if (role === "merchant") {
      await FirebaseService.createMerchant({
        businessName: businessName || displayName,
        email,
        description: description || "",
        category: Array.isArray(category) ? category[0] : category || "Other",
        walletAddress: walletAddress || "",
        isApproved: false,
        isVerified: false,
        uid: userId,
        name: displayName || "",
        password: hashedPassword,
      })
    } else{
      await FirebaseService.createUser({
        email,
        password: hashedPassword,
        name: displayName || "",
        role: role || "user",
        walletAddress: walletAddress || "",
        isVerified: false,
        uid: userId,
      })
    }
    
    return NextResponse.json({
      success: true,
      message:
        role === "merchant"
          ? "Merchant application submitted successfully. You'll receive an email once approved."
          : "User account created successfully.",
      user: {
        uid: userId,
        email,
        displayName,
        role: role || "user",
      },
    })
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
