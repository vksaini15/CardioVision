const RESULT_TEXT = {
  standby: "No result yet",
  loading: "Calculating…",
  error: "Unavailable",
};

const NOTE_TEXT = {
  standby: "Waiting for the prediction service.",
  loading: "Running the model.",
  error: "The prediction could not be completed.",
};

export default function PredictionCard({ target, state, result }) {
  const resultText = state === "ready" ? result?.label ?? "No result yet" : RESULT_TEXT[state];
  const probability =
    state === "ready" && Number.isFinite(result?.probability)
      ? Math.max(0, Math.min(1, result.probability))
      : 0;

  return (
    <li
      className={`prediction${target.primary ? " prediction--primary" : ""}`}
      data-state={state}
    >
      <div className="prediction__row">
        <div>
          <h3 className="prediction__name">{target.name}</h3>
          <p className="prediction__desc">{target.description}</p>
        </div>
        <p className="prediction__result">{resultText}</p>
      </div>

      <div className="prediction__track" aria-label={`${target.name} probability`}>
        {state === "ready" ? (
          <span
            className="prediction__fill"
            style={{ width: `${probability * 100}%` }}
          />
        ) : null}
      </div>

      {state !== "ready" ? <p className="prediction__note">{NOTE_TEXT[state]}</p> : null}
    </li>
  );
}
