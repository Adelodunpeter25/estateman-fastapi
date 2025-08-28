import { api } from './api'

export interface Property {
  id: number
  title: string
  description?: string
  property_type: string
  status: string
  price: number
  bedrooms?: number
  bathrooms?: number
  square_feet?: number
  lot_size?: number
  year_built?: number
  address: string
  city: string
  state: string
  zip_code: string
  latitude?: number
  longitude?: number
  agent_id: number
  created_at: string
  updated_at?: string
  images?: PropertyImage[]
  documents?: PropertyDocument[]
  agent?: any
}

export interface PropertyImage {
  id: number
  property_id: number
  image_url: string
  caption?: string
  is_primary: boolean
  order_index: number
}

export interface PropertyDocument {
  id: number
  property_id: number
  document_url: string
  document_name: string
  document_type?: string
  file_size?: number
}

export interface PropertyFilters {
  status?: string
  property_type?: string
  min_price?: number
  max_price?: number
  city?: string
  bedrooms?: number
  bathrooms?: number
}

export interface PropertyCreate {
  address: string
  city: string
  state: string
  zip_code: string
  price: number
  bedrooms?: number
  bathrooms?: number
  square_feet?: number
  property_type: string
  status: string
  description?: string
  agent_id: number
  lot_size?: number
  year_built?: number
  latitude?: number
  longitude?: number
}

export const propertiesService = {
  async getProperties(skip = 0, limit = 100, filters?: PropertyFilters): Promise<Property[]> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters || {}).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, v.toString()])
      )
    })
    
    const response = await api.get<{ properties: Property[] }>(`/properties?${params}`)
    return response.data.properties
  },

  async getProperty(id: number): Promise<Property> {
    const response = await api.get<Property>(`/properties/${id}`)
    return response.data
  },

  async createProperty(propertyData: PropertyCreate): Promise<Property> {
    const response = await api.post<Property>('/properties', propertyData)
    return response.data
  },

  async updateProperty(id: number, propertyData: Partial<PropertyCreate>): Promise<Property> {
    const response = await api.put<Property>(`/properties/${id}`, propertyData)
    return response.data
  },

  async deleteProperty(id: number): Promise<void> {
    await api.delete(`/properties/${id}`)
  },

  async searchProperties(searchTerm: string): Promise<Property[]> {
    const response = await api.get<{ properties: Property[] }>(`/properties/search/${encodeURIComponent(searchTerm)}`)
    return response.data.properties
  },

  async getPropertyAnalytics(id: number): Promise<any> {
    const response = await api.get(`/properties/${id}/analytics`)
    return response.data
  },

  // Image Management
  async getPropertyImages(id: number): Promise<PropertyImage[]> {
    const response = await api.get<{ images: PropertyImage[] }>(`/properties/${id}/images`)
    return response.data.images
  },

  async addPropertyImage(id: number, imageData: { image_url: string; caption?: string; is_primary?: boolean; order_index?: number }): Promise<PropertyImage> {
    const response = await api.post<PropertyImage>(`/properties/${id}/images`, imageData)
    return response.data
  },

  async deletePropertyImage(imageId: number): Promise<void> {
    await api.delete(`/properties/images/${imageId}`)
  },

  // Document Management
  async getPropertyDocuments(id: number): Promise<PropertyDocument[]> {
    const response = await api.get<{ documents: PropertyDocument[] }>(`/properties/${id}/documents`)
    return response.data.documents
  },

  async addPropertyDocument(id: number, documentData: { document_url: string; document_name: string; document_type?: string; file_size?: number }): Promise<PropertyDocument> {
    const response = await api.post<PropertyDocument>(`/properties/${id}/documents`, documentData)
    return response.data
  },

  async deletePropertyDocument(documentId: number): Promise<void> {
    await api.delete(`/properties/documents/${documentId}`)
  },

  // Showing Management
  async getPropertyShowings(id: number): Promise<any[]> {
    const response = await api.get<{ showings: any[] }>(`/properties/${id}/showings`)
    return response.data.showings
  },

  async schedulePropertyShowing(id: number, showingData: { client_name: string; client_email?: string; client_phone?: string; showing_date: string; duration_minutes?: number; notes?: string }): Promise<any> {
    const response = await api.post(`/properties/${id}/showings`, showingData)
    return response.data
  },

  async updatePropertyShowing(showingId: number, showingData: { status?: string; feedback?: string; notes?: string }): Promise<any> {
    const response = await api.put(`/properties/showings/${showingId}`, showingData)
    return response.data
  },

  // Bulk Import
  async bulkImportProperties(file: File): Promise<{ created_count: number; failed_count: number; errors: string[] }> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/properties/bulk-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // Property Comparison
  async compareProperties(propertyIds: number[]): Promise<{ properties: any[] }> {
    const response = await api.get<{ properties: any[] }>(`/properties/compare?property_ids=${propertyIds.join(',')}`)
    return response.data
  },

  // Map Data
  async getPropertiesMapData(bounds?: string): Promise<Property[]> {
    const params = bounds ? `?bounds=${bounds}` : ''
    const response = await api.get<{ properties: Property[] }>(`/properties/map${params}`)
    return response.data.properties
  },

  // Tools
  async generateCMA(propertyId: number): Promise<any> {
    const response = await api.post(`/properties/${propertyId}/cma`)
    return response.data
  },

  async createVirtualTour(propertyId: number): Promise<any> {
    const response = await api.post(`/properties/${propertyId}/virtual-tour`)
    return response.data
  },

  async generateMarketReport(propertyId: number): Promise<any> {
    const response = await api.post(`/properties/${propertyId}/market-report`)
    return response.data
  },

  async enhancePhotos(propertyId: number): Promise<any> {
    const response = await api.post(`/properties/${propertyId}/enhance-photos`)
    return response.data
  },

  async optimizeListing(propertyId: number): Promise<any> {
    const response = await api.post(`/properties/${propertyId}/optimize-listing`)
    return response.data
  },

  async createSocialMediaKit(propertyId: number): Promise<any> {
    const response = await api.post(`/properties/${propertyId}/social-media-kit`)
    return response.data
  },

  // Image Upload
  async uploadPropertyImages(propertyId: number, images: File[]): Promise<any> {
    const formData = new FormData()
    images.forEach((image, index) => {
      formData.append('images', image)
      formData.append(`is_primary_${index}`, index === 0 ? 'true' : 'false')
    })
    
    const response = await api.post(`/properties/${propertyId}/upload-images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  }
}