import MeasurementField from "./MeasurementField.jsx";
import { MEASUREMENT_GROUPS } from "./measurementFields.js";

export default function PatientMeasurements({
  patient,
  canPredict = false,
  predictionState = "standby",
  predictionError = "",
  onPredict,
  onLoadDemo,
}) {
  const { values, bmi, setValue, reset, hasAnyValue, missingFields, hasCompleteModelInput } = patient;

  return (
    <section className="panel dashboard__measurements" aria-labelledby="measurements-title">
      <div className="panel__header">
        <h2 className="panel__title" id="measurements-title">Patient measurements</h2>
        <p className="panel__hint">
          Complete model input schema · {missingFields.length === 0 ? "ready" : `${missingFields.length} fields remaining`}
        </p>
      </div>

      <form onSubmit={(event) => { event.preventDefault(); onPredict?.(); }}>
        {MEASUREMENT_GROUPS.map((group) => (
          <fieldset className="measure-group" key={group.id}>
            <legend className="measure-group__title">{group.title}</legend>
            <div className="measure-grid">
              {group.fields.map((field) => (
                <MeasurementField
                  key={field.id}
                  field={field}
                  value={field.id === "BMI" ? bmi : values[field.id]}
                  onChange={setValue}
                />
              ))}
            </div>
          </fieldset>
        ))}

        <div className="measure-actions">
          <button className="button" type="button" onClick={onLoadDemo}>Load demo patient</button>
          <button
            className="button button--primary"
            type="submit"
            disabled={!canPredict || !hasCompleteModelInput}
          >
            {predictionState === "loading" ? "Running prediction…" : "Run prediction"}
          </button>

          <button className="button" type="button" onClick={reset} disabled={!hasAnyValue}>
            Clear measurements
          </button>

          <p className="measure-actions__note" role={predictionError ? "alert" : undefined}>
            {predictionError
              ? `Prediction error: ${predictionError}`
              : !hasCompleteModelInput
                ? `Enter all ${MEASUREMENT_GROUPS.flatMap((group) => group.fields).filter((field) => !field.computed).length} model inputs before running prediction.`
                : canPredict
                  ? "Complete input set ready for the four prediction models."
                  : "Waiting for the prediction backend connection."}
          </p>
        </div>
      </form>
    </section>
  );
}
