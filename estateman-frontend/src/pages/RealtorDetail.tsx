import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Users, DollarSign, TrendingUp, Calendar, Phone, Mail, MapPin, Star, Award, Eye, Edit, Loader2 } from "lucide-react"
import { realtorsService, type Realtor } from "@/services/realtors"
import { teamsService, type PerformanceReview, type Goal, type TeamActivity } from "@/services/teams"
import { clientsService } from "@/services/clients"
import { TeamManagement } from "@/components/TeamManagement"



const RealtorDetail = () => {
  const { id } = useParams()
  const [realtor, setRealtor] = useState<Realtor | null>(null)
  const [realtorProfile, setRealtorProfile] = useState<any>(null)
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [teamActivities, setTeamActivities] = useState<TeamActivity[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const fetchRealtorData = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        const realtorId = parseInt(id)
        
        // Fetch realtor basic info
        const realtorData = await realtorsService.getRealtor(realtorId)
        setRealtor(realtorData)
        
        // Fetch enhanced profile data
        try {
          const profileData = await realtorsService.getRealtorProfile(realtorId)
          setRealtorProfile(profileData)
        } catch (err) {
          console.warn('Profile data not available:', err)
        }
        
        // Fetch performance reviews
        try {
          const reviews = await teamsService.getRealtorReviews(realtorId)
          setPerformanceReviews(reviews)
        } catch (err) {
          console.warn('Performance reviews not available:', err)
        }
        
        // Fetch goals
        try {
          const goalsData = await teamsService.getRealtorGoals(realtorId)
          setGoals(goalsData)
        } catch (err) {
          console.warn('Goals not available:', err)
        }
        
        // Fetch team activities if realtor has a team
        if (realtorData.team_id) {
          try {
            const activities = await teamsService.getTeamActivities(realtorData.team_id)
            setTeamActivities(activities)
          } catch (err) {
            console.warn('Team activities not available:', err)
          }
        }
        
        // Fetch clients
        try {
          const clientsData = await clientsService.getClients({ realtor_id: realtorId })
          setClients(clientsData)
        } catch (err) {
          console.warn('Clients data not available:', err)
        }
        
      } catch (err: any) {
        console.error('Error fetching realtor data:', err)
        setError(err.message || 'Failed to load realtor data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchRealtorData()
  }, [id])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading realtor details...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !realtor) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Realtor Not Found</h2>
            <p className="text-muted-foreground mb-4">{error || 'The requested realtor could not be found.'}</p>
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
      case "meeting":
        return <Users className="h-4 w-4 text-primary" />
      case "training":
        return <Award className="h-4 w-4 text-success" />
      case "event":
        return <Calendar className="h-4 w-4 text-warning" />
      case "deadline":
        return <TrendingUp className="h-4 w-4 text-destructive" />
      default:
        return <Calendar className="h-4 w-4 text-muted-foreground" />
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
                  <AvatarImage src={realtorProfile?.avatar || '/placeholder.svg'} />
                  <AvatarFallback className="text-xl">
                    {realtor.realtor_id.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <CardTitle className="text-2xl">{realtorProfile?.name || `Realtor ${realtor.realtor_id}`}</CardTitle>
                    <Badge className={getLevelColor(realtor.level)}>
                      {realtor.level}
                    </Badge>
                  </div>
                  <CardDescription className="text-base">
                    ID: {realtor.realtor_id} • Joined {new Date(realtor.join_date).toLocaleDateString()}
                  </CardDescription>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Mail className="mr-1 h-4 w-4" />
                      {realtorProfile?.email || 'N/A'}
                    </div>
                    <div className="flex items-center">
                      <Phone className="mr-1 h-4 w-4" />
                      {realtorProfile?.phone || 'N/A'}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4" />
                      {realtor.location || 'N/A'}
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
                <p className="text-sm text-muted-foreground">{realtorProfile?.bio || 'No bio available'}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {realtor.specialties?.map((specialty) => (
                    <Badge key={specialty} variant="outline">
                      {specialty}
                    </Badge>
                  )) || <span className="text-sm text-muted-foreground">No specialties listed</span>}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">License Info</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center">
                    <Award className="mr-2 h-4 w-4 text-warning" />
                    License: {realtor.license_number || 'N/A'}
                  </div>
                  {realtor.license_expiry && (
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      Expires: {new Date(realtor.license_expiry).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Clients"
            value={realtor.total_clients || 0}
            icon={Users}
            change={{ value: "+5", type: "increase" }}
            description="All time clients"
          />
          <StatsCard
            title="Active Deals"
            value={realtor.active_deals || 0}
            icon={TrendingUp}
            change={{ value: "+2", type: "increase" }}
            description="Currently active"
          />
          <StatsCard
            title="Total Commissions"
            value={`$${(realtor.total_commissions || 0).toLocaleString()}`}
            icon={DollarSign}
            change={{ value: "+18%", type: "increase" }}
            description="All time earnings"
          />
          <StatsCard
            title="Monthly Progress"
            value={`${Math.round(((realtor.monthly_earned || 0) / (realtor.monthly_target || 1)) * 100)}%`}
            icon={TrendingUp}
            change={{ value: "+12%", type: "increase" }}
            description={`$${(realtor.monthly_earned || 0).toLocaleString()} / $${(realtor.monthly_target || 0).toLocaleString()}`}
          />
        </div>

        {/* Detailed Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="clients">Clients ({clients.length})</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="team">Team Management</TabsTrigger>
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
                      <span className="font-medium">${(realtor.monthly_earned || 0).toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className="bg-primary h-3 rounded-full transition-all" 
                        style={{ width: `${Math.min(((realtor.monthly_earned || 0) / (realtor.monthly_target || 1)) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Target: ${(realtor.monthly_target || 0).toLocaleString()}</span>
                      <span>{Math.round(((realtor.monthly_earned || 0) / (realtor.monthly_target || 1)) * 100)}% Complete</span>
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
                      <div className="text-2xl font-bold text-primary">{realtor.active_deals || 0}</div>
                      <div className="text-sm text-muted-foreground">Active Deals</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-success">{realtor.rating || 0}</div>
                      <div className="text-sm text-muted-foreground">Rating</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-warning">{realtor.total_clients || 0}</div>
                      <div className="text-sm text-muted-foreground">Total Clients</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-info">{((realtor.commission_rate || 0) * 100).toFixed(1)}%</div>
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
                <CardDescription>All clients assigned to this realtor</CardDescription>
              </CardHeader>
              <CardContent>
                {clients.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Last Contact</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell>
                            <div className="font-medium">{client.name}</div>
                            <div className="text-sm text-muted-foreground">{client.email}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={client.status === "active" ? "default" : "secondary"}>
                              {client.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{client.stage || 'N/A'}</TableCell>
                          <TableCell className="font-medium">
                            {client.budget ? `$${client.budget.toLocaleString()}` : "N/A"}
                          </TableCell>
                          <TableCell>{client.last_contact ? new Date(client.last_contact).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>
                            <Link to={`/clients/${client.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No clients assigned yet</p>
                  </div>
                )}
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
                      <span className="font-bold text-success">{((realtor.conversion_rate || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Deal Size</span>
                      <span className="font-bold">${(realtor.avg_deal_size || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Response Time</span>
                      <span className="font-bold">{realtor.response_time_hours || 0} hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Client Satisfaction</span>
                      <span className="font-bold text-success">{((realtor.client_satisfaction || 0) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Reviews</CardTitle>
                  <CardDescription>Recent performance evaluations</CardDescription>
                </CardHeader>
                <CardContent>
                  {performanceReviews.length > 0 ? (
                    <div className="space-y-4">
                      {performanceReviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-sm font-medium">
                              {new Date(review.review_period_start).toLocaleDateString()} - {new Date(review.review_period_end).toLocaleDateString()}
                            </div>
                            <Badge variant="outline">
                              {review.overall_rating}/5
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Sales: {review.sales_performance}/5 • Satisfaction: {review.client_satisfaction}/5
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Award className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No performance reviews yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <TeamManagement realtorId={realtor.id} />
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Activities</CardTitle>
                <CardDescription>Recent team activities and events</CardDescription>
              </CardHeader>
              <CardContent>
                {teamActivities.length > 0 ? (
                  <div className="space-y-4">
                    {teamActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                        <div className="mt-1">
                          {getActivityIcon(activity.activity_type)}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{activity.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {activity.description}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(activity.scheduled_date).toLocaleDateString()} • {activity.status}
                          </div>
                        </div>
                        <Badge variant={activity.status === 'completed' ? 'default' : 'outline'}>
                          {activity.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No team activities yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export default RealtorDetail