import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Mail, Phone, MapPin, Calendar, Award, Edit, Save, X, MessageSquare, DollarSign } from "lucide-react"
import { clientsService, Client, ClientUpdateData, ClientInteraction, LoyaltyTransaction } from "@/services/clients"

interface ClientDetailModalProps {
  client: Client | null
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export function ClientDetailModal({ client, isOpen, onClose, onUpdate }: ClientDetailModalProps) {
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [interactions, setInteractions] = useState<ClientInteraction[]>([])
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<LoyaltyTransaction[]>([])
  const [formData, setFormData] = useState<ClientUpdateData>({})

  useEffect(() => {
    if (client && isOpen) {
      setFormData({
        first_name: client.first_name,
        last_name: client.last_name,
        email: client.email,
        phone: client.phone,
        status: client.status,
        budget_min: client.budget_min,
        budget_max: client.budget_max,
        preferred_location: client.preferred_location,
        property_interests: client.property_interests,
        notes: client.notes
      })
      loadClientData()
    }
  }, [client, isOpen])

  const loadClientData = async () => {
    if (!client) return
    
    try {
      const [interactionsData, loyaltyData] = await Promise.all([
        clientsService.getClientInteractions(client.id),
        clientsService.getLoyaltyTransactions(client.id)
      ])
      setInteractions(interactionsData)
      setLoyaltyTransactions(loyaltyData)
    } catch (error) {
      console.error("Failed to load client data:", error)
    }
  }

  const handleSave = async () => {
    if (!client) return

    try {
      setLoading(true)
      await clientsService.updateClient(client.id, formData)
      setEditing(false)
      onUpdate()
    } catch (error) {
      console.error("Failed to update client:", error)
      alert("Failed to update client")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    if (client) {
      setFormData({
        first_name: client.first_name,
        last_name: client.last_name,
        email: client.email,
        phone: client.phone,
        status: client.status,
        budget_min: client.budget_min,
        budget_max: client.budget_max,
        preferred_location: client.preferred_location,
        property_interests: client.property_interests,
        notes: client.notes
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "lead": return "bg-yellow-100 text-yellow-800"
      case "inactive": return "bg-gray-100 text-gray-800"
      case "converted": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (!client) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>{client.first_name[0]}{client.last_name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-xl font-semibold">{client.first_name} {client.last_name}</div>
                <div className="text-sm text-muted-foreground">ID: {client.client_id}</div>
              </div>
            </DialogTitle>
            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={loading}>
                    <Save className="w-4 h-4 mr-1" />
                    {loading ? "Saving..." : "Save"}
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="interactions">Interactions</TabsTrigger>
            <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      {editing ? (
                        <Input
                          value={formData.first_name || ""}
                          onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{client.first_name}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      {editing ? (
                        <Input
                          value={formData.last_name || ""}
                          onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{client.last_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Email</Label>
                    {editing ? (
                      <Input
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{client.email}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    {editing ? (
                      <Input
                        value={formData.phone || ""}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{client.phone || "Not provided"}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Status</Label>
                    {editing ? (
                      <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as any})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="converted">Converted</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={getStatusColor(client.status)}>
                        {client.status}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Preferred Location</Label>
                    {editing ? (
                      <Input
                        value={formData.preferred_location || ""}
                        onChange={(e) => setFormData({...formData, preferred_location: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{client.preferred_location || "Not specified"}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Budget Min</Label>
                      {editing ? (
                        <Input
                          type="number"
                          value={formData.budget_min || ""}
                          onChange={(e) => setFormData({...formData, budget_min: parseFloat(e.target.value) || undefined})}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span>${(client.budget_min || 0).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Budget Max</Label>
                      {editing ? (
                        <Input
                          type="number"
                          value={formData.budget_max || ""}
                          onChange={(e) => setFormData({...formData, budget_max: parseFloat(e.target.value) || undefined})}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span>${(client.budget_max || 0).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Property Interests</Label>
                    {editing ? (
                      <Input
                        value={formData.property_interests?.join(", ") || ""}
                        onChange={(e) => setFormData({...formData, property_interests: e.target.value.split(",").map(s => s.trim()).filter(s => s)})}
                        placeholder="Luxury Condos, Family Homes"
                      />
                    ) : (
                      <span>{client.property_interests?.join(", ") || "Not specified"}</span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    {editing ? (
                      <Textarea
                        value={formData.notes || ""}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        rows={3}
                      />
                    ) : (
                      <span className="text-sm">{client.notes || "No notes"}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="interactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Recent Interactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {interactions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No interactions recorded</p>
                  ) : (
                    interactions.map((interaction) => (
                      <div key={interaction.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{interaction.type}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(interaction.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {interaction.subject && (
                          <h4 className="font-medium mb-1">{interaction.subject}</h4>
                        )}
                        {interaction.content && (
                          <p className="text-sm text-muted-foreground">{interaction.content}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="loyalty" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Loyalty Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">{client.loyalty_points}</div>
                    <div className="text-sm text-muted-foreground">Total Points</div>
                  </div>
                  <div className="text-center">
                    <Badge className="text-lg px-4 py-2">{client.loyalty_tier}</Badge>
                    <div className="text-sm text-muted-foreground mt-1">Current Tier</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold">${client.total_spent.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Spent</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {loyaltyTransactions.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No transactions</p>
                    ) : (
                      loyaltyTransactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <div className="font-medium">{transaction.description}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className={`font-medium ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.points > 0 ? '+' : ''}{transaction.points}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{client.lead_score}</div>
                    <div className="text-sm text-muted-foreground">out of 100</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {client.engagement_level}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Last Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{client.last_contact_date ? new Date(client.last_contact_date).toLocaleDateString() : "Never"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}