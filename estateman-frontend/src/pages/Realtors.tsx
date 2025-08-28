import { useState, useEffect } from "react"
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
import { realtorsService, Realtor, RealtorAnalytics, RealtorCreateData } from "@/services/realtors"



const Realtors = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRealtor, setSelectedRealtor] = useState(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [realtors, setRealtors] = useState<Realtor[]>([])
  const [analytics, setAnalytics] = useState<RealtorAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState<RealtorCreateData>({
    name: '',
    email: '',
    phone: '',
    level: 'junior',
    specialties: [],
    location: '',
    monthly_target: 0,
    commission_rate: 0.03,
    split_percentage: 0.70
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [realtorsData, analyticsData] = await Promise.all([
        realtorsService.getRealtors().catch((err: any) => err?.response?.status === 404 ? [] : Promise.reject(err)),
        realtorsService.getRealtorAnalytics()
      ])
      setRealtors(realtorsData)
      setAnalytics(analyticsData)
    } catch (error: any) {
      console.error('Error loading realtor data:', error)
      if (error?.response?.status === 404) {
        setRealtors([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRealtor = async () => {
    try {
      setCreating(true)
      const newRealtor = await realtorsService.createRealtor(formData)
      setRealtors(prev => [...prev, newRealtor])
      setShowAddDialog(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        level: 'junior',
        specialties: [],
        location: '',
        monthly_target: 0,
        commission_rate: 0.03,
        split_percentage: 0.70
      })
      loadData()
    } catch (error) {
      console.error('Error creating realtor:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleFormChange = (field: keyof RealtorCreateData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const filteredRealtors = realtors.filter(realtor =>
    realtor.realtor_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                  <Input 
                    id="name" 
                    placeholder="Enter full name" 
                    value={formData.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="Enter email address" 
                    value={formData.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    placeholder="Enter phone number" 
                    value={formData.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select value={formData.level} onValueChange={(value) => handleFormChange('level', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Junior Agent</SelectItem>
                      <SelectItem value="senior">Senior Agent</SelectItem>
                      <SelectItem value="team_lead">Team Lead</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    placeholder="Enter location/territory" 
                    value={formData.location}
                    onChange={(e) => handleFormChange('location', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target">Monthly Target ($)</Label>
                  <Input 
                    id="target" 
                    type="number" 
                    placeholder="Enter monthly target" 
                    value={formData.monthly_target}
                    onChange={(e) => handleFormChange('monthly_target', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                  <Input 
                    id="commission_rate" 
                    type="number" 
                    step="0.01"
                    placeholder="Enter commission rate (e.g., 0.03 for 3%)" 
                    value={formData.commission_rate}
                    onChange={(e) => handleFormChange('commission_rate', parseFloat(e.target.value) || 0.03)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="split_percentage">Split Percentage</Label>
                  <Input 
                    id="split_percentage" 
                    type="number" 
                    step="0.01"
                    placeholder="Enter split percentage (e.g., 0.70 for 70%)" 
                    value={formData.split_percentage}
                    onChange={(e) => handleFormChange('split_percentage', parseFloat(e.target.value) || 0.70)}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="specialties">Specialties</Label>
                  <Textarea 
                    id="specialties" 
                    placeholder="Enter specialties (comma-separated)" 
                    value={formData.specialties?.join(', ') || ''}
                    onChange={(e) => handleFormChange('specialties', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={creating}>Cancel</Button>
                <Button onClick={handleCreateRealtor} disabled={creating}>
                  {creating ? 'Creating...' : 'Create Realtor'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Realtors"
            value={analytics?.total_realtors || 0}
            icon={Users}
            change={{ value: "+12%", type: "increase" }}
            description="Active real estate agents"
          />
          <StatsCard
            title="Active Agents"
            value={analytics?.active_realtors || 0}
            icon={TrendingUp}
            change={{ value: "+8%", type: "increase" }}
            description="Currently working agents"
          />
          <StatsCard
            title="Total Commissions"
            value={`$${(analytics?.total_commissions || 0).toLocaleString()}`}
            icon={DollarSign}
            change={{ value: "+15%", type: "increase" }}
            description="This year's earnings"
          />
          <StatsCard
            title="Average Rating"
            value={analytics?.average_rating?.toFixed(1) || "0.0"}
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
              {filteredRealtors.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No realtors available
                </div>
              ) : (
                filteredRealtors.map((realtor) => (
                <Card key={realtor.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={realtor.avatar} />
                          <AvatarFallback>{realtor.name?.split(' ').map(n => n[0]).join('') || 'R'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{realtor.name || `Realtor ${realtor.realtor_id}`}</CardTitle>
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
                        <span>{realtor.monthly_target > 0 ? Math.round((realtor.monthly_earned / realtor.monthly_target) * 100) : 0}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all" 
                          style={{ width: `${realtor.monthly_target > 0 ? Math.min((realtor.monthly_earned / realtor.monthly_target) * 100, 100) : 0}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>${realtor.monthly_earned.toLocaleString()}</span>
                        <span>${realtor.monthly_target.toLocaleString()}</span>
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
                ))
              )}
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
                    {realtors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No realtors available
                        </TableCell>
                      </TableRow>
                    ) : (
                      realtors.map((realtor) => (
                      <TableRow key={realtor.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback>R{realtor.id}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">Realtor {realtor.realtor_id}</div>
                              <div className="text-sm text-muted-foreground">{realtor.realtor_id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getLevelColor(realtor.level)}>
                            {realtor.level}
                          </Badge>
                        </TableCell>
                        <TableCell>{realtor.total_clients}</TableCell>
                        <TableCell>{realtor.active_deals}</TableCell>
                        <TableCell>${realtor.monthly_target.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${realtor.monthly_target > 0 ? Math.min((realtor.monthly_earned / realtor.monthly_target) * 100, 100) : 0}%` }}
                              />
                            </div>
                            <span className="text-sm">{realtor.monthly_target > 0 ? Math.round((realtor.monthly_earned / realtor.monthly_target) * 100) : 0}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Star className="mr-1 h-4 w-4 fill-warning text-warning" />
                            {realtor.rating}
                          </div>
                        </TableCell>
                      </TableRow>
                      ))
                    )}
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
                    {realtors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No realtors available
                        </TableCell>
                      </TableRow>
                    ) : (
                      realtors.map((realtor) => {
                      const remaining = realtor.monthly_target - realtor.monthly_earned
                      return (
                        <TableRow key={realtor.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={realtor.avatar} />
                                <AvatarFallback>{realtor.name?.split(' ').map(n => n[0]).join('') || 'R'}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{realtor.name || `Realtor ${realtor.realtor_id}`}</div>
                                <div className="text-sm text-muted-foreground">{realtor.level}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">${realtor.total_commissions.toLocaleString()}</TableCell>
                          <TableCell>${realtor.monthly_earned.toLocaleString()}</TableCell>
                          <TableCell>${realtor.monthly_target.toLocaleString()}</TableCell>
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
                      })
                    )}
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