from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Query, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional
import uuid
import os
import shutil
from pathlib import Path

from app.database import get_db, init_db
from app.models import Product, Webhook, UploadTask
from app.schemas import (
    ProductCreate, ProductUpdate, ProductResponse,
    WebhookCreate, WebhookUpdate, WebhookResponse,
    UploadTaskResponse, TaskStatusResponse
)
from app.tasks import process_csv_upload, trigger_webhooks_async
from app.celery_app import celery_app
from app.config import get_settings

settings = get_settings()

# Create uploads directory
Path(settings.upload_dir).mkdir(exist_ok=True)

app = FastAPI(
    title="Acme Product Importer",
    description="A scalable web application for importing and managing products",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()


# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Serve static files and frontend
@app.get("/", response_class=HTMLResponse)
async def root():
    """Serve the main UI"""
    return HTMLResponse(open("static/index.html").read())


# =============================================================================
# PRODUCT ENDPOINTS
# =============================================================================

@app.get("/api/products", response_model=dict)
def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    search: Optional[str] = None,
    active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Get paginated list of products with filtering"""
    query = db.query(Product)
    
    # Apply filters
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                func.lower(Product.sku).like(func.lower(search_filter)),
                func.lower(Product.name).like(func.lower(search_filter)),
                func.lower(Product.description).like(func.lower(search_filter))
            )
        )
    
    if active is not None:
        query = query.filter(Product.active == active)
    
    # Get total count
    total = query.count()
    
    # Get paginated results
    products = query.order_by(Product.id.desc()).offset(skip).limit(limit).all()
    
    return {
        "items": products,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@app.post("/api/products", response_model=ProductResponse, status_code=201)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    """Create a new product"""
    # Check if SKU already exists (case-insensitive)
    existing = db.query(Product).filter(
        func.lower(Product.sku) == func.lower(product.sku)
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="SKU already exists")
    
    db_product = Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    # Trigger webhooks
    trigger_webhooks_async.delay('product.created', {'product_id': db_product.id, 'sku': db_product.sku})
    
    return db_product


@app.get("/api/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a single product by ID"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@app.put("/api/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_update: ProductUpdate,
    db: Session = Depends(get_db)
):
    """Update a product"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check SKU uniqueness if updating SKU
    if product_update.sku and product_update.sku != product.sku:
        existing = db.query(Product).filter(
            func.lower(Product.sku) == func.lower(product_update.sku)
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="SKU already exists")
    
    # Update fields
    update_data = product_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    
    # Trigger webhooks
    trigger_webhooks_async.delay('product.updated', {'product_id': product.id, 'sku': product.sku})
    
    return product


@app.delete("/api/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Delete a single product"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    sku = product.sku
    db.delete(product)
    db.commit()
    
    # Trigger webhooks
    trigger_webhooks_async.delay('product.deleted', {'product_id': product_id, 'sku': sku})
    
    return {"message": "Product deleted successfully"}


@app.delete("/api/products")
def bulk_delete_products(db: Session = Depends(get_db)):
    """Delete all products"""
    count = db.query(Product).count()
    db.query(Product).delete()
    db.commit()
    
    # Trigger webhooks
    trigger_webhooks_async.delay('products.bulk_deleted', {'count': count})
    
    return {"message": f"Successfully deleted {count} products", "count": count}


# =============================================================================
# FILE UPLOAD ENDPOINTS
# =============================================================================

@app.post("/api/upload", response_model=UploadTaskResponse)
async def upload_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload CSV file for processing"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    # Generate unique task ID
    task_id = str(uuid.uuid4())
    
    # Save uploaded file
    file_path = os.path.join(settings.upload_dir, f"{task_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create upload task record
    upload_task = UploadTask(
        task_id=task_id,
        filename=file.filename,
        status="pending"
    )
    db.add(upload_task)
    db.commit()
    db.refresh(upload_task)
    
    # Start async processing
    process_csv_upload.delay(file_path, task_id)
    
    return upload_task


@app.get("/api/upload/status/{task_id}", response_model=TaskStatusResponse)
def get_upload_status(task_id: str, db: Session = Depends(get_db)):
    """Get upload task status"""
    # Check database for task info
    upload_task = db.query(UploadTask).filter(UploadTask.task_id == task_id).first()
    if not upload_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Get Celery task status
    celery_task = celery_app.AsyncResult(task_id)
    
    if celery_task.state == 'PROGRESS':
        info = celery_task.info
        return TaskStatusResponse(
            status="processing",
            current=info.get('current', 0),
            total=info.get('total', 0),
            percentage=info.get('percentage', 0)
        )
    elif upload_task.status == "completed":
        return TaskStatusResponse(
            status="completed",
            current=upload_task.processed_rows,
            total=upload_task.total_rows,
            percentage=100,
            message="Upload completed successfully"
        )
    elif upload_task.status == "failed":
        return TaskStatusResponse(
            status="failed",
            current=upload_task.processed_rows,
            total=upload_task.total_rows,
            percentage=0,
            message=upload_task.error_message
        )
    else:
        return TaskStatusResponse(
            status=upload_task.status,
            current=upload_task.processed_rows,
            total=upload_task.total_rows,
            percentage=0
        )


# =============================================================================
# WEBHOOK ENDPOINTS
# =============================================================================

@app.get("/api/webhooks", response_model=List[WebhookResponse])
def get_webhooks(db: Session = Depends(get_db)):
    """Get all webhooks"""
    webhooks = db.query(Webhook).order_by(Webhook.id.desc()).all()
    return webhooks


@app.post("/api/webhooks", response_model=WebhookResponse, status_code=201)
def create_webhook(webhook: WebhookCreate, db: Session = Depends(get_db)):
    """Create a new webhook"""
    db_webhook = Webhook(**webhook.model_dump())
    db.add(db_webhook)
    db.commit()
    db.refresh(db_webhook)
    return db_webhook


@app.put("/api/webhooks/{webhook_id}", response_model=WebhookResponse)
def update_webhook(
    webhook_id: int,
    webhook_update: WebhookUpdate,
    db: Session = Depends(get_db)
):
    """Update a webhook"""
    webhook = db.query(Webhook).filter(Webhook.id == webhook_id).first()
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")
    
    update_data = webhook_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(webhook, field, value)
    
    db.commit()
    db.refresh(webhook)
    return webhook


@app.delete("/api/webhooks/{webhook_id}")
def delete_webhook(webhook_id: int, db: Session = Depends(get_db)):
    """Delete a webhook"""
    webhook = db.query(Webhook).filter(Webhook.id == webhook_id).first()
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")
    
    db.delete(webhook)
    db.commit()
    return {"message": "Webhook deleted successfully"}


@app.post("/api/webhooks/{webhook_id}/test")
async def test_webhook(webhook_id: int, db: Session = Depends(get_db)):
    """Test a webhook by sending a test payload"""
    import httpx
    import time
    
    webhook = db.query(Webhook).filter(Webhook.id == webhook_id).first()
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")
    
    test_payload = {
        'event': webhook.event_type,
        'data': {
            'test': True,
            'timestamp': time.time()
        }
    }
    
    try:
        start_time = time.time()
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(webhook.url, json=test_payload)
        response_time = int((time.time() - start_time) * 1000)
        
        return {
            "success": True,
            "status_code": response.status_code,
            "response_time_ms": response_time,
            "message": "Webhook test successful"
        }
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }


# =============================================================================
# HEALTH CHECK
# =============================================================================

@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Product Importer API"}

