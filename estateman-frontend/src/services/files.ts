import { api } from './api'

export interface FileUploadResponse {
  filename: string
  original_filename: string
  file_path: string
  file_size: number
  file_type?: string
  category: string
  url: string
}

export interface BulkUploadResponse {
  files: Array<FileUploadResponse | { filename: string; error: string; status: string }>
}

export interface UploadConfig {
  allowed_extensions: Record<string, string[]>
  max_file_size: number
  upload_categories: string[]
}

export interface DocumentResponse {
  id: number
  filename: string
  original_filename: string
  file_path: string
  file_size: number
  file_type?: string
  category: string
  subfolder?: string
  title?: string
  description?: string
  tags?: string
  is_shared: boolean
  access_level: string
  uploaded_by: number
  tenant_id?: number
  created_at: string
  updated_at?: string
  last_accessed?: string
  url?: string
}

export interface DocumentListResponse {
  documents: DocumentResponse[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface DocumentStatsResponse {
  total_documents: number
  total_size: number
  total_size_formatted: string
  categories: Record<string, number>
  recent_uploads: number
}

export interface DocumentUpdate {
  title?: string
  description?: string
  tags?: string
  access_level?: string
}

export interface DocumentShareCreate {
  document_id: number
  shared_with: number
  access_level?: string
  expires_at?: string
}

export const filesService = {
  async uploadFile(file: File, category: string = 'images', subfolder?: string): Promise<FileUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    
    const params = new URLSearchParams({ category })
    if (subfolder) params.append('subfolder', subfolder)
    
    const response = await api.post<FileUploadResponse>(`/files/upload?${params}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async uploadFiles(files: File[], category: string = 'images', subfolder?: string): Promise<BulkUploadResponse> {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    
    const params = new URLSearchParams({ category })
    if (subfolder) params.append('subfolder', subfolder)
    
    const response = await api.post<BulkUploadResponse>(`/files/upload/bulk?${params}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async deleteFile(filePath: string): Promise<void> {
    await api.delete('/files/delete', { params: { file_path: filePath } })
  },

  async getUploadConfig(): Promise<UploadConfig> {
    const response = await api.get<UploadConfig>('/files/info')
    return response.data
  },

  getFileUrl(filePath: string): string {
    return filePath.startsWith('http') ? filePath : `${api.defaults.baseURL}/files/${filePath.replace('uploads/', '')}`
  },

  // Document Management Methods
  async getDocuments(params?: {
    page?: number
    per_page?: number
    search?: string
    category?: string
    access_level?: string
  }): Promise<DocumentListResponse> {
    const response = await api.get<DocumentListResponse>('/files/documents', { params })
    return response.data
  },

  async getDocumentStats(): Promise<DocumentStatsResponse> {
    const response = await api.get<DocumentStatsResponse>('/files/documents/stats')
    return response.data
  },

  async getDocument(documentId: number): Promise<DocumentResponse> {
    const response = await api.get<DocumentResponse>(`/files/documents/${documentId}`)
    return response.data
  },

  async updateDocument(documentId: number, data: DocumentUpdate): Promise<DocumentResponse> {
    const response = await api.put<DocumentResponse>(`/files/documents/${documentId}`, data)
    return response.data
  },

  async deleteDocument(documentId: number): Promise<void> {
    await api.delete(`/files/documents/${documentId}`)
  },

  async shareDocument(documentId: number, shareData: Omit<DocumentShareCreate, 'document_id'>): Promise<any> {
    const response = await api.post(`/files/documents/${documentId}/share`, shareData)
    return response.data
  },

  async getSharedDocuments(): Promise<DocumentResponse[]> {
    const response = await api.get<DocumentResponse[]>('/files/documents/shared/with-me')
    return response.data
  }
}