"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "admin" | "merchant" | "user"
  fallbackPath?: string
}

export default function AuthGuard({ children, requiredRole, fallbackPath }: AuthGuardProps) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // If not authenticated, redirect to appropriate auth page
      if (!isAuthenticated) {
        const authPath = fallbackPath || (requiredRole === "admin" ? "/auth/admin" : 
                                        requiredRole === "merchant" ? "/auth/merchant-login" : 
                                        "/auth/user")
        router.push(authPath)
        return
      }

      // If role is required and user doesn't have the required role
      if (requiredRole && user?.role !== requiredRole) {
        // Redirect to appropriate dashboard based on user's actual role
        const dashboardPath = user?.role === "admin" ? "/dashboard/admin" :
                            user?.role === "merchant" ? "/dashboard/merchant" :
                            "/dashboard/user"
        router.push(dashboardPath)
        return
      }
    }
  }, [user, loading, isAuthenticated, requiredRole, router, fallbackPath])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading...</h1>
          <p className="text-gray-600 dark:text-gray-400">Please wait while we verify your access.</p>
        </div>
      </div>
    )
  }

  // If not authenticated or wrong role, don't render children
  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return null
  }

  // User is authenticated and has the required role
  return <>{children}</>
} 