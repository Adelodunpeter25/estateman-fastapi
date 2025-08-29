import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Upload, X, File, Image } from 'lucide-react'
import { filesService, type FileUploadResponse } from '@/services/files'

interface FileUploadProps {
  category?: string
  subfolder?: string
  multiple?: boolean
  accept?: string
  maxSize?: number
  onUploadComplete?: (files: FileUploadResponse[]) => void
  onUploadError?: (error: string) => void
}

export function FileUpload({
  category = 'images',
  subfolder,
  multiple = false,
  accept = 'image/*',
  maxSize = 10 * 1024 * 1024, // 10MB
  onUploadComplete,
  onUploadError
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Validate file sizes
    const oversizedFiles = files.filter(file => file.size > maxSize)
    if (oversizedFiles.length > 0) {
      onUploadError?.(`Files too large: ${oversizedFiles.map(f => f.name).join(', ')}`)
      return
    }
    
    setSelectedFiles(multiple ? [...selectedFiles, ...files] : files)
  }

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    try {
      setUploading(true)
      setUploadProgress(0)

      let results: FileUploadResponse[]
      
      if (selectedFiles.length === 1) {
        const result = await filesService.uploadFile(selectedFiles[0], category, subfolder)
        results = [result]
      } else {
        const bulkResult = await filesService.uploadFiles(selectedFiles, category, subfolder)
        results = bulkResult.files.filter(f => 'url' in f) as FileUploadResponse[]
      }

      setUploadProgress(100)
      onUploadComplete?.(results)
      setSelectedFiles([])
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="w-4 h-4 mr-2" />
          Choose Files
        </Button>
        
        {selectedFiles.length > 0 && (
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s)`}
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} />
          <p className="text-sm text-muted-foreground">Uploading files...</p>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Selected Files:</p>
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                {file.type.startsWith('image/') ? (
                  <Image className="w-4 h-4" />
                ) : (
                  <File className="w-4 h-4" />
                )}
                <span className="text-sm">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({formatFileSize(file.size)})
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                disabled={uploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}