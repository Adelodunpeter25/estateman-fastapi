from sqlalchemy.orm import Session
from ..models.permission import Permission, Role
from ..models.navigation import NavigationRoute
from ..core.database import SessionLocal

def init_default_permissions():
    """Initialize default permissions and roles"""
    db = SessionLocal()
    
    try:
        # Define comprehensive permissions
        default_permissions = [
            # User management
            {"name": "users:create", "description": "Create users", "resource": "users", "action": "create"},
            {"name": "users:read", "description": "Read users", "resource": "users", "action": "read"},
            {"name": "users:update", "description": "Update users", "resource": "users", "action": "update"},
            {"name": "users:delete", "description": "Delete users", "resource": "users", "action": "delete"},
            {"name": "users:activate", "description": "Activate/deactivate users", "resource": "users", "action": "activate"},
            
            # Property management
            {"name": "properties:create", "description": "Create properties", "resource": "properties", "action": "create"},
            {"name": "properties:read", "description": "Read properties", "resource": "properties", "action": "read"},
            {"name": "properties:update", "description": "Update properties", "resource": "properties", "action": "update"},
            {"name": "properties:delete", "description": "Delete properties", "resource": "properties", "action": "delete"},
            {"name": "properties:publish", "description": "Publish/unpublish properties", "resource": "properties", "action": "publish"},
            {"name": "properties:assign", "description": "Assign properties to realtors", "resource": "properties", "action": "assign"},
            
            # Listings management
            {"name": "listings:create", "description": "Create listings", "resource": "listings", "action": "create"},
            {"name": "listings:read", "description": "Read listings", "resource": "listings", "action": "read"},
            {"name": "listings:update", "description": "Update listings", "resource": "listings", "action": "update"},
            {"name": "listings:delete", "description": "Delete listings", "resource": "listings", "action": "delete"},
            
            # Financial management
            {"name": "invoices:create", "description": "Create invoices", "resource": "invoices", "action": "create"},
            {"name": "invoices:read", "description": "View invoices", "resource": "invoices", "action": "read"},
            {"name": "invoices:update", "description": "Update invoices", "resource": "invoices", "action": "update"},
            {"name": "invoices:delete", "description": "Delete invoices", "resource": "invoices", "action": "delete"},
            {"name": "payments:create", "description": "Record payments", "resource": "payments", "action": "create"},
            {"name": "payments:read", "description": "View payments", "resource": "payments", "action": "read"},
            {"name": "payments:update", "description": "Update payments", "resource": "payments", "action": "update"},
            {"name": "payments:refund", "description": "Process refunds", "resource": "payments", "action": "refund"},
            {"name": "expenses:create", "description": "Create expenses", "resource": "expenses", "action": "create"},
            {"name": "expenses:read", "description": "View expenses", "resource": "expenses", "action": "read"},
            {"name": "expenses:update", "description": "Update expenses", "resource": "expenses", "action": "update"},
            {"name": "expenses:delete", "description": "Delete expenses", "resource": "expenses", "action": "delete"},
            {"name": "billing:manage", "description": "Manage recurring billing", "resource": "billing", "action": "manage"},
            {"name": "transactions:reconcile", "description": "Reconcile transactions", "resource": "transactions", "action": "reconcile"},
            {"name": "tax:configure", "description": "Configure tax settings", "resource": "tax", "action": "configure"},
            
            # Reports and analytics
            {"name": "reports:financial", "description": "Generate financial reports", "resource": "reports", "action": "financial"},
            {"name": "reports:property", "description": "Generate property reports", "resource": "reports", "action": "property"},
            {"name": "reports:user", "description": "Generate user reports", "resource": "reports", "action": "user"},
            {"name": "reports:export", "description": "Export reports", "resource": "reports", "action": "export"},
            {"name": "analytics:read", "description": "View analytics", "resource": "analytics", "action": "read"},
            
            # CRM and leads
            {"name": "leads:create", "description": "Create leads", "resource": "leads", "action": "create"},
            {"name": "leads:read", "description": "View leads", "resource": "leads", "action": "read"},
            {"name": "leads:update", "description": "Update leads", "resource": "leads", "action": "update"},
            {"name": "leads:delete", "description": "Delete leads", "resource": "leads", "action": "delete"},
            {"name": "leads:assign", "description": "Assign leads to realtors", "resource": "leads", "action": "assign"},
            {"name": "contacts:create", "description": "Create contacts", "resource": "contacts", "action": "create"},
            {"name": "contacts:read", "description": "View contacts", "resource": "contacts", "action": "read"},
            {"name": "contacts:update", "description": "Update contacts", "resource": "contacts", "action": "update"},
            {"name": "contacts:delete", "description": "Delete contacts", "resource": "contacts", "action": "delete"},
            
            # Appointments and viewings
            {"name": "appointments:create", "description": "Create appointments", "resource": "appointments", "action": "create"},
            {"name": "appointments:read", "description": "View appointments", "resource": "appointments", "action": "read"},
            {"name": "appointments:update", "description": "Update appointments", "resource": "appointments", "action": "update"},
            {"name": "appointments:delete", "description": "Delete appointments", "resource": "appointments", "action": "delete"},
            {"name": "viewings:schedule", "description": "Schedule property viewings", "resource": "viewings", "action": "schedule"},
            {"name": "viewings:manage", "description": "Manage property viewings", "resource": "viewings", "action": "manage"},
            
            # Documents and contracts
            {"name": "documents:create", "description": "Create documents", "resource": "documents", "action": "create"},
            {"name": "documents:read", "description": "View documents", "resource": "documents", "action": "read"},
            {"name": "documents:update", "description": "Update documents", "resource": "documents", "action": "update"},
            {"name": "documents:delete", "description": "Delete documents", "resource": "documents", "action": "delete"},
            {"name": "contracts:create", "description": "Create contracts", "resource": "contracts", "action": "create"},
            {"name": "contracts:read", "description": "View contracts", "resource": "contracts", "action": "read"},
            {"name": "contracts:update", "description": "Update contracts", "resource": "contracts", "action": "update"},
            {"name": "contracts:sign", "description": "Sign contracts", "resource": "contracts", "action": "sign"},
            
            # System settings
            {"name": "settings:read", "description": "View system settings", "resource": "settings", "action": "read"},
            {"name": "settings:update", "description": "Update system settings", "resource": "settings", "action": "update"},
            {"name": "notifications:send", "description": "Send notifications", "resource": "notifications", "action": "send"},
            {"name": "notifications:manage", "description": "Manage notification settings", "resource": "notifications", "action": "manage"},
            
            # RBAC management
            {"name": "roles:create", "description": "Create roles", "resource": "roles", "action": "create"},
            {"name": "roles:read", "description": "View roles", "resource": "roles", "action": "read"},
            {"name": "roles:update", "description": "Update roles", "resource": "roles", "action": "update"},
            {"name": "roles:delete", "description": "Delete roles", "resource": "roles", "action": "delete"},
            {"name": "permissions:manage", "description": "Manage permissions", "resource": "permissions", "action": "manage"},
            
            # Dashboard access
            {"name": "dashboard:read", "description": "Access dashboard", "resource": "dashboard", "action": "read"},
            {"name": "dashboard:admin", "description": "Access admin dashboard", "resource": "dashboard", "action": "admin"},
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
        
        # Define roles with hierarchy: SuperAdmin > Admin > Manager > Realtor > Client
        default_roles = [
            {
                "name": "superadmin",
                "description": "Super administrator with full system access",
                "parent_role_id": None,
                "permissions": list(created_permissions.keys())  # All permissions
            },
            {
                "name": "admin",
                "description": "Administrator access",
                "parent_role_id": None,  # Will inherit from superadmin
                "permissions": [
                    "users:create", "users:read", "users:update", "users:delete", "users:activate",
                    "properties:create", "properties:read", "properties:update", "properties:delete", "properties:publish", "properties:assign",
                    "listings:create", "listings:read", "listings:update", "listings:delete",
                    "leads:create", "leads:read", "leads:update", "leads:delete", "leads:assign",
                    "contacts:create", "contacts:read", "contacts:update", "contacts:delete",
                    "appointments:create", "appointments:read", "appointments:update", "appointments:delete",
                    "viewings:schedule", "viewings:manage",
                    "documents:create", "documents:read", "documents:update", "documents:delete",
                    "contracts:create", "contracts:read", "contracts:update", "contracts:sign",
                    "reports:financial", "reports:property", "reports:user", "reports:export",
                    "analytics:read", "settings:read", "settings:update",
                    "notifications:send", "notifications:manage",
                    "roles:create", "roles:read", "roles:update", "roles:delete", "permissions:manage",
                    "dashboard:read", "dashboard:admin"
                ]
            },
            {
                "name": "manager",
                "description": "Management access",
                "parent_role_id": None,  # Will inherit from admin
                "permissions": [
                    "users:read", "users:update",
                    "properties:create", "properties:read", "properties:update", "properties:assign",
                    "listings:create", "listings:read", "listings:update",
                    "leads:create", "leads:read", "leads:update", "leads:assign",
                    "contacts:create", "contacts:read", "contacts:update",
                    "appointments:create", "appointments:read", "appointments:update",
                    "viewings:schedule", "viewings:manage",
                    "documents:create", "documents:read", "documents:update",
                    "contracts:create", "contracts:read", "contracts:update",
                    "reports:property", "reports:user", "reports:export",
                    "analytics:read", "dashboard:read"
                ]
            },
            {
                "name": "accountant",
                "description": "Financial management access",
                "parent_role_id": None,  # Standalone role
                "permissions": [
                    "invoices:create", "invoices:read", "invoices:update", "invoices:delete",
                    "payments:create", "payments:read", "payments:update", "payments:refund",
                    "expenses:create", "expenses:read", "expenses:update", "expenses:delete",
                    "billing:manage", "transactions:reconcile", "tax:configure",
                    "reports:financial", "reports:export",
                    "dashboard:read"
                ]
            },
            {
                "name": "realtor",
                "description": "Realtor access",
                "parent_role_id": None,  # Will inherit from manager
                "permissions": [
                    "properties:create", "properties:read", "properties:update",
                    "listings:create", "listings:read", "listings:update",
                    "leads:create", "leads:read", "leads:update",
                    "contacts:create", "contacts:read", "contacts:update",
                    "appointments:create", "appointments:read", "appointments:update",
                    "viewings:schedule", "viewings:manage",
                    "documents:create", "documents:read", "documents:update",
                    "contracts:create", "contracts:read", "contracts:update",
                    "dashboard:read"
                ]
            },
            {
                "name": "client",
                "description": "Client access",
                "parent_role_id": None,  # Will inherit from realtor
                "permissions": [
                    "properties:read", "listings:read",
                    "appointments:create", "appointments:read",
                    "viewings:schedule", "documents:read",
                    "contracts:read", "contracts:sign",
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
        
        # Set up role hierarchy: SuperAdmin > Admin > Manager > Realtor > Client
        if "admin" in created_roles and "superadmin" in created_roles:
            admin_role = created_roles["admin"]
            superadmin_role = created_roles["superadmin"]
            if not admin_role.parent_role_id:
                admin_role.parent_role_id = superadmin_role.id
        
        if "manager" in created_roles and "admin" in created_roles:
            manager_role = created_roles["manager"]
            admin_role = created_roles["admin"]
            if not manager_role.parent_role_id:
                manager_role.parent_role_id = admin_role.id
        
        if "realtor" in created_roles and "manager" in created_roles:
            realtor_role = created_roles["realtor"]
            manager_role = created_roles["manager"]
            if not realtor_role.parent_role_id:
                realtor_role.parent_role_id = manager_role.id
        
        if "client" in created_roles and "realtor" in created_roles:
            client_role = created_roles["client"]
            realtor_role = created_roles["realtor"]
            if not client_role.parent_role_id:
                client_role.parent_role_id = realtor_role.id
        
        # Initialize navigation routes
        navigation_routes = [
            {"route": "/analytics", "title": "Analytics", "required_permission": "analytics:read", "category": "Overview", "order_index": 1},
            {"route": "/saas-management", "title": "SaaS Management", "required_permission": "settings:update", "category": "Overview", "order_index": 2},
            {"route": "/realtors", "title": "Realtors", "required_permission": "users:read", "category": "Management", "order_index": 1},
            {"route": "/clients", "title": "Clients", "required_permission": "contacts:read", "category": "Management", "order_index": 2},
            {"route": "/properties", "title": "Properties", "required_permission": "properties:read", "category": "Management", "order_index": 3},
            {"route": "/leads", "title": "Leads", "required_permission": "leads:read", "category": "Management", "order_index": 4},
            {"route": "/sales-force", "title": "Sales Force", "required_permission": "users:read", "category": "Sales & Revenue", "order_index": 1},
            {"route": "/commissions", "title": "Commissions", "required_permission": "reports:financial", "category": "Sales & Revenue", "order_index": 2},
            {"route": "/payments", "title": "Payments", "required_permission": "payments:read", "category": "Sales & Revenue", "order_index": 3},
            {"route": "/marketing", "title": "Marketing", "required_permission": "notifications:send", "category": "Operations", "order_index": 1},
            {"route": "/documents", "title": "Documents", "required_permission": "documents:read", "category": "Operations", "order_index": 2},
            {"route": "/events", "title": "Events", "required_permission": "appointments:read", "category": "Operations", "order_index": 3},
            {"route": "/accounting", "title": "Accounting", "required_permission": "invoices:read", "category": "Business", "order_index": 1},
            {"route": "/newsletters", "title": "Newsletters", "required_permission": "notifications:send", "category": "Business", "order_index": 2},
            {"route": "/settings", "title": "Settings", "required_permission": "settings:read", "category": "Business", "order_index": 3}
        ]
        
        for nav_data in navigation_routes:
            existing_nav = db.query(NavigationRoute).filter(NavigationRoute.route == nav_data["route"]).first()
            if not existing_nav:
                nav_route = NavigationRoute(**nav_data)
                db.add(nav_route)
        
        db.commit()
        print("Default permissions, roles, and navigation routes initialized successfully")
        
    except Exception as e:
        db.rollback()
        print(f"Error initializing permissions: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_default_permissions()