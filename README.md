# CardioVision

**An AI-powered cardiovascular risk prediction and visualization platform**

CardioVision is a research prototype that combines machine learning with interactive 3D heart visualization to explore cardiovascular risk predictions. It analyzes patient-related clinical features and presents model outputs for coronary artery disease (CAD) and three coronary artery targets: LAD, LCX, and RCA.

The goal is to make machine-learning predictions easier to explore and understand through a visual, interactive interface.

## Features

* **Four prediction targets:** CAD, left anterior descending artery (LAD), left circumflex artery (LCX), and right coronary artery (RCA).
* **Interactive 3D heart:** Explore a 3D anatomical heart model with rotation and zoom controls.
* **Coronary risk visualization:** View predicted probabilities alongside color-coded coronary vessel overlays.
* **Patient input dashboard:** Enter clinical features to generate predictions.
* **Model evaluation:** Present classification metrics to help assess model performance.
* **Explainability support:** Provide a foundation for exploring the factors behind model predictions.
* **Research-focused design:** Communicate results alongside limitations and a medical disclaimer.

## Technology Stack

**Frontend**

* React
* Vite
* JavaScript
* WebGL 2 for 3D rendering

**Backend**

* Python
* FastAPI
* scikit-learn
* NumPy, pandas, and joblib

**Machine learning**

* Classification models trained on clinical data
* Separate prediction targets for CAD, LAD, LCX, and RCA
* Evaluation using accuracy, precision, recall, F1-score, and ROC-AUC

## Project Structure

```text
CardioVision/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── ml/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── notebooks/
│   ├── saved_models/
│   └── requirements.txt
│
├── cardio_frontend_fixed/
│   ├── public/
│   │   └── models/
│   │       └── VH_M_Heart.glb
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

*The exact contents may vary as development continues.*

## Dataset

CardioVision uses the Extension of Z-Alizadeh Sani dataset for cardiovascular machine-learning experiments.

* **Source:** [UCI Machine Learning Repository — Extension of Z-Alizadeh Sani Dataset](https://archive.ics.uci.edu/dataset/411/extention+z+)
* **Dataset size:** 303 patient records.
* **Prediction targets:** Cath, LAD, LCX, and RCA.

The dataset is intended for research and educational use. Model performance on this small dataset does not establish clinical reliability or generalization to other patient populations.

## Installation and Setup

### Prerequisites

* Python 3.10 or newer
* Node.js and npm
* Git
* Windows PowerShell or another compatible terminal

### 1. Clone the repository

```powershell
git clone https://github.com/vksaini15/CardioVision
cd CardioVision
```

Replace the placeholder with your repository's actual URL.

### 2. Start the backend

Open a terminal in the project root and run the following commands **in this order**.

**Step 1 — Enter the backend folder**

```powershell
cd backend
```

**Step 2 — Activate the virtual environment**

If the `.venv` folder already exists:

```powershell
.\.venv\Scripts\Activate.ps1
```

If it does not exist, create it first:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**Step 3 — Upgrade pip**

```powershell
python -m pip install --upgrade pip
```

**Step 4 — Install project dependencies**

```powershell
pip install -r requirements.txt
```

**Step 5 — Check the scikit-learn import**

```powershell
python -c "import sklearn; print(sklearn.__version__)"
```

**Step 6 — Check the joblib import**

```powershell
python -c "import joblib; print(joblib.__version__)"
```

**Step 7 — Reinstall scikit-learn if the import or binary installation is broken**

Run these only when needed to repair the installation:

```powershell
pip uninstall -y scikit-learn
pip install scikit-learn
```

**Step 8 — Verify scikit-learn again**

```powershell
python -c "import sklearn; print(sklearn.__version__)"
```

**Step 9 — Verify joblib again**

```powershell
python -c "import joblib; print(joblib.__version__)"
```

**Step 10 — Start FastAPI**

```powershell
python -m uvicorn app.main:app --reload
```

The `python -m uvicorn` form is used instead of invoking the `uvicorn` executable directly.

When the server starts successfully, open:

* API documentation: http://127.0.0.1:8000/docs
* API root: http://127.0.0.1:8000/

The API root may not provide a webpage; use `/docs` to explore the available endpoints.

**Important Windows note:** If Windows Application Control blocks a scikit-learn native DLL, reinstalling packages may not resolve the policy restriction. Do not bypass your system's security policy. The backend must successfully import the required models before its predictions can be considered operational.

### 3. Start the frontend

Keep the backend terminal running. Open a **second PowerShell terminal** and navigate to the project root.

```powershell
cd cardio_frontend_fixed
```

Install frontend dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

Open the local URL printed by Vite in your terminal, commonly:

http://localhost:5173/

Keep both terminals running while testing the application.

## Model Evaluation

The models have been evaluated using classification metrics. The following are previously recorded test-set results; they should be reproduced and verified before being presented as final benchmark results.

| Target     | Accuracy | Precision | Recall | F1-score | ROC-AUC |
| ---------- | -------: | --------: | -----: | -------: | ------: |
| CAD (Cath) |   85.25% |    88.64% | 90.70% |   89.66% |  87.60% |
| LAD        |   78.69% |    79.49% | 86.11% |   82.67% |  84.33% |
| LCX        |   63.93% |    54.17% | 54.17% |   54.17% |  73.42% |
| RCA        |   67.21% |    55.56% | 65.22% |   60.00% |  73.57% |

Performance varies by prediction target. In particular, the LCX and RCA results show that accuracy alone is insufficient to establish dependable predictions.

These values are historical experiment results, not a guarantee that the currently running application is loading the same models or reproducing those metrics.

## Important Limitations

* This is an experimental machine-learning project, not a clinically validated diagnostic system.
* Predicted probabilities are model outputs; they are **not percentages of physical artery blockage**.
* Predictions must not be used to diagnose disease, determine treatment, or replace professional medical assessment.
* The dataset contains only 303 records, which limits the strength of conclusions about generalization.
* Results may be affected by class imbalance, data quality, model selection, and evaluation methodology.
* The 3D coronary overlays are approximate visual representations unless separately validated anatomical meshes are successfully integrated.
* Feature explanations describe model behavior and do not establish medical causation.

## Ethical Use and Medical Disclaimer

CardioVision is intended for educational, research, and demonstration purposes only. It is not intended for clinical diagnosis, treatment decisions, or emergency medical use.

All displayed results should be interpreted with appropriate caution. A qualified healthcare professional should evaluate real medical concerns.

## Future Improvements

* Improve anatomical alignment of the coronary artery meshes.
* Add a one-click sample patient for demonstrations.
* Improve interactive vessel selection and highlighting.
* Add verified feature-contribution explanations.
* Strengthen data validation and model evaluation.
* Improve accessibility, testing, and documentation.

## Acknowledgements

* **Dataset:** Extension of Z-Alizadeh Sani, available through the [UCI Machine Learning Repository](https://archive.ics.uci.edu/dataset/411/extention+z+).
* **Anatomical model:** VH_M_Heart.glb and any separately integrated BodyParts3D assets should be attributed according to their respective source and license terms.

For BodyParts3D assets, consult the [official download page](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html) and [license information](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html). Confirm the license for the specific downloaded version before redistribution.

---

**CardioVision — Making cardiovascular machine-learning predictions easier to explore, visualize, and understand.**
