import os
import uuid
import shutil
from typing import List, Optional
from fastapi import UploadFile, HTTPException, status
from PIL import Image
import aiofiles
from pathlib import Path

class FileUploadService:
    def __init__(self):
        self.upload_dir = Path("uploads")
        self.allowed_extensions = {
            'images': {'.jpg', '.jpeg', '.png', '.gif', '.webp'},
            'documents': {'.pdf', '.doc', '.docx', '.txt', '.rtf'},
            'videos': {'.mp4', '.avi', '.mov', '.wmv', '.flv'}
        }
        self.max_file_size = 10 * 1024 * 1024  # 10MB
        
        # Create upload directories
        for category in ['images', 'documents', 'videos', 'temp']:
            (self.upload_dir / category).mkdir(parents=True, exist_ok=True)
    
    def validate_file(self, file: UploadFile, category: str = 'images') -> bool:
        """Validate file type and size"""
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        # Check file extension
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in self.allowed_extensions.get(category, set()):
            raise HTTPException(
                status_code=400, 
                detail=f"File type {file_ext} not allowed for {category}"
            )
        
        return True
    
    async def save_file(self, file: UploadFile, category: str = 'images', 
                       subfolder: Optional[str] = None) -> dict:
        """Save uploaded file and return file info"""
        self.validate_file(file, category)
        
        # Generate unique filename
        file_ext = Path(file.filename).suffix.lower()
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        
        # Create save path
        save_dir = self.upload_dir / category
        if subfolder:
            save_dir = save_dir / subfolder
            save_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = save_dir / unique_filename
        
        try:
            # Save file
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                if len(content) > self.max_file_size:
                    raise HTTPException(status_code=400, detail="File too large")
                await f.write(content)
            
            # Process image if it's an image file
            if category == 'images' and file_ext in {'.jpg', '.jpeg', '.png'}:
                await self._process_image(file_path)
            
            return {
                'filename': unique_filename,
                'original_filename': file.filename,
                'file_path': str(file_path),
                'file_size': len(content),
                'file_type': file.content_type,
                'category': category
            }
            
        except Exception as e:
            # Clean up file if save failed
            if file_path.exists():
                file_path.unlink()
            raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
    
    async def _process_image(self, file_path: Path):
        """Process and optimize images"""
        try:
            with Image.open(file_path) as img:
                # Create thumbnail
                thumbnail_path = file_path.parent / f"thumb_{file_path.name}"
                img.thumbnail((300, 300), Image.Resampling.LANCZOS)
                img.save(thumbnail_path, optimize=True, quality=85)
                
                # Optimize original
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                img.save(file_path, optimize=True, quality=90)
                
        except Exception as e:
            print(f"Image processing failed: {e}")
    
    async def delete_file(self, file_path: str) -> bool:
        """Delete file and its thumbnail"""
        try:
            path = Path(file_path)
            if path.exists():
                path.unlink()
                
                # Delete thumbnail if exists
                thumb_path = path.parent / f"thumb_{path.name}"
                if thumb_path.exists():
                    thumb_path.unlink()
                
                return True
        except Exception:
            pass
        return False
    
    def get_file_url(self, file_path: str) -> str:
        """Generate file URL"""
        return f"/files/{file_path.replace(str(self.upload_dir) + '/', '')}"
    
    async def bulk_upload(self, files: List[UploadFile], category: str = 'images',
                         subfolder: Optional[str] = None) -> List[dict]:
        """Upload multiple files"""
        results = []
        for file in files:
            try:
                result = await self.save_file(file, category, subfolder)
                results.append(result)
            except HTTPException as e:
                results.append({
                    'filename': file.filename,
                    'error': e.detail,
                    'status': 'failed'
                })
        return results