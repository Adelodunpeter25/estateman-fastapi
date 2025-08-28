import { useAuth } from "@/contexts/AuthContext"

export function usePermissions() {
  const { permissions } = useAuth()

  const hasPermission = (permission: string): boolean => {
    return permissions?.includes(permission) ?? false
  }

  const hasAnyPermission = (permissionList: string[]): boolean => {
    return permissionList.some(permission => hasPermission(permission))
  }

  const hasAllPermissions = (permissionList: string[]): boolean => {
    return permissionList.every(permission => hasPermission(permission))
  }

  return {
    permissions: permissions ?? [],
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  }
}