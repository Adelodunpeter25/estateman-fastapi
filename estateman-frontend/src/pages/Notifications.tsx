
import { DashboardLayout } from "@/components/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Settings, 
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  User,
  DollarSign,
  Calendar,
  Target
} from "lucide-react"

const Notifications = () => {
  const notifications = [
    {
      id: 1,
      type: "success",
      title: "New Property Sale Completed",
      message: "Sarah Johnson completed the sale of 123 Oak Street for $485,000",
      time: "2 minutes ago",
      read: false,
      category: "Sales"
    },
    {
      id: 2,
      type: "info",
      title: "New Lead Assigned",
      message: "High-value lead from premium listing inquiry has been assigned to Mike Wilson",
      time: "15 minutes ago",
      read: false,
      category: "Leads"
    },
    {
      id: 3,
      type: "warning",
      title: "Commission Payment Due",
      message: "Monthly commission payment of $12,500 is due for processing",
      time: "1 hour ago",
      read: true,
      category: "Finance"
    },
    {
      id: 4,
      type: "info",
      title: "Event Reminder",
      message: "Team meeting scheduled for tomorrow at 2:00 PM",
      time: "2 hours ago",
      read: true,
      category: "Events"
    },
    {
      id: 5,
      type: "success",
      title: "New Realtor Onboarded",
      message: "Jessica Martinez has completed onboarding and is now active",
      time: "4 hours ago",
      read: true,
      category: "Team"
    }
  ]

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'info': return <Info className="h-5 w-5 text-blue-500" />
      default: return <Bell className="h-5 w-5" />
    }
  }

  const notificationSettings = [
    { category: "Sales Updates", email: true, push: true, description: "New sales, closings, and revenue updates" },
    { category: "Lead Notifications", email: true, push: false, description: "New leads and lead status changes" },
    { category: "Team Activities", email: false, push: true, description: "Realtor performance and team updates" },
    { category: "Commission Alerts", email: true, push: true, description: "Commission calculations and payments" },
    { category: "Event Reminders", email: true, push: true, description: "Meetings, appointments, and deadlines" },
    { category: "System Updates", email: false, push: false, description: "Platform updates and maintenance" }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Notification Center</h1>
            <p className="text-muted-foreground">Manage alerts and communication preferences</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
            <Button className="bg-primary">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Bell className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">24</p>
                      <p className="text-sm text-muted-foreground">Unread</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">8</p>
                      <p className="text-sm text-muted-foreground">Financial</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-sm text-muted-foreground">Leads</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">6</p>
                      <p className="text-sm text-muted-foreground">Events</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notifications List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>Stay updated with the latest activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`flex items-start gap-4 p-4 border rounded-lg ${
                        !notification.read ? 'bg-muted/50 border-primary/20' : 'hover:bg-muted/30'
                      }`}
                    >
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{notification.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {notification.category}
                            </Badge>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {notification.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {notificationSettings.map((setting, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{setting.category}</h4>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span className="text-sm">Email</span>
                          <Switch checked={setting.email} />
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          <span className="text-sm">Push</span>
                          <Switch checked={setting.push} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export default Notifications
