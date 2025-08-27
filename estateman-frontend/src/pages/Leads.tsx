import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Target, 
  TrendingUp, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  DollarSign,
  User,
  Filter,
  Search
} from "lucide-react"

const leads = [
  {
    id: "1",
    name: "Jennifer Martinez",
    email: "jennifer.m@email.com",
    phone: "+1 (555) 123-4567",
    source: "Website",
    status: "Hot",
    score: 92,
    budget: "$800K - $1.2M",
    location: "Downtown District",
    interested: "Luxury Condo",
    assignedTo: "Sarah Johnson",
    lastContact: "2 hours ago",
    notes: "Very interested in high-end properties. Ready to move quickly."
  },
  {
    id: "2",
    name: "Robert Chen",
    email: "robert.chen@company.com",
    phone: "+1 (555) 987-6543",
    source: "Referral",
    status: "Warm",
    score: 78,
    budget: "$500K - $700K",
    location: "Suburban Hills",
    interested: "Family Home",
    assignedTo: "Mike Chen",
    lastContact: "1 day ago",
    notes: "Looking for family-friendly neighborhood with good schools."
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "emily.r@gmail.com",
    phone: "+1 (555) 456-7890",
    source: "Social Media",
    status: "Cold",
    score: 45,
    budget: "$300K - $450K",
    location: "City Center",
    interested: "Apartment",
    assignedTo: "Emily Davis",
    lastContact: "3 days ago",
    notes: "First-time buyer, needs guidance through the process."
  },
  {
    id: "4",
    name: "Michael Thompson",
    email: "m.thompson@business.com",
    phone: "+1 (555) 321-0987",
    source: "Google Ads",
    status: "Hot",
    score: 88,
    budget: "$1M - $2M",
    location: "Waterfront",
    interested: "Commercial Space",
    assignedTo: "James Wilson",
    lastContact: "4 hours ago",
    notes: "Expanding business, needs large commercial space near water."
  },
  {
    id: "5",
    name: "Lisa Wang",
    email: "lisa.wang@tech.com",
    phone: "+1 (555) 654-3210",
    source: "Walk-in",
    status: "Warm",
    score: 72,
    budget: "$600K - $900K",
    location: "Tech District",
    interested: "Modern Loft",
    assignedTo: "Lisa Anderson",
    lastContact: "6 hours ago",
    notes: "Tech professional looking for modern amenities and smart home features."
  }
]

const Leads = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hot":
        return "bg-red-100 text-red-800 border-red-200"
      case "Warm":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Cold":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-red-600"
    if (score >= 60) return "text-yellow-600"
    return "text-blue-600"
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Lead Management</h1>
            <p className="text-muted-foreground">Track and manage your sales leads with scoring</p>
          </div>
          <Button className="bg-primary">
            <User className="h-4 w-4 mr-2" />
            Add New Lead
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,847</div>
              <p className="text-xs text-muted-foreground">+18.3% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">284</div>
              <p className="text-xs text-muted-foreground">Ready to convert</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">34.2%</div>
              <p className="text-xs text-muted-foreground">+2.1% improvement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Lead Score</CardTitle>
              <Target className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gold">73.5</div>
              <p className="text-xs text-muted-foreground">Quality improving</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <CardTitle>Lead Database</CardTitle>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search leads..." className="pl-10" />
                </div>
                <Select>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="hot">Hot</SelectItem>
                    <SelectItem value="warm">Warm</SelectItem>
                    <SelectItem value="cold">Cold</SelectItem>
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
              {leads.map((lead) => (
                <div key={lead.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {lead.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{lead.name}</h4>
                          <Badge variant="outline" className={getStatusColor(lead.status)}>
                            {lead.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {lead.location} • {lead.interested}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {lead.budget}
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-2">{lead.notes}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col lg:items-end gap-2 lg:min-w-48">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Lead Score:</span>
                        <span className={`font-bold ${getScoreColor(lead.score)}`}>
                          {lead.score}/100
                        </span>
                      </div>
                      
                      <Progress value={lead.score} className="w-full lg:w-32 h-2" />
                      
                      <div className="text-sm text-muted-foreground">
                        <div>Assigned to: <span className="font-medium">{lead.assignedTo}</span></div>
                        <div>Last contact: {lead.lastContact}</div>
                        <div>Source: {lead.source}</div>
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline">
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="h-3 w-3 mr-1" />
                          Email
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default Leads