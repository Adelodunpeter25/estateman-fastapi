import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Home, MapPin, DollarSign, Calendar, Bed, Bath, Square, Search, Filter, Plus, Eye, Edit, Trash2, Grid3X3, List, Map as MapIcon, Camera, TreePine, Building2, Loader2 } from "lucide-react"
import PropertyMap from "@/components/PropertyMap"
import { PropertyDetailModal } from "@/components/PropertyDetailModal"
import { propertiesService, type Property, type PropertyFilters } from "@/services/properties"

const Properties = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid")
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [showPropertyModal, setShowPropertyModal] = useState(false)
  const [filters, setFilters] = useState<PropertyFilters>({})
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchProperties()
  }, [filters])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const data = await propertiesService.getProperties(0, 100, filters)
      setProperties(data)
    } catch (error: any) {
      console.error('Failed to fetch properties:', error)
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        setLoading(true)
        const data = await propertiesService.searchProperties(searchTerm)
        setProperties(data)
      } catch (error: any) {
        console.error('Search failed:', error)
        setProperties([])
      } finally {
        setLoading(false)
      }
    } else {
      fetchProperties()
    }
  }
  
  const handlePropertyView = (property: Property) => {
    setSelectedProperty(property)
    setShowPropertyModal(true)
  }

  const handleEditPrice = async (property: Property) => {
    const next = prompt(`Enter new price for ${property.address}`, String(property.price))
    if (!next) return
    const value = Number(next)
    if (Number.isNaN(value)) return
    
    try {
      await propertiesService.updateProperty(property.id, { price: value })
      fetchProperties() // Refresh the list
    } catch (error) {
      console.error('Failed to update price:', error)
    }
  }

  const handleDeleteProperty = async (propertyId: number) => {
    if (confirm('Are you sure you want to delete this property?')) {
      try {
        await propertiesService.deleteProperty(propertyId)
        fetchProperties() // Refresh the list
      } catch (error) {
        console.error('Failed to delete property:', error)
      }
    }
  }


  


  const thisMonth = new Date()
  thisMonth.setDate(1)
  const propertiesThisMonth = properties.filter(p => new Date(p.created_at) >= thisMonth).length
  
  const propertyStats = [
    { title: "Total Properties", value: properties.length.toString(), change: "+12", icon: Home },
    { title: "Active Listings", value: properties.filter(p => p.status === 'active').length.toString(), change: "+8", icon: MapPin },
    { title: "Avg. Sale Price", value: properties.length > 0 ? `$${Math.round(properties.reduce((sum, p) => sum + p.price, 0) / properties.length / 1000)}K` : "$0", change: "+5.2%", icon: DollarSign },
    { title: "Properties This Month", value: propertiesThisMonth.toString(), change: "-3", icon: Calendar },
  ]

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Pending</Badge>
      case "sold":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Sold</Badge>
      case "withdrawn":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Withdrawn</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Calculate market insights from actual properties data
  const marketInsights = properties.reduce((acc, property) => {
    const city = property.city
    if (!acc[city]) {
      acc[city] = { properties: [], totalPrice: 0 }
    }
    acc[city].properties.push(property)
    acc[city].totalPrice += property.price
    return acc
  }, {} as Record<string, { properties: Property[], totalPrice: number }>)
  
  const marketInsightsArray = Object.entries(marketInsights).map(([city, data]) => ({
    neighborhood: city,
    avgPrice: Math.round(data.totalPrice / data.properties.length),
    inventory: data.properties.length,
    trend: data.properties.length > 5 ? "up" : data.properties.length < 3 ? "down" : "stable"
  }))

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
                <div className="space-y-4">
                  {/* Search Bar - Full width on mobile */}
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <Input 
                      placeholder="Search properties..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="flex-1"
                    />
                  </div>
                  
                  {/* Filters Grid - Responsive */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Select onValueChange={(value) => setFilters({...filters, status: value === 'all' ? undefined : value})}>
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
                    
                    <Select onValueChange={(value) => setFilters({...filters, property_type: value === 'all' ? undefined : value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Property Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select onValueChange={(value) => {
                      if (value === 'all') {
                        setFilters({...filters, min_price: undefined, max_price: undefined})
                      } else if (value === '0-300k') {
                        setFilters({...filters, min_price: 0, max_price: 300000})
                      } else if (value === '300-500k') {
                        setFilters({...filters, min_price: 300000, max_price: 500000})
                      } else if (value === '500k+') {
                        setFilters({...filters, min_price: 500000, max_price: undefined})
                      }
                    }}>
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
                    
                    {/* More Filters Button - Hidden on mobile, shown on larger screens */}
                    <div className="hidden lg:block">
                      <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
                        <Filter className="w-4 h-4" />
                        <span>More Filters</span>
                      </Button>
                    </div>
                  </div>
                  
                  {/* View Mode Toggle and More Filters - Mobile Layout */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="lg:hidden">
                      <Button variant="outline" className="flex items-center space-x-2">
                        <Filter className="w-4 h-4" />
                        <span className="hidden sm:inline">More Filters</span>
                      </Button>
                    </div>
                    
                    <div className="flex border rounded-md ml-auto">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="px-3"
                      >
                        <Grid3X3 className="w-4 h-4" />
                        <span className="hidden sm:ml-1 sm:inline">Grid</span>
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="px-3"
                      >
                        <List className="w-4 h-4" />
                        <span className="hidden sm:ml-1 sm:inline">List</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}

            {/* Properties Display */}
            {!loading && viewMode === "list" ? (
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
                                {property.bedrooms || 0}
                              </div>
                              <div className="flex items-center">
                                <Bath className="w-3 h-3 mr-1" />
                                {property.bathrooms || 0}
                              </div>
                              <div className="flex items-center">
                                <Square className="w-3 h-3 mr-1" />
                                {property.square_feet?.toLocaleString() || 'N/A'}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">{property.property_type}</div>
                          </TableCell>
                          <TableCell className="font-medium">${property.price.toLocaleString()}</TableCell>
                          <TableCell>{getStatusBadge(property.status)}</TableCell>
                          <TableCell>{property.agent?.first_name} {property.agent?.last_name}</TableCell>
                          <TableCell>{Math.floor((new Date().getTime() - new Date(property.created_at).getTime()) / (1000 * 60 * 60 * 24))} days</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <Camera className="w-3 h-3" />
                                {property.images?.length || 0} photos
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button variant="outline" size="sm" onClick={() => handlePropertyView(property)}><Eye className="w-3 h-3" /></Button>
                              <Button variant="outline" size="sm" onClick={() => handleEditPrice(property)}><Edit className="w-3 h-3" /></Button>
                              <Button variant="outline" size="sm" onClick={() => handleDeleteProperty(property.id)}><Trash2 className="w-3 h-3" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : !loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {properties.map((property) => (
                  <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={property.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1469474968028-56623f02e42b?w=800&h=600&fit=crop'}
                        alt={property.address}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        {getStatusBadge(property.status)}
                      </div>
                    <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      {property.images?.length || 0}
                    </div>

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
                              {property.bedrooms || 0}
                            </span>
                            <span className="flex items-center">
                              <Bath className="w-3 h-3 mr-1" />
                              {property.bathrooms || 0}
                            </span>
                            <span className="flex items-center">
                              <Square className="w-3 h-3 mr-1" />
                              {property.square_feet?.toLocaleString() || 'N/A'}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>{property.property_type}</span>
                          <span>{Math.floor((new Date().getTime() - new Date(property.created_at).getTime()) / (1000 * 60 * 60 * 24))} days listed</span>
                        </div>
                        <div className="flex space-x-1 pt-2">
                         <Button variant="outline" size="sm" className="flex-1" onClick={() => handlePropertyView(property)}>
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditPrice(property)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteProperty(property.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <PropertyMap 
              properties={properties} 
              onPropertySelect={(property) => handlePropertyView(property)}
            />
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
                    {marketInsightsArray.map((insight, index) => (
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
                  {properties.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      No properties available for price recommendations
                    </div>
                  ) : (
                    properties.slice(0, 3).map((property, index) => {
                      const avgPrice = properties.reduce((sum, p) => sum + p.price, 0) / properties.length
                      const marketAdjustment = property.price > avgPrice ? 0.98 : 1.02
                      const suggested = Math.round(property.price * marketAdjustment)
                      const confidence = Math.round(80 + (Math.abs(property.price - avgPrice) / avgPrice) * -10)
                      
                      return (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="font-medium">{property.address}</div>
                          <div className="text-sm text-muted-foreground">
                            Current: ${property.price.toLocaleString()} → Suggested: ${suggested.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">Confidence: {Math.max(60, confidence)}%</div>
                        </div>
                      )
                    })
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Alerts</CardTitle>
                  <CardDescription>Important market updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {marketInsightsArray.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      No market alerts available
                    </div>
                  ) : (
                    marketInsightsArray.slice(0, 3).map((insight, index) => {
                      const alertType = insight.inventory < 5 ? 'low' : insight.trend === 'up' ? 'surge' : 'stable'
                      const bgColor = alertType === 'low' ? 'bg-red-50 border-red-200' : 
                                     alertType === 'surge' ? 'bg-blue-50 border-blue-200' : 
                                     'bg-green-50 border-green-200'
                      const textColor = alertType === 'low' ? 'text-red-800' : 
                                       alertType === 'surge' ? 'text-blue-800' : 
                                       'text-green-800'
                      const descColor = alertType === 'low' ? 'text-red-700' : 
                                       alertType === 'surge' ? 'text-blue-700' : 
                                       'text-green-700'
                      
                      return (
                        <div key={index} className={`p-3 border rounded-lg ${bgColor}`}>
                          <div className={`font-medium ${textColor}`}>
                            {alertType === 'low' ? 'Low Inventory Alert' : 
                             alertType === 'surge' ? 'Price Trend Alert' : 
                             'Market Stable'}
                          </div>
                          <div className={`text-sm ${descColor}`}>
                            {alertType === 'low' ? 
                             `${insight.neighborhood} has only ${insight.inventory} properties available` :
                             alertType === 'surge' ? 
                             `${insight.neighborhood} showing ${insight.trend === 'up' ? 'rising' : 'falling'} price trends` :
                             `${insight.neighborhood} market conditions are stable`}
                          </div>
                        </div>
                      )
                    })
                  )}
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
                  {properties.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      No performance data available
                    </div>
                  ) : (
                    [
                      { 
                        metric: "Average Days on Market", 
                        value: `${Math.round(properties.reduce((sum, p) => sum + Math.floor((new Date().getTime() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24)), 0) / properties.length)} days`, 
                        benchmark: "32 days", 
                        status: "good" 
                      },
                      { 
                        metric: "Average Property Price", 
                        value: `$${Math.round(properties.reduce((sum, p) => sum + p.price, 0) / properties.length / 1000)}K`, 
                        benchmark: "$450K", 
                        status: "excellent" 
                      },
                      { 
                        metric: "Active Listings", 
                        value: `${properties.filter(p => p.status === 'active').length}`, 
                        benchmark: "25", 
                        status: "good" 
                      },
                      { 
                        metric: "Properties This Month", 
                        value: `${propertiesThisMonth}`, 
                        benchmark: "15", 
                        status: propertiesThisMonth > 15 ? "excellent" : "good" 
                      }
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
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Properties</CardTitle>
                  <CardDescription>Properties generating the most interest</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {properties.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      No properties available for performance tracking
                    </div>
                  ) : (
                    properties.slice(0, 3).map((property, index) => {
                      const daysListed = Math.floor((new Date().getTime() - new Date(property.created_at).getTime()) / (1000 * 60 * 60 * 24))
                      const views = Math.max(50, Math.floor(daysListed * 8 + property.price / 10000))
                      const showings = Math.max(1, Math.floor(views / 15))
                      const offers = property.status === 'sold' ? Math.floor(Math.random() * 3 + 1) : Math.floor(showings / 5)
                      
                      return (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="font-medium">{property.address}</div>
                          <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground mt-1">
                            <div>{views} views</div>
                            <div>{showings} showings</div>
                            <div>{offers} offers</div>
                          </div>
                        </div>
                      )
                    })
                  )}
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