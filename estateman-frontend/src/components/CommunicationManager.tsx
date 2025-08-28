import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Mail, MessageSquare, Send, Plus, Users } from "lucide-react"
import { clientsService } from "@/services/clients"

interface Template {
  id: number
  name: string
  type: string
  subject: string
  content: string
}

interface Campaign {
  id: number
  name: string
  type: string
  status: string
  sent_count: number
}

export function CommunicationManager() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(false)
  
  // Template form
  const [templateForm, setTemplateForm] = useState({
    name: "",
    type: "email",
    subject: "",
    content: ""
  })
  
  // Campaign form
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    type: "email",
    template_id: 0
  })
  
  // Quick send form
  const [quickSend, setQuickSend] = useState({
    client_id: 0,
    template_id: 0,
    message: ""
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const data = await clientsService.getTemplates()
      setTemplates(data)
    } catch (error) {
      console.error("Failed to load templates:", error)
    }
  }

  const handleCreateTemplate = async () => {
    if (!templateForm.name || !templateForm.content) {
      alert("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      await clientsService.createTemplate(templateForm)
      setTemplateForm({ name: "", type: "email", subject: "", content: "" })
      loadTemplates()
      alert("Template created successfully")
    } catch (error) {
      console.error("Failed to create template:", error)
      alert("Failed to create template")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCampaign = async () => {
    if (!campaignForm.name || !campaignForm.template_id) {
      alert("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      const campaign = await clientsService.createCampaign(campaignForm)
      setCampaigns(prev => [...prev, campaign])
      setCampaignForm({ name: "", type: "email", template_id: 0 })
      alert("Campaign created successfully")
    } catch (error) {
      console.error("Failed to create campaign:", error)
      alert("Failed to create campaign")
    } finally {
      setLoading(false)
    }
  }

  const handleSendCampaign = async (campaignId: number) => {
    if (!confirm("Are you sure you want to send this campaign to all active clients?")) {
      return
    }

    try {
      setLoading(true)
      const result = await clientsService.sendBulkCommunication(campaignId)
      alert(`Campaign sent to ${result.sent_count} clients`)
      // Update campaign status
      setCampaigns(prev => prev.map(c => 
        c.id === campaignId ? { ...c, status: "sent", sent_count: result.sent_count } : c
      ))
    } catch (error) {
      console.error("Failed to send campaign:", error)
      alert("Failed to send campaign")
    } finally {
      setLoading(false)
    }
  }

  const handleQuickSend = async () => {
    if (!quickSend.client_id) {
      alert("Please enter client ID")
      return
    }

    try {
      setLoading(true)
      if (quickSend.template_id) {
        await clientsService.sendEmail(quickSend.client_id, quickSend.template_id)
      } else if (quickSend.message) {
        await clientsService.sendSMS(quickSend.client_id, quickSend.message)
      } else {
        alert("Please select a template or enter a message")
        return
      }
      
      setQuickSend({ client_id: 0, template_id: 0, message: "" })
      alert("Message sent successfully")
    } catch (error) {
      console.error("Failed to send message:", error)
      alert("Failed to send message")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Communication Manager
        </CardTitle>
        <CardDescription>
          Manage email templates, SMS messages, and bulk communication campaigns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="templates" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="quick-send">Quick Send</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Create Template</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Template Name</Label>
                    <Input
                      placeholder="Welcome Email"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={templateForm.type} onValueChange={(value) => setTemplateForm({...templateForm, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {templateForm.type === "email" && (
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Input
                        placeholder="Welcome to our service"
                        value={templateForm.subject}
                        onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label>Content</Label>
                    <Textarea
                      placeholder="Enter your message content..."
                      rows={4}
                      value={templateForm.content}
                      onChange={(e) => setTemplateForm({...templateForm, content: e.target.value})}
                    />
                  </div>
                  
                  <Button onClick={handleCreateTemplate} disabled={loading} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Existing Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {templates.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No templates created yet</p>
                    ) : (
                      templates.map((template) => (
                        <div key={template.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{template.name}</h4>
                            <Badge variant="outline">{template.type}</Badge>
                          </div>
                          {template.subject && (
                            <p className="text-sm text-muted-foreground mb-1">
                              Subject: {template.subject}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground truncate">
                            {template.content}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Create Campaign</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Campaign Name</Label>
                    <Input
                      placeholder="Monthly Newsletter"
                      value={campaignForm.name}
                      onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={campaignForm.type} onValueChange={(value) => setCampaignForm({...campaignForm, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Template</Label>
                    <Select value={campaignForm.template_id.toString()} onValueChange={(value) => setCampaignForm({...campaignForm, template_id: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.filter(t => t.type === campaignForm.type).map((template) => (
                          <SelectItem key={template.id} value={template.id.toString()}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button onClick={handleCreateCampaign} disabled={loading} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Campaign
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {campaigns.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No campaigns created yet</p>
                    ) : (
                      campaigns.map((campaign) => (
                        <div key={campaign.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{campaign.name}</h4>
                            <Badge variant={campaign.status === "sent" ? "default" : "secondary"}>
                              {campaign.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Sent to: {campaign.sent_count} clients
                            </span>
                            {campaign.status !== "sent" && (
                              <Button
                                size="sm"
                                onClick={() => handleSendCampaign(campaign.id)}
                                disabled={loading}
                              >
                                <Send className="w-4 h-4 mr-1" />
                                Send
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="quick-send" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Send Message</CardTitle>
                <CardDescription>Send individual messages to specific clients</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Client ID</Label>
                  <Input
                    type="number"
                    placeholder="Enter client ID"
                    value={quickSend.client_id || ""}
                    onChange={(e) => setQuickSend({...quickSend, client_id: parseInt(e.target.value) || 0})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Email Template (Optional)</Label>
                  <Select value={quickSend.template_id.toString()} onValueChange={(value) => setQuickSend({...quickSend, template_id: parseInt(value)})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select email template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      {templates.filter(t => t.type === "email").map((template) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>SMS Message (Optional)</Label>
                  <Textarea
                    placeholder="Enter SMS message..."
                    rows={3}
                    value={quickSend.message}
                    onChange={(e) => setQuickSend({...quickSend, message: e.target.value})}
                  />
                </div>
                
                <Button onClick={handleQuickSend} disabled={loading} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}