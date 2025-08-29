import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { billingService, type RevenueAnalytics, type CrossTenantReport } from "@/services/billing"
import { 
  Users, 
  Building2, 
  DollarSign, 
  Server, 
  Shield, 
  Activity,
  CreditCard,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Database,
  Cloud,
  Settings
} from "lucide-react"

const SaasManagement = () => {
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null)
  const [crossTenantReport, setCrossTenantReport] = useState<CrossTenantReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [revenue, report] = await Promise.all([
          billingService.getRevenueAnalytics(),
          billingService.getCrossTenantReport()
        ])
        setRevenueAnalytics(revenue)
        setCrossTenantReport(report)
      } catch (error) {
        console.error('Error fetching SaaS data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const tenants = [
    {
      id: 1,
      name: "Elite Properties Group",
      plan: "Professional",
      users: 24,
      status: "active",
      usage: 78,
      revenue: 3580,
      lastActive: "2 hours ago"
    },
    {
      id: 2,
      name: "Urban Realty Network",
      plan: "Enterprise",
      users: 156,
      status: "active",
      usage: 92,
      revenue: 12400,
      lastActive: "15 minutes ago"
    },
    {
      id: 3,
      name: "Prime Estates LLC",
      plan: "Starter",
      users: 8,
      status: "trial",
      usage: 45,
      revenue: 0,
      lastActive: "1 day ago"
    },
    {
      id: 4,
      name: "Metro Real Estate Co",
      plan: "Professional",
      users: 42,
      status: "suspended",
      usage: 15,
      revenue: 0,
      lastActive: "5 days ago"
    }
  ]

  const systemMetrics = [
    { name: "API Requests", value: "2.4M", change: "+12%" },
    { name: "Database Queries", value: "45.7M", change: "+8%" },
    { name: "Storage Used", value: "1.2TB", change: "+5%" },
    { name: "Uptime", value: "99.98%", change: "+0.02%" }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success"
      case "trial": return "bg-warning"
      case "suspended": return "bg-destructive"
      default: return "bg-muted"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4" />
      case "trial": return <Clock className="h-4 w-4" />
      case "suspended": return <AlertTriangle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">SaaS Management</h1>
          <p className="text-muted-foreground">Monitor and manage your multi-tenant platform</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Tenants"
            value={crossTenantReport?.total_tenants?.toString() || "0"}
            change={{ value: "+12", type: "increase" }}
            icon={Building2}
            description="Active organizations"
          />
          <StatsCard
            title="Total Users"
            value={crossTenantReport?.total_users?.toLocaleString() || "0"}
            change={{ value: "+156", type: "increase" }}
            icon={Users}
            description="Across all tenants"
          />
          <StatsCard
            title="Monthly Revenue"
            value={`$${((revenueAnalytics?.monthly_recurring_revenue || 0) / 1000).toFixed(0)}K`}
            change={{ value: `+${((revenueAnalytics?.growth_rate || 0) * 100).toFixed(1)}%`, type: "increase" }}
            icon={DollarSign}
            description="Recurring revenue"
          />
          <StatsCard
            title="Active Subscriptions"
            value={revenueAnalytics?.active_subscriptions?.toString() || "0"}
            change={{ value: "+0.02%", type: "increase" }}
            icon={Activity}
            description="Current subscriptions"
          />
        </div>

        <Tabs defaultValue="tenants" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tenants">Tenant Management</TabsTrigger>
            <TabsTrigger value="billing">Billing & Revenue</TabsTrigger>
            <TabsTrigger value="system">System Health</TabsTrigger>
            <TabsTrigger value="security">Security & Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="tenants" className="space-y-6">
            {/* Tenant List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Active Tenants</CardTitle>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Tenant
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tenants.map((tenant) => (
                    <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{tenant.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {tenant.plan}
                            </Badge>
                            <span>•</span>
                            <span>{tenant.users} users</span>
                            <span>•</span>
                            <span>Last active {tenant.lastActive}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-semibold text-foreground">
                            ${tenant.revenue.toLocaleString()}/mo
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {tenant.usage}% usage
                          </div>
                        </div>
                        
                        <Badge 
                          className={`${getStatusColor(tenant.status)} text-white flex items-center gap-1`}
                        >
                          {getStatusIcon(tenant.status)}
                          {tenant.status}
                        </Badge>
                        
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Usage Analytics */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resource Usage by Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Enterprise (12 tenants)</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Professional (156 tenants)</span>
                      <span>67%</span>
                    </div>
                    <Progress value={67} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Starter (79 tenants)</span>
                      <span>34%</span>
                    </div>
                    <Progress value={34} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Growth Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">New Signups (This Month)</span>
                    <span className="font-semibold text-success">+24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Churn Rate</span>
                    <span className="font-semibold text-destructive">-2.1%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Avg Revenue Per User</span>
                    <span className="font-semibold text-foreground">$187</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Customer LTV</span>
                    <span className="font-semibold text-foreground">$4,250</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            {/* Revenue Dashboard */}
            <div className="grid md:grid-cols-3 gap-6">
              <StatsCard
                title="Monthly Recurring Revenue"
                value="$89,240"
                change={{ value: "+23.1%", type: "increase" }}
                icon={DollarSign}
                description="Total MRR"
              />
              <StatsCard
                title="Annual Run Rate"
                value="$1.07M"
                change={{ value: "+18.5%", type: "increase" }}
                icon={TrendingUp}
                description="Projected annually"
              />
              <StatsCard
                title="Failed Payments"
                value="3"
                change={{ value: "-2", type: "decrease" }}
                icon={CreditCard}
                description="This month"
              />
            </div>

            {/* Billing Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown by Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-6 border rounded-lg">
                      <div className="text-3xl font-bold text-foreground mb-2">$45,600</div>
                      <div className="text-muted-foreground">Enterprise Plans</div>
                      <div className="text-sm text-success mt-1">+15% from last month</div>
                    </div>
                    <div className="text-center p-6 border rounded-lg">
                      <div className="text-3xl font-bold text-foreground mb-2">$38,940</div>
                      <div className="text-muted-foreground">Professional Plans</div>
                      <div className="text-sm text-success mt-1">+28% from last month</div>
                    </div>
                    <div className="text-center p-6 border rounded-lg">
                      <div className="text-3xl font-bold text-foreground mb-2">$4,700</div>
                      <div className="text-muted-foreground">Starter Plans</div>
                      <div className="text-sm text-success mt-1">+42% from last month</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Payment Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground">
                  No failed payments requiring attention at this time.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            {/* System Health Metrics */}
            <div className="grid md:grid-cols-4 gap-6">
              {systemMetrics.map((metric, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{metric.name}</p>
                        <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                      </div>
                      <div className="text-sm text-success">{metric.change}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Infrastructure Status */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Infrastructure Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      Web Servers
                    </span>
                    <Badge variant="outline" className="text-success">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      Database Cluster
                    </span>
                    <Badge variant="outline" className="text-success">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-warning rounded-full"></div>
                      Cache Layer
                    </span>
                    <Badge variant="outline" className="text-warning">Degraded</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      CDN
                    </span>
                    <Badge variant="outline" className="text-success">Healthy</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Resource Utilization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>CPU Usage</span>
                      <span>67%</span>
                    </div>
                    <Progress value={67} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Memory Usage</span>
                      <span>84%</span>
                    </div>
                    <Progress value={84} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Storage Usage</span>
                      <span>42%</span>
                    </div>
                    <Progress value={42} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Network I/O</span>
                      <span>28%</span>
                    </div>
                    <Progress value={28} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            {/* Security Overview */}
            <div className="grid md:grid-cols-3 gap-6">
              <StatsCard
                title="Security Alerts"
                value="2"
                change={{ value: "-3", type: "decrease" }}
                icon={Shield}
                description="Active alerts"
              />
              <StatsCard
                title="Failed Login Attempts"
                value="147"
                change={{ value: "+12", type: "increase" }}
                icon={AlertTriangle}
                description="Last 24 hours"
              />
              <StatsCard
                title="Compliance Score"
                value="98.5%"
                change={{ value: "+1.2%", type: "increase" }}
                icon={CheckCircle}
                description="Overall score"
              />
            </div>

            {/* Security Status */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>SSL Certificates</span>
                    <Badge variant="outline" className="text-success">Valid</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Firewall Status</span>
                    <Badge variant="outline" className="text-success">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>DDoS Protection</span>
                    <Badge variant="outline" className="text-success">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>WAF Rules</span>
                    <Badge variant="outline" className="text-success">Updated</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Vulnerability Scan</span>
                    <Badge variant="outline" className="text-warning">Pending</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>GDPR Compliance</span>
                    <Badge variant="outline" className="text-success">Compliant</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>SOC 2 Type II</span>
                    <Badge variant="outline" className="text-success">Certified</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Data Backup</span>
                    <Badge variant="outline" className="text-success">Current</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Encryption</span>
                    <Badge variant="outline" className="text-success">AES-256</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Security Events */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <div className="flex-1">
                      <div className="font-medium">Unusual login pattern detected</div>
                      <div className="text-sm text-muted-foreground">Multiple failed attempts from IP 192.168.1.100</div>
                    </div>
                    <div className="text-sm text-muted-foreground">2 hours ago</div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <div className="flex-1">
                      <div className="font-medium">Security patch applied</div>
                      <div className="text-sm text-muted-foreground">Updated authentication service to v2.4.1</div>
                    </div>
                    <div className="text-sm text-muted-foreground">6 hours ago</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export default SaasManagement