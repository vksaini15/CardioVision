import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.predictions import router as prediction_router
from app.services.prediction_service import check_models

app = FastAPI(
    title="CardioVision API",
    description="Cardiovascular risk prediction and visualization backend.",
    version="1.1.0",
)

raw_origins = os.getenv("CORS_ORIGINS", "*")
origins = [item.strip() for item in raw_origins.split(",") if item.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prediction_router)


@app.get("/")
def root():
    return {
        "message": "CardioVision API is running",
        "service": "prediction-backend",
        "version": app.version,
    }


@app.get("/health")
def health():
    models = check_models()
    ready = all(item.get("ready") for item in models.values())
    return {
        "status": "healthy" if ready else "degraded",
        "models_ready": ready,
        "models": models,
    }
