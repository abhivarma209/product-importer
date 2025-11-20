from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
from datetime import datetime


class ProductBase(BaseModel):
    sku: str = Field(..., min_length=1, max_length=255)
    name: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    price: Optional[float] = None
    active: bool = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    sku: Optional[str] = Field(None, min_length=1, max_length=255)
    name: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    price: Optional[float] = None
    active: Optional[bool] = None


class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class WebhookBase(BaseModel):
    url: str = Field(..., max_length=2048)
    event_type: str = Field(..., max_length=100)
    enabled: bool = True
    description: Optional[str] = None


class WebhookCreate(WebhookBase):
    pass


class WebhookUpdate(BaseModel):
    url: Optional[str] = Field(None, max_length=2048)
    event_type: Optional[str] = Field(None, max_length=100)
    enabled: Optional[bool] = None
    description: Optional[str] = None


class WebhookResponse(WebhookBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UploadTaskResponse(BaseModel):
    id: int
    task_id: str
    filename: str
    status: str
    total_rows: int
    processed_rows: int
    error_message: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class TaskStatusResponse(BaseModel):
    status: str
    current: int
    total: int
    percentage: int
    message: Optional[str] = None

