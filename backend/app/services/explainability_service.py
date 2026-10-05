from functools import lru_cache

import pandas as pd

from app.ml.preprocessing import prepare_data, TARGET_COLUMNS
from app.services.prediction_service import get_model


@lru_cache(maxsize=4)
def _reference_values(target: str):
    X, _ = prepare_data(target)
    refs = {}
    for column in X.columns:
        series = X[column]
        if pd.api.types.is_numeric_dtype(series):
            refs[column] = float(series.median())
        else:
            mode = series.mode(dropna=True)
            refs[column] = str(mode.iloc[0]) if not mode.empty else str(series.iloc[0])
    return refs


def _coerce_patient_features(features: dict, X_template: pd.DataFrame) -> pd.DataFrame:
    """Normalize browser JSON values to the same dtypes used during training."""
    patient = pd.DataFrame([features])
    missing = [column for column in X_template.columns if column not in patient.columns]
    if missing:
        raise ValueError(f"Missing model inputs: {', '.join(missing)}")

    patient = patient[X_template.columns].copy()

    numeric_columns = X_template.select_dtypes(include=["number"]).columns
    categorical_columns = X_template.select_dtypes(
        include=["object", "category", "string"]
    ).columns

    for column in numeric_columns:
        # Browser form values may arrive as strings or floats. Normalize both.
        patient[column] = pd.to_numeric(patient[column], errors="coerce")
        if patient[column].isna().any():
            raise ValueError(f"Invalid numeric value for model input '{column}'")

    for column in categorical_columns:
        # Keep categorical values as strings. This fixes JSON values such as 0.0
        # being passed into a string feature by the explainability endpoint.
        patient[column] = patient[column].map(
            lambda value: str(value) if pd.notna(value) else value
        )
        if patient[column].isna().any():
            raise ValueError(f"Missing categorical value for model input '{column}'")

    return patient


def _display_value(value):
    if isinstance(value, float):
        return f"{value:.3f}".rstrip("0").rstrip(".")
    return str(value)


def explain_patient(target: str, features: dict, top_n: int = 8):
    if target not in TARGET_COLUMNS:
        raise ValueError(f"Unknown target: {target}")

    model = get_model(target)
    X_template, _ = prepare_data(target)
    reference = _reference_values(target)

    patient = _coerce_patient_features(features, X_template)
    baseline_probability = float(model.predict_proba(patient)[0][1])

    impacts = []
    for column in X_template.columns:
        original = patient.iloc[0][column]
        ref = reference[column]

        # Compare normalized values without turning numeric values into strings.
        same_value = (
            float(original) == float(ref)
            if pd.api.types.is_numeric_dtype(X_template[column])
            else str(original) == str(ref)
        )
        if same_value:
            continue

        counterfactual = patient.copy()
        counterfactual.at[counterfactual.index[0], column] = ref
        counterfactual_probability = float(model.predict_proba(counterfactual)[0][1])
        impact = baseline_probability - counterfactual_probability

        impacts.append({
            "feature": column,
            "value": _display_value(original),
            "reference_value": _display_value(ref),
            "impact": float(impact),
            "direction": (
                "increases risk"
                if impact > 0
                else "decreases risk"
                if impact < 0
                else "minimal impact"
            ),
        })

    impacts.sort(key=lambda item: abs(item["impact"]), reverse=True)

    return {
        "target": target,
        "model": type(model.named_steps["model"]).__name__,
        "baseline_probability": baseline_probability,
        "method": "local one-feature perturbation",
        "note": "Impact is the change in model probability when one patient feature is replaced by the training-data reference value. It is an interpretability aid, not a causal effect or diagnosis.",
        "features": impacts[:top_n],
    }
