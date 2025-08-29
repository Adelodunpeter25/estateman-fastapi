import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users,
  Plus,
  Filter,
  Search,
  Video,
  UserCheck,
  Building2,
  TrendingUp
} from "lucide-react"
import { useEffect, useState } from "react"
import { eventService, type Event } from "@/services/events"

// Removed hardcoded data - now using API data

const Events = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [todayEvents, setTodayEvents] = useState<Event[]>([])
  const [eventStats, setEventStats] = useState({ total_events: 0, this_month: 0, avg_attendance: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [eventsData, todayData, statsData] = await Promise.all([
        eventService.getEvents({ limit: 50 }),
        eventService.getTodayEvents(),
        eventService.getEventStats()
      ])
      setEvents(eventsData)
      setTodayEvents(todayData)
      setEventStats(statsData)
    } catch (err) {
      setError('Failed to load events data')
      console.error('Events error:', err)
    } finally {
      setLoading(false)
    }
  }

  const createQuickEvent = async (eventType: string, title: string) => {
    try {
      setCreating(true)
      const now = new Date()
      const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000) // Tomorrow
      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000) // 2 hours later
      
      await eventService.createEvent({
        title,
        event_type: eventType,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        location: eventType === 'Open House' ? 'Property Location' : 'Office',
        is_virtual: eventType === 'Virtual Tour',
        max_attendees: eventType === 'Open House' ? 50 : 20
      })
      
      // Reload data to show new event
      await loadData()
    } catch (err) {
      console.error('Failed to create event:', err)
      setError('Failed to create event')
    } finally {
      setCreating(false)
    }
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Completed":
        return "bg-success/10 text-success border-success/20"
      case "Scheduled":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Open House":
        return <Building2 className="h-4 w-4" />
      case "Seminar":
      case "Workshop":
        return <Users className="h-4 w-4" />
      case "Training":
        return <UserCheck className="h-4 w-4" />
      case "Meeting":
        return <Video className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Events & Scheduling</h1>
            <p className="text-muted-foreground">Manage events, meetings, and appointments</p>
          </div>
          <Button className="bg-primary">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Event
          </Button>
        </div>

        {/* Event Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eventStats.this_month}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eventStats.total_events}</div>
              <p className="text-xs text-muted-foreground">All events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eventStats.avg_attendance}</div>
              <p className="text-xs text-muted-foreground">Average attendees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Events</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{todayEvents.length}</div>
              <p className="text-xs text-muted-foreground">Scheduled today</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="list" className="space-y-6">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Event List */}
              <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <CardTitle>Event Management</CardTitle>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search events..." className="pl-10" />
                    </div>
                    <Select>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="openhouse">Open House</SelectItem>
                        <SelectItem value="seminar">Seminar</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          {getTypeIcon(event.type || event.event_type)}
                          <div>
                            <h4 className="font-semibold">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>{event.date || (event.start_date ? new Date(event.start_date).toLocaleDateString() : 'No date')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{event.time || (event.start_date && event.end_date ? `${new Date(event.start_date).toLocaleTimeString()} - ${new Date(event.end_date).toLocaleTimeString()}` : 'No time')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span>{event.attendees || event.current_attendees || 0}/{event.maxAttendees || event.max_attendees || 0} attendees</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Avatar className="h-4 w-4">
                              <AvatarFallback className="text-xs">
                                {event.organizerInitials || 'OR'}
                              </AvatarFallback>
                            </Avatar>
                            <span>Organized by {event.organizer || 'Unknown'}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {event.type || event.event_type}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-3 border-t">
                        <div className="text-sm text-muted-foreground">
                          {(((event.attendees || event.current_attendees || 0) / (event.maxAttendees || event.max_attendees || 1)) * 100).toFixed(0)}% capacity
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">Edit</Button>
                          <Button size="sm" variant="ghost">View</Button>
                          <Button size="sm" variant="outline">Manage</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today's Schedule */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : todayEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No events today</div>
                  ) : (
                    todayEvents.map((event) => (
                      <div key={event.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {event.type}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-1 mb-1">
                            <Clock className="h-3 w-3" />
                            {event.time} ({event.duration})
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    disabled={creating}
                    onClick={() => createQuickEvent('OPEN_HOUSE', 'New Open House Event')}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Open House
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    disabled={creating}
                    onClick={() => createQuickEvent('MEETING', 'Client Meeting')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Book Client Meeting
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    disabled={creating}
                    onClick={() => createQuickEvent('APPOINTMENT', 'Virtual Property Tour')}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Create Virtual Tour
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    disabled={creating}
                    onClick={() => createQuickEvent('TRAINING', 'Team Training Session')}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Team Training Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Calendar View</CardTitle>
                <CardDescription>Monthly calendar with events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-2 text-center font-medium text-sm text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }, (_, i) => {
                    const day = i - 6 + 1
                    const isCurrentMonth = day > 0 && day <= 28
                    const currentDate = new Date()
                    const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                    const dayEvents = events.filter(event => {
                      if (!event.start_date) return false
                      const eventDate = new Date(event.start_date)
                      return eventDate.toDateString() === cellDate.toDateString()
                    })
                    
                    return (
                      <div key={i} className={`min-h-[80px] p-2 border rounded ${
                        isCurrentMonth ? 'bg-background' : 'bg-muted/30'
                      }`}>
                        {isCurrentMonth && (
                          <>
                            <div className="text-sm font-medium mb-1">{day}</div>
                            {dayEvents.length > 0 && (
                              <div className="space-y-1">
                                {dayEvents.slice(0, 2).map((event, idx) => (
                                  <div key={idx} className="text-xs bg-primary text-primary-foreground px-1 py-0.5 rounded truncate">
                                    {event.title}
                                  </div>
                                ))}
                                {dayEvents.length > 2 && (
                                  <div className="text-xs text-muted-foreground">+{dayEvents.length - 2} more</div>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export default Events