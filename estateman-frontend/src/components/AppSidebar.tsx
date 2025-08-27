import { useState } from "react"
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

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "SaaS Management", url: "/saas-management", icon: Cloud },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
]

const managementItems = [
  { title: "Realtors", url: "/realtors", icon: UserCheck },
  { title: "Clients", url: "/clients", icon: Users },
  { title: "Properties", url: "/properties", icon: Building2 },
  { title: "Leads", url: "/leads", icon: Target },
]

const salesItems = [
  { title: "Sales Force", url: "/sales-force", icon: TrendingUp },
  { title: "Commissions", url: "/commissions", icon: Calculator },
  { title: "MLM & Referrals", url: "/referrals", icon: Crown },
  { title: "Payments", url: "/payments", icon: DollarSign },
]

const operationsItems = [
  { title: "Marketing", url: "/marketing", icon: FileText },
  { title: "Documents", url: "/documents", icon: FolderOpen },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Events", url: "/events", icon: Calendar },
  { title: "Notifications", url: "/notifications", icon: Bell },
]

const businessItems = [
  { title: "Accounting", url: "/accounting", icon: Calculator },
  { title: "Loyalty Program", url: "/loyalty", icon: Award },
  { title: "Newsletters", url: "/newsletters", icon: Mail },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"

  const isActive = (path: string) => {
    if (path === "/dashboard" && currentPath === "/dashboard") return true
    if (path !== "/dashboard" && path !== "/" && currentPath.startsWith(path)) return true
    return false
  }

  const getNavCls = (path: string) => 
    isActive(path) 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"

  const renderMenuGroup = (items: typeof mainItems, label: string) => (
    <SidebarGroup>
      {!collapsed && <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink to={item.url} className={`${getNavCls(item.url)} px-2 py-2`}>
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span className="text-sm">{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )

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
                <h2 className="font-bold text-base md:text-lg text-primary">RealtyPro</h2>
                <p className="text-xs text-muted-foreground">Admin Dashboard</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Groups */}
        {renderMenuGroup(mainItems, "Overview")}
        {renderMenuGroup(managementItems, "Management")}
        {renderMenuGroup(salesItems, "Sales & Revenue")}
        {renderMenuGroup(operationsItems, "Operations")}
        {renderMenuGroup(businessItems, "Business")}
      </SidebarContent>
    </Sidebar>
  )
}