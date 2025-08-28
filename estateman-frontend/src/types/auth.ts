export interface LoginRequest {
  email: string
  password: string
}

export interface UserCreate {
  email: string
  username: string
  first_name: string
  last_name: string
  phone?: string
  password: string
  role?: string
}

export interface UserResponse {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  phone?: string
  role: string
  is_active: boolean
  is_verified: boolean
  created_at: string
}

export interface Token {
  access_token: string
  token_type: string
}

export interface SessionInfo {
  user_id: number
  username: string
  role: string
  last_login?: string
  permissions: string[]
}

export interface PasswordResetRequest {
  email: string
}

export interface NavigationItem {
  route: string
  title: string
  required_permission: string
  accessible: boolean
  order_index: number
}

export interface NavigationConfig {
  [category: string]: NavigationItem[]
}

export interface AuthContextType {
  user: UserResponse | null
  token: string | null
  permissions: string[] | null
  navigationConfig: NavigationConfig | null
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: UserCreate) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}