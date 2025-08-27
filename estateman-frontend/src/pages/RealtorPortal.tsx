import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Award,
  Calendar,
  Target,
  Building2,
  FileText,
  Bell,
  Download,
  Eye,
  UserPlus,
  Network,
  Crown,
  Gift,
  Share2,
  Mail,
  Image,
  Trophy,
  Play,
  Star,
  Medal,
  Plus
} from "lucide-react"
import { MLMTreeDiagram } from "@/components/MLMTreeDiagram"

// Sample realtor data
const realtorData = {
  id: "R001",
  name: "Sarah Johnson",
  referralId: "SJ2024001",
  email: "sarah.johnson@realty.com",
  phone: "+1 (555) 123-4567",
  level: "Diamond Partner",
  avatar: "/placeholder.svg",
  joinDate: "Jan 2023",
  status: "Active"
}

// Sample performance data
const performanceStats = {
  totalCommissions: 287650,
  monthlyCommissions: 15420,
  clientsReferred: 24,
  totalNetwork: 187,
  networkDepth: 4,
  conversionRate: 67.8,
  rankProgress: 85
}

// Sample clients data
const myClients = [
  {
    id: "C001",
    name: "David Thompson",
    email: "david.thompson@email.com",
    status: "Active",
    leadScore: 95,
    stage: "Viewing Properties",
    totalValue: 1250000,
    lastContact: "2024-01-28"
  },
  {
    id: "C004", 
    name: "Lisa Anderson",
    email: "lisa.anderson@email.com",
    status: "Lead",
    leadScore: 65,
    stage: "Initial Consultation",
    totalValue: 0,
    lastContact: "2024-01-30"
  }
]

// Sample downline data
const myDownline = [
  {
    id: "R002",
    name: "Mike Chen",
    referralId: "MC2024002",
    level: "Gold Partner",
    directReferrals: 18,
    monthlyCommission: 11280,
    joinDate: "Mar 2023"
  },
  {
    id: "R003",
    name: "Emily Davis", 
    referralId: "ED2024003",
    level: "Silver Partner",
    directReferrals: 12,
    monthlyCommission: 6890,
    joinDate: "Jun 2023"
  }
]

// Sample announcements
const announcements = [
  {
    id: "1",
    title: "New Commission Structure Update",
    content: "We're excited to announce improved commission rates for Diamond Partners...",
    date: "2024-01-30",
    type: "important"
  },
  {
    id: "2", 
    title: "Training Webinar: Advanced Sales Techniques",
    content: "Join us for an exclusive training session on February 15th...",
    date: "2024-01-29",
    type: "training"
  }
]

// Sample events
const upcomingEvents = [
  {
    id: "1",
    title: "Regional Sales Conference",
    date: "2024-02-15",
    time: "9:00 AM - 5:00 PM",
    location: "Downtown Convention Center",
    type: "conference"
  },
  {
    id: "2",
    title: "Monthly Team Meeting", 
    date: "2024-02-05",
    time: "2:00 PM - 3:00 PM",
    location: "Virtual Meeting",
    type: "meeting"
  }
]

