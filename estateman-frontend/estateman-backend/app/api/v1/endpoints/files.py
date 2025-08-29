from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from pathlib import Path
from ....core.database import get_db
from ....api.deps import get_current_user
from ....models.user import User
from ....services.file_upload import FileUploadService
from ....services.document import DocumentService
from ....schemas.file_upload import FileUploadResponse, BulkUploadResponse, UploadConfigResponse
from ....schemas.document import (
    DocumentCreate, DocumentUpdate, DocumentResponse, DocumentListResponse,
    DocumentStatsResponse, DocumentShareCreate, DocumentShareResponse
)

router = APIRouter()

@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    category: str = "images",
    subfolder: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a single file"""
    service = FileUploadService()
    result = await service.save_file(file, category, subfolder)
    result['url'] = service.get_file_url(result['file_path'])
    
    # Create document record if category is documents
    if category == "documents":
        doc_service = DocumentService(db)
        doc_data = DocumentCreate(
            filename=result['filename'],
            original_filename=result['original_filename'],
            file_path=result['file_path'],
            file_size=result['file_size'],
            file_type=result.get('file_type'),
            category=category,
            subfolder=subfolder
        )
        doc_service.create_document(doc_data, current_user.id)
    
    return result

@router.post("/upload/bulk", response_model=BulkUploadResponse)
async def bulk_upload_files(
    files: List[UploadFile] = File(...),
    category: str = "images",
    subfolder: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload multiple files"""
    service = FileUploadService()
    results = await service.bulk_upload(files, category, subfolder)
    
    # Add URLs to successful uploads and create document records
    doc_service = DocumentService(db) if category == "documents" else None
    
    for result in results:
        if 'file_path' in result:
            result['url'] = service.get_file_url(result['file_path'])
            
            # Create document record if category is documents
            if doc_service:
                doc_data = DocumentCreate(
                    filename=result['filename'],
                    original_filename=result['original_filename'],
                    file_path=result['file_path'],
                    file_size=result['file_size'],
                    file_type=result.get('file_type'),
                    category=category,
                    subfolder=subfolder
                )
                doc_service.create_document(doc_data, current_user.id)
    
    return {"files": results}

@router.delete("/delete")
async def delete_file(
    file_path: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a file"""
    service = FileUploadService()
    success = await service.delete_file(file_path)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found or could not be deleted"
        )
    
    return {"message": "File deleted successfully"}

@router.get("/serve/{category}/{filename}")
async def serve_file(category: str, filename: str):
    """Serve uploaded files"""
    file_path = Path(f"uploads/{category}/{filename}")
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    return FileResponse(file_path)

@router.get("/serve/{category}/{subfolder}/{filename}")
async def serve_file_with_subfolder(category: str, subfolder: str, filename: str):
    """Serve uploaded files from subfolder"""
    file_path = Path(f"uploads/{category}/{subfolder}/{filename}")
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    return FileResponse(file_path)

@router.get("/info", response_model=UploadConfigResponse)
async def get_upload_info():
    """Get upload configuration info"""
    service = FileUploadService()
    return {
        "allowed_extensions": service.allowed_extensions,
        "max_file_size": service.max_file_size,
        "upload_categories": list(service.allowed_extensions.keys())
    }

# Document Management Endpoints

@router.get("/documents", response_model=DocumentListResponse)
async def list_documents(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    access_level: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get paginated list of documents with filters"""
    doc_service = DocumentService(db)
    file_service = FileUploadService()
    
    documents, total = doc_service.get_documents(
        user_id=current_user.id,
        page=page,
        per_page=per_page,
        search=search,
        category=category,
        access_level=access_level
    )
    
    # Add URLs to documents
    doc_responses = []
    for doc in documents:
        doc_dict = DocumentResponse.from_orm(doc).dict()
        doc_dict['url'] = file_service.get_file_url(doc.file_path)
        doc_responses.append(doc_dict)
    
    total_pages = (total + per_page - 1) // per_page
    
    return {
        "documents": doc_responses,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages
    }

@router.get("/documents/stats", response_model=DocumentStatsResponse)
async def get_document_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get document statistics"""
    doc_service = DocumentService(db)
    return doc_service.get_document_stats(current_user.id)

@router.get("/documents/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get document by ID"""
    doc_service = DocumentService(db)
    file_service = FileUploadService()
    
    document = doc_service.get_document_by_id(document_id, current_user.id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or access denied"
        )
    
    doc_response = DocumentResponse.from_orm(document)
    doc_response.url = file_service.get_file_url(document.file_path)
    return doc_response

@router.put("/documents/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: int,
    document_data: DocumentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update document metadata"""
    doc_service = DocumentService(db)
    file_service = FileUploadService()
    
    document = doc_service.update_document(document_id, document_data, current_user.id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or access denied"
        )
    
    doc_response = DocumentResponse.from_orm(document)
    doc_response.url = file_service.get_file_url(document.file_path)
    return doc_response

@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete document"""
    doc_service = DocumentService(db)
    
    success = doc_service.delete_document(document_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or could not be deleted"
        )
    
    return {"message": "Document deleted successfully"}

@router.post("/documents/{document_id}/share", response_model=DocumentShareResponse)
async def share_document(
    document_id: int,
    share_data: DocumentShareCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Share document with another user"""
    doc_service = DocumentService(db)
    
    # Ensure document_id matches
    share_data.document_id = document_id
    
    share = doc_service.share_document(share_data, current_user.id)
    if not share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or access denied"
        )
    
    return DocumentShareResponse.from_orm(share)

@router.get("/documents/shared/with-me", response_model=List[DocumentResponse])
async def get_shared_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get documents shared with current user"""
    doc_service = DocumentService(db)
    file_service = FileUploadService()
    
    documents = doc_service.get_shared_documents(current_user.id)
    
    # Add URLs to documents
    doc_responses = []
    for doc in documents:
        doc_dict = DocumentResponse.from_orm(doc).dict()
        doc_dict['url'] = file_service.get_file_url(doc.file_path)
        doc_responses.append(doc_dict)
    
    return doc_responses