from fastapi import Request, HTTPException, status
from typing import Optional

class APIVersioning:
    """API versioning utilities"""
    
    SUPPORTED_VERSIONS = ["v1", "v2"]
    DEFAULT_VERSION = "v1"
    
    @staticmethod
    def get_version_from_header(request: Request) -> str:
        """Get API version from Accept header"""
        accept_header = request.headers.get("Accept", "")
        
        # Look for version in Accept header like: application/vnd.api+json;version=v1
        if "version=" in accept_header:
            version = accept_header.split("version=")[1].split(";")[0].split(",")[0]
            if version in APIVersioning.SUPPORTED_VERSIONS:
                return version
        
        return APIVersioning.DEFAULT_VERSION
    
    @staticmethod
    def get_version_from_path(path: str) -> Optional[str]:
        """Extract version from URL path"""
        path_parts = path.strip("/").split("/")
        if len(path_parts) >= 2 and path_parts[1].startswith("v"):
            version = path_parts[1]
            if version in APIVersioning.SUPPORTED_VERSIONS:
                return version
        return None
    
    @staticmethod
    def validate_version(version: str) -> str:
        """Validate API version"""
        if version not in APIVersioning.SUPPORTED_VERSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported API version: {version}. Supported versions: {APIVersioning.SUPPORTED_VERSIONS}"
            )
        return version
    
    @staticmethod
    def get_deprecation_info(version: str) -> Optional[dict]:
        """Get deprecation information for version"""
        deprecation_info = {
            # Future versions can be marked as deprecated here
        }
        return deprecation_info.get(version)

def version_middleware(request: Request, call_next):
    """Middleware to handle API versioning"""
    # Get version from path (primary) or header (fallback)
    version = APIVersioning.get_version_from_path(request.url.path)
    if not version:
        version = APIVersioning.get_version_from_header(request)
    
    # Validate version
    try:
        version = APIVersioning.validate_version(version)
    except HTTPException:
        version = APIVersioning.DEFAULT_VERSION
    
    # Add version to request state
    request.state.api_version = version
    
    response = call_next(request)
    
    # Add version info to response headers
    response.headers["API-Version"] = version
    
    # Add deprecation warning if applicable
    deprecation = APIVersioning.get_deprecation_info(version)
    if deprecation:
        response.headers["Deprecation"] = deprecation["date"]
        response.headers["Sunset"] = deprecation["sunset"]
    
    return response