from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from typing import List, Optional, Dict, Any
from datetime import datetime
from ..models.user import User, UserRole
from ..models.permission import Role, Permission
from ..models.audit import AuditLog
from ..schemas.realtor import BulkUserImport, UserActivityLog, RoleAssignmentRequest
from ..core.security import get_password_hash
import csv
import io

class UserManagementService:
    def __init__(self, db: Session):
        self.db = db

    def bulk_import_users(self, import_data: BulkUserImport) -> Dict[str, Any]:
        """Bulk import users from CSV or JSON data"""
        created_users = []
        failed_users = []
        
        for user_data in import_data.users:
            try:
                # Check if user already exists
                existing_user = self.db.query(User).filter(
                    (User.email == user_data.get('email')) | 
                    (User.username == user_data.get('username'))
                ).first()
                
                if existing_user:
                    failed_users.append({
                        'data': user_data,
                        'error': 'User already exists'
                    })
                    continue
                
                # Create new user
                new_user = User(
                    email=user_data['email'],
                    username=user_data.get('username', user_data['email']),
                    hashed_password=get_password_hash(user_data.get('password', 'temp123')),
                    first_name=user_data['first_name'],
                    last_name=user_data['last_name'],
                    phone=user_data.get('phone'),
                    role=UserRole(user_data.get('role', 'client'))
                )
                
                self.db.add(new_user)
                self.db.flush()  # Get the ID without committing
                
                created_users.append(new_user)
                
                # Log the creation
                self.log_user_activity(
                    user_id=new_user.id,
                    action='bulk_import_create',
                    resource='user',
                    details={'imported': True}
                )
                
            except Exception as e:
                failed_users.append({
                    'data': user_data,
                    'error': str(e)
                })
        
        self.db.commit()
        
        return {
            'created_count': len(created_users),
            'failed_count': len(failed_users),
            'created_users': [{'id': u.id, 'email': u.email} for u in created_users],
            'failed_users': failed_users
        }

    def export_users(self, format: str = 'csv') -> str:
        """Export users to CSV or JSON format"""
        users = self.db.query(User).all()
        
        if format == 'csv':
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write header
            writer.writerow(['ID', 'Email', 'Username', 'First Name', 'Last Name', 'Phone', 'Role', 'Active', 'Created At'])
            
            # Write data
            for user in users:
                writer.writerow([
                    user.id, user.email, user.username, user.first_name,
                    user.last_name, user.phone, user.role.value, user.is_active, user.created_at
                ])
            
            return output.getvalue()
        
        # JSON format
        return [
            {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone': user.phone,
                'role': user.role.value,
                'is_active': user.is_active,
                'created_at': user.created_at.isoformat()
            }
            for user in users
        ]

    def get_user_dashboard_metrics(self, user_id: int) -> Dict[str, Any]:
        """Get personalized dashboard metrics for a user"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return {}
        
        # Base metrics for all users
        metrics = {
            'profile_completion': self._calculate_profile_completion(user),
            'last_login': user.last_login,
            'account_age_days': (datetime.utcnow() - user.created_at).days,
            'role': user.role.value
        }
        
        # Role-specific metrics
        if user.role == UserRole.REALTOR:
            realtor = user.realtor_profile
            if realtor:
                metrics.update({
                    'total_clients': realtor.total_clients,
                    'active_deals': realtor.active_deals,
                    'total_commissions': realtor.total_commissions,
                    'monthly_target': realtor.monthly_target,
                    'monthly_earned': realtor.monthly_earned
                })
        
        return metrics

    def log_user_activity(self, user_id: int, action: str, resource: str, 
                         details: Optional[Dict[str, Any]] = None, ip_address: Optional[str] = None):
        """Log user activity for audit purposes"""
        activity_log = AuditLog(
            user_id=user_id,
            action=action,
            resource=resource,
            new_values=details,
            ip_address=ip_address,
            timestamp=datetime.utcnow()
        )
        
        self.db.add(activity_log)
        self.db.commit()

    def get_user_activity_logs(self, user_id: Optional[int] = None, 
                              limit: int = 100) -> List[AuditLog]:
        """Get user activity logs"""
        query = self.db.query(AuditLog)
        
        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        
        return query.order_by(desc(AuditLog.timestamp)).limit(limit).all()

    def _calculate_profile_completion(self, user: User) -> float:
        """Calculate profile completion percentage"""
        fields = ['first_name', 'last_name', 'phone', 'bio', 'profile_picture']
        completed_fields = sum(1 for field in fields if getattr(user, field))
        return (completed_fields / len(fields)) * 100


class RoleManagementService:
    def __init__(self, db: Session):
        self.db = db

    def create_role_assignment_request(self, request_data: RoleAssignmentRequest) -> Dict[str, Any]:
        """Create a role assignment request for approval workflow"""
        # For now, directly assign the role (can be enhanced with approval workflow)
        user = self.db.query(User).filter(User.id == request_data.user_id).first()
        role = self.db.query(Role).filter(Role.id == request_data.role_id).first()
        
        if not user or not role:
            return {'success': False, 'message': 'User or role not found'}
        
        old_role_id = user.role_id
        user.role_id = request_data.role_id
        
        # Log the role change
        audit_log = AuditLog(
            user_id=request_data.assigned_by,
            action='role_assignment',
            resource='user_role',
            old_values={'user_id': user.id, 'old_role_id': old_role_id},
            new_values={'user_id': user.id, 'new_role_id': request_data.role_id, 'reason': request_data.reason},
            timestamp=datetime.utcnow()
        )
        
        self.db.add(audit_log)
        self.db.commit()
        
        return {'success': True, 'message': 'Role assigned successfully'}

    def get_role_audit_logs(self, limit: int = 100) -> List[AuditLog]:
        """Get audit logs for role changes"""
        return self.db.query(AuditLog).filter(
            AuditLog.action == 'role_assignment'
        ).order_by(desc(AuditLog.timestamp)).limit(limit).all()

    def get_user_permissions(self, user_id: int) -> List[str]:
        """Get all permissions for a user based on their role"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user or not user.role_id:
            return []
        
        role = self.db.query(Role).filter(Role.id == user.role_id).first()
        if not role:
            return []
        
        permissions = []
        
        # Get direct permissions
        for permission in role.permissions:
            permissions.append(f"{permission.resource}:{permission.action}")
        
        # Get inherited permissions from parent roles
        parent_role = role.parent_role
        while parent_role:
            for permission in parent_role.permissions:
                perm_string = f"{permission.resource}:{permission.action}"
                if perm_string not in permissions:
                    permissions.append(perm_string)
            parent_role = parent_role.parent_role
        
        return permissions