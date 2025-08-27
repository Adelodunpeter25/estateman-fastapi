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
import { useState } from "react"

const referralData = [
  {
    id: "1",
    name: "Sarah Johnson",
    level: "Diamond Partner",
    directReferrals: 24,
    totalNetwork: 187,
    monthlyCommission: 15420,
    totalEarnings: 287650,
    status: "Active",
    joinDate: "Jan 2023",
    downlineLevel: 4
  },
  {
    id: "2",
    name: "Mike Chen",
    level: "Gold Partner",
    directReferrals: 18,
    totalNetwork: 143,
    monthlyCommission: 11280,
    totalEarnings: 195430,
    status: "Active",
    joinDate: "Mar 2023",
    downlineLevel: 3
  },
  {
    id: "3",
    name: "Emily Davis",
    level: "Silver Partner",
    directReferrals: 12,
    totalNetwork: 67,
    monthlyCommission: 6890,
    totalEarnings: 98760,
    status: "Active",
    joinDate: "Jun 2023",
    downlineLevel: 2
  },
  {
    id: "4",
    name: "James Wilson",
    level: "Bronze Partner",
    directReferrals: 8,
    totalNetwork: 34,
    monthlyCommission: 3450,
    totalEarnings: 42130,
    status: "Active",
    joinDate: "Aug 2023",
    downlineLevel: 2
  }
]

const recentReferrals = [
  {
    id: "1",
    referrer: "Sarah Johnson",
    newMember: "Alex Rodriguez",
    type: "Direct Referral",
    bonus: 500,
    date: "2 hours ago"
  },
  {
    id: "2",
    referrer: "Mike Chen",
    newMember: "Jessica Liu",
    type: "Level 2 Bonus",
    bonus: 250,
    date: "5 hours ago"
  },
  {
    id: "3",
    referrer: "Emily Davis",
    newMember: "David Park",
    type: "Direct Referral",
    bonus: 500,
    date: "1 day ago"
  }
]

const Referrals = () => {
  const [showTreeDialog, setShowTreeDialog] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<{id: string, name: string} | null>(null)

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
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">+156 this month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Network Size</CardTitle>
              <Network className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8,431</div>
              <p className="text-xs text-muted-foreground">7 levels deep</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Referral Bonus</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">$487K</div>
              <p className="text-xs text-muted-foreground">+23.4% vs last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gold">67.8%</div>
              <p className="text-xs text-muted-foreground">Referral to partner</p>
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
                {referralData.map((partner, index) => (
                  <div key={partner.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {partner.name.split(' ').map(n => n[0]).join('')}
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
                          <h4 className="font-medium">{partner.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Member since {partner.joinDate}
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
                        <p className="font-semibold">{partner.directReferrals}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Network</p>
                        <p className="font-semibold">{partner.totalNetwork}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Monthly Commission</p>
                        <p className="font-semibold text-success">
                          ${partner.monthlyCommission.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Earnings</p>
                        <p className="font-semibold text-primary">
                          ${partner.totalEarnings.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        Network Depth: {partner.downlineLevel} levels
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewTree({id: partner.id, name: partner.name})}
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
                {recentReferrals.map((referral) => (
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
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-semibold text-lg mb-2">Level 1</h4>
                <p className="text-2xl font-bold text-primary mb-1">15%</p>
                <p className="text-sm text-muted-foreground">Direct Referrals</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-semibold text-lg mb-2">Level 2</h4>
                <p className="text-2xl font-bold text-primary mb-1">7%</p>
                <p className="text-sm text-muted-foreground">Second Level</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-semibold text-lg mb-2">Level 3</h4>
                <p className="text-2xl font-bold text-primary mb-1">3%</p>
                <p className="text-sm text-muted-foreground">Third Level</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-semibold text-lg mb-2">Levels 4-7</h4>
                <p className="text-2xl font-bold text-primary mb-1">1%</p>
                <p className="text-sm text-muted-foreground">Deep Network</p>
              </div>
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