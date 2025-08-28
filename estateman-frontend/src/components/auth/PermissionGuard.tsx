import { ReactNode } from 'react'
import { usePermissions } from '@/hooks/usePermissions'

interface PermissionGuardProps {
  children: ReactNode
  resource?: string
  action?: string
  role?: string | string[]
  fallback?: ReactNode
  requireAll?: boolean // If true, user must have ALL specified permissions/roles
}

export const PermissionGuard = ({
  children,
  resource,
  action,
  role,
  fallback = null,
  requireAll = false
}: PermissionGuardProps) => {
  const { hasPermission, hasRole, hasAnyRole } = usePermissions()

  let hasAccess = true

  // Check role-based access
  if (role) {
    if (Array.isArray(role)) {
      hasAccess = requireAll 
        ? role.every(r => hasRole(r))
        : hasAnyRole(role)
    } else {
      hasAccess = hasRole(role)
    }
  }

  // Check permission-based access
  if (hasAccess && resource && action) {
    hasAccess = hasPermission(resource, action)
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

// Convenience components for common use cases
export const AdminOnly = ({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) => (
  <PermissionGuard role={['admin', 'superadmin']} fallback={fallback}>
    {children}
  </PermissionGuard>
)

export const ManagerOnly = ({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) => (
  <PermissionGuard role={['manager', 'admin', 'superadmin']} fallback={fallback}>
    {children}
  </PermissionGuard>
)

export const RealtorOnly = ({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) => (
  <PermissionGuard role="realtor" fallback={fallback}>
    {children}
  </PermissionGuard>
)

export const ClientOnly = ({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) => (
  <PermissionGuard role="client" fallback={fallback}>
    {children}
  </PermissionGuard>
)