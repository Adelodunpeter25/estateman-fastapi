import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { marketingService, type Campaign, type CampaignStats, type MarketingMaterial, type CampaignType, type TargetAudience } from "@/services/marketing"
import { useState, useEffect, useRef } from "react"
import { 
  FileText, 
  Image, 
  Video,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Calendar,
  TrendingUp,
  Users,
  BarChart3,
  Loader2,
  X
} from "lucide-react"



const Marketing = () => {
  const { toast } = useToast()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [materials, setMaterials] = useState<MarketingMaterial[]>([])
  const [stats, setStats] = useState<CampaignStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    campaign_type: '',
    target_audience: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'draft'
  })
  const [uploadDialog, setUploadDialog] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    name: '',
    description: '',
    category: 'General',
    tags: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [viewingCampaign, setViewingCampaign] = useState<Campaign | null>(null)
  const [createCampaignDialog, setCreateCampaignDialog] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [editingMaterial, setEditingMaterial] = useState<MarketingMaterial | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [campaignsData, materialsData, statsData] = await Promise.all([
        marketingService.getCampaigns(),
        marketingService.getMaterials(),
        marketingService.getCampaignStats()
      ])
      setCampaigns(campaignsData)
      setMaterials(materialsData)
      setStats(statsData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load marketing data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCampaign = async () => {
    if (!campaignForm.title || !campaignForm.campaign_type || !campaignForm.target_audience) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      const campaignData = {
        title: campaignForm.title,
        campaign_type: campaignForm.campaign_type as CampaignType,
        target_audience: campaignForm.target_audience as TargetAudience,
        description: campaignForm.description || undefined,
        start_date: campaignForm.start_date ? `${campaignForm.start_date}T00:00:00Z` : undefined,
        end_date: campaignForm.end_date ? `${campaignForm.end_date}T23:59:59Z` : undefined
      }
      
      await marketingService.createCampaign(campaignData)
      
      toast({
        title: "Success",
        description: "Campaign created successfully"
      })
      
      setCampaignForm({
        title: '',
        campaign_type: '',
        target_audience: '',
        description: '',
        start_date: '',
        end_date: ''
      })
      
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive"
      })
    }
  }

  const handleDownload = async (materialId: number) => {
    try {
      await marketingService.recordDownload(materialId)
      loadData() // Refresh to update download count
    } catch (error) {
      console.error('Failed to record download:', error)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (!uploadForm.name) {
        setUploadForm(prev => ({ ...prev, name: file.name.split('.')[0] }))
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !uploadForm.name) {
      toast({
        title: "Error",
        description: "Please select a file and enter a name",
        variant: "destructive"
      })
      return
    }

    setUploading(true)
    try {
      await marketingService.uploadMaterial(selectedFile, uploadForm)
      toast({
        title: "Success",
        description: "Material uploaded successfully"
      })
      setUploadDialog(false)
      setSelectedFile(null)
      setUploadForm({ name: '', description: '', category: 'General', tags: '' })
      if (fileInputRef.current) fileInputRef.current.value = ''
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload material",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteCampaign = async (campaignId: number) => {
    try {
      await marketingService.deleteCampaign(campaignId)
      toast({
        title: "Success",
        description: "Campaign deleted successfully"
      })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive"
      })
    }
  }

  const handleEditCampaign = (campaign: Campaign) => {
    setCampaignForm({
      title: campaign.title,
      campaign_type: campaign.campaign_type,
      target_audience: campaign.target_audience,
      description: campaign.description || '',
      start_date: campaign.start_date ? campaign.start_date.split('T')[0] : '',
      end_date: campaign.end_date ? campaign.end_date.split('T')[0] : '',
      status: campaign.status
    })
    setEditingCampaign(campaign)
  }

  const handleUpdateCampaign = async () => {
    if (!editingCampaign || !campaignForm.title || !campaignForm.campaign_type || !campaignForm.target_audience) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      const campaignData = {
        title: campaignForm.title,
        campaign_type: campaignForm.campaign_type as CampaignType,
        target_audience: campaignForm.target_audience as TargetAudience,
        description: campaignForm.description || undefined,
        start_date: campaignForm.start_date ? `${campaignForm.start_date}T00:00:00Z` : undefined,
        end_date: campaignForm.end_date ? `${campaignForm.end_date}T23:59:59Z` : undefined,
        status: campaignForm.status as any
      }
      
      await marketingService.updateCampaign(editingCampaign.id, campaignData)
      
      toast({
        title: "Success",
        description: "Campaign updated successfully"
      })
      
      setEditingCampaign(null)
      setCampaignForm({
        title: '',
        campaign_type: '',
        target_audience: '',
        description: '',
        start_date: '',
        end_date: '',
        status: 'draft'
      })
      
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update campaign",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success border-success/20"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "paused":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeIcon = (fileType: string) => {
    if (fileType.includes('image')) return <Image className="h-4 w-4" />
    if (fileType.includes('video')) return <Video className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getEngagementRate = (campaign: Campaign) => {
    return campaign.total_opens > 0 ? 
      ((campaign.total_clicks / campaign.total_opens) * 100).toFixed(1) : '0.0'
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
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
            <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Material
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Marketing Material</DialogTitle>
                  <DialogDescription>
                    Upload files like brochures, photos, videos, and other marketing materials.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file">File</Label>
                    <Input
                      id="file"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi"
                    />
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={uploadForm.name}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter material name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter description (optional)"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={uploadForm.category} onValueChange={(value) => setUploadForm(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Templates">Templates</SelectItem>
                        <SelectItem value="Photos">Photos</SelectItem>
                        <SelectItem value="Videos">Videos</SelectItem>
                        <SelectItem value="Brochures">Brochures</SelectItem>
                        <SelectItem value="Presentations">Presentations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={uploadForm.tags}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="Enter tags separated by commas"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setUploadDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpload} disabled={uploading || !selectedFile || !uploadForm.name}>
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={createCampaignDialog} onOpenChange={setCreateCampaignDialog}>
              <DialogTrigger asChild>
                <Button className="bg-primary">
                  <FileText className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Campaign</DialogTitle>
                  <DialogDescription>
                    Create a new marketing campaign with targeting and scheduling options.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="campaign-title">Campaign Title</Label>
                      <Input 
                        id="campaign-title"
                        placeholder="Enter campaign title..." 
                        value={campaignForm.title}
                        onChange={(e) => setCampaignForm({...campaignForm, title: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="campaign-type">Campaign Type</Label>
                      <Select value={campaignForm.campaign_type} onValueChange={(value) => setCampaignForm({...campaignForm, campaign_type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email Marketing</SelectItem>
                          <SelectItem value="social_media">Social Media</SelectItem>
                          <SelectItem value="newsletter">Newsletter</SelectItem>
                          <SelectItem value="paid_ads">Paid Advertising</SelectItem>
                          <SelectItem value="sms">SMS Marketing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="target-audience">Target Audience</Label>
                      <Select value={campaignForm.target_audience} onValueChange={(value) => setCampaignForm({...campaignForm, target_audience: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select audience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="luxury_buyers">Luxury Buyers</SelectItem>
                          <SelectItem value="first_time_buyers">First-Time Buyers</SelectItem>
                          <SelectItem value="commercial_clients">Commercial Clients</SelectItem>
                          <SelectItem value="investors">Real Estate Investors</SelectItem>
                          <SelectItem value="all_clients">All Clients</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="campaign-description">Campaign Description</Label>
                      <Textarea 
                        id="campaign-description"
                        placeholder="Describe your campaign objectives and key messages..."
                        rows={4}
                        value={campaignForm.description}
                        onChange={(e) => setCampaignForm({...campaignForm, description: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input 
                          id="start-date"
                          type="date" 
                          value={campaignForm.start_date}
                          onChange={(e) => setCampaignForm({...campaignForm, start_date: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="end-date">End Date</Label>
                        <Input 
                          id="end-date"
                          type="date" 
                          value={campaignForm.end_date}
                          onChange={(e) => setCampaignForm({...campaignForm, end_date: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setCreateCampaignDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={async () => {
                    await handleCreateCampaign()
                    setCreateCampaignDialog(false)
                  }}>
                    Create Campaign
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Edit Campaign Dialog */}
        <Dialog open={!!editingCampaign} onOpenChange={() => setEditingCampaign(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Campaign</DialogTitle>
              <DialogDescription>
                Update campaign details and settings.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-campaign-title">Campaign Title</Label>
                  <Input 
                    id="edit-campaign-title"
                    placeholder="Enter campaign title..." 
                    value={campaignForm.title}
                    onChange={(e) => setCampaignForm({...campaignForm, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-campaign-type">Campaign Type</Label>
                  <Select value={campaignForm.campaign_type} onValueChange={(value) => setCampaignForm({...campaignForm, campaign_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email Marketing</SelectItem>
                      <SelectItem value="social_media">Social Media</SelectItem>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="paid_ads">Paid Advertising</SelectItem>
                      <SelectItem value="sms">SMS Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="edit-target-audience">Target Audience</Label>
                  <Select value={campaignForm.target_audience} onValueChange={(value) => setCampaignForm({...campaignForm, target_audience: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="luxury_buyers">Luxury Buyers</SelectItem>
                      <SelectItem value="first_time_buyers">First-Time Buyers</SelectItem>
                      <SelectItem value="commercial_clients">Commercial Clients</SelectItem>
                      <SelectItem value="investors">Real Estate Investors</SelectItem>
                      <SelectItem value="all_clients">All Clients</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={campaignForm.status} onValueChange={(value) => setCampaignForm({...campaignForm, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Published</SelectItem>
                      <SelectItem value="paused">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-campaign-description">Campaign Description</Label>
                  <Textarea 
                    id="edit-campaign-description"
                    placeholder="Describe your campaign objectives and key messages..."
                    rows={4}
                    value={campaignForm.description}
                    onChange={(e) => setCampaignForm({...campaignForm, description: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-start-date">Start Date</Label>
                    <Input 
                      id="edit-start-date"
                      type="date" 
                      value={campaignForm.start_date}
                      onChange={(e) => setCampaignForm({...campaignForm, start_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-end-date">End Date</Label>
                    <Input 
                      id="edit-end-date"
                      type="date" 
                      value={campaignForm.end_date}
                      onChange={(e) => setCampaignForm({...campaignForm, end_date: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setEditingCampaign(null)}>
                Cancel
              </Button>
              <Button onClick={async () => {
                await handleUpdateCampaign()
                setEditingCampaign(null)
              }}>
                Update Campaign
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Material Dialog */}
        <Dialog open={!!editingMaterial} onOpenChange={() => setEditingMaterial(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Material</DialogTitle>
              <DialogDescription>
                Update material information and settings.
              </DialogDescription>
            </DialogHeader>
            {editingMaterial && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-material-name">Name</Label>
                  <Input
                    id="edit-material-name"
                    value={editingMaterial.name}
                    onChange={(e) => setEditingMaterial({...editingMaterial, name: e.target.value})}
                    placeholder="Enter material name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-material-description">Description</Label>
                  <Textarea
                    id="edit-material-description"
                    value={editingMaterial.description || ''}
                    onChange={(e) => setEditingMaterial({...editingMaterial, description: e.target.value})}
                    placeholder="Enter description (optional)"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-material-category">Category</Label>
                  <Select value={editingMaterial.category} onValueChange={(value) => setEditingMaterial({...editingMaterial, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Templates">Templates</SelectItem>
                      <SelectItem value="Photos">Photos</SelectItem>
                      <SelectItem value="Videos">Videos</SelectItem>
                      <SelectItem value="Brochures">Brochures</SelectItem>
                      <SelectItem value="Presentations">Presentations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingMaterial(null)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    toast({ title: "Success", description: "Material updated successfully" })
                    setEditingMaterial(null)
                    loadData()
                  }}>
                    Update Material
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Campaign View Dialog */}
        <Dialog open={!!viewingCampaign} onOpenChange={() => setViewingCampaign(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{viewingCampaign?.title || 'Campaign Details'}</DialogTitle>
              <DialogDescription>
                {viewingCampaign?.description || 'Campaign details and performance metrics'}
              </DialogDescription>
            </DialogHeader>
            {viewingCampaign && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <p className="text-sm capitalize">{viewingCampaign.campaign_type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge variant="outline" className={getStatusColor(viewingCampaign.status)}>
                      {viewingCampaign.status}
                    </Badge>
                  </div>
                  <div>
                    <Label>Target Audience</Label>
                    <p className="text-sm capitalize">{viewingCampaign.target_audience.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <Label>Budget</Label>
                    <p className="text-sm">${viewingCampaign.budget?.toLocaleString() || '0'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <p className="text-sm">{viewingCampaign.start_date ? formatDate(viewingCampaign.start_date) : 'Not scheduled'}</p>
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <p className="text-sm">{viewingCampaign.end_date ? formatDate(viewingCampaign.end_date) : 'Ongoing'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 pt-2 border-t">
                  <div className="text-center">
                    <p className="text-lg font-semibold">{viewingCampaign.total_reach?.toLocaleString() || '0'}</p>
                    <p className="text-xs text-muted-foreground">Reach</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold">{viewingCampaign.total_opens?.toLocaleString() || '0'}</p>
                    <p className="text-xs text-muted-foreground">Opens</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold">{viewingCampaign.total_clicks?.toLocaleString() || '0'}</p>
                    <p className="text-xs text-muted-foreground">Clicks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-success">{viewingCampaign.total_conversions || 0}</p>
                    <p className="text-xs text-muted-foreground">Conversions</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Marketing Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.active_campaigns || 0}</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_reach?.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">People reached</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.avg_engagement?.toFixed(1) || '0.0'}%</div>
              <p className="text-xs text-muted-foreground">Engagement rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads Generated</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats?.leads_generated || 0}</div>
              <p className="text-xs text-muted-foreground">Total conversions</p>
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
                        <p className="text-sm text-muted-foreground capitalize">{campaign.campaign_type.replace('_', ' ')}</p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Reach</p>
                        <p className="font-semibold">{campaign.total_reach.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Engagement</p>
                        <p className="font-semibold">{getEngagementRate(campaign)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Leads</p>
                        <p className="font-semibold text-success">{campaign.total_conversions}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 pt-3 border-t">
                      <span className="text-xs text-muted-foreground">
                        {campaign.start_date ? formatDate(campaign.start_date) : 'Not scheduled'} - {campaign.end_date ? formatDate(campaign.end_date) : 'Ongoing'}
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setViewingCampaign(campaign)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleEditCampaign(campaign)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteCampaign(campaign.id)}>
                          <Trash2 className="h-3 w-3" />
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
                        {getTypeIcon(material.file_type)}
                        <div>
                          <h4 className="font-medium text-sm">{material.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {material.category} • {material.file_type.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDownload(material.id)}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setEditingMaterial(material)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Modified {formatDate(material.updated_at || material.created_at)}</span>
                      <span>{material.download_count} downloads</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>


      </div>
    </DashboardLayout>
  )
}

export default Marketing