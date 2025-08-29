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
import { useEffect, useState } from "react"
import { notificationService, type Notification, type NotificationPreference } from "@/services/notifications"

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreference[]>([])
  const [stats, setStats] = useState({ total: 0, unread: 0, categories: {} })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [notificationsData, preferencesData, statsData] = await Promise.all([
        notificationService.getNotifications({ limit: 50 }),
        notificationService.getPreferences(),
        notificationService.getNotificationStats()
      ])
      setNotifications(notificationsData)
      setPreferences(preferencesData)
      setStats(statsData)
    } catch (err) {
      setError('Failed to load notifications')
      console.error('Notifications error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId)
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n))
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }


  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'info': return <Info className="h-5 w-5 text-blue-500" />
      default: return <Bell className="h-5 w-5" />
    }
  }



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
                      <p className="text-2xl font-bold">{stats.unread}</p>
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
                      <p className="text-2xl font-bold">{stats.categories['Finance'] || 0}</p>
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
                      <p className="text-2xl font-bold">{stats.categories['Leads'] || 0}</p>
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
                      <p className="text-2xl font-bold">{stats.categories['Events'] || 0}</p>
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
                  {loading ? (
                    <div className="text-center py-8">Loading notifications...</div>
                  ) : error ? (
                    <div className="text-center py-8 text-red-600">{error}</div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No notifications found</div>
                  ) : (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer ${
                          !notification.is_read ? 'bg-muted/50 border-primary/20' : 'hover:bg-muted/30'
                        }`}
                        onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                      >
                        {getNotificationIcon(notification.notification_type)}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{notification.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {notification.category}
                              </Badge>
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(notification.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
                  {preferences.map((setting, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{setting.category}</h4>
                        <p className="text-sm text-muted-foreground">{setting.channel} notifications</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span className="text-sm">Email</span>
                          <Switch checked={setting.is_enabled && setting.channel === 'email'} />
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          <span className="text-sm">Push</span>
                          <Switch checked={setting.is_enabled && setting.channel === 'push'} />
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
