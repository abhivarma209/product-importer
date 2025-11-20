from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
import os
import shutil
from pathlib import Path

from dependencies.database import get_db
from dependencies.celery_app import celery_app
from models import UploadTask
from schemas import UploadTaskResponse, TaskStatusResponse
from app.tasks import process_csv_upload
from config import settings

# Create uploads directory
Path(settings.upload_dir).mkdir(exist_ok=True)

router = APIRouter(prefix="/api/upload", tags=["upload"])


@router.post("", response_model=UploadTaskResponse)
def upload_csv(
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


@router.get("/status/{task_id}", response_model=TaskStatusResponse)
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
