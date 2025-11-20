import uvicorn
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from pathlib import Path

from config import settings
from dependencies.database import init_db
from routes import products, upload, webhooks

# Create uploads directory
Path(settings.upload_dir).mkdir(exist_ok=True)


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers
    app.include_router(products.router)
    app.include_router(upload.router)
    app.include_router(webhooks.router)

    return app


app = create_app()


@app.on_event("startup")
def startup_event():
    """Initialize database on startup"""
    init_db()


@app.get("/")
def welcome_user():
    return {
        "message": "Acme Product Importer API",
        "version": settings.app_version,
        "docs": "/docs"
    }


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "Product Importer API"}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )
