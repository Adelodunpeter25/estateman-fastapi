import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Target, TrendingUp, Users, Star, Award, Zap, Calendar } from "lucide-react"

const SalesForce = () => {
  const gamificationStats = [
    { title: "Active Agents", value: "24", change: "+2", icon: Users },
    { title: "Monthly Target", value: "85%", change: "+5%", icon: Target },
    { title: "Top Performer", value: "Sarah W.", change: "15 deals", icon: Trophy },
    { title: "Team Energy", value: "92%", change: "+8%", icon: Zap },
  ]

  const leaderboard = [
    {
      rank: 1,
      name: "Sarah Wilson",
      avatar: "/placeholder.svg",
      points: 2850,
      deals: 15,
      revenue: 450000,
      badges: ["Top Seller", "Deal Closer"],
      level: "Diamond"
    },
    {
      rank: 2,
      name: "Mike Chen",
      avatar: "/placeholder.svg", 
      points: 2420,
      deals: 12,
      revenue: 380000,
      badges: ["Speed Demon", "Client Favorite"],
      level: "Platinum"
    },
    {
      rank: 3,
      name: "Emily Rodriguez",
      avatar: "/placeholder.svg",
      points: 2180,
      deals: 11,
      revenue: 340000,
      badges: ["Rising Star", "Team Player"],
      level: "Gold"
    },
    {
      rank: 4,
      name: "James Thompson",
      avatar: "/placeholder.svg",
      points: 1950,
      deals: 9,
      revenue: 290000,
      badges: ["Consistent", "Mentor"],
      level: "Gold"
    },
    {
      rank: 5,
      name: "Lisa Garcia",
      avatar: "/placeholder.svg",
      points: 1720,
      deals: 8,
      revenue: 260000,
      badges: ["Newcomer", "Quick Learner"],
      level: "Silver"
    }
  ]

  const achievements = [
    { title: "Deal Master", description: "Close 10 deals in a month", reward: "500 points", rarity: "rare" },
    { title: "Speed Demon", description: "Close a deal in under 7 days", reward: "300 points", rarity: "uncommon" },
    { title: "Client Whisperer", description: "Achieve 95% client satisfaction", reward: "400 points", rarity: "rare" },
    { title: "Team Player", description: "Refer 5 leads to colleagues", reward: "200 points", rarity: "common" },
    { title: "Revenue King", description: "Generate $1M in sales", reward: "1000 points", rarity: "legendary" },
    { title: "Streak Keeper", description: "Close deals 5 months in a row", reward: "750 points", rarity: "epic" }
  ]

  const getLevelBadge = (level: string) => {
    const colors = {
      Diamond: "bg-blue-100 text-blue-700",
      Platinum: "bg-gray-100 text-gray-700", 
      Gold: "bg-yellow-100 text-yellow-700",
      Silver: "bg-slate-100 text-slate-700"
    }
    return <Badge className={colors[level as keyof typeof colors]}>{level}</Badge>
  }

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: "border-gray-300",
      uncommon: "border-green-300", 
      rare: "border-blue-300",
      epic: "border-purple-300",
      legendary: "border-orange-300"
    }
    return colors[rarity as keyof typeof colors]
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Sales Force Management</h1>
          <p className="text-muted-foreground">Gamification and performance tracking for your sales team</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {gamificationStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{stat.change}</span> from last month
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Tabs defaultValue="leaderboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Leaderboard</CardTitle>
                <CardDescription>Top performing agents this month</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Deals</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Badges</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.map((agent) => (
                      <TableRow key={agent.rank}>
                        <TableCell>
                          <div className="flex items-center">
                            {agent.rank === 1 && <Trophy className="w-4 h-4 text-yellow-500 mr-1" />}
                            {agent.rank === 2 && <Award className="w-4 h-4 text-gray-400 mr-1" />}
                            {agent.rank === 3 && <Star className="w-4 h-4 text-orange-500 mr-1" />}
                            #{agent.rank}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={agent.avatar} />
                              <AvatarFallback>{agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{agent.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getLevelBadge(agent.level)}</TableCell>
                        <TableCell className="font-medium">{agent.points.toLocaleString()}</TableCell>
                        <TableCell>{agent.deals}</TableCell>
                        <TableCell>${agent.revenue.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {agent.badges.slice(0, 2).map((badge, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{badge}</Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => (
                <Card key={index} className={`border-2 ${getRarityColor(achievement.rarity)}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{achievement.title}</CardTitle>
                      <Badge variant="outline" className="text-xs">{achievement.rarity}</Badge>
                    </div>
                    <CardDescription>{achievement.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-green-600">{achievement.reward}</span>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Challenges</CardTitle>
                  <CardDescription>Current team challenges and progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">January Sales Sprint</span>
                      <span className="text-sm text-muted-foreground">12 days left</span>
                    </div>
                    <Progress value={68} className="h-2" />
                    <div className="text-sm text-muted-foreground">68% complete • 34/50 deals</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Client Satisfaction Week</span>
                      <span className="text-sm text-muted-foreground">5 days left</span>
                    </div>
                    <Progress value={85} className="h-2" />
                    <div className="text-sm text-muted-foreground">85% complete • 4.2/5.0 rating</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Referral Boost</span>
                      <span className="text-sm text-muted-foreground">20 days left</span>
                    </div>
                    <Progress value={45} className="h-2" />
                    <div className="text-sm text-muted-foreground">45% complete • 9/20 referrals</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Challenge Rewards</CardTitle>
                  <CardDescription>Upcoming rewards for completing challenges</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { challenge: "January Sales Sprint", reward: "Team Lunch + 1000 pts", status: "In Progress" },
                    { challenge: "Client Satisfaction Week", reward: "$500 bonus", status: "Almost Complete" },
                    { challenge: "Referral Boost", reward: "Extra PTO Day", status: "In Progress" },
                    { challenge: "Q1 Revenue Goal", reward: "Team Retreat", status: "Not Started" }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium">{item.challenge}</div>
                        <div className="text-sm text-muted-foreground">{item.reward}</div>
                      </div>
                      <Badge variant="outline">{item.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rewards Store</CardTitle>
                  <CardDescription>Redeem your points for exciting rewards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { item: "Extra PTO Day", cost: "2000 pts", availability: "Available" },
                    { item: "Prime Parking Spot", cost: "1500 pts", availability: "Available" },
                    { item: "Lunch with CEO", cost: "5000 pts", availability: "Limited" },
                    { item: "Home Office Setup", cost: "10000 pts", availability: "Premium" },
                    { item: "Conference Ticket", cost: "7500 pts", availability: "Available" },
                    { item: "Team Lead Mentorship", cost: "3000 pts", availability: "Available" }
                  ].map((reward, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{reward.item}</div>
                        <div className="text-sm text-muted-foreground">{reward.availability}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{reward.cost}</div>
                        <Button variant="outline" size="sm">Redeem</Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Redemptions</CardTitle>
                  <CardDescription>Latest reward redemptions by team members</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { agent: "Sarah Wilson", reward: "Extra PTO Day", date: "Jan 20, 2025", points: 2000 },
                    { agent: "Mike Chen", reward: "Prime Parking", date: "Jan 18, 2025", points: 1500 },
                    { agent: "Emily Rodriguez", reward: "Team Lead Mentorship", date: "Jan 15, 2025", points: 3000 },
                    { agent: "James Thompson", reward: "Conference Ticket", date: "Jan 12, 2025", points: 7500 }
                  ].map((redemption, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{redemption.agent}</div>
                        <div className="text-sm text-muted-foreground">{redemption.reward}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">{redemption.date}</div>
                        <div className="text-sm text-muted-foreground">{redemption.points} pts</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export default SalesForce