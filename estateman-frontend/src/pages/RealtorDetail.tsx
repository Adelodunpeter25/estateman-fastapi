import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Users, DollarSign, TrendingUp, Calendar, Phone, Mail, MapPin, Star, Award, Eye, Edit } from "lucide-react"

// This would typically come from an API or database
const getRealtorData = (id: string) => {
  const realtors = {
    "R001": {
      id: "R001",
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 123-4567",
      level: "Senior Agent",
      status: "Active",
      referralId: "SJ2024001",
      joinDate: "2022-01-15",
      totalClients: 45,
      activeDeals: 8,
      totalCommissions: 125000,
      monthlyTarget: 15000,
      monthlyEarned: 12500,
      rating: 4.8,
      specialties: ["Residential", "Luxury Homes"],
      location: "Downtown District",
      avatar: "/placeholder.svg",
      bio: "Experienced real estate agent specializing in luxury residential properties. Sarah has been consistently ranked among the top performers in the downtown district.",
      achievements: [
        "Top Performer 2023",
        "Client Satisfaction Award",
        "Luxury Sales Specialist"
      ],
      clients: [
        {
          id: "C001",
          name: "David Thompson",
          status: "Active",
          stage: "Viewing Properties",
          value: 1250000,
          lastContact: "2024-01-28"
        },
        {
          id: "C004",
          name: "Lisa Anderson",
          status: "Lead",
          stage: "Initial Consultation",
          value: 0,
          lastContact: "2024-01-30"
        }
      ],
      recentActivities: [
        { date: "2024-01-30", activity: "Scheduled property viewing with David Thompson", type: "appointment" },
        { date: "2024-01-29", activity: "Closed deal for luxury condo - $1.2M", type: "sale" },
        { date: "2024-01-28", activity: "New client consultation with Lisa Anderson", type: "consultation" },
        { date: "2024-01-27", activity: "Property listing updated for downtown penthouse", type: "listing" }
      ]
    }
  }
  
  return realtors[id] || null
}

const RealtorDetail = () => {
  const { id } = useParams()
  const realtor = getRealtorData(id)
  const [activeTab, setActiveTab] = useState("overview")

  if (!realtor) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Realtor Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested realtor could not be found.</p>
            <Link to="/realtors">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Realtors
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Team Lead":
        return "bg-primary/10 text-primary border-primary/20"
      case "Senior Agent":
        return "bg-success/10 text-success border-success/20"
      case "Junior Agent":
        return "bg-warning/10 text-warning border-warning/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "sale":
        return <DollarSign className="h-4 w-4 text-success" />
      case "appointment":
        return <Calendar className="h-4 w-4 text-primary" />
      case "consultation":
        return <Users className="h-4 w-4 text-warning" />
      default:
        return <TrendingUp className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/realtors">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Realtor Profile</h1>
              <p className="text-muted-foreground">Detailed view of realtor performance and clients</p>
            </div>
          </div>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        {/* Realtor Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={realtor.avatar} />
                  <AvatarFallback className="text-xl">
                    {realtor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <CardTitle className="text-2xl">{realtor.name}</CardTitle>
                    <Badge className={getLevelColor(realtor.level)}>
                      {realtor.level}
                    </Badge>
                  </div>
                  <CardDescription className="text-base">
                    Referral ID: {realtor.referralId} • Joined {realtor.joinDate}
                  </CardDescription>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Mail className="mr-1 h-4 w-4" />
                      {realtor.email}
                    </div>
                    <div className="flex items-center">
                      <Phone className="mr-1 h-4 w-4" />
                      {realtor.phone}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4" />
                      {realtor.location}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end mb-2">
                  <Star className="mr-1 h-5 w-5 fill-warning text-warning" />
                  <span className="text-xl font-bold">{realtor.rating}</span>
                </div>
                <div className="text-sm text-muted-foreground">Overall Rating</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-2">About</h4>
                <p className="text-sm text-muted-foreground">{realtor.bio}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {realtor.specialties.map((specialty) => (
                    <Badge key={specialty} variant="outline">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Achievements</h4>
                <div className="space-y-1">
                  {realtor.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <Award className="mr-2 h-4 w-4 text-warning" />
                      {achievement}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Clients"
            value={realtor.totalClients}
            icon={Users}
            change={{ value: "+5", type: "increase" }}
            description="All time clients"
          />
          <StatsCard
            title="Active Deals"
            value={realtor.activeDeals}
            icon={TrendingUp}
            change={{ value: "+2", type: "increase" }}
            description="Currently active"
          />
          <StatsCard
            title="Total Commissions"
            value={`$${realtor.totalCommissions.toLocaleString()}`}
            icon={DollarSign}
            change={{ value: "+18%", type: "increase" }}
            description="All time earnings"
          />
          <StatsCard
            title="Monthly Progress"
            value={`${Math.round((realtor.monthlyEarned / realtor.monthlyTarget) * 100)}%`}
            icon={TrendingUp}
            change={{ value: "+12%", type: "increase" }}
            description={`$${realtor.monthlyEarned.toLocaleString()} / $${realtor.monthlyTarget.toLocaleString()}`}
          />
        </div>

        {/* Detailed Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Progress</CardTitle>
                  <CardDescription>Current month performance vs target</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Commission Earned</span>
                      <span className="font-medium">${realtor.monthlyEarned.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className="bg-primary h-3 rounded-full transition-all" 
                        style={{ width: `${Math.min((realtor.monthlyEarned / realtor.monthlyTarget) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Target: ${realtor.monthlyTarget.toLocaleString()}</span>
                      <span>{Math.round((realtor.monthlyEarned / realtor.monthlyTarget) * 100)}% Complete</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{realtor.activeDeals}</div>
                      <div className="text-sm text-muted-foreground">Active Deals</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-success">{realtor.rating}</div>
                      <div className="text-sm text-muted-foreground">Rating</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-warning">{realtor.totalClients}</div>
                      <div className="text-sm text-muted-foreground">Total Clients</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-info">3.2%</div>
                      <div className="text-sm text-muted-foreground">Commission Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="clients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Client Portfolio</CardTitle>
                <CardDescription>All clients assigned to {realtor.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Last Contact</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {realtor.clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-muted-foreground">ID: {client.id}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={client.status === "Active" ? "default" : "secondary"}>
                            {client.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{client.stage}</TableCell>
                        <TableCell className="font-medium">
                          {client.value > 0 ? `$${client.value.toLocaleString()}` : "N/A"}
                        </TableCell>
                        <TableCell>{client.lastContact}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Detailed performance analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Conversion Rate</span>
                      <span className="font-bold text-success">68%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Deal Size</span>
                      <span className="font-bold">$425K</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Time to Close</span>
                      <span className="font-bold">42 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Client Retention</span>
                      <span className="font-bold text-success">85%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Targets</CardTitle>
                  <CardDescription>Progress towards monthly goals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Commission Target</span>
                        <span>83%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: "83%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>New Clients</span>
                        <span>120%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-success h-2 rounded-full" style={{ width: "100%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Deals Closed</span>
                        <span>75%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-warning h-2 rounded-full" style={{ width: "75%" }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest actions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {realtor.recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                      <div className="mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{activity.activity}</div>
                        <div className="text-xs text-muted-foreground mt-1">{activity.date}</div>
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

export default RealtorDetail