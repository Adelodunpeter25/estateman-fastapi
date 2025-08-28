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
import { ArrowLeft, DollarSign, Star, TrendingUp, Calendar, Phone, Mail, MapPin, Award, Eye, Edit, Home, User } from "lucide-react"

// This would typically come from an API or database
const getClientData = (id: string) => {
  const clients = {
    "C001": {
      id: "C001",
      name: "David Thompson",
      email: "david.thompson@email.com",
      phone: "+1 (555) 987-6543",
      status: "Active",
      leadScore: 95,
      loyaltyPoints: 2850,
      joinDate: "2023-08-15",
      realtorId: "R001",
      realtorName: "Sarah Johnson",
      realtorReferralId: "SJ2025001",
      totalTransactions: 3,
      totalValue: 1250000,
      currentInterest: "Luxury Condos",
      preferredLocation: "Downtown",
      budget: { min: 800000, max: 1200000 },
      stage: "Viewing Properties",
      lastContact: "2025-01-28",
      avatar: "/placeholder.svg",
      notes: "High-value client interested in luxury properties. Prefers modern architecture.",
      preferences: {
        propertyType: "Luxury Condos",
        bedrooms: "3-4",
        bathrooms: "2+",
        features: ["City View", "Modern Kitchen", "Parking", "Gym Access"],
        commute: "Financial District"
      },
      transactions: [
        {
          id: "T001",
          property: "Downtown Luxury Condo",
          address: "123 Main St, Suite 2501",
          value: 950000,
          date: "2023-12-15",
          status: "Completed",
          type: "Purchase"
        },
        {
          id: "T002",
          property: "Investment Property",
          address: "456 Oak Ave",
          value: 650000,
          date: "2023-09-20",
          status: "Completed",
          type: "Purchase"
        },
        {
          id: "T003",
          property: "Penthouse Suite",
          address: "789 Elite Tower",
          value: 1200000,
          date: "2025-01-30",
          status: "In Progress",
          type: "Purchase"
        }
      ],
      activities: [
        { date: "2025-01-30", activity: "Scheduled viewing for Penthouse Suite", type: "appointment" },
        { date: "2025-01-28", activity: "Submitted offer for Elite Tower penthouse", type: "offer" },
        { date: "2025-01-25", activity: "Property search updated with new criteria", type: "search" },
        { date: "2025-01-22", activity: "Phone consultation with Sarah Johnson", type: "consultation" }
      ],
      documents: [
        { name: "Pre-approval Letter", type: "Financial", date: "2025-01-15", status: "Valid" },
        { name: "Property Inspection Report", type: "Inspection", date: "2025-01-20", status: "Completed" },
        { name: "Purchase Agreement", type: "Legal", date: "2025-01-28", status: "Pending" }
      ]
    }
  }
  
  return clients[id] || null
}

