import { useMemo } from "react";
import "./styles/index.css";

import Header from "./components/layout/Header.jsx";
import DisclaimerBanner from "./components/layout/DisclaimerBanner.jsx";
import ViewerPanel from "./components/viewer/ViewerPanel.jsx";
import PredictionPanel from "./components/predictions/PredictionPanel.jsx";
import PatientMeasurements from "./components/patient/PatientMeasurements.jsx";
import SystemStatusPanel from "./components/status/SystemStatusPanel.jsx";
import { INITIAL_SYSTEM_STATUS, summarizeStatus } from "./components/status/systemStatus.js";
import { usePatientMeasurements } from "./hooks/usePatientMeasurements.js";

// Root component: assembles the dashboard. It holds no business logic yet.
// Later: pass <HeartScene /> to ViewerPanel, feed real results to
// PredictionPanel, and replace INITIAL_SYSTEM_STATUS with live state.
export default function App() {
  const patient = usePatientMeasurements();
  const systemStatus = INITIAL_SYSTEM_STATUS;
  const overall = useMemo(() => summarizeStatus(systemStatus), [systemStatus]);

  const predictionService = systemStatus.find((item) => item.id === "predictions");

  return (
    <div className="app-shell">
      <Header status={overall} />
      <DisclaimerBanner />

      <main className="dashboard">
        <ViewerPanel />

        <aside className="dashboard__aside" aria-label="Predictions and system status">
          <PredictionPanel state={predictionService.state} results={{}} />
          <SystemStatusPanel items={systemStatus} />
        </aside>

        <PatientMeasurements patient={patient} canPredict={predictionService.state === "ready"} />
      </main>
    </div>
  );
}
