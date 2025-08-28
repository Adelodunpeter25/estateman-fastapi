import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { clientsService, Client, ClientAnalytics, ClientCreateData } from "@/services/clients"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Users, Star, TrendingUp, DollarSign, Search, Plus, Edit, Eye, Phone, Mail, MapPin, Calendar, Award, Grid3X3, List, Check, ChevronsUpDown } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { realtorsService } from "@/services/realtors"



const Clients = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [clients, setClients] = useState<Client[]>([])
  const [analytics, setAnalytics] = useState<ClientAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [realtors, setRealtors] = useState<Array<{id: number, name: string, realtor_id: string}>>([])
  const [realtorOpen, setRealtorOpen] = useState(false)
  const [formData, setFormData] = useState<ClientCreateData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    budget_min: 0,
    budget_max: 0,
    preferred_location: '',
    property_interests: [],
    lead_source: '',
    notes: '',
    assigned_agent_id: undefined
  })

  useEffect(() => {
    loadData()
    loadRealtors()
  }, [])

  const loadRealtors = async () => {
    try {
      const realtorsData = await realtorsService.getRealtorsDropdown()
      setRealtors(realtorsData)
    } catch (error: any) {
      console.error('Error loading realtors:', error)
      if (error?.response?.status === 404) {
        setRealtors([])
      }
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const [clientsData, analyticsData] = await Promise.all([
        clientsService.getClients().catch((err: any) => err?.response?.status === 404 ? [] : Promise.reject(err)),
        clientsService.getClientAnalytics()
      ])
      setClients(clientsData)
      setAnalytics(analyticsData)
    } catch (error: any) {
      console.error('Error loading client data:', error)
      if (error?.response?.status === 404) {
        setClients([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClient = async () => {
    try {
      setCreating(true)
      const newClient = await clientsService.createClient(formData)
      setClients(prev => [...prev, newClient])
      setShowAddDialog(false)
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        budget_min: 0,
        budget_max: 0,
        preferred_location: '',
        property_interests: [],
        lead_source: '',
        notes: '',
        assigned_agent_id: undefined
      })
      loadData()
    } catch (error) {
      console.error('Error creating client:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleFormChange = (field: keyof ClientCreateData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const filteredClients = clients.filter(client => {
    const fullName = `${client.first_name} ${client.last_name}`
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || client.status === filterStatus
    return matchesSearch && matchesStatus
  })

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
                  <Label htmlFor="first_name">First Name</Label>
                  <Input 
                    id="first_name" 
                    placeholder="Enter first name" 
                    value={formData.first_name}
                    onChange={(e) => handleFormChange('first_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input 
                    id="last_name" 
                    placeholder="Enter last name" 
                    value={formData.last_name}
                    onChange={(e) => handleFormChange('last_name', e.target.value)}
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
                  <Label htmlFor="assigned_agent_id">Assign Realtor</Label>
                  <Popover open={realtorOpen} onOpenChange={setRealtorOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={realtorOpen}
                        className="w-full justify-between"
                      >
                        {formData.assigned_agent_id
                          ? realtors.find((realtor) => realtor.id === formData.assigned_agent_id)?.name
                          : "Select realtor..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search realtors..." />
                        <CommandEmpty>No realtor found.</CommandEmpty>
                        <CommandGroup>
                          {realtors.map((realtor) => (
                            <CommandItem
                              key={realtor.id}
                              value={realtor.name}
                              onSelect={() => {
                                handleFormChange('assigned_agent_id', realtor.id)
                                setRealtorOpen(false)
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  formData.assigned_agent_id === realtor.id ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              {realtor.name} ({realtor.realtor_id})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead_source">Lead Source</Label>
                  <Input 
                    id="lead_source" 
                    placeholder="e.g., Website, Referral, Social Media" 
                    value={formData.lead_source}
                    onChange={(e) => handleFormChange('lead_source', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferred_location">Preferred Location</Label>
                  <Input 
                    id="preferred_location" 
                    placeholder="Enter preferred location" 
                    value={formData.preferred_location}
                    onChange={(e) => handleFormChange('preferred_location', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property_interests">Property Interests</Label>
                  <Input 
                    id="property_interests" 
                    placeholder="e.g., Luxury Condos, Family Homes" 
                    value={formData.property_interests?.join(', ') || ''}
                    onChange={(e) => handleFormChange('property_interests', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget_min">Budget Min ($)</Label>
                  <Input 
                    id="budget_min" 
                    type="number" 
                    placeholder="Minimum budget" 
                    value={formData.budget_min}
                    onChange={(e) => handleFormChange('budget_min', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget_max">Budget Max ($)</Label>
                  <Input 
                    id="budget_max" 
                    type="number" 
                    placeholder="Maximum budget" 
                    value={formData.budget_max}
                    onChange={(e) => handleFormChange('budget_max', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Enter client notes and preferences" 
                    value={formData.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={creating}>Cancel</Button>
                <Button onClick={handleCreateClient} disabled={creating}>
                  {creating ? 'Creating...' : 'Create Client'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Clients"
            value={analytics?.total_clients || 0}
            icon={Users}
            change={{ value: "+8%", type: "increase" }}
            description="Registered clients"
          />
          <StatsCard
            title="Active Clients"
            value={analytics?.active_clients || 0}
            icon={TrendingUp}
            change={{ value: "+12%", type: "increase" }}
            description="Currently engaged"
          />
          <StatsCard
            title="Conversion Rate"
            value={`${analytics?.conversion_rate || 0}%`}
            icon={DollarSign}
            change={{ value: "+25%", type: "increase" }}
            description="Lead to client conversion"
          />
          <StatsCard
            title="Avg Lead Score"
            value={analytics?.average_lead_score ? analytics.average_lead_score.toFixed(0) : "0"}
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
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback>{client.first_name?.[0] || '?'}{client.last_name?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{client.first_name} {client.last_name}</CardTitle>
                          <CardDescription>ID: {client.client_id}</CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge className={getStatusColor(client.status)}>
                          {client.status}
                        </Badge>
                        <div className={`text-sm font-medium ${getLeadScoreColor(client.lead_score)}`}>
                          Score: {client.lead_score}
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
                        {client.preferred_location || 'Not specified'}
                      </div>
                    </div>

                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-sm font-medium mb-1">Agent</div>
                      <div className="text-sm text-muted-foreground">Agent ID: {client.assigned_agent_id || 'Unassigned'}</div>
                      <div className="text-xs text-muted-foreground">Source: {client.lead_source || 'Unknown'}</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Interests:</span>
                        <span className="font-medium">{client.property_interests?.join(', ') || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Budget Range:</span>
                        <span className="font-medium">
                          {client.budget_min && client.budget_max 
                            ? `$${(client.budget_min / 1000)}K - $${(client.budget_max / 1000)}K`
                            : 'Not specified'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tier:</span>
                        <Badge variant="outline" className={getStageColor(client.loyalty_tier)}>
                          {client.loyalty_tier}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="text-center">
                        <div className="text-lg font-bold">${client.total_spent.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Total Spent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-warning">
                          <Award className="inline mr-1 h-4 w-4" />
                          {client.loyalty_points}
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
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback>{client.first_name?.[0] || '?'}{client.last_name?.[0] || '?'}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{client.first_name} {client.last_name}</div>
                              <div className="text-sm text-muted-foreground">{client.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">Agent ID: {client.assigned_agent_id || 'Unassigned'}</div>
                            <div className="text-xs text-muted-foreground">Source: {client.lead_source || 'Unknown'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${client.lead_score >= 90 ? 'bg-success' : client.lead_score >= 70 ? 'bg-warning' : 'bg-muted-foreground'}`}
                                style={{ width: `${client.lead_score}%` }}
                              />
                            </div>
                            <span className={`text-sm font-medium ${getLeadScoreColor(client.lead_score)}`}>
                              {client.lead_score}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{client.total_spent || 0}</TableCell>
                        <TableCell className="font-medium">
                          ${(client.total_spent || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStageColor(client.loyalty_tier)}>
                            {client.loyalty_tier}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-1 h-4 w-4" />
                            {client.last_contact_date || 'Never'}
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
                        {clients.reduce((sum, c) => sum + (c.loyalty_points || 0), 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Points per Client</span>
                      <span className="text-lg font-bold">
                        {clients.length > 0 ? Math.round(clients.reduce((sum, c) => sum + (c.loyalty_points || 0), 0) / clients.length) : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Top Earner</span>
                      <span className="text-lg font-bold">
                        {(() => {
                          const sortedClients = clients.sort((a, b) => (b.loyalty_points || 0) - (a.loyalty_points || 0))
                          const topClient = sortedClients[0]
                          return topClient ? `${topClient.first_name} ${topClient.last_name}` : 'None'
                        })()}
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
                      .sort((a, b) => (b.loyalty_points || 0) - (a.loyalty_points || 0))
                      .slice(0, 5)
                      .map((client, index) => (
                        <div key={client.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </div>
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback>{client.first_name?.[0] || '?'}{client.last_name?.[0] || '?'}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{client.first_name} {client.last_name}</span>
                          </div>
                          <div className="flex items-center text-warning">
                            <Award className="mr-1 h-4 w-4" />
                            {client.loyalty_points || 0}
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