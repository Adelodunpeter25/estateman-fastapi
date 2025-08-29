import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartConfig } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Home, Users, Calendar, Target, AlertTriangle, RefreshCw } from "lucide-react"
import { analyticsService, type DashboardAnalytics, type BusinessInsight, type RevenueVsTarget } from "@/services/analytics"
import { useAnalytics, usePageTracking } from "@/hooks/useAnalytics"
import { useEffect, useState } from "react"

const Analytics = () => {
  const [dashboardData, setDashboardData] = useState<DashboardAnalytics | null>(null)
  const [insights, setInsights] = useState<BusinessInsight[]>([])
  const [revenueData, setRevenueData] = useState<RevenueVsTarget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { trackClick } = useAnalytics()
  
  usePageTracking('analytics')

  useEffect(() => {
    loadAnalyticsData()
  }, [])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      const [analytics, businessInsights, revenue] = await Promise.all([
        analyticsService.getDashboardAnalytics(30),
        analyticsService.getInsights({ limit: 10, active_only: true }),
        analyticsService.getRevenueVsTarget(180)
      ])
      setDashboardData(analytics)
      setInsights(businessInsights)
      setRevenueData(revenue)
      
      // Set empty arrays for now - these would be populated from specific APIs
      setPropertyTypeData([])
      setPerformanceData([])
      setMarketTrendsData([])
    } catch (err) {
      setError('Failed to load analytics data')
      console.error('Analytics error:', err)
    } finally {
      setLoading(false)
    }
  }

  const analyticsStats = dashboardData ? [
    { 
      title: "Total Events", 
      value: dashboardData.total_events.toLocaleString(), 
      change: "0%", 
      trend: "neutral", 
      icon: Target 
    },
    { 
      title: "Page Views", 
      value: dashboardData.page_views.toLocaleString(), 
      change: "0%", 
      trend: "neutral", 
      icon: Home 
    },
    { 
      title: "Unique Users", 
      value: dashboardData.unique_users.toLocaleString(), 
      change: "0%", 
      trend: "neutral", 
      icon: Users 
    },
    { 
      title: "Conversion Rate", 
      value: `${dashboardData.conversion_rate}%`, 
      change: "0%", 
      trend: "neutral", 
      icon: Calendar 
    },
  ] : []

  const salesData = dashboardData?.performance_trends || []

  const [propertyTypeData, setPropertyTypeData] = useState<Array<{name: string, value: number, count: number}>>([])
  const [performanceData, setPerformanceData] = useState<Array<{agent: string, deals: number, revenue: number, conversionRate: number, avgDays: number}>>([])
  const [marketTrendsData, setMarketTrendsData] = useState<Array<{month: string, avgPrice: number, inventory: number, daysOnMarket: number}>>([])



  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))']

  const chartConfig: ChartConfig = {
    revenue: { label: "Revenue", color: "hsl(var(--primary))" },
    target: { label: "Target", color: "hsl(var(--muted))" },
    deals: { label: "Deals", color: "hsl(var(--secondary))" },
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive analytics and insights</p>
          </div>
          <Button 
            onClick={() => {
              trackClick('refresh_analytics')
              loadAnalyticsData()
            }} 
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

        {/* Stats Cards */}
        {analyticsStats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analyticsStats.map((stat, index) => {
              const Icon = stat.icon
              const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown
              const cardColors = [
                { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-200" },
                { bg: "bg-green-50", icon: "text-green-600", border: "border-green-200" },
                { bg: "bg-yellow-50", icon: "text-yellow-600", border: "border-yellow-200" },
                { bg: "bg-red-50", icon: "text-red-600", border: "border-red-200" }
              ]
              const colors = cardColors[index]
              return (
                <Card key={index} className={`${colors.bg} ${colors.border}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <Icon className={`h-4 w-4 ${colors.icon}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <TrendIcon className={`w-3 h-3 mr-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                      <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>{stat.change}</span> from last month
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="bg-muted/10 border-muted/20">
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground py-8">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Analytics Data Available</h3>
                <p className="text-sm">Start using the application to generate analytics data and insights.</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="market">Market Trends</TabsTrigger>
            <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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
                  <CardTitle>Property Types Distribution</CardTitle>
                  <CardDescription>Breakdown of property sales by type</CardDescription>
                </CardHeader>
                <CardContent>
                  {propertyTypeData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <PieChart width={500} height={300}>
                        <Pie
                          data={propertyTypeData}
                          cx={250}
                          cy={150}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {propertyTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No property type data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Deals Closed Over Time</CardTitle>
                <CardDescription>Number of deals closed each month</CardDescription>
              </CardHeader>
              <CardContent>
                {salesData.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <LineChart width={800} height={300} data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Line type="monotone" dataKey="events" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No trend data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance Comparison</CardTitle>
                <CardDescription>Key metrics for top performing agents</CardDescription>
              </CardHeader>
              <CardContent>
                {performanceData.length > 0 ? (
                  <div className="space-y-4">
                    {performanceData.map((agent, index) => (
                      <div key={index} className="grid grid-cols-5 gap-4 p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{agent.agent}</div>
                          <div className="text-sm text-muted-foreground">Agent</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{agent.deals}</div>
                          <div className="text-sm text-muted-foreground">Deals</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">${(agent.revenue / 1000000).toFixed(1)}M</div>
                          <div className="text-sm text-muted-foreground">Revenue</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{agent.conversionRate}%</div>
                          <div className="text-sm text-muted-foreground">Conversion</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{agent.avgDays} days</div>
                          <div className="text-sm text-muted-foreground">Avg. Close</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No performance data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="market" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Average Sale Price Trend</CardTitle>
                  <CardDescription>Market price trends over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {marketTrendsData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <AreaChart width={500} height={300} data={marketTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Area type="monotone" dataKey="avgPrice" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                      </AreaChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No market trend data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Inventory</CardTitle>
                  <CardDescription>Available properties and days on market</CardDescription>
                </CardHeader>
                <CardContent>
                  {marketTrendsData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <LineChart width={500} height={300} data={marketTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Line yAxisId="left" type="monotone" dataKey="inventory" stroke="hsl(var(--primary))" />
                        <Line yAxisId="right" type="monotone" dataKey="daysOnMarket" stroke="hsl(var(--secondary))" />
                      </LineChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No inventory data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

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
                    trackClick('generate_insights')
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
                    {insights.slice(0, 3).map((insight, index) => {
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

          <TabsContent value="forecasting" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Forecast</CardTitle>
                  <CardDescription>Projected revenue for next 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-8">
                    No forecast data available. Revenue forecasting requires historical data.
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Predictive Insights</CardTitle>
                  <CardDescription>AI-driven market predictions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-8">
                    No predictive insights available. Generate insights from collected data.
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Actions</CardTitle>
                <CardDescription>Data-driven recommendations for business growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  No recommendations available. Generate business insights to see data-driven recommendations.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export default Analytics