========================================
ACME PRODUCT IMPORTER
========================================

A scalable web application for importing and managing products from CSV files.

Two separate applications:
1. Backend - FastAPI (Python) with Celery
2. Frontend - Next.js + React (TypeScript)

========================================
PROJECT STRUCTURE
========================================

FileImporter/
├── backend/                   # FastAPI backend application
│   ├── app/
│   │   ├── routes/            # API route modules
│   │   │   ├── products.py    # Product endpoints
│   │   │   ├── upload.py      # Upload endpoints
│   │   │   └── webhooks.py    # Webhook endpoints
│   │   ├── main.py            # FastAPI app
│   │   ├── models.py          # Database models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── database.py        # Database connection
│   │   ├── config.py          # Configuration
│   │   ├── celery_app.py      # Celery config
│   │   └── tasks.py           # Async tasks
│   ├── uploads/               # CSV upload directory
│   ├── requirements.txt       # Python dependencies
│   ├── run.py                 # Backend entry point
│   └── README.txt             # Backend documentation
│
├── frontend/                  # Next.js frontend application
│   ├── app/                   # Next.js app directory
│   │   ├── page.tsx           # Main page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── ProductsTab.tsx    # Product management
│   │   ├── UploadTab.tsx      # CSV upload
│   │   └── WebhooksTab.tsx    # Webhook management
│   ├── lib/
│   │   └── api.ts             # API client
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   ├── package.json           # Node dependencies
│   └── README.txt             # Frontend documentation
│
├── .gitignore                 # Git ignore rules
└── README.txt                 # This file

========================================
QUICK START
========================================

STEP 1: Setup Backend
----------------------
cd backend
pip install -r requirements.txt

Edit app/config.py (line 6):
  database_url: str = "postgresql://your_user:your_password@localhost:5432/your_db"

STEP 2: Run Backend (2 terminals)
----------------------------------
Terminal 1 - API Server:
  cd backend
  python run.py

Terminal 2 - Celery Worker:
  cd backend
  celery -A app.celery_app worker --loglevel=info

Backend API: http://localhost:8000
API Docs: http://localhost:8000/docs

STEP 3: Setup & Run Frontend
-----------------------------
Terminal 3:
  cd frontend
  npm install
  npm run dev

Frontend: http://localhost:3000

========================================
REQUIREMENTS
========================================

Backend:
  - Python 3.11+
  - PostgreSQL (localhost:5432)
  - Redis (localhost:6379)

Frontend:
  - Node.js 18+
  - npm or yarn

========================================
FEATURES
========================================

✓ Product Management
  - Create, read, update, delete products
  - Search and filter
  - Pagination
  - Bulk delete

✓ CSV Import
  - Upload CSV files (up to 500K+ records)
  - Real-time progress tracking
  - Async processing with Celery
  - Case-insensitive SKU deduplication

✓ Webhooks
  - Configure webhook endpoints
  - Multiple event types
  - Test webhook functionality
  - Enable/disable webhooks

✓ Modern Tech Stack
  - FastAPI REST API
  - Next.js + React frontend
  - TypeScript for type safety
  - SQLAlchemy ORM
  - PostgreSQL database
  - Redis message broker

========================================
API ENDPOINTS
========================================

Products:
  GET    /api/products         - List products (paginated)
  POST   /api/products         - Create product
  GET    /api/products/{id}    - Get product
  PUT    /api/products/{id}    - Update product
  DELETE /api/products/{id}    - Delete product
  DELETE /api/products         - Bulk delete all

Upload:
  POST   /api/upload           - Upload CSV file
  GET    /api/upload/status/{id} - Get upload progress

Webhooks:
  GET    /api/webhooks         - List webhooks
  POST   /api/webhooks         - Create webhook
  PUT    /api/webhooks/{id}    - Update webhook
  DELETE /api/webhooks/{id}    - Delete webhook
  POST   /api/webhooks/{id}/test - Test webhook

========================================
TESTING
========================================

Generate test CSV file:
  cd backend
  python SAMPLE_CSV_GENERATOR.py

This creates:
  - sample_products_1k.csv (1,000 records)
  - products_with_duplicates.csv

Upload these files via the frontend UI.

========================================
ARCHITECTURE
========================================

Frontend (localhost:3000)
    ↓ HTTP REST API
Backend API (localhost:8000)
    ↓
PostgreSQL (localhost:5432)
    ↓
Celery Worker ← Redis (localhost:6379)

- Frontend makes API calls to backend
- Backend processes requests
- Long-running CSV uploads handled by Celery
- Real-time progress via polling

========================================
INTEGRATION
========================================

Frontend → Backend:
  - API client: frontend/lib/api.ts
  - Base URL: http://localhost:8000
  - Uses axios for HTTP requests
  - CORS configured in backend

Backend → Frontend:
  - CORS allows localhost:3000
  - REST API responses
  - Real-time progress updates

========================================
DEVELOPMENT
========================================

Backend (FastAPI):
  - Hot reload: python run.py
  - API docs: http://localhost:8000/docs
  - Route structure in app/routes/

Frontend (Next.js):
  - Hot reload: npm run dev
  - TypeScript strict mode
  - Component-based architecture

========================================
PRODUCTION
========================================

Backend:
  - Configure environment variables
  - Set production database URL
  - Configure CORS for production domain
  - Deploy with gunicorn or uvicorn workers

Frontend:
  - npm run build
  - npm run start
  - Update API URL in .env.local
  - Deploy to Vercel, Netlify, or similar

========================================
DOCUMENTATION
========================================

For detailed information:
  - Backend: backend/README.txt
  - Frontend: frontend/README.txt
  - API Docs: http://localhost:8000/docs (when running)

========================================
TROUBLESHOOTING
========================================

Backend won't start:
  ✓ Check PostgreSQL is running
  ✓ Check Redis is running
  ✓ Verify database credentials in app/config.py

Frontend can't connect:
  ✓ Ensure backend is running on port 8000
  ✓ Check .env.local has correct API URL
  ✓ Verify CORS is configured

CSV upload not processing:
  ✓ Check Celery worker is running
  ✓ Check Redis is accessible
  ✓ View Celery worker logs for errors

========================================
SUPPORT
========================================

Check the README files in backend/ and frontend/ folders for detailed documentation.

========================================
