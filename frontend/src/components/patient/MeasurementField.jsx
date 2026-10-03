/** A single labelled number input or dropdown. Wrapping <label> links text and control. */
export default function MeasurementField({ field, value, onChange }) {
  const labelText = (
    <span className="field__label">
      {field.label}
      {field.unit ? <span className="field__unit"> ({field.unit})</span> : null}
    </span>
  );

  if (field.type === "select") {
    return (
      <label className="field">
        {labelText}
        <select
          className="field__control"
          value={value}
          onChange={(event) => onChange(field.id, event.target.value)}
        >
          <option value="">Select</option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="field">
      {labelText}
      <input
        className="field__control"
        type="number"
        inputMode="decimal"
        min={field.min}
        max={field.max}
        step={field.step}
        value={value}
        readOnly={field.computed}
        tabIndex={field.computed ? -1 : undefined}
        onChange={field.computed ? undefined : (event) => onChange(field.id, event.target.value)}
      />
      {field.help ? <span className="field__help">{field.help}</span> : null}
    </label>
  );
}
