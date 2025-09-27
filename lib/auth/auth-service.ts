// Auth Service for handling authentication with backend
import { User } from "@/types/auth"

export const authService = {
  /**
   * Authenticate user with wallet address
   */
  async authenticateUser(address: string): Promise<User> {
    try {
      const response = await fetch('/api/auth/wallet-connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Authentication failed')
      }

      const data = await response.json()
      return data.user
    } catch (error) {
      console.error('Auth service error:', error)
      throw error
    }
  },

  /**
   * Authenticate admin with username and password
   */
  async authenticateAdmin(username: string, password: string): Promise<User> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: username, 
          password, 
          role: 'admin' 
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Admin authentication failed')
      }

      const data = await response.json()
      return data.user
    } catch (error) {
      console.error('Admin auth service error:', error)
      throw error
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    } catch (error) {
      console.error('Logout service error:', error)
      // Don't throw error for logout failures
    }
  }
}
