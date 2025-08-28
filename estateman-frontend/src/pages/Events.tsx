import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

const events = [
  {
    id: "1",
    title: "Luxury Villa Open House",
    type: "Open House",
    date: "2025-02-15",
    time: "10:00 AM - 4:00 PM",
    location: "123 Waterfront Drive, Downtown",
    attendees: 45,
    maxAttendees: 50,
    organizer: "Sarah Johnson",
    organizerInitials: "SJ",
    status: "Upcoming",
    description: "Exclusive viewing of our newest luxury waterfront property."
  },
  {
    id: "2",
    title: "First-Time Buyer Seminar",
    type: "Seminar",
    date: "2025-02-18",
    time: "2:00 PM - 5:00 PM",
    location: "Estateman Conference Room A",
    attendees: 32,
    maxAttendees: 40,
    organizer: "Mike Chen",
    organizerInitials: "MC",
    status: "Upcoming",
    description: "Educational seminar for first-time home buyers covering financing and process."
  },
  {
    id: "3",
    title: "Property Investment Workshop",
    type: "Workshop",
    date: "2025-02-20",
    time: "6:00 PM - 8:00 PM",
    location: "Virtual Meeting",
    attendees: 78,
    maxAttendees: 100,
    organizer: "Emily Davis",
    organizerInitials: "ED",
    status: "Upcoming",
    description: "Learn about real estate investment strategies and market trends."
  },
  {
    id: "4",
    title: "Team Training - New CRM",
    type: "Training",
    date: "2025-02-12",
    time: "9:00 AM - 12:00 PM",
    location: "Estateman Training Center",
    attendees: 24,
    maxAttendees: 25,
    organizer: "James Wilson",
    organizerInitials: "JW",
    status: "Completed",
    description: "Training session on the new CRM system features and workflow."
  },
  {
    id: "5",
    title: "Quarterly Sales Meeting",
    type: "Meeting",
    date: "2025-02-25",
    time: "10:00 AM - 2:00 PM",
    location: "Main Conference Room",
    attendees: 15,
    maxAttendees: 20,
    organizer: "Lisa Anderson",
    organizerInitials: "LA",
    status: "Scheduled",
    description: "Review Q1 performance and set Q2 targets."
  }
]

const upcomingEvents = [
  {
    id: "1",
    title: "Client Meeting - Rodriguez Family",
    time: "9:00 AM",
    duration: "1 hour",
    type: "Client Meeting"
  },
  {
    id: "2",
    title: "Property Tour - Downtown Loft",
    time: "11:30 AM",
    duration: "45 minutes",
    type: "Property Tour"
  },
  {
    id: "3",
    title: "Contract Signing - Chen Property",
    time: "2:00 PM",
    duration: "30 minutes",
    type: "Contract"
  },
  {
    id: "4",
    title: "Team Stand-up Meeting",
    time: "4:00 PM",
    duration: "30 minutes",
    type: "Team Meeting"
  }
]

const Events = () => {
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
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">+8 vs last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Houses</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">847 total attendees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs text-muted-foreground">+5% vs last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">23.4%</div>
              <p className="text-xs text-muted-foreground">Events to leads</p>
            </CardContent>
          </Card>
        </div>

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
                          {getTypeIcon(event.type)}
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
                            <span>{event.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span>{event.attendees}/{event.maxAttendees} attendees</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Avatar className="h-4 w-4">
                              <AvatarFallback className="text-xs">
                                {event.organizerInitials}
                              </AvatarFallback>
                            </Avatar>
                            <span>Organized by {event.organizer}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {event.type}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-3 border-t">
                        <div className="text-sm text-muted-foreground">
                          {((event.attendees / event.maxAttendees) * 100).toFixed(0)}% capacity
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
                  {upcomingEvents.map((event) => (
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
                  ))}
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
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Open House
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Book Client Meeting
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Video className="h-4 w-4 mr-2" />
                    Create Virtual Tour
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Team Training Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Events