const ClientDetail = () => {
  const { id } = useParams()
  const client = getClientData(id)
  const [activeTab, setActiveTab] = useState("overview")

  if (!client) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Client Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested client could not be found.</p>
            <Link to="/clients">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Clients
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-success/10 text-success border-success/20"
      case "Lead":
        return "bg-warning/10 text-warning border-warning/20"
      case "Inactive":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Under Contract":
        return "bg-primary/10 text-primary border-primary/20"
      case "Negotiating":
        return "bg-warning/10 text-warning border-warning/20"
      case "Viewing Properties":
        return "bg-info/10 text-info border-info/20"
      case "Initial Consultation":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getLeadScoreColor = (score: number) => {
    if (score >= 90) return "text-success"
    if (score >= 70) return "text-warning"
    return "text-muted-foreground"
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "offer":
        return <DollarSign className="h-4 w-4 text-success" />
      case "appointment":
        return <Calendar className="h-4 w-4 text-primary" />
      case "consultation":
        return <User className="h-4 w-4 text-warning" />
      case "search":
        return <Home className="h-4 w-4 text-info" />
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
            <Link to="/clients">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Client Profile</h1>
              <p className="text-muted-foreground">Detailed view of client information and transactions</p>
            </div>
          </div>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        {/* Client Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={client.avatar} />
                  <AvatarFallback className="text-xl">
                    {client.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <CardTitle className="text-2xl">{client.name}</CardTitle>
                    <Badge className={getStatusColor(client.status)}>
                      {client.status}
                    </Badge>
                    <Badge className={getStageColor(client.stage)}>
                      {client.stage}
                    </Badge>
                  </div>
                  <CardDescription className="text-base">
                    Client ID: {client.id} • Joined {client.joinDate}
                  </CardDescription>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Mail className="mr-1 h-4 w-4" />
                      {client.email}
                    </div>
                    <div className="flex items-center">
                      <Phone className="mr-1 h-4 w-4" />
                      {client.phone}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4" />
                      {client.preferredLocation}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="flex items-center justify-end">
                  <span className={`text-xl font-bold ${getLeadScoreColor(client.leadScore)}`}>
                    {client.leadScore}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">/100</span>
                </div>
                <div className="text-sm text-muted-foreground">Lead Score</div>
                <div className="flex items-center justify-end text-warning">
                  <Award className="mr-1 h-4 w-4" />
                  <span className="font-bold">{client.loyaltyPoints}</span>
                </div>
                <div className="text-sm text-muted-foreground">Loyalty Points</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Assigned Realtor</h4>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="font-medium">{client.realtorName}</div>
                  <div className="text-sm text-muted-foreground">ID: {client.realtorReferralId}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Budget Range</h4>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="font-medium">
                    ${(client.budget.min / 1000)}K - ${(client.budget.max / 1000)}K
                  </div>
                  <div className="text-sm text-muted-foreground">Current interest: {client.currentInterest}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Transactions"
            value={client.totalTransactions}
            icon={TrendingUp}
            change={{ value: "+1", type: "increase" }}
            description="Completed and active"
          />
          <StatsCard
            title="Transaction Value"
            value={`$${(client.totalValue / 1000000).toFixed(1)}M`}
            icon={DollarSign}
            change={{ value: "+25%", type: "increase" }}
            description="Total portfolio value"
          />
          <StatsCard
            title="Lead Score"
            value={client.leadScore}
            icon={Star}
            change={{ value: "+5", type: "increase" }}
            description="Engagement rating"
          />
          <StatsCard
            title="Loyalty Points"
            value={client.loyaltyPoints}
            icon={Award}
            change={{ value: "+150", type: "increase" }}
            description="Rewards earned"
          />
        </div>

        {/* Detailed Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Client Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Client Notes</CardTitle>
                  <CardDescription>Important information and observations</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{client.notes}</p>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Notes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                  <CardDescription>Key client metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{client.totalTransactions}</div>
                      <div className="text-sm text-muted-foreground">Transactions</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-success">${(client.totalValue / 1000000).toFixed(1)}M</div>
                      <div className="text-sm text-muted-foreground">Total Value</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-warning">{client.leadScore}</div>
                      <div className="text-sm text-muted-foreground">Lead Score</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-info">{client.loyaltyPoints}</div>
                      <div className="text-sm text-muted-foreground">Loyalty Points</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>All transactions for {client.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {client.transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.property}</TableCell>
                        <TableCell>{transaction.address}</TableCell>
                        <TableCell className="font-medium">${transaction.value.toLocaleString()}</TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.status === "Completed" ? "default" : "secondary"}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.type}</TableCell>
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

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Property Preferences</CardTitle>
                <CardDescription>Client's property search criteria and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Property Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Property Type:</span>
                          <span className="font-medium">{client.preferences.propertyType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bedrooms:</span>
                          <span className="font-medium">{client.preferences.bedrooms}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bathrooms:</span>
                          <span className="font-medium">{client.preferences.bathrooms}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Commute to:</span>
                          <span className="font-medium">{client.preferences.commute}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Desired Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {client.preferences.features.map((feature) => (
                          <Badge key={feature} variant="outline">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Budget Range</h4>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg font-bold">
                          ${client.budget.min.toLocaleString()} - ${client.budget.max.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Current budget range</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest interactions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {client.activities.map((activity, index) => (
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

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Client documents and paperwork</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {client.documents.map((doc, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{doc.name}</TableCell>
                        <TableCell>{doc.type}</TableCell>
                        <TableCell>{doc.date}</TableCell>
                        <TableCell>
                          <Badge variant={doc.status === "Valid" || doc.status === "Completed" ? "default" : "secondary"}>
                            {doc.status}
                          </Badge>
                        </TableCell>
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
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export default ClientDetail