import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { 
  Crown, 
  Users, 
  TrendingUp, 
  DollarSign,
  Award,
  Network,
  ChevronRight,
  UserPlus
} from "lucide-react"
import { MLMTreeDiagram } from "@/components/MLMTreeDiagram"
import { useState, useEffect } from "react"
import { mlmService, type MLMAnalytics, type TeamPerformance, type ReferralActivity, type CommissionStructure } from "@/services/mlm"



const Referrals = () => {
  const [showTreeDialog, setShowTreeDialog] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<{id: string, name: string} | null>(null)
  const [analytics, setAnalytics] = useState<MLMAnalytics | null>(null)
  const [topPerformers, setTopPerformers] = useState<TeamPerformance[]>([])
  const [recentActivities, setRecentActivities] = useState<ReferralActivity[]>([])
  const [commissionStructure, setCommissionStructure] = useState<CommissionStructure[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsData, performersData, activitiesData, structureData] = await Promise.all([
          mlmService.getMLMAnalytics(),
          mlmService.getTopPerformers(4),
          mlmService.getRecentActivities(3),
          mlmService.getCommissionStructure()
        ])
        
        setAnalytics(analyticsData)
        setTopPerformers(performersData)
        setRecentActivities(activitiesData)
        setCommissionStructure(structureData)
      } catch (error) {
        console.error('Error fetching MLM data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleViewTree = (partner: {id: string, name: string}) => {
    setSelectedPartner(partner)
    setShowTreeDialog(true)
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Diamond Partner":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Gold Partner":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Silver Partner":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "Bronze Partner":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">MLM & Referral System</h1>
            <p className="text-muted-foreground">Multi-level marketing and referral management</p>
          </div>
          <Button className="bg-primary">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Partner
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Partners</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.active_partners?.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">Active partners</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Network Size</CardTitle>
              <Network className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.total_network_size?.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">{analytics?.network_depth || 0} levels deep</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Referral Bonus</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">${analytics?.monthly_referral_bonus ? (analytics.monthly_referral_bonus / 1000).toFixed(0) + 'K' : '0'}</div>
              <p className="text-xs text-muted-foreground">Monthly bonus</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gold">{analytics?.conversion_rate || 0}%</div>
              <p className="text-xs text-muted-foreground">Conversion rate</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-gold" />
                Top Network Builders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((partner, index) => (
                  <div key={partner.partner_id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {partner.partner_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {index < 3 && (
                            <div className="absolute -top-1 -right-1">
                              <Award className={`h-4 w-4 ${
                                index === 0 ? 'text-yellow-500' : 
                                index === 1 ? 'text-gray-400' : 'text-orange-500'
                              }`} />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{partner.partner_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Member since {partner.join_date}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={getLevelColor(partner.level)}>
                        {partner.level}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Direct Referrals</p>
                        <p className="font-semibold">{partner.direct_referrals}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Network</p>
                        <p className="font-semibold">{partner.total_network}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Monthly Commission</p>
                        <p className="font-semibold text-success">
                          ${partner.monthly_commission.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Earnings</p>
                        <p className="font-semibold text-primary">
                          ${partner.total_earnings.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        Network Depth: {partner.downline_level} levels
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewTree({id: partner.partner_id.toString(), name: partner.partner_name})}
                      >
                        View Tree
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Referral Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((referral) => (
                  <div key={referral.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">New Referral Bonus</h4>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        +${referral.bonus}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      <span className="font-medium">{referral.referrer}</span> referred{" "}
                      <span className="font-medium">{referral.newMember}</span>
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{referral.type}</span>
                      <span className="text-muted-foreground">{referral.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Commission Structure */}
        <Card>
          <CardHeader>
            <CardTitle>MLM Commission Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {commissionStructure.map((structure, index) => (
                <div key={index} className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold text-lg mb-2">Level {structure.level}</h4>
                  <p className="text-2xl font-bold text-primary mb-1">{structure.percentage}%</p>
                  <p className="text-sm text-muted-foreground">{structure.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <MLMTreeDiagram 
          isOpen={showTreeDialog}
          onClose={() => setShowTreeDialog(false)}
          partnerId={selectedPartner?.id}
          partnerName={selectedPartner?.name}
        />
      </div>
    </DashboardLayout>
  )
}

export default Referrals