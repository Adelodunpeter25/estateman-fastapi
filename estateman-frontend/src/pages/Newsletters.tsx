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
import { newsletterService, Newsletter, EmailTemplate, Subscriber, NewsletterStats, SubscriberSegment } from "@/services/newsletter"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const Newsletters = () => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [subscriberSegments, setSubscriberSegments] = useState<SubscriberSegment[]>([])
  const [stats, setStats] = useState<NewsletterStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    category: '',
    html_content: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newslettersData, templatesData, subscribersData, segmentsData, statsData] = await Promise.all([
          newsletterService.getNewsletters(),
          newsletterService.getTemplates(),
          newsletterService.getSubscribers(),
          newsletterService.getSubscriberSegments(),
          newsletterService.getNewsletterStats()
        ])
        setNewsletters(newslettersData)
        setTemplates(templatesData)
        setSubscribers(subscribersData)
        setSubscriberSegments(segmentsData)
        setStats(statsData)
      } catch (error) {
        console.error('Failed to fetch newsletter data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleCreateTemplate = async () => {
    try {
      await newsletterService.createTemplate(templateForm)
      setShowTemplateModal(false)
      setTemplateForm({ name: '', description: '', category: '', html_content: '' })
      // Refresh templates
      const templatesData = await newsletterService.getTemplates()
      setTemplates(templatesData)
    } catch (error) {
      console.error('Failed to create template:', error)
    }
  }

  const campaignStats = stats ? [
    { label: "Total Subscribers", value: stats.total_subscribers.toLocaleString(), change: "+0", icon: Users },
    { label: "Campaigns Sent", value: stats.campaigns_sent.toString(), change: "+0", icon: Send },
    { label: "Open Rate", value: `${stats.avg_open_rate.toFixed(1)}%`, change: "+0%", icon: Eye },
    { label: "Click Rate", value: `${stats.avg_click_rate.toFixed(1)}%`, change: "+0%", icon: TrendingUp }
  ] : []

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
            <Button onClick={() => setShowTemplateModal(true)} className="bg-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {campaignStats.map((stat) => (
            <Card key={stat.label}>
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
                {newsletters.length > 0 ? (
                  <div className="space-y-4">
                    {newsletters.map((newsletter) => {
                      const openRate = newsletter.total_recipients > 0 ? (newsletter.total_opens / newsletter.total_recipients * 100).toFixed(1) : '0'
                      const clickRate = newsletter.total_recipients > 0 ? (newsletter.total_clicks / newsletter.total_recipients * 100).toFixed(1) : '0'
                      return (
                        <div key={newsletter.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded">
                              <Mail className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">{newsletter.title}</h4>
                              <p className="text-sm text-muted-foreground">{newsletter.subject}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span>{newsletter.total_recipients.toLocaleString()} recipients</span>
                                {newsletter.status === 'sent' && (
                                  <>
                                    <span>Open: {openRate}%</span>
                                    <span>Click: {clickRate}%</span>
                                  </>
                                )}
                                {newsletter.sent_at && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(newsletter.sent_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={newsletter.status === 'sent' ? 'default' : newsletter.status === 'draft' ? 'secondary' : 'outline'}>
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
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-4" />
                    <p>No campaigns found</p>
                    <p className="text-sm">Create your first newsletter campaign to get started</p>
                  </div>
                )}
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
                {templates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template) => (
                      <Card key={template.id} className="border">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">{template.category}</Badge>
                              <span className="text-sm text-muted-foreground">Used {template.usage_count} times</span>
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
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4" />
                    <p>No templates found</p>
                    <p className="text-sm">Create your first email template to get started</p>
                  </div>
                )}
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
                {subscriberSegments.length > 0 ? (
                  <div className="space-y-4">
                    {subscriberSegments.map((segment) => (
                      <div key={segment.segment} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${segment.active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <div>
                            <h4 className="font-medium">{segment.segment}</h4>
                            <p className="text-sm text-muted-foreground">{segment.count.toLocaleString()} subscribers</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">{segment.growth > 0 ? `+${segment.growth}` : segment.growth.toString()}</Badge>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4" />
                    <p>No subscriber segments found</p>
                    <p className="text-sm">Add subscribers to see segment data</p>
                  </div>
                )}
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

      {/* Add Template Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Template</DialogTitle>
            <DialogDescription>
              Create a new email template for your newsletter campaigns
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={templateForm.name}
                onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                placeholder="Enter template name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={templateForm.description}
                onChange={(e) => setTemplateForm({...templateForm, description: e.target.value})}
                placeholder="Enter template description"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={templateForm.category} onValueChange={(value) => setTemplateForm({...templateForm, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Newsletter">Newsletter</SelectItem>
                  <SelectItem value="Promotional">Promotional</SelectItem>
                  <SelectItem value="Educational">Educational</SelectItem>
                  <SelectItem value="Onboarding">Onboarding</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="html_content">HTML Content</Label>
              <Textarea
                id="html_content"
                value={templateForm.html_content}
                onChange={(e) => setTemplateForm({...templateForm, html_content: e.target.value})}
                placeholder="Enter HTML content for the template"
                rows={10}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTemplateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate}>
                Create Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

export default Newsletters