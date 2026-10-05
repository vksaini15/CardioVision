# 🫀 CardioVision

### Cardiovascular Risk Visualization & Prediction

> An AI-powered cardiovascular risk visualization and decision-support prototype combining machine learning, interactive 3D anatomy, and patient-level explainability.

---

## ✨ Key Features

### 🤖 Multi-Target Machine Learning

CardioVision uses four independently trained classification models to estimate cardiovascular risk:

| Target | Description |
|---|---|
| ❤️ Overall CAD | Predicts the probability of coronary artery disease |
| 🩸 LAD | Predicts LAD stenosis |
| 🩸 LCX | Predicts LCX stenosis |
| 🩸 RCA | Predicts RCA stenosis |

Each model produces a positive-class probability.

> **Important:** A prediction such as `65.1%` represents the model's estimated probability of the positive class. It does **not** mean that 65.1% of the artery is blocked.

### 🫀 Interactive 3D Heart Visualization

The dashboard connects model predictions with an interactive 3D heart interface.

**Interactions include:**

- 🔄 Rotate
- 🔍 Zoom
- 🖱️ Pan
- 🩸 Visualize LAD / LCX / RCA risk
- 📊 Display vessel probabilities
- 📌 Select vessel risk information

The coronary visualization is driven by model probabilities.

| Probability | Risk Level |
|---|---|
| `< 40%` | Lower |
| `40–69%` | Moderate |
| `≥ 70%` | High |

> ⚠️ The coronary layer is a **probability-driven visualization overlay**. It is not clinical-grade coronary vessel segmentation and must not be interpreted as diagnostic medical imaging.

### 📊 Cardiovascular Risk Summary

The dashboard provides a compact summary of the four model outputs and identifies the highest predicted vessel-specific risk.

Example:

```text
Overall CAD     73.6%
LAD             65.1%
LCX             20.2%
RCA             50.0%
```

### 🧠 Clinical Explainability

CardioVision provides patient-level model explainability using a **model-agnostic local feature perturbation approach**.

The dashboard can show:

- 🔎 Important contributing features
- 👤 Patient value
- 📊 Reference value
- 📈 Estimated probability impact
- ⬆️ Features associated with increased predicted probability
- ⬇️ Features associated with decreased predicted probability
- 🎯 Separate explanations for CAD, LAD, LCX and RCA

> The current production explanation panel does not use SHAP. It uses local feature perturbation because the development environment encountered a Windows-specific dependency restriction affecting SHAP.

### 📈 Model Performance

The dashboard displays held-out test-set metrics for all four models:

- Accuracy
- Precision
- Recall
- F1
- ROC-AUC

---

## 🔒 Target Leakage Prevention

Target leakage is particularly important for this dataset because the angiographic labels directly describe the outcomes being predicted.

CardioVision therefore excludes the angiographic target variables from the model input features.

The target-related columns are:

```text
Cath
LAD
LCX
RCA
```

These columns are excluded from the feature matrix for every prediction task.

This prevents the models from receiving angiographic outcomes that would directly or indirectly reveal the answer.

---

## 📚 Dataset

### UCI Extension of the Z-Alizadeh Sani Dataset

CardioVision uses the **UCI Extension of the Z-Alizadeh Sani Dataset**.

The dataset contains:

- 👥 303 patient records
- 🧬 Demographic information
- ❤️ Clinical measurements
- 🩸 Laboratory measurements
- 📈 ECG measurements
- 🫀 Echocardiographic measurements
- 🩻 CAD labels
- 🩸 LAD labels
- 🩸 LCX labels
- 🩸 RCA labels

The dataset provides clinical and physiological features for cardiovascular disease and vessel-specific stenosis classification.

---

## 🧹 Data Preprocessing

### Data Loading

The primary dataset is loaded from the UCI-derived Excel dataset.

### Data Cleaning

The preprocessing pipeline handles:

- Normalization of inconsistent categorical values
- Correction of categorical spelling inconsistencies
- Removal of unused features
- Separation of target variables from model inputs
- Feature and target dimension validation
- Missing-value validation

### Feature Preprocessing

Numerical and categorical features are processed separately.

**Numerical features:**

```text
StandardScaler
```

**Categorical features:**

```text
OneHotEncoder
```

The preprocessing pipeline is stored together with the trained models so inference uses the same transformations as training.

---

## 🤖 Machine Learning Models

The trained models are stored as serialized scikit-learn pipelines.

| Target | Selected Model |
|---|---|
| ❤️ Overall CAD | Random Forest |
| 🩸 LAD | Random Forest |
| 🩸 LCX | Random Forest |
| 🩸 RCA | Support Vector Machine |

The models are loaded by the FastAPI backend and used to generate predictions from patient measurements.

---

## 📈 Model Performance

The current models were evaluated on a held-out test set.

| Target | Accuracy | Precision | Recall | F1 | ROC-AUC |
|---|---:|---:|---:|---:|---:|
| ❤️ Overall CAD | 85.25% | 88.64% | 90.70% | 89.66% | 87.60% |
| 🩸 LAD | 78.69% | 79.49% | 86.11% | 82.67% | 84.33% |
| 🩸 LCX | 63.93% | 54.17% | 54.17% | 54.17% | 73.42% |
| 🩸 RCA | 67.21% | 55.56% | 65.22% | 60.00% | 73.57% |

### Performance Interpretation

The results show stronger predictive performance for overall CAD and LAD, while LCX and RCA are more challenging classification tasks.

The project reports these results transparently rather than presenting only the strongest-performing target.

> ⚠️ These metrics are dataset-specific evaluation results. They do not constitute clinical validation or demonstrate clinical deployment readiness.

---

## 🏗️ System Architecture

```text
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
           ❤️ CAD         🩸 LAD        🩸 LCX / RCA
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
```

