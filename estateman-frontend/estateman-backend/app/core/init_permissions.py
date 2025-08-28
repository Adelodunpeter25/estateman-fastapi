from sqlalchemy.orm import Session
from ..models.permission import Permission, Role
from ..core.database import SessionLocal

def init_default_permissions():
    """Initialize default permissions and roles"""
    db = SessionLocal()
    
    try:
        # Define default permissions
        default_permissions = [
            # User management
            {"name": "users:create", "description": "Create users", "resource": "users", "action": "create"},
            {"name": "users:read", "description": "Read users", "resource": "users", "action": "read"},
            {"name": "users:update", "description": "Update users", "resource": "users", "action": "update"},
            {"name": "users:delete", "description": "Delete users", "resource": "users", "action": "delete"},
            
            # Property management
            {"name": "properties:create", "description": "Create properties", "resource": "properties", "action": "create"},
            {"name": "properties:read", "description": "Read properties", "resource": "properties", "action": "read"},
            {"name": "properties:update", "description": "Update properties", "resource": "properties", "action": "update"},
            {"name": "properties:delete", "description": "Delete properties", "resource": "properties", "action": "delete"},
            
            # Dashboard access
            {"name": "dashboard:read", "description": "Access dashboard", "resource": "dashboard", "action": "read"},
            
            # Client management
            {"name": "clients:create", "description": "Create clients", "resource": "clients", "action": "create"},
            {"name": "clients:read", "description": "Read clients", "resource": "clients", "action": "read"},
            {"name": "clients:update", "description": "Update clients", "resource": "clients", "action": "update"},
            {"name": "clients:delete", "description": "Delete clients", "resource": "clients", "action": "delete"},
        ]
        
        # Create permissions if they don't exist
        created_permissions = {}
        for perm_data in default_permissions:
            existing = db.query(Permission).filter(Permission.name == perm_data["name"]).first()
            if not existing:
                permission = Permission(**perm_data)
                db.add(permission)
                db.flush()
                created_permissions[perm_data["name"]] = permission
            else:
                created_permissions[perm_data["name"]] = existing
        
        # Define default roles with their permissions and hierarchy
        default_roles = [
            {
                "name": "admin",
                "description": "Full system access",
                "parent_role_id": None,
                "permissions": list(created_permissions.keys())
            },
            {
                "name": "manager", 
                "description": "Management access",
                "parent_role_id": None,
                "permissions": [
                    "users:read", "users:update",
                    "properties:create", "properties:read", "properties:update",
                    "clients:create", "clients:read", "clients:update",
                    "dashboard:read"
                ]
            },
            {
                "name": "agent",
                "description": "Agent access",
                "parent_role_id": None,  # Will be set to manager role ID after creation
                "permissions": [
                    "properties:create", "properties:read", "properties:update",
                    "clients:create", "clients:read", "clients:update",
                    "dashboard:read"
                ]
            },
            {
                "name": "client",
                "description": "Client access",
                "parent_role_id": None,
                "permissions": [
                    "properties:read",
                    "dashboard:read"
                ]
            }
        ]
        
        # Create roles if they don't exist
        created_roles = {}
        for role_data in default_roles:
            existing_role = db.query(Role).filter(Role.name == role_data["name"]).first()
            if not existing_role:
                role_permissions = [created_permissions[perm_name] for perm_name in role_data["permissions"]]
                role = Role(
                    name=role_data["name"],
                    description=role_data["description"],
                    parent_role_id=role_data["parent_role_id"],
                    permissions=role_permissions
                )
                db.add(role)
                db.flush()
                created_roles[role_data["name"]] = role
            else:
                created_roles[role_data["name"]] = existing_role
        
        # Set up role hierarchy (agent inherits from manager)
        if "agent" in created_roles and "manager" in created_roles:
            agent_role = created_roles["agent"]
            manager_role = created_roles["manager"]
            if not agent_role.parent_role_id:
                agent_role.parent_role_id = manager_role.id
        
        db.commit()
        print("Default permissions and roles initialized successfully")
        
    except Exception as e:
        db.rollback()
        print(f"Error initializing permissions: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_default_permissions()