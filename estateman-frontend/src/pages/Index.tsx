import { DashboardLayout } from "@/components/DashboardLayout"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { RecentActivities } from "@/components/dashboard/RecentActivities"
import { TopPerformers } from "@/components/dashboard/TopPerformers"
import { SalesChart } from "@/components/dashboard/SalesChart"
import { 
  Users, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Target, 
  UserCheck,
  Calendar,
  Award
} from "lucide-react"

const Index = () => {
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
          <StatsCard
            title="Total Sales"
            value="$42.8M"
            change={{ value: "+12.5%", type: "increase" }}
            icon={DollarSign}
            description="Year to date"
          />
          <StatsCard
            title="Active Realtors"
            value="156"
            change={{ value: "+8", type: "increase" }}
            icon={UserCheck}
            description="Currently active"
          />
          <StatsCard
            title="Properties Listed"
            value="1,247"
            change={{ value: "+23", type: "increase" }}
            icon={Building2}
            description="Available listings"
          />
          <StatsCard
            title="Conversion Rate"
            value="34.2%"
            change={{ value: "+2.1%", type: "increase" }}
            icon={Target}
            description="Leads to sales"
          />
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
          <SalesChart />
          <TopPerformers />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatsCard
            title="Monthly Leads"
            value="2,847"
            change={{ value: "+18.3%", type: "increase" }}
            icon={Target}
            description="New leads this month"
          />
          <StatsCard
            title="Active Clients"
            value="892"
            change={{ value: "+156", type: "increase" }}
            icon={Users}
            description="Engaged clients"
          />
          <StatsCard
            title="Avg. Deal Size"
            value="$485K"
            change={{ value: "+7.2%", type: "increase" }}
            icon={TrendingUp}
            description="Per transaction"
          />
          <StatsCard
            title="Events Scheduled"
            value="64"
            change={{ value: "+12", type: "increase" }}
            icon={Calendar}
            description="This month"
          />
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          <RecentActivities />
          
          {/* Quick Actions Card */}
          <div className="space-y-4 md:space-y-6">
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-lg p-4 md:p-6 text-primary-foreground">
              <h3 className="text-lg md:text-xl font-semibold mb-2">Performance Highlights</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm md:text-base">Top Performer</span>
                  <span className="font-semibold text-sm md:text-base">Sarah Johnson</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm md:text-base">Best Deal This Month</span>
                  <span className="font-semibold text-sm md:text-base">$850K</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm md:text-base">Team Target Achievement</span>
                  <span className="font-semibold text-sm md:text-base">104.7%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gold to-gold/80 rounded-lg p-4 md:p-6 text-gold-foreground">
              <h3 className="text-lg md:text-xl font-semibold mb-2 flex items-center gap-2">
                <Award className="h-4 w-4 md:h-5 md:w-5" />
                Loyalty Program
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm md:text-base">Active Members</span>
                  <span className="font-semibold text-sm md:text-base">2,847</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm md:text-base">Points Distributed</span>
                  <span className="font-semibold text-sm md:text-base">15.2M</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm md:text-base">Rewards Claimed</span>
                  <span className="font-semibold text-sm md:text-base">1,203</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
