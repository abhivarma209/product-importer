# ⚡ Quick Start Guide

Get the Acme Product Importer up and running in 5 minutes!

## 🚀 Fastest Way: Docker Compose

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd FileImporter

# 2. Start everything
docker-compose up -d

# 3. Open your browser
# Navigate to: http://localhost:8000
```

That's it! The application is now running with:
- FastAPI web server on port 8000
- PostgreSQL database
- Redis for task queue
- Celery worker for background processing

---

## 🔍 Verify Installation

```bash
# Check if all services are running
docker-compose ps

# View logs
docker-compose logs -f web

# Check health
curl http://localhost:8000/api/health
```

Expected response:
```json
{"status": "healthy", "service": "Product Importer API"}
```

---

## 📝 Your First Test

### 1. Create a Test Product

1. Open http://localhost:8000
2. Click "+ Add Product"
3. Fill in:
   - SKU: `TEST001`
   - Name: `My First Product`
   - Price: `29.99`
4. Click "Save"

### 2. Upload a CSV File

```bash
# Generate sample CSV
python SAMPLE_CSV_GENERATOR.py

# This creates: sample_products_1k.csv
```

1. Click "Upload CSV" tab
2. Select `sample_products_1k.csv`
3. Watch the progress bar
4. Wait for "Import completed successfully!"

### 3. Setup a Test Webhook

1. Go to https://webhook.site
2. Copy your unique URL
3. Click "Webhooks" tab
4. Click "+ Add Webhook"
5. Paste URL, select event type
6. Click "Test" to verify

---

## 🎯 Common Tasks

### View API Documentation
```
http://localhost:8000/docs
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# Web server
docker-compose logs -f web

# Celery worker
docker-compose logs -f worker

# All services
docker-compose logs -f
```

### Reset Database
```bash
docker-compose down -v
docker-compose up -d
```

### Access Database
```bash
docker-compose exec db psql -U postgres -d fileimporter
```

---

## 🐛 Troubleshooting

### Application won't start?

```bash
# Check Docker is running
docker --version

# Check ports aren't in use
lsof -i :8000  # On macOS/Linux
netstat -ano | findstr :8000  # On Windows

# Restart services
docker-compose restart
```

### Can't upload CSV?

```bash
# Check Celery worker is running
docker-compose logs worker

# Check Redis is accessible
docker-compose exec redis redis-cli ping
```

### Database errors?

```bash
# Check database is running
docker-compose exec db psql -U postgres -c "SELECT 1"

# View database logs
docker-compose logs db
```

---

## 📚 Next Steps

1. **Read the full [README.md](README.md)** for detailed information
2. **Check [DEPLOYMENT.md](DEPLOYMENT.md)** to deploy to production
3. **See [TESTING.md](TESTING.md)** for comprehensive testing guide
4. **Review [API Documentation](http://localhost:8000/docs)** for API details

---

## 💡 Pro Tips

### Generate Large Test Data
```bash
# Generate 50,000 products for performance testing
python SAMPLE_CSV_GENERATOR.py 50000
```

### Monitor Processing
```bash
# Watch Celery worker in real-time
docker-compose logs -f worker
```

### Quick Data Cleanup
```bash
# Delete all products via API
curl -X DELETE http://localhost:8000/api/products
```

### Development Mode
```bash
# Run with hot-reload (code changes auto-reload)
docker-compose up
# (without -d flag to see logs in terminal)
```

---

## 🎓 Understanding the Flow

1. **Upload CSV** → File saved to disk
2. **Create Task** → Task record created in DB
3. **Celery Worker** → Processes CSV in background
4. **Progress Updates** → Frontend polls for status
5. **Bulk Import** → Efficient batch insert/update
6. **Webhook Trigger** → Notifies external systems
7. **Completion** → User sees success message

---

## 🔗 Key URLs

| Service | URL |
|---------|-----|
| Application | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |
| Health Check | http://localhost:8000/api/health |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

---

## 🆘 Need Help?

1. Check the logs: `docker-compose logs -f`
2. Review [README.md](README.md)
3. See [TROUBLESHOOTING](#troubleshooting) above
4. Check [TESTING.md](TESTING.md)

---

**Ready to deploy to production?** → See [DEPLOYMENT.md](DEPLOYMENT.md)

**Want to contribute?** → Code is clean, documented, and ready for extension!

---

🎉 **Happy importing!**

