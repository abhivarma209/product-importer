========================================
ACME PRODUCT IMPORTER
========================================

A scalable, production-ready web application for importing and managing products from CSV files.
Handles 500,000+ records with real-time progress tracking, Excel export, and webhook notifications.

Built with FastAPI (backend) and Next.js (frontend)

========================================
TABLE OF CONTENTS
========================================

1. Overview
2. Project Structure
3. Quick Start
4. Features
5. Technology Stack
6. API Endpoints
7. Prerequisites
8. Installation & Setup
9. Running the Application
10. Testing
11. Excel Export
12. Deployment
13. Troubleshooting
14. Documentation

========================================
1. OVERVIEW
========================================

This application consists of two separate services:

📦 BACKEND (acme-service)
   - FastAPI web framework
   - Celery for async task processing
   - PostgreSQL for data storage
   - Redis for message queuing
   - Synchronous database connections

🎨 FRONTEND (acme-client)
   - Next.js 14 with App Router
   - React 18 with TypeScript
   - Modern, responsive UI
   - Real-time progress updates

KEY CAPABILITIES:
✓ Import large CSV files (500K+ records)
✓ Export products to Excel with styling
✓ Real-time progress tracking
✓ Full CRUD operations
✓ Webhook system for event notifications
✓ Search, filter, and pagination
✓ Case-insensitive SKU deduplication
✓ Batch processing for performance

========================================
2. PROJECT STRUCTURE
========================================

FileImporter/
│
├── acme-service/              # Backend API (FastAPI + Celery)
│   ├── app/                   # Celery tasks
│   ├── dependencies/          # Database & Celery config
│   ├── routes/                # API endpoints (modular)
│   ├── uploads/               # CSV file storage
│   ├── main.py                # FastAPI application
│   ├── config.py              # Configuration settings
│   ├── models.py              # Database models
│   ├── schemas.py             # Pydantic schemas
│   ├── run.py                 # Entry point
│   └── requirements.txt       # Python dependencies
│
├── acme-client/               # Frontend UI (Next.js + React)
│   ├── app/                   # Next.js App Router pages
│   ├── components/            # React components
│   ├── lib/                   # API client & utilities
│   ├── types/                 # TypeScript definitions
│   ├── package.json           # Node dependencies
│   └── tsconfig.json          # TypeScript config
│
├── README.txt                 # Main documentation (this file)
├── PROJECT_STRUCTURE.txt      # Detailed structure
└── QUICKSTART.txt             # Quick reference guide

========================================
3. QUICK START
========================================

STEP 1: Start Backend Services
--------------------------------
Terminal 1 - API Server:
  cd acme-service
  pip install -r requirements.txt
  python run.py

Terminal 2 - Celery Worker:
  cd acme-service
  celery -A dependencies.celery_app:celery_app worker --loglevel=info

Backend API: http://localhost:8000
API Docs: http://localhost:8000/docs

STEP 2: Start Frontend
-----------------------
Terminal 3:
  cd acme-client
  npm install
  npm run dev

Frontend UI: http://localhost:3000

REQUIREMENTS:
- Python 3.11+
- Node.js 18+
- PostgreSQL 13+ (running on port 5432)
- Redis 6+ (running on port 6379)

========================================
4. FEATURES
========================================

📊 PRODUCT MANAGEMENT
---------------------
✓ Create, read, update, delete products
✓ Search by SKU, name, or description (case-insensitive)
✓ Filter by active status
✓ Pagination (50 products per page, customizable)
✓ Bulk delete all products
✓ Case-insensitive SKU uniqueness
✓ Automatic timestamps (created_at, updated_at)

📁 CSV IMPORT
-------------
✓ Upload CSV files (tested with 500K+ records)
✓ Real-time progress tracking with percentage
✓ Asynchronous processing with Celery
✓ Batch processing (1,000 records per batch)
✓ Automatic upsert (insert new, update existing)
✓ SKU-based deduplication
✓ Error handling with detailed messages
✓ Supports large files efficiently

📊 EXCEL EXPORT
---------------
✓ Export products to professional Excel files (.xlsx)
✓ Styled headers (blue background, white bold text)
✓ Auto-adjusted column widths
✓ Includes all product fields (ID, SKU, Name, Description, Price, Status, Created At)
✓ Supports filtering (search term, active status)
✓ Timestamped filenames (products_export_YYYYMMDD_HHMMSS.xlsx)
✓ One-click download from UI
✓ Uses openpyxl library for professional formatting

