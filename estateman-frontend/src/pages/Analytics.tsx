import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartConfig } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Home, Users, Calendar, Target, AlertTriangle } from "lucide-react"

const Analytics = () => {
  const analyticsStats = [
    { title: "Total Revenue", value: "$2.4M", change: "+12.5%", trend: "up", icon: DollarSign },
    { title: "Properties Sold", value: "156", change: "+8.2%", trend: "up", icon: Home },
    { title: "Active Clients", value: "234", change: "-2.1%", trend: "down", icon: Users },
    { title: "Avg. Days on Market", value: "28", change: "-15.3%", trend: "up", icon: Calendar },
  ]

  const salesData = [
    { month: "Jan", revenue: 180000, deals: 12, target: 200000 },
    { month: "Feb", revenue: 220000, deals: 15, target: 200000 },
    { month: "Mar", revenue: 195000, deals: 13, target: 200000 },
    { month: "Apr", revenue: 240000, deals: 16, target: 200000 },
    { month: "May", revenue: 265000, deals: 18, target: 250000 },
    { month: "Jun", revenue: 235000, deals: 14, target: 250000 },
    { month: "Jul", revenue: 280000, deals: 19, target: 250000 },
    { month: "Aug", revenue: 310000, deals: 21, target: 300000 },
    { month: "Sep", revenue: 295000, deals: 17, target: 300000 },
    { month: "Oct", revenue: 340000, deals: 23, target: 300000 },
    { month: "Nov", revenue: 325000, deals: 20, target: 350000 },
    { month: "Dec", revenue: 360000, deals: 25, target: 350000 },
  ]

  const propertyTypeData = [
    { name: "Single Family", value: 45, count: 70 },
    { name: "Condos", value: 30, count: 47 },
    { name: "Townhouses", value: 15, count: 23 },
    { name: "Multi-Family", value: 10, count: 16 },
  ]

  const marketTrendsData = [
    { month: "Jan", avgPrice: 450000, inventory: 120, daysOnMarket: 35 },
    { month: "Feb", avgPrice: 465000, inventory: 115, daysOnMarket: 32 },
    { month: "Mar", avgPrice: 470000, inventory: 110, daysOnMarket: 30 },
    { month: "Apr", avgPrice: 485000, inventory: 105, daysOnMarket: 28 },
    { month: "May", avgPrice: 495000, inventory: 100, daysOnMarket: 25 },
    { month: "Jun", avgPrice: 510000, inventory: 95, daysOnMarket: 22 },
  ]

  const performanceData = [
    { agent: "Sarah Wilson", deals: 25, revenue: 1250000, conversionRate: 85, avgDays: 22 },
    { agent: "Mike Chen", deals: 18, revenue: 980000, conversionRate: 78, avgDays: 28 },
    { agent: "Emily Rodriguez", deals: 22, revenue: 1100000, conversionRate: 82, avgDays: 25 },
    { agent: "James Thompson", deals: 15, revenue: 750000, conversionRate: 75, avgDays: 32 },
    { agent: "Lisa Garcia", deals: 12, revenue: 620000, conversionRate: 72, avgDays: 35 },
  ]

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))']

  const chartConfig: ChartConfig = {
    revenue: { label: "Revenue", color: "hsl(var(--primary))" },
    target: { label: "Target", color: "hsl(var(--muted))" },
    deals: { label: "Deals", color: "hsl(var(--secondary))" },
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive analytics and insights</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {analyticsStats.map((stat, index) => {
            const Icon = stat.icon
            const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
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
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                        <Bar dataKey="target" fill="hsl(var(--muted))" opacity={0.5} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Property Types Distribution</CardTitle>
                  <CardDescription>Breakdown of property sales by type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={propertyTypeData}
                          cx="50%"
                          cy="50%"
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
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Deals Closed Over Time</CardTitle>
                <CardDescription>Number of deals closed each month</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Line type="monotone" dataKey="deals" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
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
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={marketTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Area type="monotone" dataKey="avgPrice" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Inventory</CardTitle>
                  <CardDescription>Available properties and days on market</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={marketTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Line yAxisId="left" type="monotone" dataKey="inventory" stroke="hsl(var(--primary))" />
                        <Line yAxisId="right" type="monotone" dataKey="daysOnMarket" stroke="hsl(var(--secondary))" />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Market Insights</CardTitle>
                <CardDescription>Key market indicators and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Target className="w-5 h-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-800">Seller's Market</span>
                    </div>
                    <p className="text-sm text-green-700">Low inventory and high demand. Good time for sellers to list.</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-medium text-blue-800">Price Growth</span>
                    </div>
                    <p className="text-sm text-blue-700">Steady 8% price appreciation year-over-year.</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                      <span className="font-medium text-yellow-800">Interest Rates</span>
                    </div>
                    <p className="text-sm text-yellow-700">Monitor rate changes that may affect buyer demand.</p>
                  </div>
                </div>
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
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>February 2025</span>
                      <span className="font-medium">$385,000</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Confidence: 85%</span>
                      <span>+12% vs last year</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>March 2025</span>
                      <span className="font-medium">$420,000</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Confidence: 82%</span>
                      <span>+15% vs last year</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>April 2025</span>
                      <span className="font-medium">$445,000</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Confidence: 78%</span>
                      <span>+18% vs last year</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Predictive Insights</CardTitle>
                  <CardDescription>AI-driven market predictions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium mb-1">Peak Season Forecast</div>
                    <p className="text-sm text-muted-foreground">Spring market expected to be 25% stronger than last year based on current trends.</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium mb-1">Client Demand</div>
                    <p className="text-sm text-muted-foreground">Luxury segment showing increased activity. Consider targeting high-end listings.</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium mb-1">Competition Analysis</div>
                    <p className="text-sm text-muted-foreground">Market share opportunity in suburban areas due to competitor pullback.</p>
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
                <div className="space-y-3">
                  {[
                    { action: "Increase marketing budget for luxury properties", impact: "High", effort: "Medium" },
                    { action: "Launch referral program for existing clients", impact: "Medium", effort: "Low" },
                    { action: "Expand into suburban market segments", impact: "High", effort: "High" },
                    { action: "Implement virtual tour technology", impact: "Medium", effort: "Medium" },
                    { action: "Partner with local mortgage brokers", impact: "Medium", effort: "Low" }
                  ].map((rec, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{rec.action}</div>
                      </div>
                      <div className="flex space-x-2">
                        <Badge variant="outline">Impact: {rec.impact}</Badge>
                        <Badge variant="outline">Effort: {rec.effort}</Badge>
                        <Button variant="outline" size="sm">Details</Button>
                      </div>
                    </div>
                  ))}
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