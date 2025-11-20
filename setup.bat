@echo off
REM Setup script for Acme Product Importer (Windows)
REM This script helps set up the development environment

echo ==================================================
echo   Acme Product Importer - Setup Script
echo ==================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo X Python is not installed. Please install Python 3.11 or higher.
    exit /b 1
)

for /f "tokens=2" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo + Found Python %PYTHON_VERSION%

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo + Docker is installed
    set DOCKER_INSTALLED=true
) else (
    echo ! Docker is not installed (optional for local development)
    set DOCKER_INSTALLED=false
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% equ 0 (
    echo + Docker Compose is installed
    set COMPOSE_INSTALLED=true
) else (
    echo ! Docker Compose is not installed (optional for local development)
    set COMPOSE_INSTALLED=false
)

echo.
echo Choose your setup method:
echo 1) Docker Compose (Recommended - includes all dependencies)
echo 2) Local Development (Requires PostgreSQL and Redis installed)
echo.
set /p choice="Enter your choice (1 or 2): "

if "%choice%"=="1" (
    if "%DOCKER_INSTALLED%"=="false" (
        echo.
        echo X Docker is required for this option.
        echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
        exit /b 1
    )
    
    echo.
    echo Starting services with Docker Compose...
    echo.
    
    docker-compose up -d
    
    echo.
    echo + Services started successfully!
    echo.
    echo Access the application at: http://localhost:8000
    echo.
    echo Useful commands:
    echo   - View logs: docker-compose logs -f
    echo   - Stop services: docker-compose down
    echo   - Restart services: docker-compose restart
    echo.
    
) else if "%choice%"=="2" (
    echo.
    echo Setting up local development environment...
    echo.
    
    REM Create virtual environment
    if not exist "venv" (
        echo Creating virtual environment...
        python -m venv venv
    )
    
    REM Activate virtual environment
    echo Activating virtual environment...
    call venv\Scripts\activate
    
    REM Install dependencies
    echo Installing Python dependencies...
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    
    REM Create .env file if it doesn't exist
    if not exist ".env" (
        echo.
        echo Creating .env file...
        (
            echo DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fileimporter
            echo REDIS_URL=redis://localhost:6379/0
            echo CELERY_BROKER_URL=redis://localhost:6379/0
            echo CELERY_RESULT_BACKEND=redis://localhost:6379/0
            echo SECRET_KEY=change-this-in-production
            echo ENVIRONMENT=development
        ) > .env
        echo + Created .env file with default configuration
    ) else (
        echo + .env file already exists
    )
    
    REM Create uploads directory
    if not exist "uploads" mkdir uploads
    
    echo.
    echo + Local environment setup complete!
    echo.
    echo ! IMPORTANT: Make sure PostgreSQL and Redis are running!
    echo.
    echo To start the application:
    echo   1. Activate virtual environment: venv\Scripts\activate
    echo   2. Start FastAPI: uvicorn app.main:app --reload
    echo   3. In another terminal, start Celery: celery -A app.celery_app worker --loglevel=info
    echo.
    echo Or simply run:
    echo   python run.py
    echo.
    
) else (
    echo Invalid choice. Exiting.
    exit /b 1
)

echo.
echo ==================================================
echo   Setup Complete!
echo ==================================================
echo.
echo Next steps:
echo   1. Generate sample CSV: python SAMPLE_CSV_GENERATOR.py
echo   2. Read the quickstart guide: QUICKSTART.md
echo   3. Check out the API docs: http://localhost:8000/docs
echo.

pause