🔔 WEBHOOKS
-----------
✓ Configure multiple webhook endpoints
✓ Event types:
  - product.created
  - product.updated
  - product.deleted
  - products.bulk_deleted
  - product.imported
✓ Enable/disable webhooks individually
✓ Test webhook functionality
✓ Automatic triggering on events
✓ Retry logic and error handling

🎨 USER INTERFACE
-----------------
✓ Clean, modern design
✓ Responsive layout (mobile-friendly)
✓ Tab-based navigation (Products, Upload, Webhooks)
✓ Real-time updates and progress bars
✓ Toast notifications (success/error)
✓ Loading indicators
✓ Intuitive forms and modals
✓ Professional color scheme

========================================
5. TECHNOLOGY STACK
========================================

BACKEND (acme-service):
-----------------------
Framework:      FastAPI 0.104.1
ORM:            SQLAlchemy 2.0.23 (synchronous)
Database:       PostgreSQL 13+
Task Queue:     Celery 5.3.4
Message Broker: Redis 6+
DB Driver:      psycopg2-binary 2.9.9
Validation:     Pydantic 2.5.0
Excel Export:   openpyxl 3.1.2
CSV Processing: pandas 2.1.3
HTTP Client:    httpx 0.25.2
Web Server:     uvicorn 0.24.0

FRONTEND (acme-client):
-----------------------
Framework:      Next.js 14
UI Library:     React 18
Language:       TypeScript 5
HTTP Client:    Axios
Styling:        CSS Modules
Build Tool:     Webpack (via Next.js)

DATABASE STRATEGY:
------------------
✓ Synchronous connections only (simple & reliable)
✓ Connection pooling (10 base, 20 max overflow)
✓ Single unified database module
✓ Works seamlessly with Celery
✓ Pool pre-ping for connection health

========================================
6. API ENDPOINTS
========================================

PRODUCTS:
---------
GET    /api/products              - List products (paginated, filtered)
                                    Query params: skip, limit, search, active
POST   /api/products              - Create new product
GET    /api/products/{id}         - Get single product by ID
PUT    /api/products/{id}         - Update existing product
DELETE /api/products/{id}         - Delete single product
DELETE /api/products              - Bulk delete all products
GET    /api/products/export/excel - Export products to Excel file
                                    Query params: search, active

UPLOAD:
-------
POST   /api/upload                - Upload CSV file for processing
                                    Multipart form data with 'file' field
GET    /api/upload/status/{id}    - Get upload progress and status
                                    Returns: status, current, total, percentage

WEBHOOKS:
---------
GET    /api/webhooks              - List all webhooks
POST   /api/webhooks              - Create new webhook
PUT    /api/webhooks/{id}         - Update webhook configuration
DELETE /api/webhooks/{id}         - Delete webhook
POST   /api/webhooks/{id}/test    - Test webhook with sample payload

SYSTEM:
-------
GET    /                          - Welcome message and API info
GET    /api/health                - Health check endpoint
GET    /docs                      - Interactive API documentation (Swagger UI)
GET    /redoc                     - Alternative API documentation (ReDoc)

========================================
7. PREREQUISITES
========================================

REQUIRED SOFTWARE:
------------------
✓ Python 3.11 or higher
✓ Node.js 18 or higher
✓ npm 9+ (comes with Node.js)
✓ PostgreSQL 13+ (database server)
✓ Redis 6+ (message broker)

OPTIONAL:
---------
- Git (for version control)
- PostgreSQL GUI tool (pgAdmin, DBeaver)
- Redis GUI tool (RedisInsight)

SYSTEM REQUIREMENTS:
--------------------
- 4GB RAM minimum (8GB recommended)
- 2GB free disk space
- Windows, macOS, or Linux

========================================
8. INSTALLATION & SETUP
========================================

STEP 1: Clone/Download Project
-------------------------------
# If using Git
git clone <repository-url>
cd FileImporter

# Or extract downloaded ZIP

STEP 2: Setup PostgreSQL Database
----------------------------------
1. Install PostgreSQL if not already installed
2. Start PostgreSQL service
3. Create database:
   psql -U postgres
   CREATE DATABASE fileimporter;
   \q

STEP 3: Setup Redis
--------------------
1. Install Redis if not already installed
2. Start Redis service:
   # Windows: redis-server.exe
   # Linux/Mac: redis-server

STEP 4: Setup Backend
---------------------
cd acme-service

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
Create a file named .env with:

postgres_db=fileimporter
postgres_host=localhost
postgres_port=5432
postgres_user=postgres
postgres_password=your_actual_password

