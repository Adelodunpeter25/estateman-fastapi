import html
import re
from typing import Any, Optional
from fastapi import HTTPException, status

def sanitize_html(text: str) -> str:
    """Sanitize HTML content to prevent XSS attacks"""
    if not text:
        return ""
    return html.escape(text.strip())

def validate_id(id_value: Any) -> int:
    """Validate and sanitize ID parameters"""
    try:
        id_int = int(id_value)
        if id_int <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ID must be a positive integer"
            )
        return id_int
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ID format"
        )

def sanitize_string(text: Optional[str], max_length: int = 1000) -> Optional[str]:
    """Sanitize string input"""
    if not text:
        return text
    
    # Remove potentially dangerous characters
    sanitized = html.escape(text.strip())
    
    # Limit length
    if len(sanitized) > max_length:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Text exceeds maximum length of {max_length} characters"
        )
    
    return sanitized

def validate_email(email: str) -> str:
    """Validate email format"""
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    return email.lower().strip()

def validate_phone(phone: Optional[str]) -> Optional[str]:
    """Validate phone number format"""
    if not phone:
        return phone
    
    # Remove all non-digit characters
    digits_only = re.sub(r'\D', '', phone)
    
    # Check if it's a valid length (10-15 digits)
    if len(digits_only) < 10 or len(digits_only) > 15:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number must be between 10-15 digits"
        )
    
    return digits_only