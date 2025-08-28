import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { 
  Bed, 
  Bath, 
  Square, 
  MapPin, 
  Calendar, 
  User,
  Heart,
  Share2,
  Phone,
  Mail,
  MessageSquare
} from "lucide-react"

interface Property {
  id: string
  address: string
  price: number
  beds: number
  baths: number
  sqft: number
  status: string
  images: string[]
  coordinates: [number, number]
  type?: string
  description?: string
  agent?: string
  listedDate?: string
  lotSize?: string
  yearBuilt?: number
  propertyFeatures?: string[]
  neighborhood?: string
}

interface PropertyDetailModalProps {
  property: Property | null
  isOpen: boolean
  onClose: () => void
}

export function PropertyDetailModal({ property, isOpen, onClose }: PropertyDetailModalProps) {
  if (!property) return null

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-success/10 text-success border-success/20"
      case "pending":
        return "bg-warning/10 text-warning border-warning/20"
      case "sold":
        return "bg-muted text-muted-foreground border-muted"
      default:
        return "bg-primary/10 text-primary border-primary/20"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{property.address}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Carousel */}
          <div className="relative">
            <Carousel className="w-full">
              <CarouselContent>
                {property.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <img 
                        src={image} 
                        alt={`Property ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Property Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Price and Status */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold">${property.price.toLocaleString()}</h2>
                  <p className="text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    {property.address}
                  </p>
                </div>
                <Badge variant="outline" className={getStatusColor(property.status)}>
                  {property.status}
                </Badge>
              </div>

              {/* Key Features */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Bed className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{property.beds}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Bedrooms</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Bath className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{property.baths}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Bathrooms</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Square className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{property.sqft.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Sq Ft</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{property.yearBuilt || "2020"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Year Built</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">
                  {property.description || "Beautiful property with modern amenities and stunning views. This home features an open floor plan, updated kitchen with stainless steel appliances, and spacious bedrooms. Located in a desirable neighborhood with easy access to schools, shopping, and entertainment."}
                </p>
              </div>

              {/* Property Features */}
              <div>
                <h3 className="font-semibold mb-2">Features & Amenities</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(property.propertyFeatures || [
                    "Hardwood Floors",
                    "Granite Countertops", 
                    "Stainless Steel Appliances",
                    "Walk-in Closets",
                    "Central Air Conditioning",
                    "Fireplace",
                    "Two-Car Garage",
                    "Private Backyard"
                  ]).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Property Type</p>
                  <p className="text-muted-foreground">{property.type || "Single Family Home"}</p>
                </div>
                <div>
                  <p className="font-medium">Lot Size</p>
                  <p className="text-muted-foreground">{property.lotSize || "0.25 acres"}</p>
                </div>
                <div>
                  <p className="font-medium">Neighborhood</p>
                  <p className="text-muted-foreground">{property.neighborhood || "Downtown District"}</p>
                </div>
                <div>
                  <p className="font-medium">Listed Date</p>
                  <p className="text-muted-foreground">{property.listedDate || "Nov 15, 2025"}</p>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                    {(property.agent || "Sarah Johnson").split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-semibold">{property.agent || "Sarah Johnson"}</h4>
                    <p className="text-sm text-muted-foreground">Licensed Agent</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Agent
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Agent
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Schedule Tour
                  </Button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3">Property Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Price per sq ft</span>
                    <span className="font-medium">${(property.price / property.sqft).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Days on market</span>
                    <span className="font-medium">23 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Views</span>
                    <span className="font-medium">247</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Favorites</span>
                    <span className="font-medium">12</span>
                  </div>
                </div>
              </div>

              {/* Mortgage Calculator */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3">Mortgage Calculator</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Est. Monthly Payment</span>
                    <span className="font-medium">${Math.floor(property.price * 0.005).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Principal & Interest</span>
                    <span>${Math.floor(property.price * 0.004).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Property Tax</span>
                    <span>${Math.floor(property.price * 0.0008).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insurance</span>
                    <span>${Math.floor(property.price * 0.0002).toLocaleString()}</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-3 text-xs">
                  Get Pre-approved
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}