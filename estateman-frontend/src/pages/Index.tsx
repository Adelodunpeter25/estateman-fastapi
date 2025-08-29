import { DashboardLayout } from "@/components/DashboardLayout"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { RecentActivities } from "@/components/dashboard/RecentActivities"
import { TopPerformers } from "@/components/dashboard/TopPerformers"
import { SalesChart } from "@/components/dashboard/SalesChart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts"
import { dashboardService, type DashboardOverview, type RecentActivity, type TopPerformer, type ChartData } from "@/services/dashboard"
import { analyticsService, type DashboardAnalytics, type BusinessInsight, type RevenueVsTarget } from "@/services/analytics"
import { usePageTracking } from "@/hooks/useAnalytics"
import { useState, useEffect } from "react"
import { 
  Users, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Target, 
  UserCheck,
  Calendar,
  Award,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Home
} from "lucide-react"

const Index = () => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [performers, setPerformers] = useState<TopPerformer[]>([])
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardAnalytics | null>(null)
  const [insights, setInsights] = useState<BusinessInsight[]>([])
  const [revenueData, setRevenueData] = useState<RevenueVsTarget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  usePageTracking('dashboard')

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      const [
        overviewData, 
        activitiesData, 
        performersData, 
        chartDataRes,
        analytics,
        businessInsights,
        revenue
      ] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getRecentActivities(),
        dashboardService.getTopPerformers(),
        dashboardService.getChartData(),
        analyticsService.getDashboardAnalytics(30),
        analyticsService.getInsights({ limit: 10, active_only: true }),
        analyticsService.getRevenueVsTarget(180)
      ])
      
      setOverview(overviewData)
      setActivities(activitiesData)
      setPerformers(performersData)
      setChartData(chartDataRes)
      setDashboardData(analytics)
      setInsights(businessInsights)
      setRevenueData(revenue)
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Overview</h1>
            <p className="text-muted-foreground">Comprehensive dashboard with analytics and insights</p>
          </div>
          <Button 
            onClick={loadAllData} 
            disabled={loading}
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center text-red-800">
                <AlertTriangle className="w-4 h-4 mr-2" />
                {error}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.total_sales ? `$${overview.total_sales.value}` : "$0"}</div>
              <p className="text-xs text-muted-foreground">Year to date</p>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Realtors</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.active_realtors.value || "0"}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Properties Listed</CardTitle>
              <Building2 className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.properties_listed?.value || "0"}</div>
              <p className="text-xs text-muted-foreground">Available listings</p>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50 border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.conversion_rate?.value || "0%"}</div>
              <p className="text-xs text-muted-foreground">Leads to sales</p>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.unique_users.toLocaleString() || "0"}</div>
              <p className="text-xs text-muted-foreground">Active users</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Dashboard</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
              <SalesChart data={chartData} />
              <TopPerformers performers={performers} />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">


            {/* Revenue vs Target Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue vs Target</CardTitle>
                  <CardDescription>Monthly revenue performance against targets</CardDescription>
                </CardHeader>
                <CardContent>
                  {revenueData.length > 0 ? (
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue" />
                          <Bar dataKey="target" fill="hsl(var(--muted))" name="Target" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No revenue data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>Daily activity trends</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardData?.performance_trends.length > 0 ? (
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dashboardData.performance_trends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Line type="monotone" dataKey="events" stroke="hsl(var(--primary))" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No trend data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Business Insights</CardTitle>
                  <CardDescription>AI-powered insights and recommendations</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={async () => {
                    try {
                      const newInsights = await analyticsService.generateInsights()
                      setInsights(newInsights)
                    } catch (error) {
                      console.error('Failed to generate insights:', error)
                    }
                  }}
                >
                  Generate Insights
                </Button>
              </CardHeader>
              <CardContent>
                {insights.length > 0 ? (
                  <div className="space-y-4">
                    {insights.slice(0, 5).map((insight) => {
                      const bgColor = insight.impact_level === 'high' ? 'bg-red-50' : 
                                     insight.impact_level === 'medium' ? 'bg-yellow-50' : 'bg-green-50'
                      const textColor = insight.impact_level === 'high' ? 'text-red-800' : 
                                       insight.impact_level === 'medium' ? 'text-yellow-800' : 'text-green-800'
                      const iconColor = insight.impact_level === 'high' ? 'text-red-600' : 
                                       insight.impact_level === 'medium' ? 'text-yellow-600' : 'text-green-600'
                      
                      return (
                        <div key={insight.id} className={`p-4 ${bgColor} rounded-lg`}>
                          <div className="flex items-center mb-2">
                            <Target className={`w-5 h-5 ${iconColor} mr-2`} />
                            <span className={`font-medium ${textColor}`}>{insight.title}</span>
                            <Badge variant="outline" className="ml-auto">
                              {Math.round(insight.confidence_score)}% confidence
                            </Badge>
                          </div>
                          <p className={`text-sm ${textColor.replace('800', '700')}`}>{insight.description}</p>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No business insights available. Generate insights to see AI-powered recommendations.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {overview?.monthly_leads && (
            <StatsCard
              title="Monthly Leads"
              value={overview.monthly_leads.value}
              change={{ value: `${overview.monthly_leads.change > 0 ? '+' : ''}${overview.monthly_leads.change}%`, type: overview.monthly_leads.type }}
              icon={Target}
              description="New leads this month"
            />
          )}
          <StatsCard
            title="Active Clients"
            value={overview?.active_clients.value || "0"}
            change={{ value: `${overview?.active_clients.change > 0 ? '+' : ''}${overview?.active_clients.change || 0}`, type: overview?.active_clients.type || "neutral" }}
            icon={Users}
            description="Engaged clients"
          />
          {overview?.avg_deal_size && (
            <StatsCard
              title="Avg. Deal Size"
              value={`$${overview.avg_deal_size.value}`}
              change={{ value: `${overview.avg_deal_size.change > 0 ? '+' : ''}${overview.avg_deal_size.change}%`, type: overview.avg_deal_size.type }}
              icon={TrendingUp}
              description="Per transaction"
            />
          )}
          {overview?.events_scheduled && (
            <StatsCard
              title="Events Scheduled"
              value={overview.events_scheduled.value}
              change={{ value: `${overview.events_scheduled.change > 0 ? '+' : ''}${overview.events_scheduled.change}`, type: overview.events_scheduled.type }}
              icon={Calendar}
              description="This month"
            />
          )}
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          <RecentActivities activities={activities} />
          
          {/* Performance Summary */}
          {performers.length > 0 && (
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-lg p-4 md:p-6 text-primary-foreground">
              <h3 className="text-lg md:text-xl font-semibold mb-2">Performance Highlights</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm md:text-base">Top Performer</span>
                  <span className="font-semibold text-sm md:text-base">{performers[0]?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm md:text-base">Total Revenue</span>
                  <span className="font-semibold text-sm md:text-base">
                    ${(performers.reduce((sum, p) => sum + p.revenue, 0) / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm md:text-base">Total Sales</span>
                  <span className="font-semibold text-sm md:text-base">
                    {performers.reduce((sum, p) => sum + p.sales, 0)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
