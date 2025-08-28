// Navigation configuration with dynamic permission requirements
export const NAVIGATION_CONFIG = {
  // Overview
  "/analytics": "analytics:read",
  "/saas-management": "settings:update",
  
  // Management
  "/realtors": "users:read",
  "/clients": "contacts:read", 
  "/properties": "properties:read",
  "/leads": "leads:read",
  
  // Sales & Revenue
  "/sales-force": "users:read",
  "/commissions": "reports:financial",
  "/payments": "payments:read",
  
  // Operations
  "/marketing": "notifications:send",
  "/documents": "documents:read",
  "/events": "appointments:read",
  
  // Business
  "/accounting": "invoices:read",
  "/newsletters": "notifications:send",
  "/settings": "settings:read"
} as const

export type NavigationRoute = keyof typeof NAVIGATION_CONFIG