redis_url=redis://localhost:6379/0
celery_broker_url=redis://localhost:6379/0
celery_result_backend=redis://localhost:6379/0

environment=development
upload_dir=uploads
max_upload_size=104857600

STEP 5: Setup Frontend
----------------------
cd acme-client

# Install dependencies
npm install

# Create .env.local file (optional)
NEXT_PUBLIC_API_URL=http://localhost:8000

========================================
9. RUNNING THE APPLICATION
========================================

START BACKEND (2 terminals required):
--------------------------------------
Terminal 1 - API Server:
  cd acme-service
  # Activate venv if using
  python run.py

  ✓ API available at: http://localhost:8000
  ✓ Documentation at: http://localhost:8000/docs

Terminal 2 - Celery Worker:
  cd acme-service
  # Activate venv if using
  celery -A dependencies.celery_app:celery_app worker --loglevel=info

  ✓ Worker processes CSV uploads asynchronously
  ✓ Shows task progress in console

START FRONTEND (separate terminal):
------------------------------------
Terminal 3:
  cd acme-client
  npm run dev

  ✓ Frontend available at: http://localhost:3000
  ✓ Hot reload enabled for development

VERIFICATION:
-------------
1. Open http://localhost:3000 in browser
2. You should see the Acme Product Importer UI
3. Check all three tabs: Products, Upload, Webhooks
4. Backend API docs: http://localhost:8000/docs

========================================
10. TESTING
========================================

GENERATE TEST DATA:
-------------------
cd acme-service
python SAMPLE_CSV_GENERATOR.py

This creates:
- sample_products_1k.csv (1,000 records)
- sample_products_10k.csv (10,000 records)
- products_with_duplicates.csv (tests deduplication)

TEST CSV IMPORT:
----------------
1. Go to http://localhost:3000
2. Click "Upload" tab
3. Click "Choose File" and select a test CSV
4. Click "Upload CSV"
5. Watch real-time progress bar
6. Navigate to "Products" tab to see imported data

TEST EXCEL EXPORT:
------------------
1. Go to "Products" tab
2. (Optional) Apply filters or search
3. Click "📊 Export to Excel" button
4. Excel file downloads automatically
5. Open file in Excel/LibreOffice to verify formatting

