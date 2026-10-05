from fastapi import APIRouter, HTTPException

from app.services.prediction_service import (
    predict_patient,
)
from app.services.explainability_service import explain_patient


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

@router.post("/explain")
def explain(payload: dict):
    try:
        target = payload.get("target", "Cath")
        features = payload.get("features")
        if not isinstance(features, dict):
            raise ValueError("features must be an object")
        return {"success": True, "explanation": explain_patient(target, features)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
