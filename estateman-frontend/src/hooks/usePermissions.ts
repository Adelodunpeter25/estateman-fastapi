import { useAuth } from '@/contexts/AuthContext'

export const usePermissions = () => {
  const { user, permissions } = useAuth()

  const hasPermission = (resource: string, action: string): boolean => {
    if (!permissions || !user) return false
    
    // Super admin has all permissions
    if (user.role === 'superadmin') return true
    
    // Check if user has specific permission
    const permissionString = `${resource}:${action}`
    return permissions.includes(permissionString)
  }

  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false
    
    if (Array.isArray(role)) {
      return role.includes(user.role)
    }
    
    return user.role === role
  }

  const hasAnyRole = (roles: string[]): boolean => {
    if (!user) return false
    return roles.includes(user.role)
  }

  const canAccess = (resource: string, action?: string): boolean => {
    if (!user) return false
    
    // Super admin can access everything
    if (user.role === 'superadmin') return true
    
    // If no specific action, check if user has any permission for the resource
    if (!action) {
      return permissions?.some(p => p.startsWith(`${resource}:`)) || false
    }
    
    return hasPermission(resource, action)
  }

  const isAdmin = (): boolean => {
    return hasAnyRole(['admin', 'superadmin'])
  }

  const isManager = (): boolean => {
    return hasAnyRole(['manager', 'admin', 'superadmin'])
  }

  const isRealtor = (): boolean => {
    return user?.role === 'realtor'
  }

  const isClient = (): boolean => {
    return user?.role === 'client'
  }

  return {
    hasPermission,
    hasRole,
    hasAnyRole,
    canAccess,
    isAdmin,
    isManager,
    isRealtor,
    isClient,
    permissions: permissions || [],
    userRole: user?.role
  }
}