import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/lib/auth/jwt"

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string
    email: string
    role: string
    walletAddress?: string
    isVerified: boolean
  }
}

// Verify auth token utility
export async function verifyAuthToken(
  request: NextRequest,
): Promise<{ userId: string; role: string; email: string } | null> {
  try {
    let token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      token = request.cookies.get("auth-token")?.value
    }

    if (!token) {
      return null
    }

    const payload = await verifyJWT(token)

    return {
      userId: payload.userId,
      role: payload.role,
      email: payload.email,
    }
  } catch (error) {
    console.error("Error verifying auth token:", error)
    return null
  }
}

// Basic auth middleware
export function requireAuth(handler: Function, requiredRole?: string) {
  return async (request: NextRequest) => {
    const auth = await verifyAuthToken(request)

    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (requiredRole && auth.role !== requiredRole && auth.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    // Add auth info to request
    ;(request as any).auth = auth

    return handler(request)
  }
}

// Role-based middleware - this is the main export that's being imported
export function requireRole(roles: string[]) {
  return (handler: Function) => {
    return async (request: NextRequest) => {
      const auth = await verifyAuthToken(request)

      if (!auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      if (!roles.includes(auth.role) && auth.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      ;(request as any).auth = auth

      return handler(request)
    }
  }
}

// Advanced middleware functions
export const withAuth = (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
  return async (req: NextRequest) => {
    try {
      let token = req.headers.get("authorization")?.replace("Bearer ", "")

      if (!token) {
        token = req.cookies.get("auth-token")?.value
      }

      if (!token) {
        return NextResponse.json({ error: "Missing authentication token" }, { status: 401 })
      }

      const payload = await verifyJWT(token)

      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        walletAddress: payload.walletAddress,
        isVerified: payload.isVerified,
      }

      return handler(authenticatedReq)
    } catch (error) {
      console.error("Authentication error:", error)
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }
  }
}

export const withRole = (requiredRoles: string[], handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
  return withAuth(async (req: AuthenticatedRequest) => {
    const userRole = req.user?.role || "user"

    if (!requiredRoles.includes(userRole)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    return handler(req)
  })
}

export const withAdmin = (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
  return withRole(["admin"], handler)
}

export const withMerchantOrAdmin = (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
  return withRole(["merchant", "admin"], handler)
}

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export const withRateLimit = (
  maxRequests: number,
  windowMs: number,
  handler: (req: NextRequest) => Promise<NextResponse>,
) => {
  return async (req: NextRequest) => {
    const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown"
    const now = Date.now()

    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < now) {
        rateLimitMap.delete(key)
      }
    }

    const current = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs }

    if (current.resetTime < now) {
      current.count = 0
      current.resetTime = now + windowMs
    }

    if (current.count >= maxRequests) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": current.resetTime.toString(),
          },
        },
      )
    }

    current.count++
    rateLimitMap.set(ip, current)

    const response = await handler(req)
    response.headers.set("X-RateLimit-Limit", maxRequests.toString())
    response.headers.set("X-RateLimit-Remaining", (maxRequests - current.count).toString())
    response.headers.set("X-RateLimit-Reset", current.resetTime.toString())

    return response
  }
}

// CORS middleware
export const withCORS = (
  allowedOrigins: string[] = ["http://localhost:3000"],
  handler: (req: NextRequest) => Promise<NextResponse>,
) => {
  return async (req: NextRequest) => {
    const origin = req.headers.get("origin")

    if (req.method === "OPTIONS") {
      const response = new NextResponse(null, { status: 200 })

      if (origin && allowedOrigins.includes(origin)) {
        response.headers.set("Access-Control-Allow-Origin", origin)
      }

      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
      response.headers.set("Access-Control-Max-Age", "86400")

      return response
    }

    const response = await handler(req)

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin)
    }

    return response
  }
}

// Logging middleware
export const withLogging = (handler: (req: NextRequest) => Promise<NextResponse>) => {
  return async (req: NextRequest) => {
    const start = Date.now()
    const method = req.method
    const url = req.url

    console.log(`[${new Date().toISOString()}] ${method} ${url} - Started`)

    try {
      const response = await handler(req)
      const duration = Date.now() - start
      const status = response.status

      console.log(`[${new Date().toISOString()}] ${method} ${url} - ${status} (${duration}ms)`)

      return response
    } catch (error) {
      const duration = Date.now() - start
      console.error(`[${new Date().toISOString()}] ${method} ${url} - Error (${duration}ms):`, error)
      throw error
    }
  }
}

// Combine multiple middlewares
export const combineMiddleware = (...middlewares: Array<(handler: any) => any>) => {
  return (handler: any) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler)
  }
}

// Common middleware combinations
export const apiMiddleware = combineMiddleware(
  withLogging,
  (handler: any) => withRateLimit(100, 60000, handler),
  (handler: any) => withCORS(["http://localhost:3000", "https://eventnft.app"], handler),
)

export const protectedApiMiddleware = combineMiddleware(
  withLogging,
  (handler: any) => withRateLimit(50, 60000, handler),
  withAuth,
)

export const adminApiMiddleware = combineMiddleware(
  withLogging,
  (handler: any) => withRateLimit(200, 60000, handler),
  withAdmin,
)
