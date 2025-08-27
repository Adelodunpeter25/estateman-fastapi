import { useState } from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Home, MapPin, DollarSign, Calendar, Bed, Bath, Square, Search, Filter, Plus, Eye, Edit, Trash2, Grid3X3, List, Map as MapIcon, Camera, TreePine, Building2 } from "lucide-react"
import PropertyMap from "@/components/PropertyMap"
import { PropertyDetailModal } from "@/components/PropertyDetailModal"
import { LandPlotMap } from "@/components/LandPlotMap"
import { useAppStore } from "@/store/app-store"

const Properties = () => {
  const { properties: storeProperties, updatePropertyPrice } = useAppStore()
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid")
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [showPropertyModal, setShowPropertyModal] = useState(false)
  
  const handlePropertyView = (property: any) => {
    setSelectedProperty(property)
    setShowPropertyModal(true)
  }

  const handleEditPrice = (property: any) => {
    const next = prompt(`Enter new price for ${property.address}`, String(property.price))
    if (!next) return
    const value = Number(next)
    if (Number.isNaN(value)) return
    updatePropertyPrice(property.id, value)
  }

  const landPlotData = {
    totalArea: "28.2 acres",
    totalPlots: 73,
    plots: Array.from({ length: 73 }, (_, i) => ({
      id: `plot-${i + 1}`,
      coordinates: [
        [Math.random() * 0.8 + 0.1, Math.random() * 0.8 + 0.1],
        [Math.random() * 0.8 + 0.1, Math.random() * 0.8 + 0.1],
        [Math.random() * 0.8 + 0.1, Math.random() * 0.8 + 0.1],
        [Math.random() * 0.8 + 0.1, Math.random() * 0.8 + 0.1]
      ] as [number, number][],
      status: ['available', 'sold', 'reserved', 'development'][Math.floor(Math.random() * 4)] as 'available' | 'sold' | 'reserved' | 'development',
      price: Math.floor(Math.random() * 50000 + 25000),
      size: Math.floor(Math.random() * 2000 + 1000),
      plotNumber: `P${(i + 1).toString().padStart(3, '0')}`,
      type: ['Residential', 'Commercial', 'Mixed Use'][Math.floor(Math.random() * 3)]
    }))
  }
  
  const propertyStats = [
    { title: "Total Properties", value: "284", change: "+12", icon: Home },
    { title: "Active Listings", value: "156", change: "+8", icon: MapPin },
    { title: "Avg. Sale Price", value: "$485K", change: "+5.2%", icon: DollarSign },
    { title: "Avg. Days Listed", value: "28", change: "-3", icon: Calendar },
  ]

  const properties = [
    {
      id: "1",
      address: "123 Oak Street",
      city: "Downtown",
      price: 450000,
      beds: 3,
      baths: 2,
      sqft: 1850,
      status: "Active",
      type: "Single Family",
      agent: "Sarah Wilson",
      daysListed: 15,
      images: [
        "https://images.unsplash.com/photo-1469474968028-56623f02e42b?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&h=600&fit=crop"
      ],
      virtual_tour: true,
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    {
      id: "2",
      address: "456 Pine Avenue",
      city: "Suburbs",
      price: 320000,
      beds: 2,
      baths: 2,
      sqft: 1200,
      status: "Pending",
      type: "Condo",
      agent: "Mike Chen",
      daysListed: 8,
      images: [
        "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&h=600&fit=crop"
      ],
      virtual_tour: false,
      coordinates: { lat: 40.7589, lng: -73.9851 }
    },
    {
      id: "3",
      address: "789 Maple Drive",
      city: "Uptown", 
      price: 580000,
      beds: 4,
      baths: 3,
      sqft: 2400,
      status: "Sold",
      type: "Single Family",
      agent: "Emily Rodriguez",
      daysListed: 22,
      images: [
        "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&h=600&fit=crop"
      ],
      virtual_tour: true,
      coordinates: { lat: 40.7831, lng: -73.9712 }
    },
    {
      id: "4",
      address: "321 Elm Street",
      city: "Historic District",
      price: 275000,
      beds: 2,
      baths: 1,
      sqft: 980,
      status: "Active",
      type: "Townhouse",
      agent: "James Thompson",
      daysListed: 45,
      images: [
        "https://images.unsplash.com/photo-1517022812141-23620dba5c23?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1527576539890-dfa815648363?w=800&h=600&fit=crop"
      ],
      virtual_tour: false,
      coordinates: { lat: 40.7505, lng: -73.9934 }
    },
    {
      id: "5",
      address: "654 Cedar Lane",
      city: "Waterfront",
      price: 750000,
      beds: 5,
      baths: 4,
      sqft: 3200,
      status: "Active",
      type: "Single Family",
      agent: "Lisa Garcia",
      daysListed: 12,
      images: [
        "https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1496307653780-42ee777d4833?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1431576901776-e539bd916ba2?w=800&h=600&fit=crop"
      ],
      virtual_tour: true,
      coordinates: { lat: 40.7420, lng: -74.0020 }
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>
      case "Pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Pending</Badge>
      case "Sold":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Sold</Badge>
      case "Off Market":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Off Market</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const marketInsights = [
    { neighborhood: "Downtown", avgPrice: 485000, inventory: 45, trend: "up" },
    { neighborhood: "Suburbs", avgPrice: 320000, inventory: 78, trend: "stable" },
    { neighborhood: "Uptown", avgPrice: 620000, inventory: 23, trend: "up" },
    { neighborhood: "Historic District", avgPrice: 380000, inventory: 34, trend: "down" },
    { neighborhood: "Waterfront", avgPrice: 850000, inventory: 12, trend: "up" }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Property Management</h1>
            <p className="text-muted-foreground">Comprehensive property listing and management system</p>
          </div>
          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Property</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {propertyStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{stat.change}</span> from last month
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="listings">All Listings</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="market">Market Analysis</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search properties..." />
                  </div>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Property Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="single">Single Family</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Price Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="0-300k">$0 - $300K</SelectItem>
                      <SelectItem value="300-500k">$300K - $500K</SelectItem>
                      <SelectItem value="500k+">$500K+</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Filter className="w-4 h-4" />
                      <span>More Filters</span>
                    </Button>
                    <div className="flex border rounded-md">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Properties Display */}
            {viewMode === "list" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Property Listings</CardTitle>
                  <CardDescription>Manage all your property listings</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Agent</TableHead>
                        <TableHead>Days Listed</TableHead>
                        <TableHead>Media</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {properties.map((property) => (
                        <TableRow key={property.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{property.address}</div>
                              <div className="text-sm text-muted-foreground flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {property.city}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-4 text-sm">
                              <div className="flex items-center">
                                <Bed className="w-3 h-3 mr-1" />
                                {property.beds}
                              </div>
                              <div className="flex items-center">
                                <Bath className="w-3 h-3 mr-1" />
                                {property.baths}
                              </div>
                              <div className="flex items-center">
                                <Square className="w-3 h-3 mr-1" />
                                {property.sqft.toLocaleString()}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">{property.type}</div>
                          </TableCell>
                          <TableCell className="font-medium">${property.price.toLocaleString()}</TableCell>
                          <TableCell>{getStatusBadge(property.status)}</TableCell>
                          <TableCell>{property.agent}</TableCell>
                          <TableCell>{property.daysListed} days</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <Camera className="w-3 h-3" />
                                {property.images.length} photos
                              </div>
                              {property.virtual_tour && (
                                <Badge variant="outline" className="text-xs">VR Tour</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button variant="outline" size="sm" onClick={() => handlePropertyView(property)}><Eye className="w-3 h-3" /></Button>
                              <Button variant="outline" size="sm" onClick={() => handleEditPrice(property)}><Edit className="w-3 h-3" /></Button>
                              <Button variant="outline" size="sm"><Trash2 className="w-3 h-3" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {properties.map((property) => (
                  <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={property.images[0]}
                        alt={property.address}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        {getStatusBadge(property.status)}
                      </div>
                    <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      {property.images.length}
                    </div>
                      {property.virtual_tour && (
                        <div className="absolute bottom-2 right-2">
                          <Badge variant="secondary" className="text-xs">VR Tour</Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div>
                          <h3 className="font-semibold text-lg">${property.price.toLocaleString()}</h3>
                          <p className="text-sm text-muted-foreground">{property.address}</p>
                          <p className="text-xs text-muted-foreground flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {property.city}
                          </p>
                        </div>
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center">
                              <Bed className="w-3 h-3 mr-1" />
                              {property.beds}
                            </span>
                            <span className="flex items-center">
                              <Bath className="w-3 h-3 mr-1" />
                              {property.baths}
                            </span>
                            <span className="flex items-center">
                              <Square className="w-3 h-3 mr-1" />
                              {property.sqft.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>{property.type}</span>
                          <span>{property.daysListed} days listed</span>
                        </div>
                        <div className="flex space-x-1 pt-2">
                         <Button variant="outline" size="sm" className="flex-1" onClick={() => handlePropertyView(property)}>
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditPrice(property)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <PropertyMap 
              properties={properties} 
              onPropertySelect={(property) => handlePropertyView(property)}
            />
          </TabsContent>

          <TabsContent value="lands" className="space-y-6">
            <LandPlotMap landData={landPlotData} />
          </TabsContent>

          <TabsContent value="market" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Analysis by Neighborhood</CardTitle>
                <CardDescription>Current market conditions and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Neighborhood</TableHead>
                      <TableHead>Avg. Price</TableHead>
                      <TableHead>Inventory</TableHead>
                      <TableHead>Trend</TableHead>
                      <TableHead>Market Health</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {marketInsights.map((insight, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{insight.neighborhood}</TableCell>
                        <TableCell>${insight.avgPrice.toLocaleString()}</TableCell>
                        <TableCell>{insight.inventory} properties</TableCell>
                        <TableCell>
                          <Badge variant={insight.trend === 'up' ? 'default' : insight.trend === 'down' ? 'destructive' : 'secondary'}>
                            {insight.trend === 'up' ? '↗ Rising' : insight.trend === 'down' ? '↘ Falling' : '→ Stable'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {insight.inventory < 30 ? (
                            <Badge variant="destructive">Low Inventory</Badge>
                          ) : insight.inventory < 60 ? (
                            <Badge variant="secondary">Balanced</Badge>
                          ) : (
                            <Badge variant="outline">High Inventory</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Price Recommendations</CardTitle>
                  <CardDescription>AI-powered pricing suggestions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { address: "123 Oak Street", current: 450000, suggested: 465000, confidence: "85%" },
                    { address: "321 Elm Street", current: 275000, suggested: 260000, confidence: "78%" },
                    { address: "654 Cedar Lane", current: 750000, suggested: 775000, confidence: "92%" }
                  ].map((rec, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="font-medium">{rec.address}</div>
                      <div className="text-sm text-muted-foreground">
                        Current: ${rec.current.toLocaleString()} → Suggested: ${rec.suggested.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Confidence: {rec.confidence}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Alerts</CardTitle>
                  <CardDescription>Important market updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="font-medium text-yellow-800">Interest Rate Change</div>
                    <div className="text-sm text-yellow-700">Rates increased 0.25%, may affect buyer demand</div>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="font-medium text-green-800">Low Inventory Alert</div>
                    <div className="text-sm text-green-700">Waterfront area has only 12 properties available</div>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="font-medium text-blue-800">Price Surge</div>
                    <div className="text-sm text-blue-700">Downtown prices up 8% this quarter</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Listing Performance</CardTitle>
                  <CardDescription>How your listings are performing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { metric: "Average Days on Market", value: "28 days", benchmark: "32 days", status: "good" },
                    { metric: "Price to List Ratio", value: "97.2%", benchmark: "95%", status: "excellent" },
                    { metric: "Listing Views", value: "1,245/month", benchmark: "1,100/month", status: "good" },
                    { metric: "Showing Requests", value: "45/month", benchmark: "38/month", status: "excellent" }
                  ].map((perf, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{perf.metric}</div>
                        <div className="text-sm text-muted-foreground">vs {perf.benchmark} market avg</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{perf.value}</div>
                        <Badge variant={perf.status === 'excellent' ? 'default' : 'secondary'}>
                          {perf.status === 'excellent' ? 'Excellent' : 'Good'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Properties</CardTitle>
                  <CardDescription>Properties generating the most interest</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { address: "654 Cedar Lane", views: 324, showings: 18, offers: 3 },
                    { address: "123 Oak Street", views: 298, showings: 15, offers: 2 },
                    { address: "789 Maple Drive", views: 276, showings: 12, offers: 4 }
                  ].map((prop, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="font-medium">{prop.address}</div>
                      <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground mt-1">
                        <div>{prop.views} views</div>
                        <div>{prop.showings} showings</div>
                        <div>{prop.offers} offers</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>CMA Generator</CardTitle>
                  <CardDescription>Comparative Market Analysis tool</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Generate detailed market comparisons for property valuations.</p>
                  <Button className="w-full">Generate CMA</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Virtual Tour Creator</CardTitle>
                  <CardDescription>Create immersive property tours</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Upload photos and create 360° virtual tours for listings.</p>
                  <Button className="w-full">Create Tour</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Report</CardTitle>
                  <CardDescription>Automated market reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Generate comprehensive market reports for clients.</p>
                  <Button className="w-full">Generate Report</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Photo Enhancement</CardTitle>
                  <CardDescription>AI-powered photo editing</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Automatically enhance property photos for better presentation.</p>
                  <Button className="w-full">Enhance Photos</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Listing Optimizer</CardTitle>
                  <CardDescription>Optimize listing descriptions</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">AI-generated listing descriptions that attract more buyers.</p>
                  <Button className="w-full">Optimize Listing</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Social Media Kit</CardTitle>
                  <CardDescription>Marketing materials generator</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Create social media posts and marketing materials automatically.</p>
                  <Button className="w-full">Create Kit</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <PropertyDetailModal 
        property={selectedProperty}
        isOpen={showPropertyModal}
        onClose={() => setShowPropertyModal(false)}
      />
    </DashboardLayout>
  )
}

export default Properties