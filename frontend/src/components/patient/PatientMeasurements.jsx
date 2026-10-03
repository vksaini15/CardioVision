import MeasurementField from "./MeasurementField.jsx";
import { HISTORY_TOGGLES, MEASUREMENT_GROUPS } from "./measurementFields.js";

/**
 * Patient measurement form. Values live in the usePatientMeasurements hook
 * (owned by App). Nothing is sent anywhere yet: the Run button stays disabled
 * until `canPredict` is true, which needs the prediction service.
 */
export default function PatientMeasurements({ patient, canPredict = false }) {
  const { values, bmi, setValue, reset, hasAnyValue } = patient;

  return (
    <section className="panel dashboard__measurements" aria-labelledby="measurements-title">
      <div className="panel__header">
        <h2 className="panel__title" id="measurements-title">Patient measurements</h2>
        <p className="panel__hint">Core inputs only; the full set is added with the prediction service</p>
      </div>

      <form onSubmit={(event) => event.preventDefault()}>
        {MEASUREMENT_GROUPS.map((group) => (
          <fieldset className="measure-group" key={group.id}>
            <legend className="measure-group__title">{group.title}</legend>
            <div className="measure-grid">
              {group.fields.map((field) => (
                <MeasurementField
                  key={field.id}
                  field={field}
                  value={field.computed ? bmi : values[field.id]}
                  onChange={setValue}
                />
              ))}
            </div>
          </fieldset>
        ))}

        <fieldset className="measure-group">
          <legend className="measure-group__title">History and symptoms</legend>
          <div className="toggle-grid">
            {HISTORY_TOGGLES.map((toggle) => (
              <label className="toggle" key={toggle.id}>
                <input
                  type="checkbox"
                  checked={values[toggle.id]}
                  onChange={(event) => setValue(toggle.id, event.target.checked)}
                />
                <span>{toggle.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="measure-actions">
          <button className="button button--primary" type="submit" disabled={!canPredict}>
            Run prediction
          </button>
          <button className="button" type="button" onClick={reset} disabled={!hasAnyValue}>
            Clear measurements
          </button>
          <p className="measure-actions__note">
            {canPredict
              ? "Measurements stay in this browser tab until you run a prediction."
              : "Prediction is unavailable: the prediction service is not connected. Entries stay in this browser tab only."}
          </p>
        </div>
      </form>
    </section>
  );
}
