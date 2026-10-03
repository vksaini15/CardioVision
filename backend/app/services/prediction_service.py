from pathlib import Path

import pandas as pd
from joblib import load


# ---------------------------------------------------------
# Paths
# ---------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_DIR = PROJECT_ROOT / "saved_models"


MODEL_PATHS = {
    "Cath": MODEL_DIR / "cath_model.joblib",
    "LAD": MODEL_DIR / "lad_model.joblib",
    "LCX": MODEL_DIR / "lcx_model.joblib",
    "RCA": MODEL_DIR / "rca_model.joblib",
}


# ---------------------------------------------------------
# Model cache
# ---------------------------------------------------------

_models = {}


def get_model(target: str):
    """Load a trained model and keep it in memory."""

    if target not in MODEL_PATHS:
        raise ValueError(
            f"Unknown target: {target}"
        )

    if target not in _models:

        model_path = MODEL_PATHS[target]

        if not model_path.exists():
            raise FileNotFoundError(
                f"Model not found: {model_path}"
            )

        _models[target] = load(model_path)

    return _models[target]


# ---------------------------------------------------------
# Prediction
# ---------------------------------------------------------

def predict_patient(features: dict):

    """
    Run all four CardioVision models
    on one patient's clinical data.
    """

    patient = pd.DataFrame([features])

    results = {}

    for target in ["Cath", "LAD", "LCX", "RCA"]:

        model = get_model(target)

        prediction = int(
            model.predict(patient)[0]
        )

        probability = float(
            model.predict_proba(patient)[0][1]
        )

        results[target] = {
            "prediction": prediction,
            "probability": probability,
        }

    return results