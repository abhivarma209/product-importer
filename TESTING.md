# Testing Guide

This guide provides instructions for testing the Acme Product Importer application.

## Table of Contents

- [Setup Test Environment](#setup-test-environment)
- [Generate Test Data](#generate-test-data)
- [Manual Testing](#manual-testing)
- [API Testing](#api-testing)
- [Performance Testing](#performance-testing)
- [Troubleshooting](#troubleshooting)

---

## Setup Test Environment

### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# Check if services are running
docker-compose ps

# View logs
docker-compose logs -f web
```

### Local Development

```bash
# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Start FastAPI
uvicorn app.main:app --reload --port 8000

# In another terminal, start Celery worker
celery -A app.celery_app worker --loglevel=info
```

---

## Generate Test Data

### Create Sample CSV Files

```bash
# Generate 1,000 sample products
python SAMPLE_CSV_GENERATOR.py 1000

# Generate 10,000 products for performance testing
python SAMPLE_CSV_GENERATOR.py 10000

# Generate 50,000 products for large-scale testing
python SAMPLE_CSV_GENERATOR.py 50000
```

This will create:
- `sample_products_1k.csv` - 1,000 records
- `products_with_duplicates.csv` - ~550 records with duplicates
- `large_products.csv` - Custom size (if specified)

---

## Manual Testing

### 1. Product Management

#### Test Create Product
1. Navigate to http://localhost:8000
2. Click "Products" tab (should be default)
3. Click "+ Add Product" button
4. Fill in form:
   - SKU: TEST001
   - Name: Test Product
   - Description: This is a test product
   - Price: 29.99
   - Active: ✓
5. Click "Save"
6. Verify product appears in table

#### Test Update Product
1. Find the product you just created
2. Click "Edit" button
3. Change name to "Updated Test Product"
4. Change price to 39.99
5. Click "Save"
6. Verify changes are reflected

#### Test Delete Product
1. Find a test product
2. Click "Delete" button
3. Confirm deletion
4. Verify product is removed from table

#### Test Search and Filters
1. Create several products with different names/SKUs
2. Use search box to filter by SKU
3. Use search box to filter by name
4. Use "Active Status" dropdown
5. Verify filtering works correctly

#### Test Pagination
1. Create or upload enough products to span multiple pages
2. Click "Next" and "Previous" buttons
3. Verify page numbers update correctly
4. Verify products change on each page

### 2. CSV Upload

#### Test Small File Upload (1,000 records)
1. Click "Upload CSV" tab
2. Click "Select File" or drag-and-drop `sample_products_1k.csv`
3. Verify progress bar appears
4. Watch real-time progress updates
5. Wait for completion message
6. Go to "Products" tab
7. Verify products were imported

#### Test Duplicate SKU Handling
1. Upload `sample_products_1k.csv`
2. Wait for completion
3. Upload `products_with_duplicates.csv`
4. Verify existing SKUs are updated (not duplicated)
5. Check that total product count is correct

#### Test Large File Upload (10,000+ records)
1. Upload `large_products.csv` (10k or more records)
2. Monitor progress updates (should show current/total)
3. Verify memory usage stays reasonable
4. Wait for completion
5. Verify all products were imported

#### Test Error Handling
1. Try uploading a non-CSV file (should fail)
2. Try uploading CSV with invalid data
3. Verify error messages are clear

### 3. Bulk Delete

#### Test Bulk Delete with Confirmation
1. Ensure you have products in database
2. Click "Delete All" button
3. Verify first confirmation dialog appears
4. Click OK
5. Verify second confirmation dialog appears
6. Click OK
7. Verify all products are deleted
8. Verify success message appears

### 4. Webhooks

#### Setup Test Webhook
1. Go to https://webhook.site
2. Copy your unique webhook URL
3. Go to "Webhooks" tab in application
4. Click "+ Add Webhook"
5. Fill in form:
   - URL: (your webhook.site URL)
   - Event Type: product.created
   - Description: Test webhook
   - Enabled: ✓
6. Click "Save"

#### Test Webhook Trigger
1. Click "Test" button on webhook
2. Verify success message with response code
3. Go to webhook.site
4. Verify test payload was received

#### Test Webhook Events
1. Create a new product
2. Check webhook.site for `product.created` event
3. Update a product
4. Check for `product.updated` event
5. Delete a product
6. Check for `product.deleted` event
7. Upload CSV
8. Check for `product.imported` event

#### Test Webhook Management
1. Edit webhook (change event type)
2. Disable webhook (uncheck "Enabled")
3. Create product and verify webhook doesn't fire
4. Re-enable webhook
5. Delete webhook

---

## API Testing

### Using cURL

#### Get Products
```bash
curl http://localhost:8000/api/products
```

#### Create Product
```bash
curl -X POST http://localhost:8000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "API001",
    "name": "API Test Product",
    "description": "Created via API",
    "price": 19.99,
    "active": true
  }'
```

#### Update Product
```bash
curl -X PUT http://localhost:8000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated via API",
    "price": 29.99
  }'
```

#### Delete Product
```bash
curl -X DELETE http://localhost:8000/api/products/1
```

#### Upload CSV
```bash
curl -X POST http://localhost:8000/api/upload \
  -F "file=@sample_products_1k.csv"
```

### Using Postman

1. Import collection (or create manually)
2. Set base URL: `http://localhost:8000`
3. Test all endpoints
4. Verify responses

### Using FastAPI Docs

1. Navigate to http://localhost:8000/docs
2. Use interactive API documentation
3. Test each endpoint
4. Verify request/response schemas

---

## Performance Testing

### Test CSV Processing Speed

```python
import time
import requests

start = time.time()

# Upload CSV
with open('large_products.csv', 'rb') as f:
    response = requests.post('http://localhost:8000/api/upload', files={'file': f})

task_id = response.json()['task_id']

# Poll for completion
while True:
    status_response = requests.get(f'http://localhost:8000/api/upload/status/{task_id}')
    status = status_response.json()
    
    if status['status'] in ['completed', 'failed']:
        break
    
    print(f"Progress: {status['percentage']}%")
    time.sleep(1)

end = time.time()
print(f"\nTotal time: {end - start:.2f} seconds")
```

### Test API Response Times

```python
import time
import requests

# Test product listing
start = time.time()
response = requests.get('http://localhost:8000/api/products?limit=100')
end = time.time()
print(f"Get products: {(end - start) * 1000:.2f}ms")

# Test search
start = time.time()
response = requests.get('http://localhost:8000/api/products?search=product')
end = time.time()
print(f"Search products: {(end - start) * 1000:.2f}ms")
```

### Expected Performance

- CSV Processing: ~10,000 records/minute
- API Response: <100ms for CRUD operations
- Search with pagination: <200ms
- Concurrent uploads: Handled via Celery queue

---

## Automated Testing (Not Implemented)

### Recommended Test Structure

```python
# tests/test_products.py
def test_create_product():
    """Test product creation"""
    pass

def test_duplicate_sku():
    """Test SKU uniqueness (case-insensitive)"""
    pass

def test_product_pagination():
    """Test pagination"""
    pass

# tests/test_upload.py
def test_csv_upload():
    """Test CSV upload and processing"""
    pass

def test_duplicate_handling():
    """Test duplicate SKU handling"""
    pass

# tests/test_webhooks.py
def test_webhook_trigger():
    """Test webhook triggering"""
    pass
```

---

## Troubleshooting

### Issue: Upload Progress Not Updating

**Possible Causes:**
- Celery worker not running
- Redis connection issues

**Solutions:**
```bash
# Check Celery worker
docker-compose logs worker

# Check Redis
docker-compose exec redis redis-cli ping
```

### Issue: Products Not Appearing After Upload

**Possible Causes:**
- Database connection issues
- Task failed silently

**Solutions:**
```bash
# Check database
docker-compose exec db psql -U postgres -d fileimporter -c "SELECT COUNT(*) FROM products;"

# Check task status
docker-compose logs worker
```

### Issue: Webhook Not Triggering

**Possible Causes:**
- Webhook disabled
- Invalid URL
- Network issues

**Solutions:**
1. Verify webhook is enabled
2. Test webhook endpoint manually
3. Check application logs

---

## Test Checklist

### Functional Testing
- [ ] Create product
- [ ] Read product (single & list)
- [ ] Update product
- [ ] Delete product
- [ ] Search products
- [ ] Filter products (by status)
- [ ] Pagination works
- [ ] Upload small CSV (1k records)
- [ ] Upload large CSV (10k+ records)
- [ ] Duplicate SKU handling
- [ ] Case-insensitive SKU
- [ ] Bulk delete with confirmation
- [ ] Create webhook
- [ ] Edit webhook
- [ ] Delete webhook
- [ ] Test webhook
- [ ] Webhook triggers on events

### UI/UX Testing
- [ ] Tabs switch correctly
- [ ] Forms validate input
- [ ] Error messages display
- [ ] Success messages display
- [ ] Progress bar updates
- [ ] Modals open/close
- [ ] Responsive design works
- [ ] Loading states visible

### Performance Testing
- [ ] Upload 10k records completes in reasonable time
- [ ] Upload 50k records completes successfully
- [ ] API responds quickly (<100ms)
- [ ] Search is performant
- [ ] Pagination doesn't slow down with many records
- [ ] Multiple concurrent uploads handled

### Error Handling
- [ ] Invalid CSV file rejected
- [ ] Duplicate SKU handled correctly
- [ ] Network errors display properly
- [ ] Database errors handled gracefully
- [ ] Celery task failures reported

### Deployment Testing
- [ ] Docker compose works
- [ ] Environment variables load correctly
- [ ] Database migrations work
- [ ] Static files served correctly
- [ ] Logs are accessible

---

## Test Data Cleanup

### Clear All Data

```bash
# Using API
curl -X DELETE http://localhost:8000/api/products

# Using SQL
docker-compose exec db psql -U postgres -d fileimporter -c "TRUNCATE products, webhooks, upload_tasks RESTART IDENTITY CASCADE;"
```

### Reset Database

```bash
# Stop containers
docker-compose down -v

# Start fresh
docker-compose up -d
```

---

## Continuous Testing

For production systems, consider:

1. **Automated Testing**: Implement unit and integration tests
2. **CI/CD Pipeline**: Run tests on every commit
3. **Monitoring**: Set up application performance monitoring
4. **Load Testing**: Regular load tests with tools like Locust or JMeter
5. **Security Testing**: Regular security audits and penetration testing

---

## Support

For testing issues, check:
1. Application logs
2. Celery worker logs
3. Database logs
4. Redis logs
5. Browser console (for frontend issues)

