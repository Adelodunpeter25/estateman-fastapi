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
import { Users, Trophy, DollarSign, TrendingUp, Search, Plus, Edit, Eye, Star, Phone, Mail, MapPin } from "lucide-react"

// Sample realtor data
const realtors = [
  {
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
    avatar: "/placeholder.svg"
  },
  {
    id: "R002",
    name: "Michael Chen",
    email: "michael.chen@email.com",
    phone: "+1 (555) 234-5678",
    level: "Junior Agent",
    status: "Active",
    referralId: "MC2024002",
    joinDate: "2023-06-20",
    totalClients: 28,
    activeDeals: 5,
    totalCommissions: 75000,
    monthlyTarget: 10000,
    monthlyEarned: 8500,
    rating: 4.5,
    specialties: ["Commercial", "Investment"],
    location: "Business District",
    avatar: "/placeholder.svg"
  },
  {
    id: "R003",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@email.com",
    phone: "+1 (555) 345-6789",
    level: "Team Lead",
    status: "Active",
    referralId: "ER2024003",
    joinDate: "2021-03-10",
    totalClients: 67,
    activeDeals: 12,
    totalCommissions: 185000,
    monthlyTarget: 20000,
    monthlyEarned: 18500,
    rating: 4.9,
    specialties: ["Luxury", "New Construction"],
    location: "Uptown Area",
    avatar: "/placeholder.svg"
  }
]

const Realtors = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRealtor, setSelectedRealtor] = useState(null)
  const [showAddDialog, setShowAddDialog] = useState(false)

  const filteredRealtors = realtors.filter(realtor =>
    realtor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    realtor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    realtor.referralId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalRealtors = realtors.length
  const activeRealtors = realtors.filter(r => r.status === "Active").length
  const totalCommissions = realtors.reduce((sum, r) => sum + r.totalCommissions, 0)
  const averageRating = realtors.reduce((sum, r) => sum + r.rating, 0) / realtors.length

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Realtor Management</h1>
            <p className="text-muted-foreground">Manage your real estate team, levels, and commissions</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Realtor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Realtor</DialogTitle>
                <DialogDescription>
                  Create a new realtor profile with all necessary details.
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
                  <Label htmlFor="level">Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Junior Agent</SelectItem>
                      <SelectItem value="senior">Senior Agent</SelectItem>
                      <SelectItem value="lead">Team Lead</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="Enter location/territory" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target">Monthly Target ($)</Label>
                  <Input id="target" type="number" placeholder="Enter monthly target" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="specialties">Specialties</Label>
                  <Textarea id="specialties" placeholder="Enter specialties (comma-separated)" />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button>Create Realtor</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Realtors"
            value={totalRealtors}
            icon={Users}
            change={{ value: "+12%", type: "increase" }}
            description="Active real estate agents"
          />
          <StatsCard
            title="Active Agents"
            value={activeRealtors}
            icon={TrendingUp}
            change={{ value: "+8%", type: "increase" }}
            description="Currently working agents"
          />
          <StatsCard
            title="Total Commissions"
            value={`$${totalCommissions.toLocaleString()}`}
            icon={DollarSign}
            change={{ value: "+15%", type: "increase" }}
            description="This year's earnings"
          />
          <StatsCard
            title="Average Rating"
            value={averageRating.toFixed(1)}
            icon={Star}
            change={{ value: "+0.2", type: "increase" }}
            description="Team performance rating"
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Search */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search realtors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Realtors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRealtors.map((realtor) => (
                <Card key={realtor.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={realtor.avatar} />
                          <AvatarFallback>{realtor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{realtor.name}</CardTitle>
                          <CardDescription>ID: {realtor.referralId}</CardDescription>
                        </div>
                      </div>
                      <Badge className={getLevelColor(realtor.level)}>
                        {realtor.level}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="mr-2 h-4 w-4" />
                        {realtor.email}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="mr-2 h-4 w-4" />
                        {realtor.phone}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        {realtor.location}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="text-center">
                        <div className="text-lg font-bold">{realtor.totalClients}</div>
                        <div className="text-xs text-muted-foreground">Clients</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{realtor.activeDeals}</div>
                        <div className="text-xs text-muted-foreground">Active Deals</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{realtor.rating}</div>
                        <div className="text-xs text-muted-foreground">Rating</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Monthly Progress</span>
                        <span>{Math.round((realtor.monthlyEarned / realtor.monthlyTarget) * 100)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all" 
                          style={{ width: `${Math.min((realtor.monthlyEarned / realtor.monthlyTarget) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>${realtor.monthlyEarned.toLocaleString()}</span>
                        <span>${realtor.monthlyTarget.toLocaleString()}</span>
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

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Detailed performance metrics for all realtors</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Realtor</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Clients</TableHead>
                      <TableHead>Active Deals</TableHead>
                      <TableHead>Monthly Target</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {realtors.map((realtor) => (
                      <TableRow key={realtor.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={realtor.avatar} />
                              <AvatarFallback>{realtor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{realtor.name}</div>
                              <div className="text-sm text-muted-foreground">{realtor.referralId}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getLevelColor(realtor.level)}>
                            {realtor.level}
                          </Badge>
                        </TableCell>
                        <TableCell>{realtor.totalClients}</TableCell>
                        <TableCell>{realtor.activeDeals}</TableCell>
                        <TableCell>${realtor.monthlyTarget.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${Math.min((realtor.monthlyEarned / realtor.monthlyTarget) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm">{Math.round((realtor.monthlyEarned / realtor.monthlyTarget) * 100)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Star className="mr-1 h-4 w-4 fill-warning text-warning" />
                            {realtor.rating}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Commission Tracking</CardTitle>
                <CardDescription>Monitor realtor earnings and commission structures</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Realtor</TableHead>
                      <TableHead>Total Commissions</TableHead>
                      <TableHead>This Month</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Commission Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {realtors.map((realtor) => {
                      const remaining = realtor.monthlyTarget - realtor.monthlyEarned
                      return (
                        <TableRow key={realtor.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={realtor.avatar} />
                                <AvatarFallback>{realtor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{realtor.name}</div>
                                <div className="text-sm text-muted-foreground">{realtor.level}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">${realtor.totalCommissions.toLocaleString()}</TableCell>
                          <TableCell>${realtor.monthlyEarned.toLocaleString()}</TableCell>
                          <TableCell>${realtor.monthlyTarget.toLocaleString()}</TableCell>
                          <TableCell className={remaining > 0 ? "text-warning" : "text-success"}>
                            ${Math.abs(remaining).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {realtor.level === "Team Lead" ? "5%" : realtor.level === "Senior Agent" ? "4%" : "3%"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
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

export default Realtors