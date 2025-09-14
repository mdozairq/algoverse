import { cookies } from "next/headers"
import { verifyJWT, type JWTPayload } from "./jwt"

export async function getSession(): Promise<JWTPayload | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    console.log("Session check - has token:", !!token)
    if (!token) {
      console.log("No auth token found")
      return null
    }

    console.log("Verifying token:", token.substring(0, 20) + "...")
    const payload = await verifyJWT(token)
    console.log("Session verified for user:", payload.email, payload.role)
    return payload
  } catch (error) {
    console.error("Session verification failed:", error)
    return null
  }
}

export function setAuthCookie(token: string) {
  const cookieStore = cookies()
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

export function clearAuthCookie() {
  const cookieStore = cookies()
  cookieStore.delete("auth-token")
}
