import { DashboardLayout } from "@/components/DashboardLayout"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { RecentActivities } from "@/components/dashboard/RecentActivities"
import { TopPerformers } from "@/components/dashboard/TopPerformers"
import { SalesChart } from "@/components/dashboard/SalesChart"
import { dashboardService, type DashboardOverview, type RecentActivity, type TopPerformer, type ChartData } from "@/services/dashboard"
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
  Loader2
} from "lucide-react"

const Index = () => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [performers, setPerformers] = useState<TopPerformer[]>([])
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  
  usePageTracking('dashboard')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [overviewData, activitiesData, performersData, chartDataRes] = await Promise.all([
          dashboardService.getOverview(),
          dashboardService.getRecentActivities(),
          dashboardService.getTopPerformers(),
          dashboardService.getChartData()
        ])
        
        setOverview(overviewData)
        setActivities(activitiesData)
        setPerformers(performersData)
        setChartData(chartDataRes)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

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
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground">Welcome to your real estate management platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {overview?.total_sales && (
            <StatsCard
              title="Total Sales"
              value={`$${overview.total_sales.value}`}
              change={{ value: `${overview.total_sales.change > 0 ? '+' : ''}${overview.total_sales.change}%`, type: overview.total_sales.type }}
              icon={DollarSign}
              description="Year to date"
            />
          )}
          <StatsCard
            title="Active Realtors"
            value={overview?.active_realtors.value || "0"}
            change={{ value: `${overview?.active_realtors.change > 0 ? '+' : ''}${overview?.active_realtors.change || 0}`, type: overview?.active_realtors.type || "neutral" }}
            icon={UserCheck}
            description="Currently active"
          />
          {overview?.properties_listed && (
            <StatsCard
              title="Properties Listed"
              value={overview.properties_listed.value}
              change={{ value: `${overview.properties_listed.change > 0 ? '+' : ''}${overview.properties_listed.change}`, type: overview.properties_listed.type }}
              icon={Building2}
              description="Available listings"
            />
          )}
          {overview?.conversion_rate && (
            <StatsCard
              title="Conversion Rate"
              value={overview.conversion_rate.value}
              change={{ value: `${overview.conversion_rate.change > 0 ? '+' : ''}${overview.conversion_rate.change}%`, type: overview.conversion_rate.type }}
              icon={Target}
              description="Leads to sales"
            />
          )}
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
          <SalesChart data={chartData} />
          <TopPerformers performers={performers} />
        </div>

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
