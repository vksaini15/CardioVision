import { useState } from "react";

const TARGETS = [
  ["Cath", "Overall CAD"],
  ["LAD", "LAD"],
  ["LCX", "LCX"],
  ["RCA", "RCA"],
];

function formatImpact(value) {
  const pct = Math.abs(value * 100).toFixed(1);
  return `${pct}%`;
}

export default function ExplainabilityPanel({
  state = "standby",
  explanation = null,
  target = "Cath",
  onTargetChange,
  error = "",
}) {
  return (
    <section className="panel explainability" aria-labelledby="explainability-title">
      <div className="panel__header">
        <div>
          <h2 className="panel__title" id="explainability-title">Clinical explainability</h2>
          <p className="panel__hint">Patient-level model sensitivity</p>
        </div>
        <span className={`explainability__status explainability__status--${state}`}>
          {state === "loading" ? "Analyzing…" : state === "ready" ? "Ready" : "Waiting"}
        </span>
      </div>

      <div className="explainability__targets" role="tablist" aria-label="Explainability target">
        {TARGETS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`explainability__target${target === id ? " is-active" : ""}`}
            onClick={() => onTargetChange?.(id)}
            disabled={state === "loading"}
            role="tab"
            aria-selected={target === id}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? <p className="explainability__error" role="alert">{error}</p> : null}

      {!explanation && state !== "loading" && !error ? (
        <div className="explainability__empty">
          Run a prediction to see which patient measurements most changed the model's risk estimate.
        </div>
      ) : null}

      {state === "loading" ? (
        <div className="explainability__loading" aria-live="polite">
          Calculating local feature impacts…
        </div>
      ) : null}

      {explanation ? (
        <>
          <div className="explainability__summary">
            <span>Baseline model probability</span>
            <strong>{(explanation.baseline_probability * 100).toFixed(1)}%</strong>
          </div>

          <div className="explainability__list">
            {explanation.features.map((item) => {
              const positive = item.impact > 0;
              const width = Math.min(100, Math.max(4, Math.abs(item.impact) * 100 * 2.2));
              return (
                <div className="impact" key={item.feature}>
                  <div className="impact__head">
                    <div>
                      <strong>{item.feature}</strong>
                      <span>{item.value} <em>vs reference {item.reference_value}</em></span>
                    </div>
                    <b className={positive ? "impact__value impact__value--positive" : "impact__value impact__value--negative"}>
                      {positive ? "+" : "−"}{formatImpact(item.impact)}
                    </b>
                  </div>
                  <div className="impact__track" aria-hidden="true">
                    <span className={positive ? "impact__bar impact__bar--positive" : "impact__bar impact__bar--negative"} style={{ width: `${width}%` }} />
                  </div>
                  <p>{item.direction}</p>
                </div>
              );
            })}
          </div>

          <p className="explainability__note">
            {explanation.note}
          </p>
        </>
      ) : null}
    </section>
  );
}
