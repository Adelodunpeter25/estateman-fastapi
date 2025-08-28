from datetime import datetime, timezone
from typing import Optional

def utc_now() -> datetime:
    """Get current UTC datetime with timezone info"""
    return datetime.now(timezone.utc)

def to_utc(dt: Optional[datetime]) -> Optional[datetime]:
    """Convert datetime to UTC timezone"""
    if dt is None:
        return None
    
    if dt.tzinfo is None:
        # Assume naive datetime is in UTC
        return dt.replace(tzinfo=timezone.utc)
    
    return dt.astimezone(timezone.utc)

def ensure_timezone_aware(dt: Optional[datetime]) -> Optional[datetime]:
    """Ensure datetime is timezone-aware (UTC if naive)"""
    if dt is None:
        return None
    
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    
    return dt