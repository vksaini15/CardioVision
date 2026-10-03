from fastapi import APIRouter, HTTPException

from app.services.prediction_service import (
    predict_patient,
)


router = APIRouter(
    prefix="/api",
    tags=["Predictions"],
)


@router.post("/predict")
def predict(features: dict):

    try:

        results = predict_patient(
            features
        )

        return {
            "success": True,
            "predictions": results,
        }

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )