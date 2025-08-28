// Permission constants for better type safety and maintainability
export const PERMISSIONS = {
  // User management
  USERS_CREATE: 'users:create',
  USERS_READ: 'users:read',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_ACTIVATE: 'users:activate',

  // Properties
  PROPERTIES_CREATE: 'properties:create',
  PROPERTIES_READ: 'properties:read',
  PROPERTIES_UPDATE: 'properties:update',
  PROPERTIES_DELETE: 'properties:delete',
  PROPERTIES_PUBLISH: 'properties:publish',
  PROPERTIES_ASSIGN: 'properties:assign',

  // Financial
  INVOICES_READ: 'invoices:read',
  INVOICES_CREATE: 'invoices:create',
  INVOICES_UPDATE: 'invoices:update',
  INVOICES_DELETE: 'invoices:delete',
  PAYMENTS_READ: 'payments:read',
  PAYMENTS_CREATE: 'payments:create',
  PAYMENTS_UPDATE: 'payments:update',
  PAYMENTS_REFUND: 'payments:refund',
  EXPENSES_READ: 'expenses:read',
  EXPENSES_CREATE: 'expenses:create',
  EXPENSES_UPDATE: 'expenses:update',
  EXPENSES_DELETE: 'expenses:delete',

  // Reports & Analytics
  REPORTS_FINANCIAL: 'reports:financial',
  REPORTS_PROPERTY: 'reports:property',
  REPORTS_USER: 'reports:user',
  REPORTS_EXPORT: 'reports:export',
  ANALYTICS_READ: 'analytics:read',

  // CRM
  LEADS_CREATE: 'leads:create',
  LEADS_READ: 'leads:read',
  LEADS_UPDATE: 'leads:update',
  LEADS_DELETE: 'leads:delete',
  LEADS_ASSIGN: 'leads:assign',
  CONTACTS_CREATE: 'contacts:create',
  CONTACTS_READ: 'contacts:read',
  CONTACTS_UPDATE: 'contacts:update',
  CONTACTS_DELETE: 'contacts:delete',

  // System
  SETTINGS_READ: 'settings:read',
  SETTINGS_UPDATE: 'settings:update',
  NOTIFICATIONS_SEND: 'notifications:send',
  NOTIFICATIONS_MANAGE: 'notifications:manage',
  DOCUMENTS_READ: 'documents:read',
  DOCUMENTS_CREATE: 'documents:create',
  DOCUMENTS_UPDATE: 'documents:update',
  DOCUMENTS_DELETE: 'documents:delete',

  // RBAC
  ROLES_CREATE: 'roles:create',
  ROLES_READ: 'roles:read',
  ROLES_UPDATE: 'roles:update',
  ROLES_DELETE: 'roles:delete',
  PERMISSIONS_MANAGE: 'permissions:manage',

  // Dashboard
  DASHBOARD_READ: 'dashboard:read',
  DASHBOARD_ADMIN: 'dashboard:admin',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// Role-based permission groups for easier management
export const ROLE_PERMISSIONS = {
  CLIENT: [
    PERMISSIONS.PROPERTIES_READ,
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.DOCUMENTS_READ,
  ],
  REALTOR: [
    PERMISSIONS.PROPERTIES_CREATE,
    PERMISSIONS.PROPERTIES_READ,
    PERMISSIONS.PROPERTIES_UPDATE,
    PERMISSIONS.LEADS_CREATE,
    PERMISSIONS.LEADS_READ,
    PERMISSIONS.LEADS_UPDATE,
    PERMISSIONS.CONTACTS_CREATE,
    PERMISSIONS.CONTACTS_READ,
    PERMISSIONS.CONTACTS_UPDATE,
    PERMISSIONS.DASHBOARD_READ,
  ],
  ACCOUNTANT: [
    PERMISSIONS.INVOICES_READ,
    PERMISSIONS.INVOICES_CREATE,
    PERMISSIONS.INVOICES_UPDATE,
    PERMISSIONS.PAYMENTS_READ,
    PERMISSIONS.PAYMENTS_CREATE,
    PERMISSIONS.PAYMENTS_UPDATE,
    PERMISSIONS.EXPENSES_READ,
    PERMISSIONS.EXPENSES_CREATE,
    PERMISSIONS.EXPENSES_UPDATE,
    PERMISSIONS.REPORTS_FINANCIAL,
    PERMISSIONS.DASHBOARD_READ,
  ],
} as const