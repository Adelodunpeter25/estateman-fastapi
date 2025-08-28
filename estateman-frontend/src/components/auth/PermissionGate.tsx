import { usePermissions } from '@/hooks/usePermissions'
import { ReactNode } from 'react'

interface PermissionGateProps {
  children: ReactNode
  permissions: string | string[]
  requireAll?: boolean
  fallback?: ReactNode
}

export function PermissionGate({ 
  children, 
  permissions, 
  requireAll = false, 
  fallback = null 
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions()

  const permissionList = Array.isArray(permissions) ? permissions : [permissions]
  
  let hasAccess = false
  
  if (requireAll) {
    hasAccess = hasAllPermissions(permissionList)
  } else {
    hasAccess = hasAnyPermission(permissionList)
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}