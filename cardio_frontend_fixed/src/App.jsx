import { useCallback, useEffect, useMemo, useState } from "react";
import "./styles/index.css";

import Header from "./components/layout/Header.jsx";
import DisclaimerBanner from "./components/layout/DisclaimerBanner.jsx";
import ViewerPanel from "./components/viewer/ViewerPanel.jsx";
import PredictionPanel from "./components/predictions/PredictionPanel.jsx";
import PatientMeasurements from "./components/patient/PatientMeasurements.jsx";
import SystemStatusPanel from "./components/status/SystemStatusPanel.jsx";
import { summarizeStatus } from "./components/status/systemStatus.js";
import { usePatientMeasurements } from "./hooks/usePatientMeasurements.js";
import { checkHealth, predictPatient } from "./services/predictionApi.js";

function buildPayload(values, bmi) {
  const payload = {};

  for (const [key, value] of Object.entries(values)) {
    if (value === "") continue;
    if (key === "Length" || key === "Weight") {
      payload[key] = Number(value);
    } else if (["Age", "DM", "HTN", "Current Smoker", "EX-Smoker", "FH", "Edema", "Typical Chest Pain", "Function Class", "Q Wave", "St Elevation", "St Depression", "Tinversion", "BP", "PR", "FBS", "CR", "TG", "LDL", "HDL", "BUN", "ESR", "HB", "K", "Na", "WBC", "Lymph", "Neut", "PLT", "EF-TTE", "Region RWMA"].includes(key)) {
      payload[key] = Number(value);
    } else {
      payload[key] = value;
    }
  }

  payload.BMI = Number(bmi);
  return payload;
}

function mapPrediction(raw) {
  return raw
    ? {
        label: `${(raw.probability * 100).toFixed(1)}%`,
        probability: raw.probability,
        prediction: raw.prediction,
      }
    : null;
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
  "Region RWMA": 0, VHD: "N",
};

export default function App() {
  const patient = usePatientMeasurements();
  const [serviceState, setServiceState] = useState("loading");
  const [serviceDetail, setServiceDetail] = useState("Checking backend connection");
  const [predictionState, setPredictionState] = useState("standby");
  const [predictionError, setPredictionError] = useState("");
  const [results, setResults] = useState({});

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
      const response = await predictPatient(buildPayload(patient.values, patient.bmi));
      const raw = response?.predictions || {};
      setResults({
        cad: mapPrediction(raw.Cath),
        lad: mapPrediction(raw.LAD),
        lcx: mapPrediction(raw.LCX),
        rca: mapPrediction(raw.RCA),
      });
      setPredictionState("ready");
    } catch (error) {
      setPredictionState("error");
      setPredictionError(error.message || "Prediction request failed.");
    }
  }, [patient.hasCompleteModelInput, patient.bmi, patient.values, serviceState]);

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
        <ViewerPanel />
        <aside className="dashboard__aside" aria-label="Predictions and system status">
          <PredictionPanel state={predictionState} results={results} error={predictionError} />
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
