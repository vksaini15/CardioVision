import { useCallback, useEffect, useMemo, useState } from "react";
import "./styles/index.css";

import Header from "./components/layout/Header.jsx";
import DisclaimerBanner from "./components/layout/DisclaimerBanner.jsx";
import ViewerPanel from "./components/viewer/ViewerPanel.jsx";
import PredictionPanel from "./components/predictions/PredictionPanel.jsx";
import ModelPerformance from "./components/predictions/ModelPerformance.jsx";
import PatientMeasurements from "./components/patient/PatientMeasurements.jsx";
import SystemStatusPanel from "./components/status/SystemStatusPanel.jsx";
import ExplainabilityPanel from "./components/explainability/ExplainabilityPanel.jsx";
import { summarizeStatus } from "./components/status/systemStatus.js";
import { usePatientMeasurements } from "./hooks/usePatientMeasurements.js";
import { checkHealth, predictPatient, explainPatient } from "./services/predictionApi.js";





const NUMERIC_FIELDS = new Set([
  "Age", "Weight", "Length", "BMI", "DM", "HTN",
  "Current Smoker", "EX-Smoker", "FH", "BP", "PR",
  "Edema", "Typical Chest Pain", "Function Class",
  "Q Wave", "St Elevation", "St Depression", "Tinversion",
  "FBS", "CR", "TG", "LDL", "HDL", "BUN", "ESR",
  "HB", "K", "Na", "WBC", "Lymph", "Neut", "PLT",
  "EF-TTE", "Region RWMA",
]);

function buildPayload(values, bmi) {
  const payload = {};

  for (const [key, value] of Object.entries(values)) {
    if (value === "" || value == null) continue;

    if (!NUMERIC_FIELDS.has(key)) {
      payload[key] = value;
      continue;
    }

    if (key === "Function Class") {
  const normalized = String(value).trim().toUpperCase();

  if (["0", "I", "II", "III", "IV"].includes(normalized)) {
    payload[key] = normalized === "0"
      ? 0
      : { I: 1, II: 2, III: 3, IV: 4 }[normalized];
  } else {
    throw new Error(`Invalid Function Class value: "${value}"`);
  }

  continue;
}

    const normalized = String(value).trim().toUpperCase();

    if (normalized === "Y" || normalized === "YES") {
      payload[key] = 1;
    } else if (normalized === "N" || normalized === "NO") {
      payload[key] = 0;
    } else {
      const numberValue = Number(value);

      if (!Number.isFinite(numberValue)) {
        throw new Error(`Invalid numeric value for ${key}: "${value}"`);
      }

      payload[key] = numberValue;
    }
  }

  payload.BMI = Number(bmi);
  return payload;
}





const DEMO_PATIENT = {
  Age: 53, Weight: 90, Length: 175, Sex: "Male", DM: 0, HTN: 1,
  "Current Smoker": 1, "EX-Smoker": 0, FH: 0, Obesity: "Y", CRF: "N",
  CVA: "N", "Airway disease": "N", "Thyroid Disease": "N", CHF: "N", DLP: "Y",
  BP: 110, PR: 80, Edema: 0, "Weak Peripheral Pulse": "N", "Lung rales": "N",
  "Systolic Murmur": "N", "Diastolic Murmur": "N", "Typical Chest Pain": 0,
  Dyspnea: "N", "Function Class": 0, Atypical: "N", Nonanginal: "N",
  "LowTH Ang": "N", "Q Wave": 0, "St Elevation": 0, "St Depression": 1,
  Tinversion: 1, LVH: "N", "Poor R Progression": "N", BBB: "N", FBS: 90,
  CR: 0.7, TG: 250, LDL: 155, HDL: 30, BUN: 8, ESR: 7, HB: 15.6, K: 4.7,
  Na: 141, WBC: 5700, Lymph: 39, Neut: 52, PLT: 261, "EF-TTE": 50,
  "Region RWMA": 0, VHD: "None",
};

function mapPrediction(raw) {
  return raw
    ? {
        label: `${(raw.probability * 100).toFixed(1)}%`,
        probability: raw.probability,
        prediction: raw.prediction,
      }
    : null;
}

