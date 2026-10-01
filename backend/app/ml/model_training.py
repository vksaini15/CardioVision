from pathlib import Path
import json

import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate
from sklearn.pipeline import Pipeline

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
)

from joblib import dump

from app.ml.preprocessing import (
    TARGET_COLUMNS,
    prepare_data,
    build_preprocessor,
    validate_prepared_data,
)


# =========================================================
# Configuration
# =========================================================

RANDOM_STATE = 42
TEST_SIZE = 0.20
CV_FOLDS = 5

PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_DIR = PROJECT_ROOT / "saved_models"
RESULTS_DIR = PROJECT_ROOT / "notebooks" / "results"

MODEL_DIR.mkdir(parents=True, exist_ok=True)
RESULTS_DIR.mkdir(parents=True, exist_ok=True)


# =========================================================
# Convert target labels to binary values
# =========================================================

def encode_target(y: pd.Series, target_column: str) -> pd.Series:
    """
    Convert dataset target labels into binary values.

    Positive class = 1
    Negative class = 0
    """

    y = y.copy()

    if target_column == "Cath":
        mapping = {
            "Normal": 0,
            "CAD": 1,
        }

    else:
        mapping = {
            "Normal": 0,
            "Stenotic": 1,
        }

    unknown_values = set(y.unique()) - set(mapping.keys())

    if unknown_values:
        raise ValueError(
            f"Unexpected values in {target_column}: "
            f"{unknown_values}"
        )

    return y.map(mapping).astype(int)


# =========================================================
# Models
# =========================================================

def create_models():

    return {

        "logistic_regression": LogisticRegression(
            max_iter=3000,
            class_weight="balanced",
            random_state=RANDOM_STATE,
        ),

        "random_forest": RandomForestClassifier(
            n_estimators=500,
            max_depth=None,
            min_samples_leaf=2,
            class_weight="balanced",
            random_state=RANDOM_STATE,
            n_jobs=-1,
        ),

        "svm": SVC(
            kernel="rbf",
            probability=True,
            class_weight="balanced",
            random_state=RANDOM_STATE,
        ),
    }


# =========================================================
# Build complete pipeline
# =========================================================

def build_pipeline(X, model):

    preprocessor = build_preprocessor(X)

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("model", model),
        ]
    )

    return pipeline


# =========================================================
# Cross-validation
# =========================================================

def cross_validate_model(pipeline, X_train, y_train):

    cv = StratifiedKFold(
        n_splits=CV_FOLDS,
        shuffle=True,
        random_state=RANDOM_STATE,
    )

    scoring = {
        "accuracy": "accuracy",
        "precision": "precision",
        "recall": "recall",
        "f1": "f1",
        "roc_auc": "roc_auc",
    }

    results = cross_validate(
        pipeline,
        X_train,
        y_train,
        cv=cv,
        scoring=scoring,
        n_jobs=-1,
    )

    return {
        metric: float(np.mean(results[f"test_{metric}"]))
        for metric in scoring
    }


# =========================================================
# Test-set evaluation
# =========================================================

def evaluate_on_test(
    pipeline,
    X_test,
    y_test,
):

    pipeline.fit(
        X_test,
        y_test,
    )

    predictions = pipeline.predict(X_test)

    probabilities = pipeline.predict_proba(
        X_test
    )[:, 1]

    return {
        "accuracy": float(
            accuracy_score(y_test, predictions)
        ),
        "precision": float(
            precision_score(
                y_test,
                predictions,
                zero_division=0,
            )
        ),
        "recall": float(
            recall_score(
                y_test,
                predictions,
                zero_division=0,
            )
        ),
        "f1": float(
            f1_score(
                y_test,
                predictions,
                zero_division=0,
            )
        ),
        "roc_auc": float(
            roc_auc_score(
                y_test,
                probabilities,
            )
        ),
    }


# =========================================================
# Main experiment
# =========================================================

