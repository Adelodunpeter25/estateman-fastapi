import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authService } from '@/services/auth'
import type { AuthContextType, LoginRequest, UserCreate, UserResponse } from '@/types/auth'

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'))
  const [permissions, setPermissions] = useState<string[] | null>(null)
  const [navigationConfig, setNavigationConfig] = useState<NavigationConfig | null>(null)
  const [loading, setLoading] = useState(true)

  const login = async (credentials: LoginRequest) => {
    const tokenData = await authService.login(credentials)
    const newToken = tokenData.access_token
    
    localStorage.setItem('access_token', newToken)
    setToken(newToken)
    
    // Get user data, permissions, and navigation config
    const [userData, userPermissions, navConfig] = await Promise.all([
      authService.getCurrentUser(),
      authService.getUserPermissions(),
      authService.getNavigationConfig()
    ])
    
    setUser(userData)
    setPermissions(userPermissions)
    setNavigationConfig(navConfig)
  }

  const register = async (userData: UserCreate) => {
    const newUser = await authService.register(userData)
    setUser(newUser)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setToken(null)
    setUser(null)
    setPermissions(null)
    setNavigationConfig(null)
  }

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const [userData, userPermissions, navConfig] = await Promise.all([
            authService.getCurrentUser(),
            authService.getUserPermissions(),
            authService.getNavigationConfig()
          ])
          setUser(userData)
          setPermissions(userPermissions)
          setNavigationConfig(navConfig)
        } catch (error) {
          logout()
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [token])

  const isAuthenticated = !!token && !!user

  // Auto-refresh permissions every 5 minutes
  useEffect(() => {
    if (!isAuthenticated) return

    const refreshPermissions = async () => {
      try {
        const [userPermissions, navConfig] = await Promise.all([
          authService.getUserPermissions(),
          authService.getNavigationConfig()
        ])
        setPermissions(userPermissions)
        setNavigationConfig(navConfig)
      } catch (error) {
        console.error('Permission refresh failed:', error)
      }
    }

    const interval = setInterval(refreshPermissions, 5 * 60 * 1000) // 5 minutes
    return () => clearInterval(interval)
  }, [isAuthenticated])

  const value: AuthContextType = {
    user,
    token,
    permissions,
    navigationConfig,
    login,
    register,
    logout,
    isAuthenticated,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}