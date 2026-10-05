from pathlib import Path
import os

import pandas as pd
from joblib import load


PROJECT_ROOT = Path(__file__).resolve().parents[2]
MODEL_DIR = PROJECT_ROOT / "saved_models"

MODEL_PATHS = {
    "Cath": MODEL_DIR / "cath_model.joblib",
    "LAD": MODEL_DIR / "lad_model.joblib",
    "LCX": MODEL_DIR / "lcx_model.joblib",
    "RCA": MODEL_DIR / "rca_model.joblib",
}

TARGETS = ("Cath", "LAD", "LCX", "RCA")

# Exact feature schema used to train the saved pipelines.
# Exertional CP was intentionally removed during training because it is constant.
MODEL_FEATURES = (
    "Age", "Weight", "Length", "Sex", "BMI", "DM", "HTN",
    "Current Smoker", "EX-Smoker", "FH", "Obesity", "CRF", "CVA",
    "Airway disease", "Thyroid Disease", "CHF", "DLP", "BP", "PR",
    "Edema", "Weak Peripheral Pulse", "Lung rales", "Systolic Murmur",
    "Diastolic Murmur", "Typical Chest Pain", "Dyspnea", "Function Class",
    "Atypical", "Nonanginal", "LowTH Ang", "Q Wave", "St Elevation",
    "St Depression", "Tinversion", "LVH", "Poor R Progression", "BBB",
    "FBS", "CR", "TG", "LDL", "HDL", "BUN", "ESR", "HB", "K", "Na",
    "WBC", "Lymph", "Neut", "PLT", "EF-TTE", "Region RWMA", "VHD",
)

_models = {}


def validate_features(features: dict) -> dict:
    if not isinstance(features, dict):
        raise ValueError("Prediction input must be a JSON object.")

    missing = [name for name in MODEL_FEATURES if name not in features]
    if missing:
        raise ValueError(
            "Missing model inputs: " + ", ".join(missing)
        )

    forbidden = {"Cath", "LAD", "LCX", "RCA", "Exertional CP"}
    leaked = sorted(forbidden.intersection(features))
    if leaked:
        raise ValueError(
            "Target leakage detected. These fields must not be sent as model inputs: "
            + ", ".join(leaked)
        )

    # Keep only the exact columns the trained pipeline expects.
    cleaned = {name: features[name] for name in MODEL_FEATURES}

    # Normalize known categorical spellings.
    if cleaned["Sex"] == "Fmale":
        cleaned["Sex"] = "Female"
    if cleaned["VHD"] == "mild":
        cleaned["VHD"] = "Mild"

    return cleaned


def get_model(target: str):
    if target not in MODEL_PATHS:
        raise ValueError(f"Unknown target: {target}")

    if target not in _models:
        model_path = MODEL_PATHS[target]
        if not model_path.exists():
            raise FileNotFoundError(f"Model not found: {model_path}")
        _models[target] = load(model_path)

    return _models[target]


def check_models():
    status = {}
    for target in TARGETS:
        try:
            model = get_model(target)
            status[target] = {
                "ready": True,
                "model_type": type(model.named_steps["model"]).__name__
                if hasattr(model, "named_steps") and "model" in model.named_steps
                else type(model).__name__,
            }
        except Exception as exc:
            status[target] = {"ready": False, "error": str(exc)}
    return status


def predict_patient(features: dict):
    cleaned = validate_features(features)
    patient = pd.DataFrame([cleaned])

    results = {}

    for target in TARGETS:
        model = get_model(target)

        prediction = int(model.predict(patient)[0])
        probabilities = model.predict_proba(patient)[0]

        # Saved training pipelines use 0=negative, 1=positive.
        classes = list(getattr(model, "classes_", [0, 1]))
        if 1 not in classes:
            raise ValueError(f"Model for {target} does not contain positive class 1.")
        positive_probability = float(probabilities[classes.index(1)])

        results[target] = {
            "prediction": prediction,
            "probability": positive_probability,
        }

    return results