TEST WEBHOOKS:
--------------
1. Go to "Webhooks" tab
2. Click "+ Add Webhook"
3. Enter URL: https://webhook.site/<your-unique-id>
   (Get unique URL from https://webhook.site)
4. Select event type: product.created
5. Click "Save"
6. Create a new product in "Products" tab
7. Check webhook.site to see the event received

TEST API DIRECTLY:
------------------
Visit http://localhost:8000/docs for interactive API testing
Or use curl:

# List products
curl http://localhost:8000/api/products

# Health check
curl http://localhost:8000/api/health

# Export to Excel
curl -o products.xlsx http://localhost:8000/api/products/export/excel

========================================
11. EXCEL EXPORT
========================================

FEATURE DETAILS:
----------------
✓ Professional Excel formatting (.xlsx)
✓ Styled headers:
  - Blue background (#4472C4)
  - White bold text
  - Centered alignment
✓ Auto-adjusted column widths for readability
✓ Includes all product fields:
  - ID, SKU, Name, Description, Price, Status, Created At
✓ Respects active filters (search, active status)
✓ Timestamped filenames

USAGE FROM UI:
--------------
1. Navigate to Products tab
2. (Optional) Apply search or active filter
3. Click "📊 Export to Excel" button
4. File downloads automatically

USAGE FROM CODE:
----------------
JavaScript/TypeScript:
const response = await productsApi.exportToExcel({ search: 'widget' });
const blob = new Blob([response.data]);
// Trigger download

Python:
import requests
response = requests.get('http://localhost:8000/api/products/export/excel')
with open('products.xlsx', 'wb') as f:
    f.write(response.content)

CURL:
curl -o products.xlsx "http://localhost:8000/api/products/export/excel?active=true"

========================================
12. DEPLOYMENT
========================================

BACKEND DEPLOYMENT:
-------------------
1. Update .env for production:
   - Set strong database password
   - Update database host
   - Set environment=production
   - Configure CORS for production domain

2. Use production ASGI server:
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

3. Run Celery as background service:
   celery -A dependencies.celery_app:celery_app worker --detach

4. Recommended platforms:
   - Railway (easiest)
   - Render
   - AWS EC2 + RDS
   - DigitalOcean App Platform

FRONTEND DEPLOYMENT:
--------------------
1. Update environment variable:
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com

2. Build for production:
   npm run build

3. Start production server:
   npm run start

4. Recommended platforms:
   - Vercel (best for Next.js)
   - Netlify
   - AWS Amplify

DATABASE & REDIS:
-----------------
- Use managed PostgreSQL (Railway, AWS RDS, Render)
- Use managed Redis (Upstash, Redis Cloud, AWS ElastiCache)
- Enable SSL connections
- Set up automated backups
- Monitor performance

========================================
13. TROUBLESHOOTING
========================================

BACKEND WON'T START:
--------------------
Issue: ModuleNotFoundError
Fix: Ensure virtual environment is activated and dependencies installed

Issue: Can't connect to database
Fix: 
  - Verify PostgreSQL is running (port 5432)
  - Check credentials in .env file
  - Ensure database 'fileimporter' exists
  - Test connection: psql -U postgres -d fileimporter

Issue: Can't connect to Redis
Fix:
  - Verify Redis is running (port 6379)
  - Test: redis-cli ping (should return PONG)
  - Check firewall settings

FRONTEND WON'T START:
---------------------
Issue: npm install fails
Fix: 
  - Delete node_modules and package-lock.json
  - Run npm install again
  - Ensure Node.js 18+ is installed

Issue: Can't connect to backend
Fix:
  - Verify backend is running on port 8000
  - Check CORS settings in acme-service/main.py
  - Verify API_URL in frontend

CSV UPLOAD NOT PROCESSING:
---------------------------
Issue: Upload hangs at "processing"
Fix:
  - Ensure Celery worker is running
  - Check Celery worker logs for errors
  - Verify Redis connection
  - Check uploads/ directory exists and is writable

EXCEL EXPORT FAILS:
-------------------
Issue: Export button doesn't work
Fix:
  - Check browser console for errors
  - Verify openpyxl is installed: pip list | grep openpyxl
  - Ensure products exist in database
  - Check browser allows downloads

IMPORT ERRORS:
--------------
Issue: "No module named 'config'" or similar
Fix:
  - Ensure you're in the correct directory (acme-service/)
  - Verify all __init__.py files exist
  - Check Python path

DATABASE ERRORS:
----------------
Issue: Tables don't exist
Fix: Tables are created automatically on startup
  - Restart the backend (python run.py)
  - Check logs for errors

Issue: SKU already exists
Fix: This is expected behavior (SKUs must be unique)
  - Update existing product instead
  - Or use different SKU

========================================
14. DOCUMENTATION
========================================

PROJECT DOCUMENTATION:
----------------------
README.txt                          - This file (main documentation)
PROJECT_STRUCTURE.txt               - Detailed file structure
QUICKSTART.txt                      - Quick reference guide

BACKEND DOCUMENTATION:
----------------------
acme-service/README.txt             - Backend overview
acme-service/requirements.txt       - Python dependencies

FRONTEND DOCUMENTATION:
-----------------------
acme-client/README.txt              - Frontend overview
acme-client/package.json            - npm dependencies

API DOCUMENTATION:
------------------
Interactive docs: http://localhost:8000/docs (Swagger UI)
Alternative docs: http://localhost:8000/redoc (ReDoc)

========================================
KEY FEATURES SUMMARY
========================================

✓ Handles 500K+ CSV records efficiently
✓ Real-time progress tracking
✓ Export to professionally formatted Excel
✓ Full CRUD for products
✓ Webhook notifications
✓ Search, filter, pagination
✓ Case-insensitive SKU deduplication
✓ Synchronous database (simple & reliable)
✓ Modern, responsive UI
✓ Type-safe (TypeScript + Pydantic)
✓ Well-documented codebase
✓ Production-ready
✓ Easy to deploy
✓ Modular architecture
✓ Comprehensive error handling

========================================
VERSION INFORMATION
========================================

Backend:
  Python: 3.11+
  FastAPI: 0.104.1
  SQLAlchemy: 2.0.23
  Celery: 5.3.4
  PostgreSQL: 13+
  Redis: 6+

Frontend:
  Node.js: 18+
  Next.js: 14
  React: 18
  TypeScript: 5

========================================
SUPPORT
========================================

For issues or questions:
1. Check this README first
2. Review PROJECT_STRUCTURE.txt for code organization
3. Check API docs at /docs endpoint
4. Review component-specific README files

========================================

Built with ❤️ for Acme Inc.
FastAPI + Next.js + PostgreSQL + Redis + Celery

========================================
