# 🚀 Deployment Guide

This guide provides detailed instructions for deploying the Acme Product Importer to various platforms.

## Table of Contents

- [Heroku Deployment](#heroku-deployment)
- [Render Deployment](#render-deployment)
- [AWS Deployment](#aws-deployment)
- [DigitalOcean Deployment](#digitalocean-deployment)
- [Local Docker Deployment](#local-docker-deployment)

---

## Heroku Deployment

### Prerequisites
- Heroku CLI installed
- Git repository initialized

### Step-by-Step Instructions

1. **Login to Heroku**
```bash
heroku login
```

2. **Create Heroku Application**
```bash
heroku create acme-product-importer
```

3. **Add PostgreSQL Database**
```bash
heroku addons:create heroku-postgresql:mini
```

4. **Add Redis**
```bash
heroku addons:create heroku-redis:mini
```

5. **Set Environment Variables**
```bash
heroku config:set SECRET_KEY=$(openssl rand -hex 32)
heroku config:set ENVIRONMENT=production
```

6. **Deploy Application**
```bash
git push heroku main
```

7. **Scale Workers**
```bash
heroku ps:scale web=1 worker=1
```

8. **View Logs**
```bash
heroku logs --tail
```

9. **Open Application**
```bash
heroku open
```

### Important Notes for Heroku

- **Request Timeout**: Heroku has a 30-second timeout for web requests. Our CSV upload is handled asynchronously via Celery, so this isn't an issue.
- **Dyno Sleep**: Free dynos sleep after 30 minutes of inactivity. Use paid dynos for production.
- **Database Limits**: Mini PostgreSQL has 10,000 row limit. Upgrade for larger datasets.
- **Redis Limits**: Mini Redis has 25MB memory. Upgrade if needed.

### Heroku Environment Variables

The following environment variables are automatically set by Heroku add-ons:
- `DATABASE_URL` - Set by heroku-postgresql
- `REDIS_URL` - Set by heroku-redis

You need to manually set:
- `SECRET_KEY` - Application secret key
- `ENVIRONMENT` - Set to "production"

---

## Render Deployment

### Prerequisites
- Render account
- GitHub/GitLab repository

### Step-by-Step Instructions

1. **Create PostgreSQL Database**
   - Go to Render Dashboard
   - New → PostgreSQL
   - Choose free tier
   - Note the Internal Database URL

2. **Create Redis Instance**
   - Go to Render Dashboard
   - New → Redis
   - Choose free tier
   - Note the Internal Redis URL

3. **Create Web Service**
   - Go to Render Dashboard
   - New → Web Service
   - Connect your GitHub repository
   - Configuration:
     - **Name**: acme-product-importer
     - **Environment**: Python 3
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Create Background Worker**
   - Go to Render Dashboard
   - New → Background Worker
   - Connect same repository
   - Configuration:
     - **Name**: acme-product-importer-worker
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `celery -A app.celery_app worker --loglevel=info`

5. **Set Environment Variables** (for both Web Service and Worker)
   ```
   DATABASE_URL=<your-postgres-internal-url>
   REDIS_URL=<your-redis-internal-url>
   CELERY_BROKER_URL=<your-redis-internal-url>
   CELERY_RESULT_BACKEND=<your-redis-internal-url>
   SECRET_KEY=<generate-random-key>
   ENVIRONMENT=production
   ```

6. **Deploy**
   - Render will automatically deploy when you push to your repository

### Important Notes for Render

- **Free Tier**: Services spin down after 15 minutes of inactivity
- **Database Backups**: Not available on free tier
- **Health Checks**: Configure health check endpoint: `/api/health`

---

## AWS Deployment

### Using AWS ECS (Elastic Container Service)

1. **Build and Push Docker Image**

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t acme-product-importer .

# Tag image
docker tag acme-product-importer:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/acme-product-importer:latest

# Push image
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/acme-product-importer:latest
```

2. **Create RDS PostgreSQL Database**
   - Use AWS RDS Console
   - Choose PostgreSQL 15
   - Note the connection details

3. **Create ElastiCache Redis**
   - Use AWS ElastiCache Console
   - Choose Redis
   - Note the connection endpoint

4. **Create ECS Task Definition**
   - Create two task definitions: one for web, one for worker
   - Configure environment variables
   - Set appropriate CPU and memory

5. **Create ECS Service**
   - Deploy web service with Application Load Balancer
   - Deploy worker service without load balancer

6. **Configure Security Groups**
   - Allow inbound traffic on port 80/443 for web service
   - Allow web and worker services to access RDS and Redis

### Using AWS Elastic Beanstalk

1. Install EB CLI:
```bash
pip install awsebcli
```

2. Initialize:
```bash
eb init -p python-3.11 acme-product-importer
```

3. Create environment:
```bash
eb create production-env
```

4. Add RDS and Redis (ElastiCache) through AWS Console

---

## DigitalOcean Deployment

### Using DigitalOcean App Platform

1. **Create App**
   - Go to DigitalOcean Dashboard
   - Apps → Create App
   - Connect GitHub repository

2. **Configure Components**

   **Web Service**:
   - Type: Web Service
   - Run Command: `uvicorn app.main:app --host 0.0.0.0 --port 8080`
   - HTTP Port: 8080

   **Worker Service**:
   - Type: Worker
   - Run Command: `celery -A app.celery_app worker --loglevel=info`

3. **Add Databases**
   - Add PostgreSQL database
   - Add Redis database

4. **Set Environment Variables**
   ```
   DATABASE_URL=${db.DATABASE_URL}
   REDIS_URL=${redis.DATABASE_URL}
   CELERY_BROKER_URL=${redis.DATABASE_URL}
   CELERY_RESULT_BACKEND=${redis.DATABASE_URL}
   SECRET_KEY=<generate-random-key>
   ENVIRONMENT=production
   ```

5. **Deploy**
   - DigitalOcean will build and deploy automatically

---

## Local Docker Deployment

### For Testing/Development

1. **Start All Services**
```bash
docker-compose up -d
```

2. **View Logs**
```bash
docker-compose logs -f
```

3. **Stop Services**
```bash
docker-compose down
```

4. **Rebuild After Changes**
```bash
docker-compose up -d --build
```

### For Production (Docker Swarm or Kubernetes)

1. **Docker Swarm**
```bash
docker stack deploy -c docker-compose.yml acme-stack
```

2. **Kubernetes**
   - Create Kubernetes manifests
   - Use Helm charts for easier management
   - Configure persistent volumes for database

---

## Post-Deployment Checklist

- [ ] Application is accessible via URL
- [ ] Database connection is working
- [ ] Redis connection is working
- [ ] Celery worker is running
- [ ] File upload works
- [ ] CSV processing works
- [ ] Webhooks can be created and tested
- [ ] All CRUD operations work
- [ ] Error handling works correctly
- [ ] Logs are accessible
- [ ] Environment variables are set correctly
- [ ] SSL/HTTPS is configured (production)
- [ ] Monitoring is set up (optional)
- [ ] Backups are configured (production)

---

## Troubleshooting

### Common Issues

**Issue**: Application doesn't start
- Check logs for error messages
- Verify all environment variables are set
- Ensure database and Redis are accessible

**Issue**: Celery worker not processing tasks
- Verify Redis connection
- Check worker logs
- Ensure worker process is running

**Issue**: Database connection errors
- Verify DATABASE_URL is correct
- Check database server is running
- Ensure firewall allows connections

**Issue**: 502 Bad Gateway
- Application might not be listening on correct port
- Check application logs
- Verify port configuration matches platform requirements

---

## Monitoring and Maintenance

### Recommended Monitoring

1. **Application Performance Monitoring (APM)**
   - Sentry for error tracking
   - New Relic or DataDog for performance

2. **Logging**
   - Centralized logging with ELK stack or CloudWatch
   - Log aggregation for easier debugging

3. **Uptime Monitoring**
   - Use services like UptimeRobot or Pingdom
   - Monitor `/api/health` endpoint

4. **Database Monitoring**
   - Monitor query performance
   - Set up alerts for slow queries
   - Regular backups

### Maintenance Tasks

- Regular database backups
- Monitor disk space usage
- Update dependencies regularly
- Review and rotate logs
- Scale resources as needed
- Review error logs and fix issues

---

## Security Best Practices

1. **Use HTTPS in production**
2. **Keep SECRET_KEY secure and rotate regularly**
3. **Use environment variables for sensitive data**
4. **Enable database encryption at rest**
5. **Use VPC/private networks for database connections**
6. **Implement rate limiting**
7. **Keep dependencies updated**
8. **Regular security audits**

---

## Support

For deployment issues or questions, please refer to:
- Platform-specific documentation
- Application logs
- GitHub Issues (if applicable)

