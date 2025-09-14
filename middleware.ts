// middleware.js (fixed)
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
  const userCookie = request.cookies.get("eventnft_user")?.value

  // Protected routes that require authentication
  const protectedRoutes = [
    "/dashboard/admin",
    "/dashboard/merchant", 
    "/dashboard/user",
    "/merchant/dashboard",
    "/user/dashboard",
    "/admin/dashboard"
  ]

  // Auth routes
  const authRoutes = [
    "/auth/admin",
    "/auth/merchant",
    "/auth/user"
  ]

  // Check if user is trying to access protected or auth routes
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  
  // If user is authenticated and trying to access auth pages, redirect to appropriate dashboard
  if (userCookie && isAuthRoute) {
    try {
      const userData = JSON.parse(userCookie)
      const userRole = userData.role
      
      // Only redirect if they're trying to access an auth page that's not for their role
      const shouldRedirect = 
        (userRole === "admin" && !pathname.startsWith("/auth/admin")) ||
        (userRole === "merchant" && !pathname.startsWith("/auth/merchant")) ||
        (userRole === "user" && !pathname.startsWith("/auth/user"))
      
      if (shouldRedirect) {
        return NextResponse.redirect(new URL(`/dashboard/${userRole}`, request.url))
      }
    } catch (error) {
      // Invalid user data, allow access to auth pages
      return NextResponse.next()
    }
  }

  // Handle protected routes for unauthenticated users
  if (isProtectedRoute && !userCookie) {
    // Redirect to appropriate auth page based on the route
    if (pathname.startsWith("/dashboard/admin") || pathname.startsWith("/admin/dashboard")) {
      return NextResponse.redirect(new URL("/auth/admin", request.url))
    } else if (pathname.startsWith("/dashboard/merchant") || pathname.startsWith("/merchant/dashboard")) {
      return NextResponse.redirect(new URL("/auth/merchant/signin", request.url))
    } else {
      return NextResponse.redirect(new URL("/auth/user", request.url))
    }
  }

  // Handle role-based access for protected routes
  if (isProtectedRoute && userCookie) {
    try {
      const userData = JSON.parse(userCookie)
      const userRole = userData.role
      
      // Check if user has access to the requested route
      const hasAccess = 
        (userRole === "admin" && (pathname.startsWith("/dashboard/admin") || pathname.startsWith("/admin/dashboard"))) ||
        (userRole === "merchant" && (pathname.startsWith("/dashboard/merchant") || pathname.startsWith("/merchant/dashboard"))) ||
        (userRole === "user" && (pathname.startsWith("/dashboard/user") || pathname.startsWith("/user/dashboard")))
      
      if (!hasAccess) {
        // Redirect to their own dashboard if they don't have access
        return NextResponse.redirect(new URL(`/dashboard/${userRole}`, request.url))
      }
    } catch (error) {
      // Invalid user data, redirect to appropriate auth page
      if (pathname.startsWith("/dashboard/admin") || pathname.startsWith("/admin/dashboard")) {
        return NextResponse.redirect(new URL("/auth/admin", request.url))
      } else if (pathname.startsWith("/dashboard/merchant") || pathname.startsWith("/merchant/dashboard")) {
        return NextResponse.redirect(new URL("/auth/merchant/signin", request.url))
      } else {
        return NextResponse.redirect(new URL("/auth/user", request.url))
      }
    }
  }

  // Handle main dashboard route - redirect to role-specific dashboard
  if (pathname === "/dashboard") {
    if (!userCookie) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    
    try {
      const userData = JSON.parse(userCookie)
      const userRole = userData.role
      
      switch (userRole) {
        case "admin":
          return NextResponse.redirect(new URL("/dashboard/admin", request.url))
        case "merchant":
          return NextResponse.redirect(new URL("/dashboard/merchant", request.url))
        case "user":
          return NextResponse.redirect(new URL("/dashboard/user", request.url))
        default:
          return NextResponse.redirect(new URL("/auth/user", request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/auth/user", request.url))
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