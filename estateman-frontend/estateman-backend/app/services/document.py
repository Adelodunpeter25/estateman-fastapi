from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from ..models.document import Document, DocumentShare
from ..schemas.document import DocumentCreate, DocumentUpdate, DocumentShareCreate
from ..services.file_upload import FileUploadService
import json

class DocumentService:
    def __init__(self, db: Session):
        self.db = db
        self.file_service = FileUploadService()

    def create_document(self, document_data: DocumentCreate, user_id: int, tenant_id: Optional[int] = None) -> Document:
        """Create a new document record"""
        document = Document(
            **document_data.dict(),
            uploaded_by=user_id,
            tenant_id=tenant_id
        )
        self.db.add(document)
        self.db.commit()
        self.db.refresh(document)
        return document

    def get_documents(
        self, 
        user_id: int,
        tenant_id: Optional[int] = None,
        page: int = 1,
        per_page: int = 20,
        search: Optional[str] = None,
        category: Optional[str] = None,
        access_level: Optional[str] = None
    ) -> tuple[List[Document], int]:
        """Get paginated list of documents with filters"""
        query = self.db.query(Document)
        
        # Filter by tenant if provided
        if tenant_id:
            query = query.filter(Document.tenant_id == tenant_id)
        
        # Filter by access (user's own documents or shared with user)
        query = query.filter(
            or_(
                Document.uploaded_by == user_id,
                Document.access_level == "public"
            )
        )
        
        # Apply filters
        if search:
            query = query.filter(
                or_(
                    Document.original_filename.ilike(f"%{search}%"),
                    Document.title.ilike(f"%{search}%"),
                    Document.description.ilike(f"%{search}%")
                )
            )
        
        if category and category != "all":
            query = query.filter(Document.category == category)
            
        if access_level:
            query = query.filter(Document.access_level == access_level)
        
        # Get total count
        total = query.count()
        
        # Apply pagination and ordering
        documents = query.order_by(desc(Document.created_at)).offset((page - 1) * per_page).limit(per_page).all()
        
        return documents, total

    def get_document_by_id(self, document_id: int, user_id: int) -> Optional[Document]:
        """Get document by ID with access check"""
        document = self.db.query(Document).filter(Document.id == document_id).first()
        
        if not document:
            return None
            
        # Check access permissions
        if (document.uploaded_by == user_id or 
            document.access_level == "public"):
            
            # Update last accessed
            document.last_accessed = datetime.utcnow()
            self.db.commit()
            return document
            
        return None

    def update_document(self, document_id: int, document_data: DocumentUpdate, user_id: int) -> Optional[Document]:
        """Update document metadata"""
        document = self.db.query(Document).filter(
            and_(Document.id == document_id, Document.uploaded_by == user_id)
        ).first()
        
        if not document:
            return None
            
        for field, value in document_data.dict(exclude_unset=True).items():
            setattr(document, field, value)
            
        document.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(document)
        return document

    def delete_document(self, document_id: int, user_id: int) -> bool:
        """Delete document and file"""
        document = self.db.query(Document).filter(
            and_(Document.id == document_id, Document.uploaded_by == user_id)
        ).first()
        
        if not document:
            return False
            
        # Delete file from storage
        file_deleted = self.file_service.delete_file(document.file_path)
        
        if file_deleted:
            # Delete document shares
            self.db.query(DocumentShare).filter(DocumentShare.document_id == document_id).delete()
            
            # Delete document record
            self.db.delete(document)
            self.db.commit()
            return True
            
        return False

    def get_document_stats(self, user_id: int, tenant_id: Optional[int] = None) -> Dict[str, Any]:
        """Get document statistics"""
        query = self.db.query(Document)
        
        if tenant_id:
            query = query.filter(Document.tenant_id == tenant_id)
        else:
            query = query.filter(Document.uploaded_by == user_id)
        
        documents = query.all()
        
        total_size = sum(doc.file_size for doc in documents)
        
        # Category breakdown
        categories = {}
        for doc in documents:
            categories[doc.category] = categories.get(doc.category, 0) + 1
        
        # Recent uploads (last 7 days)
        recent_date = datetime.utcnow() - timedelta(days=7)
        recent_uploads = query.filter(Document.created_at >= recent_date).count()
        
        return {
            "total_documents": len(documents),
            "total_size": total_size,
            "total_size_formatted": self._format_file_size(total_size),
            "categories": categories,
            "recent_uploads": recent_uploads
        }

    def share_document(self, share_data: DocumentShareCreate, user_id: int) -> Optional[DocumentShare]:
        """Share document with another user"""
        # Check if user owns the document
        document = self.db.query(Document).filter(
            and_(Document.id == share_data.document_id, Document.uploaded_by == user_id)
        ).first()
        
        if not document:
            return None
            
        # Create share record
        share = DocumentShare(
            **share_data.dict(),
            shared_by=user_id
        )
        self.db.add(share)
        
        # Update document sharing status
        document.is_shared = True
        shared_with_list = json.loads(document.shared_with or "[]")
        if share_data.shared_with not in shared_with_list:
            shared_with_list.append(share_data.shared_with)
            document.shared_with = json.dumps(shared_with_list)
        
        self.db.commit()
        self.db.refresh(share)
        return share

    def get_shared_documents(self, user_id: int) -> List[Document]:
        """Get documents shared with user"""
        # Get documents through DocumentShare table
        shared_doc_ids = self.db.query(DocumentShare.document_id).filter(
            DocumentShare.shared_with == user_id
        ).subquery()
        
        return self.db.query(Document).filter(
            Document.id.in_(shared_doc_ids)
        ).order_by(desc(Document.created_at)).all()

    def _format_file_size(self, bytes_size: int) -> str:
        """Format file size in human readable format"""
        if bytes_size == 0:
            return "0 Bytes"
        
        k = 1024
        sizes = ["Bytes", "KB", "MB", "GB", "TB"]
        i = 0
        
        while bytes_size >= k and i < len(sizes) - 1:
            bytes_size /= k
            i += 1
            
        return f"{bytes_size:.2f} {sizes[i]}"