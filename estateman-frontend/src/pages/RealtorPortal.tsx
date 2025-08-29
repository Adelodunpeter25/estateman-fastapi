import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { StatsCard } from "@/components/dashboard/StatsCard"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
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
  Plus,
  LayoutDashboard
} from "lucide-react"
import { MLMTreeDiagram } from "@/components/MLMTreeDiagram"
import { realtorsService } from "@/services/realtors"
import { teamsService } from "@/services/teams"
import { clientsService } from "@/services/clients"

const RealtorPortal = () => {
  const [realtorData, setRealtorData] = useState<any>(null)
  const [performanceStats, setPerformanceStats] = useState<any>({})
  const [myClients, setMyClients] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [marketingMaterials, setMarketingMaterials] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [salesData, setSalesData] = useState<any>({})
  const [commissionHistory, setCommissionHistory] = useState<any[]>([])
  const [networkMembers, setNetworkMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([])
  const [showMLMTree, setShowMLMTree] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    type: 'email',
    target_audience: '',
    message: '',
    schedule_date: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        if (currentUser.id) {
          const realtor = await realtorsService.getRealtor(currentUser.id)
          setRealtorData(realtor)
          
          const performance = await realtorsService.getRealtorPerformanceMetrics(currentUser.id)
          setPerformanceStats(performance)
          
          const clients = await clientsService.getClients({ assigned_agent_id: currentUser.id })
          setMyClients(clients)
          
          const eventsData = await realtorsService.getEvents()
          setEvents(eventsData)
          
          const materials = await realtorsService.getMarketingMaterials()
          setMarketingMaterials(materials)
          
          const campaignsData = await realtorsService.getRealtorCampaigns(currentUser.id)
          setCampaigns(campaignsData)
          
          const leaderboardData = await realtorsService.getLeaderboard()
          setLeaderboard(leaderboardData)
          
          // Fetch additional data
          const announcementsData = await realtorsService.getAnnouncements()
          setAnnouncements(announcementsData)
          
          const leadsData = await realtorsService.getRealtorLeads(currentUser.id)
          setLeads(leadsData)
          
          const salesInfo = await realtorsService.getRealtorSalesData(currentUser.id)
          setSalesData(salesInfo)
          
          const commissions = await realtorsService.getCommissionHistory(currentUser.id)
          setCommissionHistory(commissions)
          
          const network = await realtorsService.getNetworkMembers(currentUser.id)
          setNetworkMembers(network)
          
          const notificationsData = await realtorsService.getNotifications(currentUser.id)
          setNotifications(notificationsData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleEventRegistration = async (eventId: string) => {
    try {
      const result = await realtorsService.registerForEvent(parseInt(eventId))
      
      if (registeredEvents.includes(eventId)) {
        setRegisteredEvents(prev => prev.filter(id => id !== eventId))
      } else {
        setRegisteredEvents(prev => [...prev, eventId])
      }
      
      console.log(result.message)
    } catch (error) {
      console.error('Error registering for event:', error)
    }
  }

  const handleNotifications = () => {
    setShowNotifications(!showNotifications)
  }

  const handleInvitePartner = () => {
    setShowInviteModal(true)
  }

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const result = await realtorsService.invitePartner(currentUser.id, inviteForm)
      console.log('Invite sent:', result)
      setShowInviteModal(false)
      setInviteForm({ name: '', email: '', phone: '', message: '' })
    } catch (error) {
      console.error('Error inviting partner:', error)
    }
  }

  const handleFormChange = (field: string, value: string) => {
    setInviteForm(prev => ({ ...prev, [field]: value }))
  }

  const handleCreateCampaign = () => {
    setShowCampaignModal(true)
  }

  const handleCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!realtorData?.id) return
      const result = await realtorsService.createCampaign(realtorData.id, campaignForm)
      console.log('Campaign created:', result)
      setShowCampaignModal(false)
      setCampaignForm({ name: '', type: 'email', target_audience: '', message: '', schedule_date: '' })
      // Refresh campaigns
      const campaignsData = await realtorsService.getRealtorCampaigns(realtorData.id)
      setCampaigns(campaignsData)
    } catch (error) {
      console.error('Error creating campaign:', error)
    }
  }

  const handleCampaignFormChange = (field: string, value: string) => {
    setCampaignForm(prev => ({ ...prev, [field]: value }))
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="w-64" collapsible="none">
          <SidebarContent className="bg-card border-r">
            <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>
                    {realtorData?.realtor_id?.substring(0, 2).toUpperCase() || 'RL'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-bold text-base">{realtorData?.name || 'Realtor Portal'}</h2>
                  <div className="flex items-center space-x-2">
                    <Badge className={getLevelColor(realtorData?.level || 'junior')} variant="outline">
                      {realtorData?.level || 'Junior'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ID: {realtorData?.realtor_id || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => setActiveTab('dashboard')}
                      isActive={activeTab === 'dashboard'}
                      className="px-3 py-3 h-12 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span className="text-sm font-medium">Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => setActiveTab('leads')}
                      isActive={activeTab === 'leads'}
                      className="px-3 py-3 h-12 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                    >
                      <Target className="h-4 w-4" />
                      <span className="text-sm font-medium">Lead Management</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => setActiveTab('clients')}
                      isActive={activeTab === 'clients'}
                      className="px-3 py-3 h-12 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                    >
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-medium">My Clients</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => setActiveTab('sales')}
                      isActive={activeTab === 'sales'}
                      className="px-3 py-3 h-12 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                    >
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">Sales Performance</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => setActiveTab('downline')}
                      isActive={activeTab === 'downline'}
                      className="px-3 py-3 h-12 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                    >
                      <Network className="h-4 w-4" />
                      <span className="text-sm font-medium">My Network</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => setActiveTab('commissions')}
                      isActive={activeTab === 'commissions'}
                      className="px-3 py-3 h-12 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                    >
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm font-medium">Commissions</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => setActiveTab('marketing')}
                      isActive={activeTab === 'marketing'}
                      className="px-3 py-3 h-12 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                    >
                      <Mail className="h-4 w-4" />
                      <span className="text-sm font-medium">Marketing</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => setActiveTab('leaderboard')}
                      isActive={activeTab === 'leaderboard'}
                      className="px-3 py-3 h-12 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                    >
                      <Trophy className="h-4 w-4" />
                      <span className="text-sm font-medium">Leaderboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => setActiveTab('events')}
                      isActive={activeTab === 'events'}
                      className="px-3 py-3 h-12 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                    >
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">Events</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-card/50 backdrop-blur">
            <div className="flex items-center justify-between h-full px-6">
              <div>
                <h1 className="text-2xl font-bold">Realtor Portal</h1>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Button variant="outline" size="icon" onClick={handleNotifications}>
                    <Bell className="h-4 w-4" />
                    {notifications.length > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                        {notifications.length}
                      </Badge>
                    )}
                  </Button>
                  {showNotifications && (
                    <div className="absolute right-0 top-12 w-80 bg-white border rounded-lg shadow-lg z-50">
                      <div className="p-4">
                        <h3 className="font-semibold mb-3">Notifications</h3>
                        {notifications.length > 0 ? (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {notifications.map((notification) => (
                              <div key={notification.id} className="p-2 border-b">
                                <p className="text-sm font-medium">{notification.title}</p>
                                <p className="text-xs text-muted-foreground">{notification.message}</p>
                                <p className="text-xs text-muted-foreground">{notification.created_at}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No notifications</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <Button onClick={handleInvitePartner}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite New Partner
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 bg-muted/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatsCard
                title="Total Commissions"
                value={`$${((realtorData?.total_commissions || 0) / 1000).toFixed(0)}K`}
                icon={DollarSign}
                change={{ value: "+15.2%", type: "increase" }}
                description="All time earnings"
                className="bg-red-50 border-red-200 text-red-800"
              />
              <StatsCard
                title="Monthly Commissions"
                value={`$${((realtorData?.monthly_earned || 0) / 1000).toFixed(1)}K`}
                icon={TrendingUp}
                change={{ value: "+8.4%", type: "increase" }}
                description="This month"
                className="bg-blue-50 border-blue-200 text-blue-800"
              />
              <StatsCard
                title="Total Clients"
                value={realtorData?.total_clients || 0}
                icon={Network}
                change={{ value: "+23", type: "increase" }}
                description="All clients"
                className="bg-yellow-50 border-yellow-200 text-yellow-800"
              />
              <StatsCard
                title="Conversion Rate"
                value={`${((realtorData?.conversion_rate || 0) * 100).toFixed(1)}%`}
                icon={Target}
                change={{ value: "+2.1%", type: "increase" }}
                description="Lead to client"
                className="bg-green-50 border-green-200 text-green-800"
              />
            </div>

            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Dashboard Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Welcome to your realtor portal dashboard.</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'leads' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Lead Management</CardTitle>
                    <CardDescription>Manage and track your leads</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-primary">{leads.length}</p>
                          <p className="text-sm text-muted-foreground">Total Leads</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-success">{leads.filter(l => l.status === 'Hot').length}</p>
                          <p className="text-sm text-muted-foreground">Hot Leads</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-warning">{leads.filter(l => l.status === 'Warm').length}</p>
                          <p className="text-sm text-muted-foreground">Follow-ups</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-purple-600">{leads.filter(l => l.status === 'Converted').length}</p>
                          <p className="text-sm text-muted-foreground">Converted</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {leads.map((lead, index) => (
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
              </div>
            )}

            {activeTab === 'clients' && (
              <div className="space-y-4">
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
                              <h4 className="font-medium">{client.name || `${client.first_name} ${client.last_name}`}</h4>
                              <p className="text-sm text-muted-foreground">{client.email}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(client.status)}>
                                {client.status}
                              </Badge>
                              <span className="text-sm font-medium">Score: {client.lead_score || 0}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Stage</p>
                              <p className="font-medium">{client.status}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Total Value</p>
                              <p className="font-medium">${((client.total_spent || 0) / 1000).toFixed(0)}K</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Last Contact</p>
                              <p className="font-medium">{client.last_contact_date || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'sales' && (
              <div className="space-y-4">
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
                              <span className="font-bold text-success">${(salesData?.direct?.monthly || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>This Quarter</span>
                              <span className="font-bold">${(salesData?.direct?.quarterly || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>This Year</span>
                              <span className="font-bold">${(salesData?.direct?.yearly || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Deals Closed</span>
                              <span className="font-bold text-primary">{salesData?.direct?.deals || 0}</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 border rounded-lg">
                          <h4 className="font-semibold mb-4">Indirect Sales (Team)</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span>This Month</span>
                              <span className="font-bold text-success">${(salesData?.indirect?.monthly || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>This Quarter</span>
                              <span className="font-bold">${(salesData?.indirect?.quarterly || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>This Year</span>
                              <span className="font-bold">${(salesData?.indirect?.yearly || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Team Deals</span>
                              <span className="font-bold text-primary">{salesData?.indirect?.deals || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-4">Recent Sales Activity</h4>
                        <div className="space-y-3">
                          {(salesData?.recent_sales || []).map((sale, index) => (
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
              </div>
            )}

            {activeTab === 'downline' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>My Network ({networkMembers.length} Direct)</CardTitle>
                    <CardDescription>Partners you've referred</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {networkMembers.length > 0 ? (
                      <div className="space-y-4">
                        {networkMembers.map((member) => (
                          <div key={member.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{member.name}</h4>
                                <p className="text-sm text-muted-foreground">{member.level}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">${member.total_commissions?.toLocaleString() || 0}</p>
                                <p className="text-xs text-muted-foreground">Total Earned</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Network className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No network members yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'commissions' && (
              <div className="space-y-4">
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
                          <p className="text-2xl font-bold text-success">${realtorData?.monthly_earned?.toLocaleString() || 0}</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg text-center">
                          <p className="text-sm text-muted-foreground">Last Month</p>
                          <p className="text-2xl font-bold">${realtorData?.last_month_earned?.toLocaleString() || 0}</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg text-center">
                          <p className="text-sm text-muted-foreground">All Time</p>
                          <p className="text-2xl font-bold">${realtorData?.total_commissions?.toLocaleString() || 0}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {commissionHistory.map((commission) => (
                          <div key={commission.id} className="flex justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{commission.type}</p>
                              <p className="text-sm text-muted-foreground">{commission.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-success">+${commission.amount?.toLocaleString()}</p>
                              <Button variant="ghost" size="sm">
                                <Download className="h-3 w-3 mr-1" />
                                Receipt
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Events</CardTitle>
                    <CardDescription>Register for training sessions and conferences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {events.length > 0 ? events.map((event) => (
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
                      )) : (
                        <div className="text-center py-8">
                          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">No upcoming events</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'marketing' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Marketing Materials</CardTitle>
                      <CardDescription>Download and share marketing assets</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {marketingMaterials.length > 0 ? marketingMaterials.map((material) => (
                        <div key={material.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Image className="h-8 w-8 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{material.name}</p>
                              <p className="text-sm text-muted-foreground">{material.type} • {material.size}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">{material.downloads} downloads</span>
                            <Button size="sm" onClick={() => window.open(material.url, '_blank')}>
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-8">
                          <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">No marketing materials available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Active Campaigns</CardTitle>
                      <CardDescription>Your current marketing campaigns</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {campaigns.length > 0 ? campaigns.map((campaign) => (
                        <div key={campaign.id} className="p-3 border rounded-lg">
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
                      )) : (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">No campaigns yet</p>
                        </div>
                      )}
                      <Button className="w-full mt-4" onClick={handleCreateCampaign}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Campaign
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="space-y-4">
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
                      {leaderboard.length > 0 ? leaderboard.map((performer) => (
                        <div 
                          key={performer.rank} 
                          className={`flex items-center justify-between p-4 border rounded-lg ${performer.name === realtorData?.name ? 'bg-primary/5 border-primary/20' : ''}`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold">#{performer.rank}</span>
                              {performer.rank === 1 && <span className="text-lg">👑</span>}
                              {performer.rank === 2 && <span className="text-lg">🥈</span>}
                              {performer.rank === 3 && <span className="text-lg">🥉</span>}
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
                      )) : (
                        <div className="text-center py-8">
                          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">No leaderboard data available</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
      
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

      {showInviteModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Invite New Partner</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowInviteModal(false)}>
                ×
              </Button>
            </div>
            <form onSubmit={handleInviteSubmit} className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium">Full Name *</label>
                <input
                  type="text"
                  required
                  value={inviteForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email Address *</label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone Number</label>
                <input
                  type="tel"
                  value={inviteForm.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Personal Message</label>
                <textarea
                  value={inviteForm.message}
                  onChange={(e) => handleFormChange('message', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md h-20"
                  placeholder="Add a personal message (optional)"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowInviteModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Send Invitation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCampaignModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Create New Campaign</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowCampaignModal(false)}>
                ×
              </Button>
            </div>
            <form onSubmit={handleCampaignSubmit} className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium">Campaign Name *</label>
                <input
                  type="text"
                  required
                  value={campaignForm.name}
                  onChange={(e) => handleCampaignFormChange('name', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="Enter campaign name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Campaign Type *</label>
                <select
                  required
                  value={campaignForm.type}
                  onChange={(e) => handleCampaignFormChange('type', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  <option value="email">Email Campaign</option>
                  <option value="sms">SMS Campaign</option>
                  <option value="social">Social Media</option>
                  <option value="direct_mail">Direct Mail</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Target Audience *</label>
                <input
                  type="text"
                  required
                  value={campaignForm.target_audience}
                  onChange={(e) => handleCampaignFormChange('target_audience', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="e.g., New leads, Existing clients"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Message *</label>
                <textarea
                  required
                  value={campaignForm.message}
                  onChange={(e) => handleCampaignFormChange('message', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md h-20"
                  placeholder="Enter campaign message"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Schedule Date</label>
                <input
                  type="datetime-local"
                  value={campaignForm.schedule_date}
                  onChange={(e) => handleCampaignFormChange('schedule_date', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowCampaignModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Create Campaign
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SidebarProvider>
  )
}

export default RealtorPortal