def run_experiments():

    all_results = {}

    for target in TARGET_COLUMNS:

        print("\n")
        print("=" * 70)
        print(f"TARGET: {target}")
        print("=" * 70)

        # -------------------------------------------------
        # Load and prepare data
        # -------------------------------------------------

        X, y_raw = prepare_data(target)

        y = encode_target(
            y_raw,
            target,
        )

        validate_prepared_data(
            X,
            y_raw,
            target,
        )

        print(f"Total samples: {len(X)}")
        print(f"Positive cases: {int(y.sum())}")
        print(f"Negative cases: {int((y == 0).sum())}")

        # -------------------------------------------------
        # Train/test split
        # -------------------------------------------------

        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=TEST_SIZE,
            stratify=y,
            random_state=RANDOM_STATE,
        )

        print(f"Training samples: {len(X_train)}")
        print(f"Test samples: {len(X_test)}")

        models = create_models()

        target_results = {}

        # -------------------------------------------------
        # Compare models
        # -------------------------------------------------

        for model_name, model in models.items():

            print("\n" + "-" * 60)
            print(f"Model: {model_name}")

            pipeline = build_pipeline(
                X_train,
                model,
            )

            cv_results = cross_validate_model(
                pipeline,
                X_train,
                y_train,
            )

            print("\nCross-validation:")

            for metric, value in cv_results.items():
                print(
                    f"  {metric:10s}: "
                    f"{value:.4f}"
                )

            # -------------------------------------------------
            # Fit ONLY on training data
            # -------------------------------------------------

            pipeline.fit(
                X_train,
                y_train,
            )

            predictions = pipeline.predict(
                X_test
            )

            probabilities = pipeline.predict_proba(
                X_test
            )[:, 1]

            test_results = {
                "accuracy": float(
                    accuracy_score(
                        y_test,
                        predictions,
                    )
                ),
                "precision": float(
                    precision_score(
                        y_test,
                        predictions,
                        zero_division=0,
                    )
                ),
                "recall": float(
                    recall_score(
                        y_test,
                        predictions,
                        zero_division=0,
                    )
                ),
                "f1": float(
                    f1_score(
                        y_test,
                        predictions,
                        zero_division=0,
                    )
                ),
                "roc_auc": float(
                    roc_auc_score(
                        y_test,
                        probabilities,
                    )
                ),
            }

            print("\nTest set:")

            for metric, value in test_results.items():
                print(
                    f"  {metric:10s}: "
                    f"{value:.4f}"
                )

            target_results[model_name] = {
                "cross_validation": cv_results,
                "test": test_results,
            }

        # -------------------------------------------------
        # Select model using CV ROC-AUC
        # -------------------------------------------------

        best_model_name = max(
            target_results,
            key=lambda name:
                target_results[name]
                ["cross_validation"]
                ["roc_auc"]
        )

        print("\n" + "=" * 70)
        print(
            f"Selected model for {target}: "
            f"{best_model_name}"
        )
        print("=" * 70)

        # -------------------------------------------------
        # Retrain selected model on complete dataset
        # -------------------------------------------------

        best_model = create_models()[
            best_model_name
        ]

        final_pipeline = build_pipeline(
            X,
            best_model,
        )

        final_pipeline.fit(
            X,
            y,
        )

        # -------------------------------------------------
        # Save model
        # -------------------------------------------------

        model_path = (
            MODEL_DIR
            / f"{target.lower()}_model.joblib"
        )

        dump(
            final_pipeline,
            model_path,
        )

        print(
            f"Saved model: {model_path}"
        )

        all_results[target] = {
            "selected_model": best_model_name,
            "models": target_results,
        }

    # =====================================================
    # Save experiment results
    # =====================================================

    results_path = (
        RESULTS_DIR
        / "model_comparison.json"
    )

    with open(
        results_path,
        "w",
        encoding="utf-8",
    ) as f:

        json.dump(
            all_results,
            f,
            indent=4,
        )

    print("\n")
    print("=" * 70)
    print("ALL MODEL EXPERIMENTS COMPLETE")
    print("=" * 70)
    print(
        f"Results saved to: {results_path}"
    )


if __name__ == "__main__":
    run_experiments()