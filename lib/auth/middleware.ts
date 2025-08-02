import { type NextRequest, NextResponse } from "next/server"
import { verifyIdToken } from "@/lib/firebase/admin"

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    uid: string
    email: string
    role: string
  }
}

// Middleware to verify Firebase ID token
export const withAuth = (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
  return async (req: NextRequest) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.get("authorization")
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 })
      }

      const idToken = authHeader.split("Bearer ")[1]

      // Verify the token
      const decodedToken = await verifyIdToken(idToken)

      // Add user info to request
      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || "",
        role: decodedToken.role || "user",
      }

      return handler(authenticatedReq)
    } catch (error) {
      console.error("Authentication error:", error)
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }
  }
}

// Role-based access control
export const withRole = (requiredRoles: string[], handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
  return withAuth(async (req: AuthenticatedRequest) => {
    const userRole = req.user?.role || "user"

    if (!requiredRoles.includes(userRole)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    return handler(req)
  })
}

// Admin-only middleware
export const withAdmin = (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
  return withRole(["admin"], handler)
}

// Merchant or admin middleware
export const withMerchantOrAdmin = (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
  return withRole(["merchant", "admin"], handler)
}

// Rate limiting middleware
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export const withRateLimit = (
  maxRequests: number,
  windowMs: number,
  handler: (req: NextRequest) => Promise<NextResponse>,
) => {
  return async (req: NextRequest) => {
    const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown"
    const now = Date.now()
    const windowStart = now - windowMs

    // Clean up old entries
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < now) {
        rateLimitMap.delete(key)
      }
    }

    // Get current rate limit info
    const current = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs }

    // Reset if window has passed
    if (current.resetTime < now) {
      current.count = 0
      current.resetTime = now + windowMs
    }

    // Check if limit exceeded
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

    // Increment counter
    current.count++
    rateLimitMap.set(ip, current)

    // Add rate limit headers
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

    // Handle preflight requests
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

    // Handle actual requests
    const response = await handler(req)

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin)
    }

    return response
  }
}

// Input validation middleware
export const withValidation = <T>(
  schema: (data: any) => T,
  handler: (req: NextRequest, validatedData: T) => Promise<NextResponse>
) => {
  return async (req: NextRequest) => {
    try {
      const body = await req.json()
      const validatedData = schema(body)
      return handler(req, validatedData)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error },
        { status: 400 }
      )
    }
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
  (handler: any) => withRateLimit(100, 60000, handler), // 100 requests per minute
  (handler: any) => withCORS(['http://localhost:3000', 'https://eventnft.app'], handler)
)

export const protectedApiMiddleware = combineMiddleware(
  withLogging,
  (handler: any) => withRateLimit(50, 60000, handler), // 50 requests per minute for authenticated routes
  withAuth
)

export const adminApiMiddleware = combineMiddleware(
  withLogging,
  (handler: any) => withRateLimit(200, 60000, handler), // Higher limit for admin
  withAdmin
)

export async function verifyAuthToken(request: NextRequest): Promise<{ uid: string; role: string } | null> {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return null
    }

    const decodedToken = await adminAuth.verifyIdToken(token)

    // Get user role from custom claims or database
    const userRole = decodedToken.role || "user"

    return {
      uid: decodedToken.uid,
      role: userRole,
    }
  } catch (error) {
    console.error("Error verifying auth token:", error)
    return null
  }
}

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