---

## 🔌 Backend Architecture

The backend is implemented using **FastAPI**.

It handles:

- ❤️ Health checks
- 📊 Prediction requests
- 🧠 Explainability requests
- 🤖 Model loading
- 🧹 Input preparation
- 🔒 Target leakage protection

### API Flow

```text
React Frontend
      │
      │ Patient measurements
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
```

---

## ⚛️ Frontend Architecture

The frontend is built with:

- React
- Vite
- JavaScript
- CSS
- WebGL / Three.js-based visualization

Major UI areas include:

```text
components/
├── explainability/
├── layout/
├── patient/
├── predictions/
├── status/
└── viewer/
```

The dashboard is modular so prediction, visualization, patient data, system status, and explainability can operate as separate components.

---

## 📁 Project Structure

```text
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
│   └── requirements.txt
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
```

---

## 🛠️ Technology Stack

### 🐍 Backend

- Python
- FastAPI
- pandas
- NumPy
- scikit-learn
- joblib
- openpyxl

### ⚛️ Frontend

- React
- Vite
- JavaScript
- CSS
- WebGL / Three.js

### 🔧 Development

- Git
- GitHub
- VS Code
- PowerShell

---

## ▶️ Installation & Setup

### Requirements

Before starting, install:

- 🐍 Python 3.10+
- 📦 pip
- 🟢 Node.js 18+
- 📦 npm
- 💻 Git

> The commands below assume the repository has already been cloned or downloaded.

### 🐍 Backend Setup

Open PowerShell in the project folder:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend runs at:

```text
http://localhost:8000
```

FastAPI documentation:

```text
http://localhost:8000/docs
```

Health endpoint:

```text
http://localhost:8000/health
```

### ⚛️ Frontend Setup

Open a second PowerShell window:

```powershell
cd cardio_frontend_fixed
npm install
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

---

## 🧪 Quick Demo

### 1️⃣ Start the Backend

Run:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

### 2️⃣ Start the Frontend

In a second terminal:

```powershell
cd cardio_frontend_fixed
npm run dev
```

### 3️⃣ Open CardioVision

Open the frontend URL shown by Vite.

### 4️⃣ Load the Demo Patient

Use the built-in demo patient functionality to populate a complete patient record.

### 5️⃣ Run Prediction

Click the prediction button.

The measurements are sent to the FastAPI backend and processed by the four trained models.

### 6️⃣ Explore the Risk Summary

Inspect:

- ❤️ Overall CAD
- 🩸 LAD
- 🩸 LCX
- 🩸 RCA
- 📊 Highest predicted vessel risk

### 7️⃣ Explore the 3D Heart

Interact with the model:

- 🔄 Rotate
- 🔍 Zoom
- 🖱️ Pan
- 🩸 Inspect coronary risk visualization

### 8️⃣ Explore Explainability

Switch between:

- Overall CAD
- LAD
- LCX
- RCA

to inspect patient-level model sensitivity.

### 9️⃣ Inspect Model Performance

Review:

- Accuracy
- Precision
- Recall
- F1
- ROC-AUC

for every target.

---

## 🔬 Current Limitations

### Dataset Size

The primary dataset contains only 303 records.

### External Validation

The current models have not undergone external clinical validation.

### Probability Calibration

Probability calibration has not been established for clinical use.

### Anatomical Visualization

The coronary visualization is a probability-driven overlay rather than a validated patient-specific coronary reconstruction.

### Explainability

The local perturbation method estimates model sensitivity. It should not be interpreted as a causal medical explanation.

### Clinical Deployment

The system is a research and hackathon prototype and is not intended for clinical deployment.

---

## 🚀 Future Work

Potential future improvements include:

- 🧪 Larger and more diverse datasets
- 🏥 External clinical validation
- 📈 Probability calibration
- 🔬 Confidence intervals
- 🧠 Advanced explainability methods
- 🫀 Anatomically validated coronary vessel geometry
- 🩻 Patient-specific medical imaging integration
- 🌐 Multi-patient analytics
- 📱 Improved responsive design
- 🔐 Production-grade security
- ☁️ Deployment infrastructure

---

## 🏆 Hackathon Alignment

### Multimodal AI Hackathon 2026

**Track A — Cardiovascular Risk Visualization & Prediction**

| Requirement | CardioVision |
|---|---|
| Overall CAD prediction | ✅ |
| LAD prediction | ✅ |
| LCX prediction | ✅ |
| RCA prediction | ✅ |
| Clinical / physiological features | ✅ |
| Target leakage prevention | ✅ |
| Accuracy / Precision / Recall / F1 / ROC-AUC | ✅ |
| Interactive 3D visualization | ✅ |
| Vessel risk visualization | ✅ |
| Patient-level explainability | ✅ |
| Clinical dashboard | ✅ |
| Medical safety disclaimer | ✅ |
| Working web application | ✅ |

---

## 🛡️ Medical Safety Disclaimer

> ⚠️ **Educational and decision-support tool. Not a substitute for formal diagnostic imaging or professional medical evaluation.**

CardioVision is a research and hackathon prototype.

Its predictions must not be used as a standalone medical diagnosis, treatment recommendation, or replacement for professional clinical assessment.

---

## 🎯 Project Philosophy

### 🫀 Predict

Use machine learning to estimate cardiovascular risk from available clinical measurements.

### 🧠 Explain

Show which patient features are locally associated with changes in the model's prediction.

### 🎨 Visualize

Connect those predictions to an interactive 3D anatomical interface.

---

## ❤️ Final Note

CardioVision demonstrates how machine learning, interactive visualization, and explainability can be combined into a single cardiovascular decision-support prototype.

> **Predict. Explain. Visualize.** 🫀🤖🧠
