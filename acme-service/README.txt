====================================
ACME PRODUCT IMPORTER - BACKEND
====================================

FastAPI backend with Celery for async CSV processing
Uses synchronous database connections throughout

STRUCTURE:
----------
backend/
├── app/
│   └── tasks.py                  # Celery async tasks
├── dependencies/
│   ├── database.py               # Synchronous database
│   └── celery_app.py             # Celery configuration
├── routes/
│   ├── products.py               # Product CRUD endpoints
│   ├── upload.py                 # CSV upload endpoints
│   └── webhooks.py               # Webhook endpoints
├── uploads/                      # CSV upload directory
├── main.py                       # FastAPI app initialization
├── config.py                     # Configuration
├── models.py                     # Database models
├── schemas.py                    # Pydantic schemas
├── run.py                        # Application entry point
├── requirements.txt              # Python dependencies
└── SAMPLE_CSV_GENERATOR.py       # Generate test CSV files

PREREQUISITES:
--------------
- Python 3.11+
- PostgreSQL (running on localhost:5432)
- Redis (running on localhost:6379)

SETUP:
------
1. Install dependencies:
   pip install -r requirements.txt

2. Create .env file:
   postgres_db=fileimporter
   postgres_host=localhost
   postgres_port=5432
   postgres_user=postgres
   postgres_password=your_password
   
   redis_url=redis://localhost:6379/0
   celery_broker_url=redis://localhost:6379/0
   celery_result_backend=redis://localhost:6379/0
   
   environment=development

RUN:
----
Terminal 1 - Start API server:
   python run.py

Terminal 2 - Start Celery worker:
   celery -A dependencies.celery_app:celery_app worker --loglevel=info

API will be available at: http://127.0.0.1:8000
API Documentation: http://127.0.0.1:8000/docs

TESTING:
--------
Generate sample CSV:
   python SAMPLE_CSV_GENERATOR.py

This creates test CSV files you can upload via the frontend.

ARCHITECTURE:
-------------
- Uses SYNCHRONOUS database connections (SQLAlchemy + psycopg2)
- Simple and straightforward - no async complexity
- Both routes and Celery tasks use the same database connection
- Clean separation: config, main, dependencies, routes

API ENDPOINTS:
--------------
Products:
  GET    /api/products         - List products
  POST   /api/products         - Create product
  GET    /api/products/{id}    - Get product
  PUT    /api/products/{id}    - Update product
  DELETE /api/products/{id}    - Delete product
  DELETE /api/products         - Bulk delete

Upload:
  POST   /api/upload           - Upload CSV
  GET    /api/upload/status/{id} - Get progress

Webhooks:
  GET    /api/webhooks         - List webhooks
  POST   /api/webhooks         - Create webhook
  PUT    /api/webhooks/{id}    - Update webhook
  DELETE /api/webhooks/{id}    - Delete webhook
  POST   /api/webhooks/{id}/test - Test webhook

FEATURES:
---------
✓ RESTful API with FastAPI
✓ Synchronous database with SQLAlchemy
✓ Supports 500K+ record CSV files
✓ Real-time progress tracking
✓ Webhook system
✓ CORS enabled for frontend integration
✓ Clean, organized code structure
✓ Simple sync-only approach - easy to understand

For detailed structure information, see STRUCTURE.txt
