from fastapi import FastAPI

from app.api.predictions import router as prediction_router


app = FastAPI(
    title="CardioVision API",
    description=(
        "Cardiovascular risk prediction "
        "and visualization backend."
    ),
    version="1.0.0",
)


app.include_router(
    prediction_router
)


@app.get("/")
def root():

    return {
        "message": "CardioVision API is running"
    }


@app.get("/health")
def health():

    return {
        "status": "healthy"
    }