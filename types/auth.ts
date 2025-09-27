// Auth types for the application

export interface User {
  id: string
  email?: string
  role: 'user' | 'merchant' | 'admin'
  address?: string
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
