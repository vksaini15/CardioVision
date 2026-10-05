import { useCallback, useMemo, useState } from "react";
import { MEASUREMENT_GROUPS } from "../components/patient/measurementFields.js";

function emptyValues() {
  const values = {};
  for (const group of MEASUREMENT_GROUPS) {
    for (const field of group.fields) {
      if (!field.computed) values[field.id] = "";
    }
  }
  return values;
}

export function calculateBmi(heightCm, weightKg) {
  const height = Number(heightCm);
  const weight = Number(weightKg);
  if (!(height > 0) || !(weight > 0)) return "";
  return (weight / (height / 100) ** 2).toFixed(1);
}

export function usePatientMeasurements() {
  const [values, setValues] = useState(emptyValues);

  const setValue = useCallback((id, value) => {
    setValues((current) => ({ ...current, [id]: value }));
  }, []);

  const reset = useCallback(() => setValues(emptyValues()), []);

  const bmi = useMemo(
    () => calculateBmi(values.Length, values.Weight),
    [values.Length, values.Weight]
  );

  const missingFields = useMemo(() => {
    const missing = [];
    for (const group of MEASUREMENT_GROUPS) {
      for (const field of group.fields) {
        if (field.computed) {
          if (field.id === "BMI" && bmi === "") missing.push(field.id);
          continue;
        }
        if (values[field.id] === "" || values[field.id] === null || values[field.id] === undefined) {
          missing.push(field.id);
        }
      }
    }
    return missing;
  }, [bmi, values]);

  const hasCompleteModelInput = missingFields.length === 0;

  const hasAnyValue = useMemo(
    () => Object.values(values).some((value) => value !== ""),
    [values]
  );

  return {
    values,
    bmi,
    setValue,
    reset,
    hasAnyValue,
    missingFields,
    hasCompleteModelInput,
  };
}
