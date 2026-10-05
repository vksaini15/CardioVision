# 🫀 CardioVision

### Cardiovascular Risk Visualization & Prediction

> An AI-powered cardiovascular risk visualization and decision-support prototype combining machine learning, interactive 3D anatomy, and patient-level explainability.

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Frontend%20Tooling-646CFF?logo=vite)](https://vite.dev/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-Machine%20Learning-F7931E?logo=scikit-learn)](https://scikit-learn.org/)
[![Three.js](https://img.shields.io/badge/Three.js-3D%20Visualization-black?logo=three.js)](https://threejs.org/)

---

## 🧭 Overview

**CardioVision** is a research-oriented prototype developed for the **Multimodal AI Hackathon 2026 — Track A: Cardiovascular Risk Visualization & Prediction**.

The system combines clinical and physiological patient measurements with machine-learning models to estimate cardiovascular risk and visualize the resulting predictions through an interactive 3D heart interface.

CardioVision provides predictions for:

- ❤️ Overall Coronary Artery Disease (CAD)
- 🩸 Left Anterior Descending (LAD) vessel stenosis
- 🩸 Left Circumflex (LCX) vessel stenosis
- 🩸 Right Coronary Artery (RCA) vessel stenosis

The predictions are connected to:

- 🫀 Interactive 3D anatomical visualization
- 🎨 Coronary risk visualization overlays
- 📊 Cardiovascular risk summaries
- 🧠 Patient-level explainability
- 📈 Model performance metrics
- 👤 Clinical measurement inputs
- ⚡ FastAPI prediction services

---

# ✨ Key Features

## 🤖 Multi-Target Machine Learning

CardioVision uses four independently trained classification models.

| Target | Description |
|---|---|
| ❤️ Overall CAD | Predicts the probability of coronary artery disease |
| 🩸 LAD | Predicts LAD stenosis |
| 🩸 LCX | Predicts LCX stenosis |
| 🩸 RCA | Predicts RCA stenosis |

Each model produces a positive-class probability.

> **Important:** A prediction such as `65.1%` represents the model's estimated probability of the positive class. It does **not** mean that 65.1% of the artery is blocked.

---

# 🫀 Interactive 3D Heart Visualization

CardioVision includes an interactive 3D heart interface designed to connect model predictions with anatomical visualization.

### Supported interactions

- 🔄 Rotate the heart
- 🔍 Zoom
- 🖱️ Pan
- 🩸 Visualize LAD / LCX / RCA risk
- 📊 Display vessel probabilities
- 🎨 Represent risk levels visually
- 📌 Select and inspect vessel risk information

The coronary visualization is driven by the model probabilities.

### Risk thresholds

| Probability | Risk visualization |
|---|---|
| `< 40%` | Lower |
| `40–69%` | Moderate |
| `≥ 70%` | High |

> ⚠️ The coronary layer is a **probability-driven visualization overlay**. It is not clinical-grade coronary vessel segmentation and must not be interpreted as diagnostic medical imaging.

---

# 📊 Cardiovascular Risk Summary

The dashboard provides a compact summary of the four model outputs.

Example:

```text
Overall CAD     73.6%
LAD             65.1%
LCX             20.2%
RCA             50.0%

The system also identifies the highest predicted vessel-specific risk.

For example:

Highest predicted vessel risk
LAD — 65.1%

Overall CAD is intentionally excluded from the vessel comparison because CAD represents the overall disease target rather than an individual coronary vessel.

### 🧠 Clinical Explainability

CardioVision includes patient-level model explainability.

The current implementation uses a model-agnostic local feature perturbation approach.

For an individual patient, selected input features are perturbed and the change in model probability is estimated.

The dashboard provides:

🔎 Important contributing features
👤 Patient value
📊 Reference value
📈 Estimated probability impact
⬆️ Features associated with increased predicted probability
⬇️ Features associated with decreased predicted probability
🎯 Separate explanations for CAD, LAD, LCX and RCA

Example interpretation:

Feature: Triglycerides
Patient value: 250
Reference value: 122
Estimated local impact: +6.6%
Direction: Increased predicted probability
Explainability methodology

The explainability result should be interpreted as a local model-sensitivity estimate, not as a causal medical relationship.

SHAP is not used to generate the current production explanation panel. The current implementation uses local feature perturbation because the development environment encountered a Windows-specific dependency restriction affecting SHAP.

###🔒 Target Leakage Prevention

Target leakage is particularly important for this dataset because the angiographic labels directly describe the outcomes being predicted.

CardioVision therefore excludes the target-related angiographic variables from model inputs.

For all four prediction tasks, the angiographic target columns are removed from the feature matrix:

Cath
LAD
LCX
RCA

Therefore:

❤️ CAD prediction

The model does not receive:

Cath
LAD
LCX
RCA
🩸 LAD prediction

The model does not receive:

Cath
LAD
LCX
RCA
🩸 LCX prediction

The model does not receive:

Cath
LAD
LCX
RCA
🩸 RCA prediction

The model does not receive:

Cath
LAD
LCX
RCA

This prevents the model from directly receiving angiographic outcomes that would otherwise leak the answer into the prediction process.

###📚 Dataset

CardioVision uses the:

UCI Extension of the Z-Alizadeh Sani Dataset

The dataset contains:

👥 303 patient records
🧬 Demographic information
❤️ Clinical measurements
🩸 Laboratory measurements
📈 ECG measurements
🫀 Echocardiographic measurements
🩻 CAD labels
🩸 LAD labels
🩸 LCX labels
🩸 RCA labels

The dataset contains clinical and physiological features that can be used to investigate cardiovascular disease and vessel-specific stenosis classification.

###🧹 Data Preprocessing

The preprocessing pipeline performs several steps before model inference.

Data loading

The primary dataset is loaded from the UCI-derived Excel dataset.

Data cleaning

Examples include:

Normalizing inconsistent categorical values
Correcting categorical spelling inconsistencies
Removing unused features
Separating target variables from model inputs
Validating feature/target dimensions
Checking for missing values
Feature preprocessing

Numerical and categorical features are processed separately.

Numerical features use:

StandardScaler

Categorical features use:

OneHotEncoder

The preprocessing pipeline is stored together with the trained models so that inference uses the same feature transformations as training.

###🤖 Machine Learning Models

The trained models are stored as serialized scikit-learn pipelines.

Current selected models include:

Target	Selected Model
❤️ CAD	Random Forest
🩸 LAD	Random Forest
🩸 LCX	Random Forest
🩸 RCA	Support Vector Machine

The models are loaded by the FastAPI backend and used to generate predictions from patient measurements.

###📈 Model Performance

The current models were evaluated on a held-out test set.

Target	Accuracy	Precision	Recall	F1	ROC-AUC
❤️ Overall CAD	85.25%	88.64%	90.70%	89.66%	87.60%
🩸 LAD	78.69%	79.49%	86.11%	82.67%	84.33%
🩸 LCX	63.93%	54.17%	54.17%	54.17%	73.42%
🩸 RCA	67.21%	55.56%	65.22%	60.00%	73.57%
Performance interpretation

The results demonstrate stronger predictive performance for the overall CAD and LAD targets, while LCX and RCA show more challenging classification performance.

The project intentionally reports these results transparently rather than presenting only the strongest-performing target.

⚠️ These metrics are dataset-specific evaluation results. They do not constitute clinical validation or demonstrate clinical deployment readiness.

##🏗️ System Architecture
                         👤 Patient
                            │
                            ▼
                 📋 Clinical Measurements
                            │
                            ▼
                   🧹 Preprocessing
                            │
                            ▼
                  🔒 Leakage Prevention
                            │
                            ▼
                    🤖 ML Pipelines
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
           ❤️ CAD         🩸 LAD         🩸 LCX/RCA
             │              │              │
             └──────────────┼──────────────┘
                            │
                            ▼
                    📊 Probabilities
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
        🫀 3D Risk Map  🧠 Explainability  📈 Metrics
              │             │             │
              └─────────────┼─────────────┘
                            ▼
                   🖥️ CardioVision UI
##🔌 Backend Architecture

The backend is implemented using FastAPI.

The API handles:

❤️ Health checks
📊 Prediction requests
🧠 Explainability requests
🤖 Model loading
🧹 Input preparation
🔒 Target leakage protection
Example API flow
React Frontend
      │
      │ POST patient measurements
      ▼
FastAPI
      │
      ▼
Prediction Service
      │
      ├── CAD model
      ├── LAD model
      ├── LCX model
      └── RCA model
      │
      ▼
Prediction probabilities
      │
      ▼
React Dashboard
##⚛️ Frontend Architecture

The frontend is built with:

React
Vite
JavaScript
CSS
WebGL / Three.js-based visualization

Major UI components include:

components/
├── explainability/
├── layout/
├── patient/
├── predictions/
├── status/
└── viewer/

The application is designed as a modular dashboard so that prediction, visualization, patient data, system status, and explainability can operate as separate components.

##📁 Project Structure
CardioVision/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── ml/
│   │   └── services/
│   │
│   ├── data/
│   ├── notebooks/
│   ├── saved_models/
│   ├── tests/
│   ├── requirements.txt
│   └── .venv/
│
├── cardio_frontend_fixed/
│   ├── public/
│   │   └── models/
│   │       └── VH_M_Heart.glb
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── explainability/
│   │   │   ├── layout/
│   │   │   ├── patient/
│   │   │   ├── predictions/
│   │   │   ├── status/
│   │   │   └── viewer/
│   │   │
│   │   ├── hooks/
│   │   ├── services/
│   │   └── styles/
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
##🛠️ Technology Stack
###🐍 Backend
Python
FastAPI
pandas
NumPy
scikit-learn
joblib
openpyxl
###⚛️ Frontend
React
Vite
JavaScript
CSS
Three.js / WebGL
###🔧 Development
Git
GitHub
VS Code
PowerShell
## ▶️ Installation & Setup

> The following setup assumes you have already cloned or downloaded the CardioVision repository.

Before starting, make sure you have:

- 🐍 Python 3.10+
- 📦 pip
- 🟢 Node.js 18+
- 📦 npm
- 💻 Git
###🐍 Backend Setup

Open PowerShell:

cd backend

Create the virtual environment:

python -m venv .venv

Activate it:

.\.venv\Scripts\Activate.ps1

Install dependencies:

pip install -r requirements.txt

Start the FastAPI server:

uvicorn app.main:app --reload

The backend runs at:

http://localhost:8000

FastAPI interactive documentation:

http://localhost:8000/docs

Health endpoint:

http://localhost:8000/health
###⚛️ Frontend Setup

Open a second PowerShell window.

From the project root:

cd cardio_frontend_fixed

Install dependencies:

npm install

Start the development server:

npm run dev

The frontend will normally be available at:

http://localhost:5173
##🧪 Quick Demo

After starting both servers:

1. Open CardioVision

Navigate to the frontend URL.

2. Load the demo patient

Use the built-in demo patient functionality.

3. Run prediction

The application sends the clinical measurements to the FastAPI backend.

4. Explore the results

The dashboard displays:

❤️ Overall CAD
🩸 LAD
🩸 LCX
🩸 RCA
5. Explore the 3D visualization

Interact with the heart using:

🔄 Rotate
🔍 Zoom
🖱️ Pan
6. Explore explainability

Switch between:

Overall CAD
LAD
LCX
RCA

to inspect patient-level feature contributions.

7. Inspect model performance

The dashboard displays:

Accuracy
Precision
Recall
F1
ROC-AUC

for each trained model.

##🔬 Current Limitations

CardioVision is a prototype and has several important limitations.

Dataset size

The primary dataset contains only 303 records.

External validation

The current models have not undergone external clinical validation.

Calibration

Probability calibration has not yet been established for clinical use.

Anatomical visualization

The coronary visualization layer is a risk visualization overlay rather than a validated patient-specific coronary reconstruction.

Explainability

The local perturbation method estimates model sensitivity and should not be interpreted as causal clinical reasoning.

Clinical deployment

The system is not intended for clinical deployment.

##🚀 Future Work

Potential future improvements include:

🧪 Larger and more diverse datasets
🏥 External clinical validation
📈 Probability calibration
🔬 Confidence intervals
🧠 Advanced explainability methods
🫀 Anatomically validated coronary vessel geometry
🩻 Patient-specific imaging integration
🌐 Multi-patient analytics
📱 Improved responsive design
🔐 Production-grade security
☁️ Deployment infrastructure
🏆 Hackathon Alignment

CardioVision was developed for:

Multimodal AI Hackathon 2026
Track A — Cardiovascular Risk Visualization & Prediction

The system addresses the major requirements of the track:

Requirement	CardioVision
Overall CAD prediction	✅
LAD prediction	✅
LCX prediction	✅
RCA prediction	✅
Clinical / physiological features	✅
Leakage prevention	✅
Accuracy / Precision / Recall / F1 / ROC-AUC	✅
Interactive 3D visualization	✅
Vessel risk visualization	✅
Patient-level explainability	✅
Clinical dashboard	✅
Medical safety disclaimer	✅
Working web application	✅
🛡️ Medical Safety Disclaimer

⚠️ Educational and decision-support tool. Not a substitute for formal diagnostic imaging or professional medical evaluation.

CardioVision is a research and hackathon prototype.

Its predictions must not be used as a standalone medical diagnosis, treatment recommendation, or replacement for professional clinical assessment.

🎯 Project Philosophy

CardioVision is built around three ideas:

🫀 Predict

Use machine learning to estimate cardiovascular risk from available clinical measurements.

🧠 Explain

Show which patient features are locally associated with changes in the model's prediction.

🎨 Visualize

Connect those predictions to an interactive 3D anatomical interface.

##❤️ Final Note

CardioVision demonstrates how machine learning, interactive visualization, and explainability can be combined into a single cardiovascular decision-support prototype.

#Predict. Explain. Visualize. 🫀🤖🧠