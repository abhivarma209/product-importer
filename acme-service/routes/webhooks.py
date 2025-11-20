from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import httpx
import time

from dependencies.database import get_db
from models import Webhook
from schemas import WebhookCreate, WebhookUpdate, WebhookResponse

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])


@router.get("", response_model=List[WebhookResponse])
def get_webhooks(db: Session = Depends(get_db)):
    """Get all webhooks"""
    webhooks = db.query(Webhook).order_by(Webhook.id.desc()).all()
    return webhooks


@router.post("", response_model=WebhookResponse, status_code=201)
def create_webhook(webhook: WebhookCreate, db: Session = Depends(get_db)):
    """Create a new webhook"""
    db_webhook = Webhook(**webhook.model_dump())
    db.add(db_webhook)
    db.commit()
    db.refresh(db_webhook)
    return db_webhook


@router.put("/{webhook_id}", response_model=WebhookResponse)
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


@router.delete("/{webhook_id}")
def delete_webhook(webhook_id: int, db: Session = Depends(get_db)):
    """Delete a webhook"""
    webhook = db.query(Webhook).filter(Webhook.id == webhook_id).first()
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")
    
    db.delete(webhook)
    db.commit()
    return {"message": "Webhook deleted successfully"}


@router.post("/{webhook_id}/test")
def test_webhook(webhook_id: int, db: Session = Depends(get_db)):
    """Test a webhook by sending a test payload"""
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
        with httpx.Client(timeout=10.0) as client:
            response = client.post(webhook.url, json=test_payload)
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
