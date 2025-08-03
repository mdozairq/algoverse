import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  // Add CORS headers for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const response = NextResponse.next()

    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

    return response
  }

  // Handle authentication routing
  const { pathname } = request.nextUrl
  const user = request.cookies.get("eventnft_user")?.value

  // Protected routes that require authentication
  const protectedRoutes = [
    "/dashboard/admin",
    "/dashboard/merchant", 
    "/dashboard/user",
    "/merchant/dashboard",
    "/user/dashboard",
    "/admin/dashboard"
  ]

  // Check if user is trying to access protected routes
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  if (isProtectedRoute && !user) {
    // Redirect to appropriate auth page based on the route
    if (pathname.startsWith("/dashboard/admin") || pathname.startsWith("/admin/dashboard")) {
      return NextResponse.redirect(new URL("/auth/admin", request.url))
    } else if (pathname.startsWith("/dashboard/merchant") || pathname.startsWith("/merchant/dashboard")) {
      return NextResponse.redirect(new URL("/auth/merchant", request.url))
    } else {
      return NextResponse.redirect(new URL("/auth/user", request.url))
    }
  }

  // Redirect authenticated users away from auth pages
  const authRoutes = ["/auth/admin", "/auth/merchant", "/auth/merchant-login", "/auth/user"]
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  
  if (isAuthRoute && user) {
    try {
      const userData = JSON.parse(user)
      if (userData.role === "admin") {
        return NextResponse.redirect(new URL("/dashboard/admin", request.url))
      } else if (userData.role === "merchant") {
        return NextResponse.redirect(new URL("/merchant/dashboard", request.url))
      } else {
        return NextResponse.redirect(new URL("/user/dashboard", request.url))
      }
    } catch (error) {
      // Invalid user data, continue to auth page
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/merchant/:path*", 
    "/user/:path*",
    "/admin/:path*",
    "/auth/:path*"
  ],
}
