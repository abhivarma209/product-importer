====================================
ACME PRODUCT IMPORTER - FRONTEND
====================================

Next.js + React frontend application

STRUCTURE:
----------
frontend/
├── app/
│   ├── page.tsx              # Main page with tabs
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── ProductsTab.tsx       # Products management
│   ├── ProductModal.tsx      # Product form
│   ├── UploadTab.tsx         # CSV upload interface
│   ├── WebhooksTab.tsx       # Webhooks management
│   ├── WebhookModal.tsx      # Webhook form
│   └── Toast.tsx             # Notifications
├── lib/
│   └── api.ts                # API client (axios)
├── types/
│   └── index.ts              # TypeScript types
├── package.json              # Dependencies
└── tsconfig.json             # TypeScript config

PREREQUISITES:
--------------
- Node.js 18+
- npm or yarn
- Backend running on http://localhost:8000

SETUP:
------
1. Install dependencies:
   npm install

   OR

   yarn install

2. Backend API URL is configured in .env.local:
   NEXT_PUBLIC_API_URL=http://localhost:8000

RUN:
----
Development:
   npm run dev

   OR

   yarn dev

Production:
   npm run build
   npm run start

Application will be available at: http://localhost:3000

FEATURES:
---------
✓ Product management (CRUD)
✓ CSV file upload with real-time progress
✓ Webhook configuration and testing
✓ Search and filter products
✓ Pagination
✓ Responsive design
✓ TypeScript for type safety
✓ Modern React with hooks

USAGE:
------
1. Products Tab:
   - View all products
   - Search by SKU or name
   - Filter by active status
   - Create/Edit/Delete products
   - Bulk delete all products

2. Upload CSV Tab:
   - Drag and drop CSV file
   - Real-time progress bar
   - See processing status
   - View total/processed rows

3. Webhooks Tab:
   - Configure webhooks
   - Test webhook endpoints
   - Enable/disable webhooks
   - View webhook status

INTEGRATION:
------------
The frontend communicates with the backend via REST API:
- API client: lib/api.ts
- Backend URL: http://localhost:8000
- CORS is configured in backend to accept requests

Make sure backend is running before starting frontend!

