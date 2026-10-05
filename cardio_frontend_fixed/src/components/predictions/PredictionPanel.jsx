import PredictionCard from "./PredictionCard.jsx";
import { PREDICTION_TARGETS } from "./targets.js";

function getRiskLevel(probability) {
  if (probability >= 0.7) return "High";
  if (probability >= 0.4) return "Moderate";
  return "Lower";
}

function getRiskClass(probability) {
  if (probability >= 0.7) return "high";
  if (probability >= 0.4) return "moderate";
  return "lower";
}

export default function PredictionPanel({
  state = "standby",
  results = {},
  error = "",
}) {
  const ready = state === "ready";

  const riskResults = PREDICTION_TARGETS.map((target) => {
    const probability =
      ready && Number.isFinite(results[target.id]?.probability)
        ? Math.max(0, Math.min(1, results[target.id].probability))
        : 0;

    return {
      ...target,
      probability,
      percentage: probability * 100,
      riskLevel: getRiskLevel(probability),
      riskClass: getRiskClass(probability),
    };
  });

  const vesselResults = riskResults.filter(
  (result) => !result.primary
);

  const highestRiskVessel = vesselResults.reduce(
    (highest, current) =>
      current.probability > highest.probability ? current : highest,
    vesselResults[0] || null
  );

  return (
    <>
      <section className="panel" aria-labelledby="risk-summary-title">
        <div className="panel__header">
          <div>
            <h2 className="panel__title" id="risk-summary-title">
              Cardiovascular Risk Summary
            </h2>
            <p className="panel__hint">
              Model-predicted positive-class probabilities
            </p>
          </div>
        </div>

        <div className="risk-summary">
          {riskResults.map((result) => (
            <div className="risk-summary__item" key={result.id}>
              <div className="risk-summary__top">
                <div>
                  <strong>{result.name}</strong>
                  <span className="risk-summary__level">
                    {ready ? result.riskLevel : "Waiting"}
                  </span>
                </div>

                <strong className="risk-summary__percentage">
                  {ready ? `${result.percentage.toFixed(1)}%` : "—"}
                </strong>
              </div>

              <div className="risk-summary__track">
                {ready ? (
                  <span
                    className={`risk-summary__fill risk-summary__fill--${result.riskClass}`}
                    style={{ width: `${result.percentage}%` }}
                  />
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {ready && highestRiskVessel ? (
          <div className="risk-summary__highlight">
            <span>Highest predicted vessel risk</span>
            <strong>
              {highestRiskVessel.name} —{" "}
              {highestRiskVessel.percentage.toFixed(1)}%
            </strong>
          </div>
        ) : null}

        <p className="risk-summary__disclaimer">
          These values represent model probabilities, not measured arterial
          blockage percentages or a clinical diagnosis.
        </p>
      </section>

      <section className="panel" aria-labelledby="predictions-title">
        <div className="panel__header">
          <h2 className="panel__title" id="predictions-title">
            Predictions
          </h2>
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
    </>
  );
}