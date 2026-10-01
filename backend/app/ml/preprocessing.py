from pathlib import Path

import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler


# ---------------------------------------------------------
# Paths
# ---------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATASET_PATH = (
    PROJECT_ROOT
    / "data"
    / "extension of Z-Alizadeh sani dataset.xlsx"
)


# ---------------------------------------------------------
# Target columns
# ---------------------------------------------------------

TARGET_COLUMNS = [
    "Cath",
    "LAD",
    "LCX",
    "RCA",
]


# ---------------------------------------------------------
# Load dataset
# ---------------------------------------------------------

def load_dataset() -> pd.DataFrame:
    """
    Load the official UCI Extension of Z-Alizadeh Sani dataset.

    The original Excel file is never modified.
    """

    df = pd.read_excel(
        DATASET_PATH,
        sheet_name=0,
    )

    return df


# ---------------------------------------------------------
# Clean input values
# ---------------------------------------------------------

def clean_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean known inconsistent categorical values.

    This does NOT modify the original Excel file.
    It creates a copy in memory.
    """

    df = df.copy()

    # Correct known spelling inconsistency.
    if "Sex" in df.columns:
        df["Sex"] = df["Sex"].replace({
            "Fmale": "Female"
        })

    # Standardize VHD capitalization.
    if "VHD" in df.columns:
        df["VHD"] = df["VHD"].replace({
            "mild": "Mild",
            "Moderate": "Moderate",
            "Severe": "Severe"
        })

    return df


# ---------------------------------------------------------
# Prepare features and target
# ---------------------------------------------------------

def prepare_data(
    target_column: str
):
    """
    Prepare X and y for one of the four prediction tasks.

    All four angiography-derived columns are removed from X
    to prevent target leakage.
    """

    if target_column not in TARGET_COLUMNS:
        raise ValueError(
            f"Invalid target '{target_column}'. "
            f"Choose from {TARGET_COLUMNS}"
        )

    df = load_dataset()
    df = clean_features(df)

    # Separate target.
    y = df[target_column].copy()

    # Remove ALL angiography-derived target columns.
    X = df.drop(columns=TARGET_COLUMNS)

    # Remove constant feature identified during inspection.
    # Exertional CP is "N" for every patient.
    if "Exertional CP" in X.columns:
        X = X.drop(columns=["Exertional CP"])

    return X, y


# ---------------------------------------------------------
# Build preprocessing pipeline
# ---------------------------------------------------------

def build_preprocessor(X: pd.DataFrame) -> ColumnTransformer:
    """
    Build a scikit-learn preprocessing pipeline.

    Numeric features:
        - Standardized using StandardScaler

    Categorical features:
        - One-hot encoded
        - Unknown categories are safely ignored
    """

    numeric_columns = X.select_dtypes(
        include=["number"]
    ).columns.tolist()

    categorical_columns = X.select_dtypes(
        include=["object", "category", "string"]
    ).columns.tolist()

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "numeric",
                StandardScaler(),
                numeric_columns,
            ),
            (
                "categorical",
                OneHotEncoder(
                    handle_unknown="ignore",
                    sparse_output=False,
                ),
                categorical_columns,
            ),
        ],
        remainder="drop",
    )

    return preprocessor


# ---------------------------------------------------------
# Validation
# ---------------------------------------------------------

def validate_prepared_data(
    X: pd.DataFrame,
    y: pd.Series,
    target_column: str,
):
    """
    Validate that preprocessing preparation is safe.
    """

    # No target columns may remain in X.
    leaked_columns = set(X.columns).intersection(
        TARGET_COLUMNS
    )

    if leaked_columns:
        raise ValueError(
            f"Target leakage detected! "
            f"These target columns remain in X: {leaked_columns}"
        )

    # Number of samples must match.
    if len(X) != len(y):
        raise ValueError(
            "X and y have different numbers of rows."
        )

    # Dataset should not contain missing values at this stage.
    if X.isnull().any().any():
        missing = X.columns[
            X.isnull().any()
        ].tolist()

        raise ValueError(
            f"Missing values found in: {missing}"
        )

    if y.isnull().any():
        raise ValueError(
            f"Missing target values found for {target_column}."
        )

    return True


# ---------------------------------------------------------
# Quick inspection
# ---------------------------------------------------------

if __name__ == "__main__":

    print("=" * 60)
    print("CardioVision - Preprocessing Test")
    print("=" * 60)

    for target in TARGET_COLUMNS:

        print(f"\nTarget: {target}")

        X, y = prepare_data(target)

        validate_prepared_data(
            X,
            y,
            target
        )

        preprocessor = build_preprocessor(X)

        print(f"Samples: {len(X)}")
        print(f"Input features before encoding: {X.shape[1]}")
        print(f"Target classes: {y.unique().tolist()}")

        numeric = X.select_dtypes(
            include=["number"]
        ).columns.tolist()

        categorical = X.select_dtypes(
            include=["object", "category", "string"]
        ).columns.tolist()

        print(f"Numeric features: {len(numeric)}")
        print(f"Categorical features: {len(categorical)}")

        print("Validation: PASSED")

    print("\n" + "=" * 60)
    print("ALL PREPROCESSING CHECKS PASSED")
    print("=" * 60)