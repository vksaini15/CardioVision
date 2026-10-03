import { useCallback, useMemo, useState } from "react";
import { HISTORY_TOGGLES, MEASUREMENT_GROUPS } from "../components/patient/measurementFields.js";

// Empty starting state: text/number inputs are "", yes/no toggles are false.
function emptyValues() {
  const values = {};
  for (const group of MEASUREMENT_GROUPS) {
    for (const field of group.fields) {
      if (!field.computed) values[field.id] = "";
    }
  }
  for (const toggle of HISTORY_TOGGLES) values[toggle.id] = false;
  return values;
}

/** BMI = weight (kg) / height (m)^2. Returns "" until both inputs are valid. */
export function calculateBmi(heightCm, weightKg) {
  const height = Number(heightCm);
  const weight = Number(weightKg);
  if (!(height > 0) || !(weight > 0)) return "";
  return (weight / (height / 100) ** 2).toFixed(1);
}

/**
 * Holds the patient form state. Kept in a hook (used by App) so the same
 * values can later be sent to the prediction API.
 */
export function usePatientMeasurements() {
  const [values, setValues] = useState(emptyValues);

  const setValue = useCallback((id, value) => {
    setValues((current) => ({ ...current, [id]: value }));
  }, []);

  const reset = useCallback(() => setValues(emptyValues()), []);

  const bmi = useMemo(() => calculateBmi(values.height, values.weight), [values.height, values.weight]);

  const hasAnyValue = useMemo(
    () => Object.values(values).some((value) => value !== "" && value !== false),
    [values]
  );

  return { values, bmi, setValue, reset, hasAnyValue };
}
