#!/bin/bash

# Setup script for Acme Product Importer
# This script helps set up the development environment

set -e

echo "=================================================="
echo "  Acme Product Importer - Setup Script"
echo "=================================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11 or higher."
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
echo "✅ Found Python $PYTHON_VERSION"

# Check if Docker is installed
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed"
    DOCKER_INSTALLED=true
else
    echo "⚠️  Docker is not installed (optional for local development)"
    DOCKER_INSTALLED=false
fi

# Check if Docker Compose is installed
if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose is installed"
    COMPOSE_INSTALLED=true
else
    echo "⚠️  Docker Compose is not installed (optional for local development)"
    COMPOSE_INSTALLED=false
fi

echo ""
echo "Choose your setup method:"
echo "1) Docker Compose (Recommended - includes all dependencies)"
echo "2) Local Development (Requires PostgreSQL and Redis installed)"
echo ""
read -p "Enter your choice (1 or 2): " choice

if [ "$choice" == "1" ]; then
    if [ "$DOCKER_INSTALLED" = false ] || [ "$COMPOSE_INSTALLED" = false ]; then
        echo ""
        echo "❌ Docker and Docker Compose are required for this option."
        echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
        exit 1
    fi
    
    echo ""
    echo "Starting services with Docker Compose..."
    echo ""
    
    docker-compose up -d
    
    echo ""
    echo "✅ Services started successfully!"
    echo ""
    echo "Access the application at: http://localhost:8000"
    echo ""
    echo "Useful commands:"
    echo "  - View logs: docker-compose logs -f"
    echo "  - Stop services: docker-compose down"
    echo "  - Restart services: docker-compose restart"
    echo ""
    
elif [ "$choice" == "2" ]; then
    echo ""
    echo "Setting up local development environment..."
    echo ""
    
    # Create virtual environment
    if [ ! -d "venv" ]; then
        echo "Creating virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    echo "Activating virtual environment..."
    source venv/bin/activate
    
    # Install dependencies
    echo "Installing Python dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        echo ""
        echo "Creating .env file..."
        cat > .env << EOF
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fileimporter
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
ENVIRONMENT=development
EOF
        echo "✅ Created .env file with default configuration"
    else
        echo "✅ .env file already exists"
    fi
    
    # Create uploads directory
    mkdir -p uploads
    
    echo ""
    echo "✅ Local environment setup complete!"
    echo ""
    echo "⚠️  IMPORTANT: Make sure PostgreSQL and Redis are running!"
    echo ""
    echo "To start the application:"
    echo "  1. Activate virtual environment: source venv/bin/activate"
    echo "  2. Start FastAPI: uvicorn app.main:app --reload"
    echo "  3. In another terminal, start Celery: celery -A app.celery_app worker --loglevel=info"
    echo ""
    echo "Or simply run:"
    echo "  python run.py"
    echo ""
    
else
    echo "Invalid choice. Exiting."
    exit 1
fi

echo ""
echo "=================================================="
echo "  Setup Complete! 🎉"
echo "=================================================="
echo ""
echo "Next steps:"
echo "  1. Generate sample CSV: python SAMPLE_CSV_GENERATOR.py"
echo "  2. Read the quickstart guide: QUICKSTART.md"
echo "  3. Check out the API docs: http://localhost:8000/docs"
echo ""

