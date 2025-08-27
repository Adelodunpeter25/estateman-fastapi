
import { DashboardLayout } from "@/components/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  FileText, 
  Upload, 
  Download, 
  Search, 
  Filter,
  Eye,
  Trash2,
  Edit,
  Share2,
  Folder,
  Calendar
} from "lucide-react"

const Documents = () => {
  const documents = [
    {
      id: 1,
      name: "Property Purchase Agreement - 123 Oak St",
      type: "Contract",
      size: "2.4 MB",
      lastModified: "2024-01-15",
      status: "Active",
      category: "Legal",
      owner: "Sarah Johnson"
    },
    {
      id: 2,
      name: "Marketing Brochure Template",
      type: "Template",
      size: "8.1 MB",
      lastModified: "2024-01-14",
      status: "Draft",
      category: "Marketing",
      owner: "Mike Wilson"
    },
    {
      id: 3,
      name: "Commission Structure 2024",
      type: "Spreadsheet",
      size: "156 KB",
      lastModified: "2024-01-13",
      status: "Active",
      category: "Financial",
      owner: "Admin User"
    },
    {
      id: 4,
      name: "Client Onboarding Checklist",
      type: "Form",
      size: "89 KB",
      lastModified: "2024-01-12",
      status: "Active",
      category: "Process",
      owner: "Lisa Chen"
    }
  ]

  const documentStats = [
    { label: "Total Documents", value: "2,847", change: "+156" },
    { label: "Storage Used", value: "4.2 GB", change: "+0.8 GB" },
    { label: "Templates", value: "89", change: "+5" },
    { label: "Active Contracts", value: "234", change: "+12" }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Document Management</h1>
            <p className="text-muted-foreground">Organize and manage all business documents</p>
          </div>
          <Button className="bg-primary">
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {documentStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                Document Library
              </CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search documents..." className="pl-10 w-64" />
                </div>
                <Select>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="process">Process</SelectItem>
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
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{doc.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{doc.type}</span>
                        <span>{doc.size}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {doc.lastModified}
                        </span>
                        <span>by {doc.owner}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={doc.status === 'Active' ? 'default' : 'secondary'}>
                      {doc.status}
                    </Badge>
                    <Badge variant="outline">{doc.category}</Badge>
                    <div className="flex items-center gap-1 ml-4">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4" />
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
      </div>
    </DashboardLayout>
  )
}

export default Documents
