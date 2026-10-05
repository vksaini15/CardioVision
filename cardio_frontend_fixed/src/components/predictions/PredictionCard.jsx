// One prediction row. `state` is: standby | loading | ready | error.
// `result` is null until the prediction service exists. When it does, pass
// `result.label` (text to show). Nothing is invented here.

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
      <div className="prediction__track" aria-hidden="true" />
      {state !== "ready" ? <p className="prediction__note">{NOTE_TEXT[state]}</p> : null}
    </li>
  );
}
