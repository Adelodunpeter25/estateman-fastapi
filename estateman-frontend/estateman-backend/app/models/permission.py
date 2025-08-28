from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base



# Association table for role-permission many-to-many relationship
role_permission = Table(
    'role_permissions',
    Base.metadata,
    Column('role_id', Integer, ForeignKey('roles.id'), primary_key=True),
    Column('permission_id', Integer, ForeignKey('permissions.id'), primary_key=True)
)

class Permission(Base):
    __tablename__ = "permissions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)
    resource = Column(String, nullable=False)  # e.g., 'users', 'properties', 'dashboard'
    action = Column(String, nullable=False)    # e.g., 'create', 'read', 'update', 'delete'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    roles = relationship("Role", secondary=role_permission, back_populates="permissions")

class Role(Base):
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)
    parent_role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    permissions = relationship("Permission", secondary=role_permission, back_populates="roles")
    # users = relationship("User", back_populates="role_obj")  # Commented to avoid circular import
    parent_role = relationship("Role", remote_side=[id], back_populates="child_roles")
    child_roles = relationship("Role", back_populates="parent_role")