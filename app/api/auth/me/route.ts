import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: session,
    })
  } catch (error: any) {
    console.error("Session check error:", error)
    return NextResponse.json({ error: "Session verification failed" }, { status: 500 })
  }
}
