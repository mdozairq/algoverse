import { SignJWT, jwtVerify, type JWTPayload as JoseJWTPayload } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")

export interface JWTPayload {
  userId: string
  email: string
  role: "user" | "merchant" | "admin"
  walletAddress?: string
  isVerified: boolean
  uid?: string
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload as unknown as JoseJWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret)
}

export async function verifyJWT(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as JWTPayload
  } catch (error) {
    console.error("JWT verification failed:", error)
    throw error
  }
}
