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
  title: string
  description?: string
  property_type: string
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
  }
}