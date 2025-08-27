
import { DashboardLayout } from "@/components/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Mail, 
  Send, 
  Users, 
  Eye,
  Edit,
  Trash2,
  Copy,
  Calendar,
  TrendingUp,
  BarChart3,
  FileText,
  Plus
} from "lucide-react"

const Newsletters = () => {
  const campaignStats = [
    { label: "Total Subscribers", value: "4,287", change: "+234", icon: Users },
    { label: "Campaigns Sent", value: "156", change: "+12", icon: Send },
    { label: "Open Rate", value: "34.2%", change: "+2.1%", icon: Eye },
    { label: "Click Rate", value: "8.7%", change: "+1.3%", icon: TrendingUp }
  ]

  const newsletters = [
    {
      id: 1,
      title: "January Market Update",
      subject: "🏡 Your Monthly Real Estate Digest",
      recipients: 4287,
      openRate: 36.5,
      clickRate: 9.2,
      status: "Sent",
      sentDate: "2024-01-15",
      type: "Monthly"
    },
    {
      id: 2,
      title: "New Property Showcase",
      subject: "Exclusive Properties Just Listed",
      recipients: 3845,
      openRate: 28.7,
      clickRate: 6.8,
      status: "Sent",
      sentDate: "2024-01-12",
      type: "Promotional"
    },
    {
      id: 3,
      title: "Investment Opportunities",
      subject: "Prime Investment Properties Available",
      recipients: 1256,
      openRate: 42.1,
      clickRate: 12.4,
      status: "Sent",
      sentDate: "2024-01-10",
      type: "VIP"
    },
    {
      id: 4,
      title: "Spring Market Preview",
      subject: "Get Ready for Spring Real Estate Season",
      recipients: 4287,
      openRate: 0,
      clickRate: 0,
      status: "Draft",
      sentDate: null,
      type: "Seasonal"
    }
  ]

  const templates = [
    { id: 1, name: "Market Update", category: "Newsletter", usage: 24 },
    { id: 2, name: "Property Showcase", category: "Promotional", usage: 18 },
    { id: 3, name: "Investment Alert", category: "VIP", usage: 12 },
    { id: 4, name: "Seasonal Guide", category: "Educational", usage: 15 },
    { id: 5, name: "Welcome Series", category: "Onboarding", usage: 8 }
  ]

  const subscribers = [
    { segment: "All Subscribers", count: 4287, growth: "+234", active: true },
    { segment: "VIP Clients", count: 1256, growth: "+45", active: true },
    { segment: "First-Time Buyers", count: 1834, growth: "+123", active: true },
    { segment: "Investors", count: 892, growth: "+67", active: true },
    { segment: "Past Clients", count: 2156, growth: "+89", active: false }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Mail className="h-8 w-8 text-primary" />
              Newsletter Management
            </h1>
            <p className="text-muted-foreground">Create and manage email campaigns and newsletters</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <Button className="bg-primary">
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {campaignStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <stat.icon className="h-8 w-8 text-primary mb-2" />
                    <Badge variant="outline" className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Email Campaigns</CardTitle>
                    <CardDescription>Manage your newsletter campaigns</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Search campaigns..." className="w-64" />
                    <Select>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {newsletters.map((newsletter) => (
                    <div key={newsletter.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{newsletter.title}</h4>
                          <p className="text-sm text-muted-foreground">{newsletter.subject}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{newsletter.recipients.toLocaleString()} recipients</span>
                            {newsletter.status === 'Sent' && (
                              <>
                                <span>Open: {newsletter.openRate}%</span>
                                <span>Click: {newsletter.clickRate}%</span>
                              </>
                            )}
                            {newsletter.sentDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {newsletter.sentDate}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={newsletter.status === 'Sent' ? 'default' : newsletter.status === 'Draft' ? 'secondary' : 'outline'}>
                          {newsletter.status}
                        </Badge>
                        <Badge variant="outline">{newsletter.type}</Badge>
                        <div className="flex items-center gap-1 ml-4">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>Reusable templates for your campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <Card key={template.id} className="border">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{template.category}</Badge>
                            <span className="text-sm text-muted-foreground">Used {template.usage} times</span>
                          </div>
                          <h4 className="font-medium">{template.name}</h4>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Eye className="h-3 w-3 mr-1" />
                              Preview
                            </Button>
                            <Button size="sm" className="flex-1">
                              Use Template
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscribers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscriber Segments</CardTitle>
                <CardDescription>Manage your email subscriber lists</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscribers.map((subscriber, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${subscriber.active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <div>
                          <h4 className="font-medium">{subscriber.segment}</h4>
                          <p className="text-sm text-muted-foreground">{subscriber.count.toLocaleString()} subscribers</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{subscriber.growth}</Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Analytics</CardTitle>
                <CardDescription>Detailed performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p>Advanced analytics coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export default Newsletters
