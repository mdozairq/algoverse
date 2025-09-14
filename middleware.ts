import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/lib/auth/jwt"

export async function middleware(request: NextRequest) {
  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const response = NextResponse.next()
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    return response
  }

  const { pathname } = request.nextUrl
  const token = request.cookies.get("auth-token")?.value

  const protectedRoutes = ["/dashboard", "/admin", "/merchant", "/user/dashboard", "/insights", "/marketplace"]
  const authRoutes = ["/auth"]

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  let user = null
  if (token) {
    try {
      const payload = await verifyJWT(token)
      user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        walletAddress: payload.walletAddress,
        isVerified: payload.isVerified,
      }
    } catch (error) {
      // Invalid token, clear it and redirect to auth
      const response = NextResponse.redirect(new URL("/auth/user", request.url))
      response.cookies.delete("auth-token")
      return response
    }
  }

  // Redirect authenticated users away from auth routes to their dashboard
  if (user && isAuthRoute) {
    // If user is accessing a different role's auth page, logout first
    const currentAuthRole = pathname.includes('/admin') ? 'admin' : 
                           pathname.includes('/merchant') ? 'merchant' : 'user'
    
    if (user.role !== currentAuthRole) {
      // Clear the token and allow access to different auth page
      const response = NextResponse.next()
      response.cookies.delete("auth-token")
      return response
    }
    
    return NextResponse.redirect(new URL(`/dashboard/${user.role}`, request.url))
  }

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !user) {
    if (pathname.startsWith("/dashboard/admin") || pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/auth/admin", request.url))
    } else if (pathname.startsWith("/dashboard/merchant") || pathname.startsWith("/merchant")) {
      return NextResponse.redirect(new URL("/auth/merchant/signin", request.url))
    } else {
      return NextResponse.redirect(new URL("/auth/user", request.url))
    }
  }

  if (isProtectedRoute && user) {
    // Define role-specific route patterns
    const roleRouteMap = {
      admin: ["/dashboard/admin", "/admin", "/insights"],
      merchant: ["/dashboard/merchant", "/merchant"],
      user: ["/dashboard/user", "/user/dashboard"],
    }

    // Public routes accessible by all authenticated users
    const publicAuthRoutes = ["/marketplace", "/events", "/nft"]

    // Check if user is trying to access routes for their role
    const userRoleRoutes = roleRouteMap[user.role as keyof typeof roleRouteMap] || []
    const hasAccessToCurrentRoute =
      userRoleRoutes.some((route) => pathname.startsWith(route)) || 
      pathname === "/dashboard" ||
      publicAuthRoutes.some((route) => pathname.startsWith(route))

    // If user doesn't have access to the current route, redirect to their role dashboard
    if (!hasAccessToCurrentRoute) {
      return NextResponse.redirect(new URL(`/dashboard/${user.role}`, request.url))
    }
  }

  // Redirect /dashboard to role-specific dashboard
  if (pathname === "/dashboard" && user) {
    return NextResponse.redirect(new URL(`/dashboard/${user.role}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*", "/merchant/:path*", "/user/:path*", "/admin/:path*", "/auth/:path*"],
}
