import PredictionCard from "./PredictionCard.jsx";
import { PREDICTION_TARGETS } from "./targets.js";

/**
 * Right-hand prediction panel: overall CAD risk, then LAD, LCX and RCA.
 * `state`   - standby | loading | ready | error (same for all four for now)
 * `results` - object keyed by target id, e.g. { cad: { label: "..." } }.
 *             Empty until the prediction service is connected.
 */
export default function PredictionPanel({ state = "standby", results = {} }) {
  return (
    <section className="panel" aria-labelledby="predictions-title">
      <div className="panel__header">
        <h2 className="panel__title" id="predictions-title">Predictions</h2>
        <p className="panel__hint">Four separate models</p>
      </div>
      <ul className="prediction-list">
        {PREDICTION_TARGETS.map((target) => (
          <PredictionCard key={target.id} target={target} state={state} result={results[target.id] ?? null} />
        ))}
      </ul>
    </section>
  );
}
