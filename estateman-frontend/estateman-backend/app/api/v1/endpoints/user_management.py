from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from io import StringIO
from ...api.deps import get_db, get_current_user, get_admin_user
from ...models.user import User
from ...schemas.realtor import BulkUserImport, UserActivityLog, RoleAssignmentRequest, AuditLogResponse
from ...services.user_management import UserManagementService, RoleManagementService

router = APIRouter()

@router.post("/bulk-import")
async def bulk_import_users(
    import_data: BulkUserImport,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    """Bulk import users from JSON data"""
    service = UserManagementService(db)
    result = service.bulk_import_users(import_data)
    
    # Log the bulk import
    service.log_user_activity(
        user_id=admin_user.id,
        action='bulk_import',
        resource='users',
        details={'imported_count': result['created_count'], 'failed_count': result['failed_count']}
    )
    
    return result

@router.post("/bulk-import-csv")
async def bulk_import_users_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    """Bulk import users from CSV file"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    content = await file.read()
    csv_content = content.decode('utf-8')
    
    # Parse CSV content
    import csv
    reader = csv.DictReader(StringIO(csv_content))
    users_data = []
    
    for row in reader:
        users_data.append({
            'email': row.get('email'),
            'username': row.get('username', row.get('email')),
            'first_name': row.get('first_name'),
            'last_name': row.get('last_name'),
            'phone': row.get('phone'),
            'role': row.get('role', 'client'),
            'password': row.get('password', 'temp123')
        })
    
    import_data = BulkUserImport(users=users_data, send_invitations=True)
    service = UserManagementService(db)
    result = service.bulk_import_users(import_data)
    
    return result

@router.get("/export")
async def export_users(
    format: str = Query("csv", regex="^(csv|json)$"),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    """Export users to CSV or JSON format"""
    service = UserManagementService(db)
    
    if format == "csv":
        csv_data = service.export_users("csv")
        return StreamingResponse(
            StringIO(csv_data),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=users_export.csv"}
        )
    else:
        json_data = service.export_users("json")
        return json_data

@router.get("/dashboard-metrics/{user_id}")
async def get_user_dashboard_metrics(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get personalized dashboard metrics for a user"""
    # Users can only access their own metrics unless they're admin
    if current_user.id != user_id and current_user.role.value not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    service = UserManagementService(db)
    return service.get_user_dashboard_metrics(user_id)

@router.get("/activity-logs")
async def get_user_activity_logs(
    user_id: Optional[int] = None,
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user activity logs"""
    # Only admins can view all logs, users can only see their own
    if user_id and current_user.id != user_id and current_user.role.value not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if not user_id and current_user.role.value not in ['admin', 'superadmin']:
        user_id = current_user.id
    
    service = UserManagementService(db)
    return service.get_user_activity_logs(user_id, limit)

@router.post("/log-activity")
async def log_user_activity(
    activity: UserActivityLog,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Log user activity"""
    service = UserManagementService(db)
    service.log_user_activity(
        user_id=activity.user_id,
        action=activity.action,
        resource=activity.resource,
        details=activity.details,
        ip_address=activity.ip_address
    )
    return {"message": "Activity logged successfully"}

# Role Management endpoints
@router.post("/roles/assign")
async def assign_role(
    request_data: RoleAssignmentRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    """Assign role to user (with approval workflow)"""
    service = RoleManagementService(db)
    result = service.create_role_assignment_request(request_data)
    return result

@router.get("/roles/audit-logs")
async def get_role_audit_logs(
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    """Get audit logs for role changes"""
    service = RoleManagementService(db)
    return service.get_role_audit_logs(limit)

@router.get("/permissions/{user_id}")
async def get_user_permissions(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all permissions for a user"""
    # Users can only access their own permissions unless they're admin
    if current_user.id != user_id and current_user.role.value not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    service = RoleManagementService(db)
    permissions = service.get_user_permissions(user_id)
    return {"user_id": user_id, "permissions": permissions}