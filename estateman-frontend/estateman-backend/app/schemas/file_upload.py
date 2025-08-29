from pydantic import BaseModel
from typing import Optional, List

class FileUploadResponse(BaseModel):
    filename: str
    original_filename: str
    file_path: str
    file_size: int
    file_type: Optional[str]
    category: str
    url: str

class BulkUploadResponse(BaseModel):
    files: List[dict]

class FileDeleteRequest(BaseModel):
    file_path: str

class UploadConfigResponse(BaseModel):
    allowed_extensions: dict
    max_file_size: int
    upload_categories: List[str]