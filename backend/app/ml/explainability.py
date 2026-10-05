from pathlib import Path

import numpy as np
import pandas as pd
import shap
from joblib import load

from app.ml.preprocessing import (
    TARGET_COLUMNS,
    prepare_data,
)


# ---------------------------------------------------------
# Paths
# ---------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_DIR = PROJECT_ROOT / "saved_models"


# ---------------------------------------------------------
# Model paths
# ---------------------------------------------------------

MODEL_PATHS = {
    "Cath": MODEL_DIR / "cath_model.joblib",
    "LAD": MODEL_DIR / "lad_model.joblib",
    "LCX": MODEL_DIR / "lcx_model.joblib",
    "RCA": MODEL_DIR / "rca_model.joblib",
}


# ---------------------------------------------------------
# Load model
# ---------------------------------------------------------

def load_model(target: str):
    """Load the saved CardioVision pipeline."""

    if target not in TARGET_COLUMNS:
        raise ValueError(
            f"Invalid target '{target}'. "
            f"Choose from {TARGET_COLUMNS}"
        )

    model_path = MODEL_PATHS[target]

    if not model_path.exists():
        raise FileNotFoundError(
            f"Model not found: {model_path}"
        )

    return load(model_path)


# ---------------------------------------------------------
# Get transformed feature names
# ---------------------------------------------------------

def get_feature_names(pipeline):
    """
    Get feature names after ColumnTransformer preprocessing.
    """

    preprocessor = pipeline.named_steps["preprocessor"]

    feature_names = preprocessor.get_feature_names_out()

    return list(feature_names)


# ---------------------------------------------------------
# Explain Random Forest model
# ---------------------------------------------------------

def explain_tree_model(
    pipeline,
    X,
    top_n=10,
):
    """
    Generate SHAP explanations for a tree-based model.
    """

    preprocessor = pipeline.named_steps["preprocessor"]
    model = pipeline.named_steps["model"]

    X_transformed = preprocessor.transform(X)

    feature_names = get_feature_names(pipeline)

    explainer = shap.TreeExplainer(model)

    shap_values = explainer.shap_values(X_transformed)

    # SHAP versions can return either:
    #   list[class][sample][feature]
    # or:
    #   array[sample][feature][class]
    if isinstance(shap_values, list):
        values = shap_values[1]
    else:
        values = shap_values

        if values.ndim == 3:
            values = values[:, :, 1]

    explanations = []

    for row_index in range(len(X)):
        row_values = values[row_index]

        ranked_indices = np.argsort(
            np.abs(row_values)
        )[::-1][:top_n]

        features = []

        for index in ranked_indices:

            contribution = float(row_values[index])

            features.append({
                "feature": feature_names[index],
                "value": str(
                    X_transformed[row_index, index]
                ),
                "contribution": contribution,
                "direction": (
                    "increases risk"
                    if contribution > 0
                    else "decreases risk"
                ),
            })

        explanations.append(features)

    return explanations


# ---------------------------------------------------------
# Explain one patient
# ---------------------------------------------------------

def explain_patient(
    target: str,
    patient_index: int = 0,
    top_n: int = 10,
):
    """
    Generate SHAP explanation for one dataset patient.
    """

    X, _ = prepare_data(target)

    if patient_index < 0 or patient_index >= len(X):
        raise IndexError(
            f"patient_index must be between "
            f"0 and {len(X) - 1}"
        )

    pipeline = load_model(target)

    model_name = type(
        pipeline.named_steps["model"]
    ).__name__

    patient = X.iloc[[patient_index]]

    probability = float(
        pipeline.predict_proba(patient)[0][1]
    )

    prediction = int(
        pipeline.predict(patient)[0]
    )

    if model_name == "RandomForestClassifier":

        explanations = explain_tree_model(
            pipeline,
            patient,
            top_n=top_n,
        )

    else:
        raise NotImplementedError(
            f"SHAP explanation for {model_name} "
            f"is not implemented yet."
        )

    return {
        "target": target,
        "patient_index": patient_index,
        "model": model_name,
        "prediction": prediction,
        "probability": probability,
        "features": explanations[0],
    }


# ---------------------------------------------------------
# Test
# ---------------------------------------------------------

if __name__ == "__main__":

    print("=" * 70)
    print("CardioVision - SHAP Explainability Test")
    print("=" * 70)

    for target in ["Cath", "LAD", "LCX"]:

        print(f"\nTarget: {target}")

        result = explain_patient(
            target=target,
            patient_index=0,
            top_n=10,
        )

        print(
            f"Model: {result['model']}"
        )

        print(
            f"Prediction: {result['prediction']}"
        )

        print(
            f"Probability: "
            f"{result['probability']:.4f}"
        )

        print("\nTop contributing features:")

        for feature in result["features"]:

            print(
                f"  {feature['feature']:35s}"
                f" {feature['contribution']:+.5f}"
                f"  ({feature['direction']})"
            )

    print("\n" + "=" * 70)
    print("SHAP TEST COMPLETE")
    print("=" * 70)