
import { DashboardLayout } from "@/components/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Award, 
  Star, 
  Gift, 
  Users, 
  TrendingUp,
  Trophy,
  Crown,
  Zap,
  Target,
  Calendar
} from "lucide-react"

const Loyalty = () => {
  const loyaltyStats = [
    { label: "Active Members", value: "2,847", change: "+156", icon: Users },
    { label: "Points Distributed", value: "15.2M", change: "+2.1M", icon: Zap },
    { label: "Rewards Claimed", value: "1,203", change: "+87", icon: Gift },
    { label: "Engagement Rate", value: "78.4%", change: "+5.2%", icon: TrendingUp }
  ]

  const memberTiers = [
    { 
      name: "Bronze", 
      members: 1247, 
      percentage: 44, 
      color: "bg-orange-500",
      benefits: "5% cashback, Basic support",
      pointsRequired: "0 - 999"
    },
    { 
      name: "Silver", 
      members: 892, 
      percentage: 31, 
      color: "bg-gray-400",
      benefits: "10% cashback, Priority support",
      pointsRequired: "1,000 - 4,999"
    },
    { 
      name: "Gold", 
      members: 534, 
      percentage: 19, 
      color: "bg-gold",
      benefits: "15% cashback, VIP support, Exclusive events",
      pointsRequired: "5,000 - 14,999"
    },
    { 
      name: "Platinum", 
      members: 174, 
      percentage: 6, 
      color: "bg-purple-500",
      benefits: "20% cashback, Personal advisor, Premium perks",
      pointsRequired: "15,000+"
    }
  ]

  const topMembers = [
    { name: "Sarah Johnson", points: 24500, tier: "Platinum", avatar: "SJ", deals: 12 },
    { name: "Mike Wilson", points: 18750, tier: "Platinum", avatar: "MW", deals: 9 },
    { name: "Lisa Chen", points: 15200, tier: "Platinum", avatar: "LC", deals: 8 },
    { name: "David Brown", points: 12800, tier: "Gold", avatar: "DB", deals: 7 },
    { name: "Emma Davis", points: 11500, tier: "Gold", avatar: "ED", deals: 6 }
  ]

  const recentActivities = [
    { user: "Sarah Johnson", action: "Earned 500 points", detail: "Property sale bonus", time: "2 hours ago" },
    { user: "Mike Wilson", action: "Redeemed reward", detail: "Premium marketing package", time: "4 hours ago" },
    { user: "Lisa Chen", action: "Tier upgrade", detail: "Promoted to Platinum", time: "1 day ago" },
    { user: "David Brown", action: "Earned 250 points", detail: "Client referral bonus", time: "2 days ago" },
    { user: "Emma Davis", action: "Earned 300 points", detail: "Monthly activity bonus", time: "3 days ago" }
  ]

  const availableRewards = [
    { name: "Premium Marketing Package", cost: 2500, category: "Marketing", claimed: 45 },
    { name: "Professional Photography", cost: 1500, category: "Services", claimed: 78 },
    { name: "Luxury Gift Hamper", cost: 1000, category: "Gifts", claimed: 123 },
    { name: "Training Workshop Access", cost: 3000, category: "Education", claimed: 34 },
    { name: "Exclusive Event Ticket", cost: 2000, category: "Events", claimed: 56 }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Award className="h-8 w-8 text-gold" />
              Loyalty Program
            </h1>
            <p className="text-muted-foreground">Reward and engage your real estate team</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Gift className="h-4 w-4 mr-2" />
              Add Reward
            </Button>
            <Button className="bg-primary">
              <Star className="h-4 w-4 mr-2" />
              Manage Points
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loyaltyStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <stat.icon className="h-8 w-8 text-primary mb-2" />
                    <Badge variant="outline" className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Member Tiers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Member Tiers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {memberTiers.map((tier, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full ${tier.color}`}></div>
                            <span className="font-medium">{tier.name}</span>
                            <Badge variant="outline">{tier.pointsRequired}</Badge>
                          </div>
                          <span className="text-sm font-semibold">{tier.members} members</span>
                        </div>
                        <Progress value={tier.percentage} className="h-2" />
                        <p className="text-sm text-muted-foreground">{tier.benefits}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topMembers.map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                            {member.avatar}
                          </div>
                          <div>
                            <h4 className="font-medium">{member.name}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant={member.tier === 'Platinum' ? 'default' : 'secondary'}>
                                {member.tier}
                              </Badge>
                              <span className="text-sm text-muted-foreground">{member.deals} deals</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gold">{member.points.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest loyalty program activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Star className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{activity.user}</h4>
                          <p className="text-sm text-muted-foreground">{activity.action} - {activity.detail}</p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Rewards</CardTitle>
                <CardDescription>Manage reward catalog and redemptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableRewards.map((reward, index) => (
                    <Card key={index} className="border">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{reward.category}</Badge>
                            <div className="flex items-center gap-1 text-gold">
                              <Target className="h-4 w-4" />
                              <span className="font-semibold">{reward.cost}</span>
                            </div>
                          </div>
                          <h4 className="font-medium">{reward.name}</h4>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Claimed {reward.claimed} times</span>
                            <Button size="sm" variant="outline">Edit</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Member Management</CardTitle>
                    <CardDescription>View and manage loyalty program members</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Users className="h-4 w-4 mr-2" />
                      Bulk Actions
                    </Button>
                    <Button size="sm">
                      <Target className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="flex gap-4 items-center">
                    <Input placeholder="Search members..." className="max-w-sm" />
                    <select className="px-3 py-2 border rounded-md">
                      <option value="">All Tiers</option>
                      <option value="bronze">Bronze</option>
                      <option value="silver">Silver</option>
                      <option value="gold">Gold</option>
                      <option value="platinum">Platinum</option>
                    </select>
                    <select className="px-3 py-2 border rounded-md">
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  
                  {/* Member List */}
                  <div className="border rounded-lg">
                    <div className="grid grid-cols-7 gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
                      <div>Member</div>
                      <div>Tier</div>
                      <div>Points</div>
                      <div>Deals</div>
                      <div>Join Date</div>
                      <div>Status</div>
                      <div>Actions</div>
                    </div>
                    {topMembers.map((member, index) => (
                      <div key={index} className="grid grid-cols-7 gap-4 p-4 border-b items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {member.avatar}
                          </div>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">member{index + 1}@example.com</p>
                          </div>
                        </div>
                        <div>
                          <Badge variant={member.tier === 'Platinum' ? 'default' : 'secondary'}>
                            {member.tier}
                          </Badge>
                        </div>
                        <div className="font-semibold text-gold">{member.points.toLocaleString()}</div>
                        <div>{member.deals}</div>
                        <div className="text-sm text-muted-foreground">Jan {15 + index}, 2024</div>
                        <div>
                          <Badge variant="outline" className="bg-success/10 text-success">Active</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">Points</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Engagement Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Engagement Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold text-primary">87.3%</p>
                        <p className="text-sm text-muted-foreground">Active Rate</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold text-success">4.2</p>
                        <p className="text-sm text-muted-foreground">Avg Actions/Month</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Points Redemption Rate</span>
                        <span>68%</span>
                      </div>
                      <Progress value={68} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Member Retention (12mo)</span>
                        <span>84%</span>
                      </div>
                      <Progress value={84} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tier Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Tier Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {memberTiers.map((tier, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${tier.color}`}></div>
                            <span className="font-medium">{tier.name}</span>
                          </div>
                          <span>{tier.percentage}%</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                          <div>Members: {tier.members}</div>
                          <div>Avg Points: {Math.floor(Math.random() * 5000 + 1000)}</div>
                          <div>Growth: +{Math.floor(Math.random() * 20 + 5)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Performance Trends
                </CardTitle>
                <CardDescription>Monthly program performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">+24%</p>
                    <p className="text-sm text-muted-foreground">New Members</p>
                    <p className="text-xs text-success">vs last month</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gold">+18%</p>
                    <p className="text-sm text-muted-foreground">Points Earned</p>
                    <p className="text-xs text-success">vs last month</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">+32%</p>
                    <p className="text-sm text-muted-foreground">Rewards Claimed</p>
                    <p className="text-xs text-success">vs last month</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">+15%</p>
                    <p className="text-sm text-muted-foreground">Tier Upgrades</p>
                    <p className="text-xs text-success">vs last month</p>
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  <h4 className="font-medium">Top Performing Actions</h4>
                  <div className="space-y-2">
                    {[
                      { action: "Property Sales", points: "125,400", percentage: 45 },
                      { action: "Client Referrals", points: "87,600", percentage: 32 },
                      { action: "Marketing Activities", points: "52,300", percentage: 19 },
                      { action: "Training Completion", points: "11,100", percentage: 4 }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="font-medium">{item.action}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">{item.points} pts</span>
                          <div className="w-20">
                            <Progress value={item.percentage} className="h-1" />
                          </div>
                          <span className="text-sm font-medium w-8">{item.percentage}%</span>
                        </div>
                      </div>
                    ))}
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

export default Loyalty
