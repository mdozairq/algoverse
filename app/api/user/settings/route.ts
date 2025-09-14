import { type NextResponse } from "next/server"
import { withAuth, type AuthenticatedRequest } from "@/lib/auth/middleware"
import { FirebaseService } from "@/lib/firebase/collections"

export const GET = withAuth(async (req: AuthenticatedRequest): Promise<NextResponse> => {
  try {
    const userId = req.user!.userId
    const user = await FirebaseService.getUserById(userId)
    
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 }) as unknown as NextResponse
    }

    // Return user settings/preferences
    const settings = {
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      privacy: {
        profileVisible: true,
        activityVisible: false
      },
      preferences: {
        theme: "system",
        language: "en",
        currency: "ALGO"
      }
    }

    return new Response(JSON.stringify({ settings, user }), { status: 200 }) as unknown as NextResponse
  } catch (error) {
    console.error("User settings fetch error:", error)
    return new Response(JSON.stringify({ error: "Failed to fetch settings" }), { status: 500 }) as unknown as NextResponse
  }
})

export const POST = withAuth(async (req: AuthenticatedRequest): Promise<NextResponse> => {
  try {
    const userId = req.user!.userId
    const body = await (req as any).json()
    
    const { notifications, privacy, preferences } = body
    
    // In a real app, you'd save these settings to a user_settings collection
    // For now, just return success
    const settings = {
      notifications: notifications || {},
      privacy: privacy || {},
      preferences: preferences || {}
    }
    
    return new Response(JSON.stringify({ success: true, settings }), { status: 200 }) as unknown as NextResponse
  } catch (error) {
    console.error("User settings update error:", error)
    return new Response(JSON.stringify({ error: "Failed to update settings" }), { status: 500 }) as unknown as NextResponse
  }
})
