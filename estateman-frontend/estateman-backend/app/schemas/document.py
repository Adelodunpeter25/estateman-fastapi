from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DocumentBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[str] = None
    category: str = "documents"
    access_level: str = "private"

class DocumentCreate(DocumentBase):
    filename: str
    original_filename: str
    file_path: str
    file_size: int
    file_type: str
    subfolder: Optional[str] = None

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[str] = None
    access_level: Optional[str] = None

class DocumentResponse(DocumentBase):
    id: int
    filename: str
    original_filename: str
    file_path: str
    file_size: int
    file_type: str
    subfolder: Optional[str] = None
    is_shared: bool
    uploaded_by: int
    tenant_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_accessed: Optional[datetime] = None
    url: Optional[str] = None

    class Config:
        from_attributes = True

class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int
    page: int
    per_page: int
    total_pages: int

class DocumentStatsResponse(BaseModel):
    total_documents: int
    total_size: int
    total_size_formatted: str
    categories: dict
    recent_uploads: int

class DocumentShareCreate(BaseModel):
    document_id: int
    shared_with: int
    access_level: str = "view"
    expires_at: Optional[datetime] = None

class DocumentShareResponse(BaseModel):
    id: int
    document_id: int
    shared_by: int
    shared_with: int
    access_level: str
    expires_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True