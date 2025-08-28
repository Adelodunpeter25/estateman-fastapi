import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { 
  Download, 
  FileText, 
  Calendar, 
  Bell, 
  Star, 
  MapPin, 
  DollarSign, 
  Home, 
  User,
  Megaphone,
  Trophy,
  Clock,
  CheckCircle
} from "lucide-react"
import { useAppStore } from "@/store/app-store"
import { ClientPayments } from "@/components/ClientPayments"

const ClientPortal = () => {
  const clientStats = [
    { title: "Loyalty Points", value: "2,450", icon: Star, color: "text-yellow-500" },
    { title: "Properties Viewed", value: "23", icon: Home, color: "text-blue-500" },
    { title: "Pending Offers", value: "2", icon: FileText, color: "text-orange-500" },
    { title: "Upcoming Events", value: "3", icon: Calendar, color: "text-green-500" },
  ]

  const recentOffers = [
    {
      id: "1",
      property: "123 Oak Street",
      address: "Downtown District",
      offer: 445000,
      status: "pending",
      date: "2025-01-22",
      agent: "Sarah Wilson"
    },
    {
      id: "2", 
      property: "456 Pine Avenue",
      address: "Suburban Area",
      offer: 315000,
      status: "countered",
      date: "2025-01-20",
      agent: "Mike Chen"
    },
    {
      id: "3",
      property: "789 Maple Drive", 
      address: "Uptown",
      offer: 575000,
      status: "accepted",
      date: "2025-01-18",
      agent: "Emily Rodriguez"
    }
  ]

  const receipts = [
    {
      id: "R001",
      description: "Home Inspection Fee",
      amount: 450,
      date: "2025-01-20",
      property: "123 Oak Street",
      status: "paid"
    },
    {
      id: "R002", 
      description: "Appraisal Fee",
      amount: 600,
      date: "2025-01-15",
      property: "123 Oak Street", 
      status: "paid"
    },
    {
      id: "R003",
      description: "Commission Payment",
      amount: 18900,
      date: "2025-01-10",
      property: "789 Maple Drive",
      status: "paid"
    }
  ]

  const announcements = [
    {
      id: "1",
      title: "New Market Report Available",
      content: "Q4 2023 market analysis is now available for download.",
      date: "2025-01-22",
      priority: "normal",
      type: "info"
    },
    {
      id: "2",
      title: "Interest Rate Update",
      content: "Current mortgage rates have changed. Contact your agent for details.",
      date: "2025-01-20", 
      priority: "high",
      type: "alert"
    },
    {
      id: "3",
      title: "Holiday Office Hours",
      content: "Our office will have modified hours during the holiday season.",
      date: "2025-01-18",
      priority: "normal",
      type: "info"
    }
  ]

  const upcomingEvents = [
    {
      id: "1",
      title: "First-Time Buyer Seminar",
      date: "2025-02-05",
      time: "6:00 PM",
      location: "Downtown Office",
      spots: 25,
      registered: 18,
      description: "Learn about the home buying process and available programs."
    },
    {
      id: "2",
      title: "Open House Tour",
      date: "2025-02-10", 
      time: "2:00 PM",
      location: "Various Locations",
      spots: 15,
      registered: 8,
      description: "Group tour of premium properties in the area."
    },
    {
      id: "3",
      title: "Investment Property Workshop",
      date: "2025-02-15",
      time: "7:00 PM", 
      location: "Conference Center",
      spots: 30,
      registered: 22,
      description: "Strategies for real estate investment and wealth building."
    }
  ]

  const loyaltyRewards = [
    { item: "Free Property Appraisal", points: 1000, available: true },
    { item: "Home Warranty Discount", points: 1500, available: true },
    { item: "Moving Service Credit", points: 2000, available: false },
    { item: "Closing Cost Credit", points: 3000, available: false },
    { item: "Premium Listing Package", points: 5000, available: false }
  ]

  const notifications = [
    {
      id: "1",
      title: "Offer Status Update",
      message: "Your offer on 123 Oak Street has been countered",
      time: "2 hours ago",
      type: "offer",
      read: false
    },
    {
      id: "2",
      title: "Document Required",
      message: "Please upload your pre-approval letter",
      time: "5 hours ago", 
      type: "document",
      read: false
    },
    {
      id: "3",
      title: "New Property Match",
      message: "3 new properties match your criteria",
      time: "1 day ago",
      type: "property",
      read: true
    }
  ]

  const getOfferStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Pending</Badge>
      case "accepted":
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Accepted</Badge>
      case "countered":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Countered</Badge>
      case "rejected":
        return <Badge variant="secondary" className="bg-red-100 text-red-700">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, John!</h1>
              <p className="text-muted-foreground">Manage your real estate journey</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {clientStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid grid-cols-7 w-full">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="offers">Offers</TabsTrigger>
              <TabsTrigger value="receipts">Receipts</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="loyalty">Rewards</TabsTrigger>
              <TabsTrigger value="announcements">News</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest property interactions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Home className="w-5 h-5 text-blue-500" />
                      <div className="flex-1">
                        <div className="font-medium">Viewed 123 Oak Street</div>
                        <div className="text-sm text-muted-foreground">2 hours ago</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <FileText className="w-5 h-5 text-green-500" />
                      <div className="flex-1">
                        <div className="font-medium">Offer submitted</div>
                        <div className="text-sm text-muted-foreground">1 day ago</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-500" />
                      <div className="flex-1">
                        <div className="font-medium">Registered for seminar</div>
                        <div className="text-sm text-muted-foreground">3 days ago</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Important updates and alerts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {notifications.slice(0, 4).map((notification) => (
                      <div key={notification.id} className={`p-3 border rounded-lg ${!notification.read ? 'bg-blue-50' : ''}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">{notification.title}</div>
                            <div className="text-sm text-muted-foreground">{notification.message}</div>
                          </div>
                          <div className="text-xs text-muted-foreground">{notification.time}</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Your Agent</CardTitle>
                  <CardDescription>Your dedicated real estate professional</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>SW</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-lg">Sarah Wilson</div>
                      <div className="text-muted-foreground">Senior Real Estate Agent</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        📞 (555) 123-4567 • 📧 sarah@realestate.com
                      </div>
                    </div>
                    <div className="space-x-2">
                      <Button variant="outline">Call</Button>
                      <Button>Message</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="offers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Offers</CardTitle>
                  <CardDescription>Track all your property offers and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Offer Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Agent</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentOffers.map((offer) => (
                        <TableRow key={offer.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{offer.property}</div>
                              <div className="text-sm text-muted-foreground">{offer.address}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">${offer.offer.toLocaleString()}</TableCell>
                          <TableCell>{getOfferStatusBadge(offer.status)}</TableCell>
                          <TableCell>{offer.date}</TableCell>
                          <TableCell>{offer.agent}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">View Details</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="receipts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Receipts</CardTitle>
                  <CardDescription>Download receipts for all your real estate transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Receipt ID</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receipts.map((receipt) => (
                        <TableRow key={receipt.id}>
                          <TableCell className="font-medium">{receipt.id}</TableCell>
                          <TableCell>{receipt.description}</TableCell>
                          <TableCell>${receipt.amount.toLocaleString()}</TableCell>
                          <TableCell>{receipt.property}</TableCell>
                          <TableCell>{receipt.date}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Paid
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" className="flex items-center space-x-1">
                              <Download className="w-3 h-3" />
                              <span>Download</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments" className="space-y-6">
              <ClientPayments />
            </TabsContent>

            <TabsContent value="events" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>Register for educational seminars and open houses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{event.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {event.date} at {event.time}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {event.location}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Button className="mb-2">Register</Button>
                          <div className="text-xs text-muted-foreground">
                            {event.registered}/{event.spots} registered
                          </div>
                          <Progress value={(event.registered / event.spots) * 100} className="w-20 h-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="loyalty" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Loyalty Points</CardTitle>
                    <CardDescription>Earn points and redeem exclusive rewards</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-yellow-500 mb-2">2,450</div>
                      <div className="text-muted-foreground">Available Points</div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Referral Bonus</span>
                        <span className="text-green-600">+500 pts</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Property Purchase</span>
                        <span className="text-green-600">+1,000 pts</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Event Attendance</span>
                        <span className="text-green-600">+100 pts</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Available Rewards</CardTitle>
                    <CardDescription>Redeem your points for valuable rewards</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {loyaltyRewards.map((reward, index) => (
                        <div key={index} className={`flex justify-between items-center p-3 border rounded-lg ${!reward.available ? 'opacity-50' : ''}`}>
                          <div>
                            <div className="font-medium">{reward.item}</div>
                            <div className="text-sm text-muted-foreground">{reward.points} points</div>
                          </div>
                          <Button 
                            variant={reward.available ? "default" : "outline"} 
                            size="sm"
                            disabled={!reward.available}
                          >
                            {reward.available ? "Redeem" : "Locked"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="announcements" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Announcements & News</CardTitle>
                  <CardDescription>Stay updated with the latest real estate news and updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <Megaphone className={`w-5 h-5 ${announcement.priority === 'high' ? 'text-red-500' : 'text-blue-500'}`} />
                          <h3 className="font-medium">{announcement.title}</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          {announcement.priority === 'high' && (
                            <Badge variant="destructive">High Priority</Badge>
                          )}
                          <span className="text-sm text-muted-foreground">{announcement.date}</span>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{announcement.content}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default ClientPortal