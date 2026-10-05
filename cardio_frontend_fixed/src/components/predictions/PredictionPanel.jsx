import PredictionCard from "./PredictionCard.jsx";
import { PREDICTION_TARGETS } from "./targets.js";

export default function PredictionPanel({ state = "standby", results = {}, error = "" }) {
  return (
    <section className="panel" aria-labelledby="predictions-title">
      <div className="panel__header">
        <h2 className="panel__title" id="predictions-title">Predictions</h2>
        <p className="panel__hint">Four separate models</p>
      </div>
      {error && state === "error" ? (
        <p className="prediction-panel__error" role="alert">
          {error}
        </p>
      ) : null}
      <ul className="prediction-list">
        {PREDICTION_TARGETS.map((target) => (
          <PredictionCard
            key={target.id}
            target={target}
            state={state}
            result={results[target.id] ?? null}
          />
        ))}
      </ul>
    </section>
  );
}
