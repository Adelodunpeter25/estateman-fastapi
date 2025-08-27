import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  FileText, 
  Image, 
  Video,
  Download,
  Upload,
  Eye,
  Share2,
  Calendar,
  TrendingUp,
  Users,
  BarChart3
} from "lucide-react"

const campaigns = [
  {
    id: "1",
    title: "Luxury Waterfront Properties Campaign",
    type: "Email Marketing",
    status: "Active",
    reach: 15420,
    engagement: 8.7,
    leads: 124,
    startDate: "2024-01-15",
    endDate: "2024-02-15"
  },
  {
    id: "2",
    title: "First-Time Buyer Social Media",
    type: "Social Media",
    status: "Completed",
    reach: 28350,
    engagement: 12.3,
    leads: 287,
    startDate: "2023-12-01",
    endDate: "2024-01-31"
  },
  {
    id: "3",
    title: "Commercial Space Newsletter",
    type: "Newsletter",
    status: "Draft",
    reach: 0,
    engagement: 0,
    leads: 0,
    startDate: "2024-02-01",
    endDate: "2024-03-01"
  }
]

const materials = [
  {
    id: "1",
    name: "Property Showcase Brochure Template",
    type: "Template",
    category: "Brochures",
    lastModified: "2 hours ago",
    downloads: 156,
    format: "PDF"
  },
  {
    id: "2",
    name: "Luxury Villa Photo Gallery",
    type: "Images",
    category: "Photos",
    lastModified: "1 day ago",
    downloads: 89,
    format: "JPG"
  },
  {
    id: "3",
    name: "Virtual Tour Video Template",
    type: "Video",
    category: "Videos",
    lastModified: "3 days ago",
    downloads: 67,
    format: "MP4"
  },
  {
    id: "4",
    name: "Client Presentation Slides",
    type: "Template",
    category: "Presentations",
    lastModified: "1 week ago",
    downloads: 234,
    format: "PPTX"
  }
]

const Marketing = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-success/10 text-success border-success/20"
      case "Completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Images":
        return <Image className="h-4 w-4" />
      case "Video":
        return <Video className="h-4 w-4" />
      case "Template":
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Marketing Materials</h1>
            <p className="text-muted-foreground">Manage campaigns and marketing assets</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload Material
            </Button>
            <Button className="bg-primary">
              <FileText className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </div>

        {/* Marketing Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+3 this month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">187K</div>
              <p className="text-xs text-muted-foreground">+24% vs last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">9.8%</div>
              <p className="text-xs text-muted-foreground">+1.2% improvement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads Generated</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">892</div>
              <p className="text-xs text-muted-foreground">This quarter</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle>Marketing Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{campaign.title}</h4>
                        <p className="text-sm text-muted-foreground">{campaign.type}</p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Reach</p>
                        <p className="font-semibold">{campaign.reach.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Engagement</p>
                        <p className="font-semibold">{campaign.engagement}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Leads</p>
                        <p className="font-semibold text-success">{campaign.leads}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 pt-3 border-t">
                      <span className="text-xs text-muted-foreground">
                        {campaign.startDate} - {campaign.endDate}
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Share2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Marketing Materials Library */}
          <Card>
            <CardHeader>
              <CardTitle>Materials Library</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {materials.map((material) => (
                  <div key={material.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(material.type)}
                        <div>
                          <h4 className="font-medium text-sm">{material.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {material.category} • {material.format}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Modified {material.lastModified}</span>
                      <span>{material.downloads} downloads</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Creator */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Campaign Creator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Campaign Title</label>
                  <Input placeholder="Enter campaign title..." />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Campaign Type</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email Marketing</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="ads">Paid Advertising</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Target Audience</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="luxury">Luxury Buyers</SelectItem>
                      <SelectItem value="firsttime">First-Time Buyers</SelectItem>
                      <SelectItem value="commercial">Commercial Clients</SelectItem>
                      <SelectItem value="investors">Real Estate Investors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Campaign Description</label>
                  <Textarea 
                    placeholder="Describe your campaign objectives and key messages..."
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Start Date</label>
                    <Input type="date" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Date</label>
                    <Input type="date" />
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1">
                    Save as Draft
                  </Button>
                  <Button className="flex-1 bg-primary">
                    Launch Campaign
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default Marketing