const RealtorPortal = () => {
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([])
  const [showMLMTree, setShowMLMTree] = useState(false)

  const handleEventRegistration = (eventId: string) => {
    if (registeredEvents.includes(eventId)) {
      setRegisteredEvents(prev => prev.filter(id => id !== eventId))
    } else {
      setRegisteredEvents(prev => [...prev, eventId])
    }
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
        return "bg-green-100 text-green-800 border-green-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-success/10 text-success border-success/20"
      case "Lead":
        return "bg-warning/10 text-warning border-warning/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={realtorData.avatar} />
                <AvatarFallback>
                  {realtorData.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{realtorData.name}</h1>
                <div className="flex items-center space-x-2">
                  <Badge className={getLevelColor(realtorData.level)}>
                    {realtorData.level}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    ID: {realtorData.referralId}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite New Partner
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Commissions"
            value={`$${(performanceStats.totalCommissions / 1000).toFixed(0)}K`}
            icon={DollarSign}
            change={{ value: "+15.2%", type: "increase" }}
            description="All time earnings"
          />
          <StatsCard
            title="Monthly Commissions"
            value={`$${(performanceStats.monthlyCommissions / 1000).toFixed(1)}K`}
            icon={TrendingUp}
            change={{ value: "+8.4%", type: "increase" }}
            description="This month"
          />
          <StatsCard
            title="Network Size"
            value={performanceStats.totalNetwork}
            icon={Network}
            change={{ value: "+23", type: "increase" }}
            description="Total downline"
          />
          <StatsCard
            title="Conversion Rate"
            value={`${performanceStats.conversionRate}%`}
            icon={Target}
            change={{ value: "+2.1%", type: "increase" }}
            description="Lead to client"
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="leads">Lead Management</TabsTrigger>
            <TabsTrigger value="clients">My Clients</TabsTrigger>
            <TabsTrigger value="sales">Sales Performance</TabsTrigger>
            <TabsTrigger value="downline">My Network</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Rank Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-gold" />
                    Rank Progress
                  </CardTitle>
                  <CardDescription>Progress towards next level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Current: {realtorData.level}</span>
                      <span className="text-sm text-muted-foreground">Next: Crown Partner</span>
                    </div>
                    <Progress value={performanceStats.rankProgress} className="h-3" />
                    <p className="text-sm text-muted-foreground">
                      {100 - performanceStats.rankProgress}% to next rank
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New Client
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="h-4 w-4 mr-2" />
                    Browse Properties
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setShowMLMTree(true)}
                  >
                    <Network className="h-4 w-4 mr-2" />
                    View MLM Tree
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Commission Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Gift className="h-4 w-4 mr-2" />
                    Loyalty Rewards
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">New client referral</p>
                      <p className="text-sm text-muted-foreground">David Thompson joined your network</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-success/10 text-success border-success/20">+$500</Badge>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Commission payment</p>
                      <p className="text-sm text-muted-foreground">Monthly commission processed</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-success/10 text-success border-success/20">+$15,420</Badge>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lead Management</CardTitle>
                <CardDescription>Manage and track your leads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary">42</p>
                      <p className="text-sm text-muted-foreground">Total Leads</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-success">18</p>
                      <p className="text-sm text-muted-foreground">Hot Leads</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-warning">12</p>
                      <p className="text-sm text-muted-foreground">Follow-ups</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-purple-600">8</p>
                      <p className="text-sm text-muted-foreground">Converted</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: "Alex Rodriguez", email: "alex@email.com", score: 85, status: "Hot", source: "Website" },
                      { name: "Maria Santos", email: "maria@email.com", score: 72, status: "Warm", source: "Referral" },
                      { name: "James Wilson", email: "james@email.com", score: 68, status: "Cold", source: "Social Media" },
                      { name: "Emma Thompson", email: "emma@email.com", score: 91, status: "Hot", source: "Direct Call" }
                    ].map((lead, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{lead.name}</h4>
                            <p className="text-sm text-muted-foreground">{lead.email}</p>
                            <p className="text-xs text-muted-foreground">Source: {lead.source}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={
                              lead.status === "Hot" ? "bg-red-100 text-red-800" :
                              lead.status === "Warm" ? "bg-yellow-100 text-yellow-800" :
                              "bg-blue-100 text-blue-800"
                            }>
                              {lead.status}
                            </Badge>
                            <span className="text-sm font-medium">Score: {lead.score}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline">Call</Button>
                          <Button size="sm" variant="outline">Email</Button>
                          <Button size="sm">Follow Up</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Clients ({myClients.length})</CardTitle>
                <CardDescription>Clients you've referred to the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myClients.map((client) => (
                    <div key={client.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{client.name}</h4>
                          <p className="text-sm text-muted-foreground">{client.email}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(client.status)}>
                            {client.status}
                          </Badge>
                          <span className="text-sm font-medium">Score: {client.leadScore}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Stage</p>
                          <p className="font-medium">{client.stage}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Value</p>
                          <p className="font-medium">${(client.totalValue / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Contact</p>
                          <p className="font-medium">{client.lastContact}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sales Performance</CardTitle>
                <CardDescription>Track your direct and indirect sales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 border rounded-lg">
                      <h4 className="font-semibold mb-4">Direct Sales</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>This Month</span>
                          <span className="font-bold text-success">$125,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>This Quarter</span>
                          <span className="font-bold">$340,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>This Year</span>
                          <span className="font-bold">$1,280,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Deals Closed</span>
                          <span className="font-bold text-primary">24</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 border rounded-lg">
                      <h4 className="font-semibold mb-4">Indirect Sales (Team)</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>This Month</span>
                          <span className="font-bold text-success">$287,500</span>
                        </div>
                        <div className="flex justify-between">
                          <span>This Quarter</span>
                          <span className="font-bold">$756,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>This Year</span>
                          <span className="font-bold">$2,840,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Team Deals</span>
                          <span className="font-bold text-primary">68</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-4">Recent Sales Activity</h4>
                    <div className="space-y-3">
                      {[
                        { property: "456 Ocean View Dr", client: "Sarah Martinez", amount: "$850,000", type: "Direct", date: "2024-01-28" },
                        { property: "123 Downtown Plaza", client: "Mike Chen (Team)", amount: "$1,200,000", type: "Indirect", date: "2024-01-26" },
                        { property: "789 Sunset Blvd", client: "Jennifer Kim", amount: "$725,000", type: "Direct", date: "2024-01-25" },
                        { property: "321 Garden Estates", client: "Lisa Davis (Team)", amount: "$950,000", type: "Indirect", date: "2024-01-24" }
                      ].map((sale, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-medium">{sale.property}</h5>
                              <p className="text-sm text-muted-foreground">{sale.client}</p>
                              <p className="text-xs text-muted-foreground">{sale.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-success">{sale.amount}</p>
                              <Badge variant={sale.type === "Direct" ? "default" : "secondary"}>
                                {sale.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="downline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Network ({myDownline.length} Direct)</CardTitle>
                <CardDescription>Partners you've referred</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myDownline.map((partner) => (
                    <div key={partner.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{partner.name}</h4>
                          <p className="text-sm text-muted-foreground">ID: {partner.referralId}</p>
                        </div>
                        <Badge className={getLevelColor(partner.level)}>
                          {partner.level}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Direct Referrals</p>
                          <p className="font-medium">{partner.directReferrals}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Monthly Commission</p>
                          <p className="font-medium text-success">${partner.monthlyCommission.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Joined</p>
                          <p className="font-medium">{partner.joinDate}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Commission History</CardTitle>
                <CardDescription>Your earnings and commission breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">This Month</p>
                      <p className="text-2xl font-bold text-success">$15,420</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">Last Month</p>
                      <p className="text-2xl font-bold">$14,250</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">All Time</p>
                      <p className="text-2xl font-bold">$287,650</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Direct Referral Commission</p>
                        <p className="text-sm text-muted-foreground">January 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-success">+$7,500</p>
                        <Button variant="ghost" size="sm">
                          <Download className="h-3 w-3 mr-1" />
                          Receipt
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Level 2 Bonus</p>
                        <p className="text-sm text-muted-foreground">January 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-success">+$3,920</p>
                        <Button variant="ghost" size="sm">
                          <Download className="h-3 w-3 mr-1" />
                          Receipt
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Register for training sessions and conferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {event.date}
                            </span>
                            <span>{event.time}</span>
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <Button
                          variant={registeredEvents.includes(event.id) ? "default" : "outline"}
                          onClick={() => handleEventRegistration(event.id)}
                        >
                          {registeredEvents.includes(event.id) ? "Registered" : "Register"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Company Announcements</CardTitle>
                <CardDescription>Latest updates and news</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{announcement.title}</h4>
                        <Badge variant="outline">
                          {announcement.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {announcement.content}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{announcement.date}</span>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Read More
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marketing" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Marketing Materials</CardTitle>
                  <CardDescription>Download and share marketing assets</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Property Brochure Template", type: "PDF", size: "2.4 MB", downloads: 156 },
                    { name: "Social Media Kit", type: "ZIP", size: "8.1 MB", downloads: 89 },
                    { name: "Email Signature Template", type: "HTML", size: "45 KB", downloads: 234 },
                    { name: "Business Card Design", type: "AI", size: "1.2 MB", downloads: 67 }
                  ].map((material, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Image className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{material.name}</p>
                          <p className="text-sm text-muted-foreground">{material.type} • {material.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">{material.downloads} downloads</span>
                        <Button size="sm">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Campaigns</CardTitle>
                  <CardDescription>Your current marketing campaigns</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "First-Time Buyer Campaign", type: "Email", status: "Active", responses: 23, sent: 150 },
                    { name: "Luxury Properties Showcase", type: "Social", status: "Active", responses: 45, sent: 300 },
                    { name: "Neighborhood Insights", type: "Newsletter", status: "Scheduled", responses: 0, sent: 0 }
                  ].map((campaign, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{campaign.name}</h4>
                        <Badge variant={campaign.status === 'Active' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Type</p>
                          <p className="font-medium">{campaign.type}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Sent</p>
                          <p className="font-medium">{campaign.sent}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Responses</p>
                          <p className="font-medium text-success">{campaign.responses}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Campaign
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Social Media Tools</CardTitle>
                <CardDescription>Share content directly to your social platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                    <Share2 className="h-6 w-6 mb-2" />
                    Share Property
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                    <Mail className="h-6 w-6 mb-2" />
                    Email Blast
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                    <Image className="h-6 w-6 mb-2" />
                    Create Post
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-gold" />
                  Leaderboard
                </CardTitle>
                <CardDescription>Top performers this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { rank: 1, name: "Sarah Johnson", commission: 287650, clients: 24, badge: "👑" },
                    { rank: 2, name: "Mike Chen", commission: 245300, clients: 18, badge: "🥈" },
                    { rank: 3, name: "Emily Davis", commission: 198750, clients: 15, badge: "🥉" },
                    { rank: 4, name: "James Wilson", commission: 167890, clients: 12, badge: "" },
                    { rank: 5, name: "Lisa Garcia", commission: 156430, clients: 11, badge: "" }
                  ].map((performer) => (
                    <div 
                      key={performer.rank} 
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        performer.name === realtorData.name ? 'bg-primary/5 border-primary/20' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold">#{performer.rank}</span>
                          {performer.badge && <span className="text-lg">{performer.badge}</span>}
                        </div>
                        <div>
                          <p className="font-medium">{performer.name}</p>
                          <p className="text-sm text-muted-foreground">{performer.clients} clients</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-success">${performer.commission.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Total commissions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Medal className="h-8 w-8 mx-auto mb-2 text-gold" />
                  <p className="text-sm text-muted-foreground">Your Rank</p>
                  <p className="text-2xl font-bold">#1</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Star className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Points This Month</p>
                  <p className="text-2xl font-bold">2,450</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-warning" />
                  <p className="text-sm text-muted-foreground">Achievement Level</p>
                  <p className="text-2xl font-bold">Elite</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* MLM Tree Modal */}
      {showMLMTree && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-lg shadow-lg w-full max-w-6xl h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">MLM Network Tree</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowMLMTree(false)}>
                ×
              </Button>
            </div>
            <div className="h-full overflow-auto">
              <MLMTreeDiagram isOpen={showMLMTree} onClose={() => setShowMLMTree(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RealtorPortal