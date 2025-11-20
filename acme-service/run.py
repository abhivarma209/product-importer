"""
Backend application entry point
Run with: python run.py
"""
import uvicorn
from config import settings

if __name__ == "__main__":
    print("=" * 60)
    print("Starting Acme Product Importer Backend")
    print("=" * 60)
    print(f"Environment: {settings.environment}")
    print(f"API will be available at: http://127.0.0.1:8000")
    print(f"API docs at: http://127.0.0.1:8000/docs")
    print("=" * 60)
    
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=settings.environment == "development",
        log_level="info"
    )

