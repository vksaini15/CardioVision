from fastapi import APIRouter, HTTPException

from app.services.prediction_service import predict_patient

router = APIRouter(prefix="/api", tags=["Predictions"])


@router.post("/predict")
def predict(features: dict):
    try:
        results = predict_patient(features)
        return {"success": True, "predictions": results}
    except (ValueError, FileNotFoundError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        # Do not expose a traceback or internal file paths to the browser.
        raise HTTPException(
            status_code=500,
            detail="Prediction service failed. Check backend logs.",
        ) from exc
