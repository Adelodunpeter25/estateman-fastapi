import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Building2, 
  TrendingUp, 
  Calculator, 
  FileText,
  FolderOpen,
  CheckSquare,
  Calendar,
  Bell,
  Target,
  Settings,
  Home,
  Crown,
  DollarSign,
  Award,
  BarChart3,
  Mail,
  Cloud
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { LogoutButton } from "@/components/auth/LogoutButton"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

// Icon mapping for dynamic navigation
const ICON_MAP: Record<string, any> = {
  "/dashboard": LayoutDashboard,
  "/analytics": BarChart3,
  "/saas-management": Cloud,
  "/realtors": UserCheck,
  "/clients": Users,
  "/properties": Building2,
  "/leads": Target,
  "/sales-force": TrendingUp,
  "/commissions": Calculator,
  "/referrals": Crown,
  "/payments": DollarSign,
  "/marketing": FileText,
  "/documents": FolderOpen,
  "/tasks": CheckSquare,
  "/events": Calendar,
  "/notifications": Bell,
  "/accounting": Calculator,
  "/loyalty": Award,
  "/newsletters": Mail,
  "/settings": Settings,
}

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"
  const { user, navigationConfig } = useAuth()

  const isActive = (path: string) => {
    if (path === "/dashboard" && currentPath === "/dashboard") return true
    if (path !== "/dashboard" && path !== "/" && currentPath.startsWith(path)) return true
    return false
  }

  const getNavCls = (path: string) => 
    isActive(path) 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"

  const renderMenuGroup = (categoryName: string, items: any[]) => {
    const accessibleItems = items.filter(item => item.accessible)
    
    if (accessibleItems.length === 0) return null

    return (
      <SidebarGroup key={categoryName}>
        {!collapsed && <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">{categoryName}</SidebarGroupLabel>}
        <SidebarGroupContent>
          <SidebarMenu>
            {accessibleItems.map((item) => {
              const IconComponent = ICON_MAP[item.route] || Settings
              return (
                <SidebarMenuItem key={item.route}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.route} className={`${getNavCls(item.route)} px-2 py-2`}>
                      <IconComponent className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-card border-r">
        {/* Logo Section */}
        <div className="p-3 md:p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 md:w-8 md:h-8 bg-primary rounded-lg flex items-center justify-center">
              <Home className="h-3 w-3 md:h-4 md:w-4 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-bold text-base md:text-lg text-primary">Estateman</h2>
                <p className="text-xs text-muted-foreground">Real Estate CRM</p>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        {!collapsed && user && (
          <div className="px-3 py-2 border-b">
            <div className="text-sm font-medium">{user.first_name} {user.last_name}</div>
            <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
          </div>
        )}

        {/* Dashboard Link */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/dashboard" className={`${getNavCls("/dashboard")} px-2 py-2`}>
                    <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && <span className="text-sm">Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Dynamic Navigation Groups */}
        {navigationConfig && Object.entries(navigationConfig).map(([categoryName, items]) => 
          renderMenuGroup(categoryName, items)
        )}

        {/* Logout */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <LogoutButton variant="ghost" showIcon={!collapsed} />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}