export default function App() {
  const patient = usePatientMeasurements();
  const [serviceState, setServiceState] = useState("loading");
  const [serviceDetail, setServiceDetail] = useState("Checking backend connection");
  const [predictionState, setPredictionState] = useState("standby");
  const [predictionError, setPredictionError] = useState("");
  const [results, setResults] = useState({});
  const [explanationTarget, setExplanationTarget] = useState("Cath");
  const [explanationState, setExplanationState] = useState("standby");
  const [explanation, setExplanation] = useState(null);
  const [explanationError, setExplanationError] = useState("");
  const [lastPayload, setLastPayload] = useState(null);
  const loadDemoPatient = useCallback(() => {
    for (const [key, value] of Object.entries(DEMO_PATIENT)) patient.setValue(key, String(value));
  }, [patient]);

  useEffect(() => {
    let active = true;
    checkHealth()
      .then(() => {
        if (!active) return;
        setServiceState("ready");
        setServiceDetail("Connected");
      })
      .catch((error) => {
        if (!active) return;
        setServiceState("error");
        setServiceDetail("Backend unavailable");
        setPredictionError(error.message);
      });
    return () => { active = false; };
  }, []);

  const runPrediction = useCallback(async () => {
    if (!patient.hasCompleteModelInput || serviceState !== "ready") return;

    setPredictionState("loading");
    setPredictionError("");
    setResults({});

    try {
      const payload = buildPayload(patient.values, patient.bmi);
      setLastPayload(payload);
      const response = await predictPatient(payload);
      const raw = response?.predictions || {};
      setResults({
        cad: mapPrediction(raw.Cath),
        lad: mapPrediction(raw.LAD),
        lcx: mapPrediction(raw.LCX),
        rca: mapPrediction(raw.RCA),
      });
      setPredictionState("ready");

      setExplanationState("loading");
      setExplanationError("");
      try {
        const explanationResponse = await explainPatient("Cath", payload);
        setExplanation(explanationResponse?.explanation || null);
        setExplanationState("ready");
      } catch (explainError) {
        setExplanation(null);
        setExplanationState("error");
        setExplanationError(explainError.message || "Explainability request failed.");
      }
    } catch (error) {
      setPredictionState("error");
      setPredictionError(error.message || "Prediction request failed.");
    }
  }, [patient.hasCompleteModelInput, patient.bmi, patient.values, serviceState]);


  const changeExplanationTarget = useCallback(async (target) => {
    setExplanationTarget(target);
    if (!lastPayload || !results.cad) return;
    setExplanationState("loading");
    setExplanationError("");
    try {
      const response = await explainPatient(target, lastPayload);
      setExplanation(response?.explanation || null);
      setExplanationState("ready");
    } catch (error) {
      setExplanation(null);
      setExplanationState("error");
      setExplanationError(error.message || "Explainability request failed.");
    }
  }, [lastPayload, results.cad]);

  const systemStatus = useMemo(() => [
    { id: "viewer", name: "3D heart viewer", state: "ready", detail: "Anatomical model loaded" },
    { id: "predictions", name: "Prediction service", state: serviceState, detail: serviceDetail },
  ], [serviceDetail, serviceState]);

  const overall = useMemo(() => summarizeStatus(systemStatus), [systemStatus]);

  return (
    <div className="app-shell">
      <Header status={overall} />
      <DisclaimerBanner />
      <main className="dashboard">
        <ViewerPanel results={results} />
        <aside className="dashboard__aside" aria-label="Predictions and system status">
          <PredictionPanel
  state={predictionState}
  results={results}
  error={predictionError}
/>

<ModelPerformance />

          <ExplainabilityPanel
            state={explanationState}
            explanation={explanation}
            target={explanationTarget}
            onTargetChange={changeExplanationTarget}
            error={explanationError}
          />
          <SystemStatusPanel items={systemStatus} />
        </aside>
        <PatientMeasurements
          patient={patient}
          onLoadDemo={loadDemoPatient}
          canPredict={serviceState === "ready" && predictionState !== "loading"}
          predictionState={predictionState}
          predictionError={predictionError}
          onPredict={runPrediction}
        />
      </main>
    </div>
  );
}
