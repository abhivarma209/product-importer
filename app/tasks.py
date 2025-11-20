import pandas as pd
import httpx
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import insert
from app.celery_app import celery_app
from app.database import SessionLocal
from app.models import Product, UploadTask, Webhook
from typing import Dict, Any
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@celery_app.task(bind=True)
def process_csv_upload(self, file_path: str, task_id: str):
    """
    Process CSV file upload asynchronously
    Handles large files efficiently with batch processing
    """
    db = SessionLocal()
    
    try:
        # Update task status to processing
        upload_task = db.query(UploadTask).filter(UploadTask.task_id == task_id).first()
        if not upload_task:
            raise Exception(f"Upload task {task_id} not found")
        
        upload_task.status = "processing"
        db.commit()
        
        # Read CSV file in chunks for memory efficiency
        chunk_size = 1000
        total_processed = 0
        
        # First pass: count total rows
        try:
            df_count = pd.read_csv(file_path, nrows=0)
            total_rows = sum(1 for _ in open(file_path)) - 1  # Subtract header
            upload_task.total_rows = total_rows
            db.commit()
        except Exception as e:
            logger.error(f"Error counting rows: {e}")
            total_rows = 0
        
        # Process CSV in chunks
        for chunk_index, df_chunk in enumerate(pd.read_csv(file_path, chunksize=chunk_size)):
            # Clean and prepare data
            df_chunk.columns = df_chunk.columns.str.strip().str.lower()
            
            # Prepare products for batch insert/update
            products_data = []
            for _, row in df_chunk.iterrows():
                product_dict = {
                    'sku': str(row.get('sku', '')).strip(),
                    'name': str(row.get('name', '')).strip(),
                    'description': str(row.get('description', '')) if pd.notna(row.get('description')) else None,
                    'price': float(row.get('price', 0)) if pd.notna(row.get('price')) else None,
                    'active': True  # Default to active
                }
                
                if product_dict['sku']:  # Only process if SKU exists
                    products_data.append(product_dict)
            
            # Batch upsert using PostgreSQL's INSERT ... ON CONFLICT
            if products_data:
                stmt = insert(Product).values(products_data)
                stmt = stmt.on_conflict_do_update(
                    index_elements=['sku'],
                    set_={
                        'name': stmt.excluded.name,
                        'description': stmt.excluded.description,
                        'price': stmt.excluded.price,
                    }
                )
                db.execute(stmt)
                db.commit()
            
            total_processed += len(products_data)
            
            # Update progress
            upload_task.processed_rows = total_processed
            db.commit()
            
            # Update Celery task state for real-time progress
            self.update_state(
                state='PROGRESS',
                meta={
                    'current': total_processed,
                    'total': total_rows,
                    'percentage': int((total_processed / total_rows * 100)) if total_rows > 0 else 0
                }
            )
        
        # Mark as completed
        upload_task.status = "completed"
        upload_task.processed_rows = total_processed
        db.commit()
        
        # Trigger webhooks
        trigger_webhooks_async.delay('product.imported', {
            'task_id': task_id,
            'total_rows': total_processed,
            'filename': upload_task.filename
        })
        
        return {
            'status': 'completed',
            'total_processed': total_processed
        }
        
    except Exception as e:
        logger.error(f"Error processing CSV: {e}")
        upload_task.status = "failed"
        upload_task.error_message = str(e)
        db.commit()
        raise
    finally:
        db.close()


@celery_app.task
def trigger_webhooks_async(event_type: str, payload: Dict[str, Any]):
    """
    Trigger webhooks asynchronously
    """
    db = SessionLocal()
    
    try:
        webhooks = db.query(Webhook).filter(
            Webhook.event_type == event_type,
            Webhook.enabled == True
        ).all()
        
        for webhook in webhooks:
            try:
                with httpx.Client(timeout=10.0) as client:
                    response = client.post(
                        webhook.url,
                        json={
                            'event': event_type,
                            'data': payload
                        }
                    )
                    logger.info(f"Webhook {webhook.id} triggered: {response.status_code}")
            except Exception as e:
                logger.error(f"Error triggering webhook {webhook.id}: {e}")
    finally:
        db.close()

