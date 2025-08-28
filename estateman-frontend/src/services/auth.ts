import { api } from './api'
import type { LoginRequest, UserCreate, UserResponse, Token, SessionInfo, PasswordResetRequest } from '@/types/auth'

export const authService = {
  async login(credentials: LoginRequest): Promise<Token> {
    const response = await api.post<Token>('/auth/login', credentials)
    return response.data
  },

  async register(userData: UserCreate): Promise<UserResponse> {
    const response = await api.post<UserResponse>('/auth/register', userData)
    return response.data
  },

  async getCurrentUser(): Promise<UserResponse> {
    const response = await api.get<UserResponse>('/auth/me')
    return response.data
  },

  async getSession(): Promise<SessionInfo> {
    const response = await api.get<SessionInfo>('/auth/session')
    return response.data
  },

  async getUserPermissions(): Promise<string[]> {
    const response = await api.get<{ permissions: string[] }>('/rbac/user-permission-names')
    return response.data.permissions
  },

  async getNavigationConfig(): Promise<Record<string, Array<{ route: string; title: string; required_permission: string; accessible: boolean; order_index: number }>>> {
    const response = await api.get<{ navigation: Record<string, Array<{ route: string; title: string; required_permission: string; accessible: boolean; order_index: number }>> }>('/rbac/navigation-config')
    return response.data.navigation
  },

  async refreshToken(): Promise<Token> {
    const response = await api.post<Token>('/auth/refresh')
    return response.data
  },

  async requestPasswordReset(email: PasswordResetRequest): Promise<{ message: string }> {
    const response = await api.post('/auth/password-reset-request', email)
    return response.data
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.post('/auth/password-reset', {
      token,
      new_password: newPassword
    })
    return response.data
  }
}