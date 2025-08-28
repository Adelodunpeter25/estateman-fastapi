import { useState } from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Users, Star, TrendingUp, DollarSign, Search, Plus, Edit, Eye, Phone, Mail, MapPin, Calendar, Award, Grid3X3, List } from "lucide-react"

// Sample client data
const clients = [
  {
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
    notes: "High-value client interested in luxury properties. Prefers modern architecture."
  },
  {
    id: "C002",
    name: "Jennifer Walsh",
    email: "jennifer.walsh@email.com",
    phone: "+1 (555) 876-5432",
    status: "Active",
    leadScore: 78,
    loyaltyPoints: 1650,
    joinDate: "2023-11-20",
    realtorId: "R002",
    realtorName: "Michael Chen",
    realtorReferralId: "MC2025002",
    totalTransactions: 1,
    totalValue: 485000,
    currentInterest: "Family Homes",
    preferredLocation: "Suburbs",
    budget: { min: 400000, max: 600000 },
    stage: "Under Contract",
    lastContact: "2025-01-29",
    avatar: "/placeholder.svg",
    notes: "First-time homebuyer looking for family-friendly neighborhood."
  },
  {
    id: "C003",
    name: "Robert Kim",
    email: "robert.kim@email.com",
    phone: "+1 (555) 765-4321",
    status: "Active",
    leadScore: 87,
    loyaltyPoints: 3200,
    joinDate: "2022-12-05",
    realtorId: "R003",
    realtorName: "Emily Rodriguez",
    realtorReferralId: "ER2025003",
    totalTransactions: 4,
    totalValue: 2100000,
    currentInterest: "Investment Properties",
    preferredLocation: "Business District",
    budget: { min: 300000, max: 800000 },
    stage: "Negotiating",
    lastContact: "2025-01-30",
    avatar: "/placeholder.svg",
    notes: "Experienced investor with multiple properties. Focuses on ROI and rental potential."
  },
  {
    id: "C004",
    name: "Lisa Anderson",
    email: "lisa.anderson@email.com",
    phone: "+1 (555) 654-3210",
    status: "Lead",
    leadScore: 65,
    loyaltyPoints: 0,
    joinDate: "2025-01-15",
    realtorId: "R001",
    realtorName: "Sarah Johnson",
    realtorReferralId: "SJ2025001",
    totalTransactions: 0,
    totalValue: 0,
    currentInterest: "Starter Homes",
    preferredLocation: "Midtown",
    budget: { min: 250000, max: 400000 },
    stage: "Initial Consultation",
    lastContact: "2025-01-30",
    avatar: "/placeholder.svg",
    notes: "New lead interested in purchasing first home. Needs financing guidance."
  }
]

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClient, setSelectedClient] = useState(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.realtorName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || client.status.toLowerCase() === filterStatus
    return matchesSearch && matchesStatus
  })

  const totalClients = clients.length
  const activeClients = clients.filter(c => c.status === "Active").length
  const totalTransactionValue = clients.reduce((sum, c) => sum + c.totalValue, 0)
  const averageLeadScore = clients.reduce((sum, c) => sum + c.leadScore, 0) / clients.length

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Client Management</h1>
            <p className="text-muted-foreground">Manage clients with lead scoring and loyalty points</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>
                  Create a new client profile and assign to a realtor.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Enter full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter email address" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="Enter phone number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="realtor">Assign Realtor</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select realtor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SJ2025001">Sarah Johnson (SJ2025001)</SelectItem>
                      <SelectItem value="MC2025002">Michael Chen (MC2025002)</SelectItem>
                      <SelectItem value="ER2025003">Emily Rodriguez (ER2025003)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interest">Current Interest</Label>
                  <Input id="interest" placeholder="e.g., Luxury Condos, Family Homes" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Preferred Location</Label>
                  <Input id="location" placeholder="Enter preferred location" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget-min">Budget Min ($)</Label>
                  <Input id="budget-min" type="number" placeholder="Minimum budget" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget-max">Budget Max ($)</Label>
                  <Input id="budget-max" type="number" placeholder="Maximum budget" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" placeholder="Enter client notes and preferences" />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button>Create Client</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Clients"
            value={totalClients}
            icon={Users}
            change={{ value: "+8%", type: "increase" }}
            description="Registered clients"
          />
          <StatsCard
            title="Active Clients"
            value={activeClients}
            icon={TrendingUp}
            change={{ value: "+12%", type: "increase" }}
            description="Currently engaged"
          />
          <StatsCard
            title="Transaction Value"
            value={`$${(totalTransactionValue / 1000000).toFixed(1)}M`}
            icon={DollarSign}
            change={{ value: "+25%", type: "increase" }}
            description="Total value handled"
          />
          <StatsCard
            title="Avg Lead Score"
            value={averageLeadScore.toFixed(0)}
            icon={Star}
            change={{ value: "+5", type: "increase" }}
            description="Client engagement score"
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="loyalty">Loyalty Program</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Clients Grid/List */}
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {filteredClients.map((client) => (
                <Card key={client.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={client.avatar} />
                          <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{client.name}</CardTitle>
                          <CardDescription>ID: {client.id}</CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge className={getStatusColor(client.status)}>
                          {client.status}
                        </Badge>
                        <div className={`text-sm font-medium ${getLeadScoreColor(client.leadScore)}`}>
                          Score: {client.leadScore}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="mr-2 h-4 w-4" />
                        {client.email}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="mr-2 h-4 w-4" />
                        {client.phone}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        {client.preferredLocation}
                      </div>
                    </div>

                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-sm font-medium mb-1">Upline</div>
                      <div className="text-sm text-muted-foreground">{client.realtorName}</div>
                      <div className="text-xs text-muted-foreground">ID: {client.realtorReferralId}</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current Interest:</span>
                        <span className="font-medium">{client.currentInterest}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Budget Range:</span>
                        <span className="font-medium">
                          ${(client.budget.min / 1000)}K - ${(client.budget.max / 1000)}K
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Stage:</span>
                        <Badge variant="outline" className={getStageColor(client.stage)}>
                          {client.stage}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="text-center">
                        <div className="text-lg font-bold">{client.totalTransactions}</div>
                        <div className="text-xs text-muted-foreground">Transactions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-warning">
                          <Award className="inline mr-1 h-4 w-4" />
                          {client.loyaltyPoints}
                        </div>
                        <div className="text-xs text-muted-foreground">Loyalty Points</div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Client Analytics</CardTitle>
                <CardDescription>Detailed analytics and lead scoring metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Realtor</TableHead>
                      <TableHead>Lead Score</TableHead>
                      <TableHead>Transactions</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Last Contact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={client.avatar} />
                              <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{client.name}</div>
                              <div className="text-sm text-muted-foreground">{client.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{client.realtorName}</div>
                            <div className="text-xs text-muted-foreground">{client.realtorReferralId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${client.leadScore >= 90 ? 'bg-success' : client.leadScore >= 70 ? 'bg-warning' : 'bg-muted-foreground'}`}
                                style={{ width: `${client.leadScore}%` }}
                              />
                            </div>
                            <span className={`text-sm font-medium ${getLeadScoreColor(client.leadScore)}`}>
                              {client.leadScore}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{client.totalTransactions}</TableCell>
                        <TableCell className="font-medium">
                          ${client.totalValue.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStageColor(client.stage)}>
                            {client.stage}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-1 h-4 w-4" />
                            {client.lastContact}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="loyalty" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Loyalty Program Overview</CardTitle>
                  <CardDescription>Client loyalty points and rewards system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Points Awarded</span>
                      <span className="text-lg font-bold text-warning">
                        {clients.reduce((sum, c) => sum + c.loyaltyPoints, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Points per Client</span>
                      <span className="text-lg font-bold">
                        {Math.round(clients.reduce((sum, c) => sum + c.loyaltyPoints, 0) / clients.length)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Top Earner</span>
                      <span className="text-lg font-bold">
                        {clients.sort((a, b) => b.loyaltyPoints - a.loyaltyPoints)[0]?.name}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Points Distribution</CardTitle>
                  <CardDescription>How loyalty points are distributed among clients</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {clients
                      .sort((a, b) => b.loyaltyPoints - a.loyaltyPoints)
                      .slice(0, 5)
                      .map((client, index) => (
                        <div key={client.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </div>
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={client.avatar} />
                              <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{client.name}</span>
                          </div>
                          <div className="flex items-center text-warning">
                            <Award className="mr-1 h-4 w-4" />
                            {client.loyaltyPoints}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export default Clients