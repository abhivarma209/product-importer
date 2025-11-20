from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float, Index
from sqlalchemy.sql import func
from app.database import Base


class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(500), nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=True)
    active = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Create case-insensitive index for SKU
    __table_args__ = (
        Index('idx_sku_lower', func.lower(sku), unique=True),
    )


class Webhook(Base):
    __tablename__ = "webhooks"
    
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String(2048), nullable=False)
    event_type = Column(String(100), nullable=False, index=True)
    enabled = Column(Boolean, default=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class UploadTask(Base):
    __tablename__ = "upload_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(String(255), unique=True, nullable=False, index=True)
    filename = Column(String(500), nullable=False)
    status = Column(String(50), nullable=False, default="pending", index=True)  # pending, processing, completed, failed
    total_rows = Column(Integer, default=0)
    processed_rows = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

