// Core patient measurements shown in the form.
// This is a subset of the model's inputs; the full set is added with the
// prediction service. Field ids are UI ids, not backend column names.

export const MEASUREMENT_GROUPS = [
  {
    id: "demographics",
    title: "Demographics",
    fields: [
      { id: "age", label: "Age", unit: "years", type: "number", min: 0, max: 120, step: 1 },
      {
        id: "sex",
        label: "Sex",
        type: "select",
        options: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
        ],
      },
      { id: "height", label: "Height", unit: "cm", type: "number", min: 100, max: 230, step: 1 },
      { id: "weight", label: "Weight", unit: "kg", type: "number", min: 20, max: 300, step: 1 },
      {
        id: "bmi",
        label: "BMI",
        unit: "kg/m²",
        type: "number",
        computed: true,
        help: "Calculated from height and weight",
      },
    ],
  },
  {
    id: "vitals",
    title: "Vitals",
    fields: [
      { id: "bloodPressure", label: "Blood pressure", unit: "mmHg", type: "number", min: 50, max: 260, step: 1 },
      { id: "pulseRate", label: "Pulse rate", unit: "bpm", type: "number", min: 30, max: 220, step: 1 },
    ],
  },
  {
    id: "labs",
    title: "Blood tests",
    fields: [
      { id: "fastingBloodSugar", label: "Fasting blood sugar", unit: "mg/dL", type: "number", min: 20, max: 800, step: 1 },
      { id: "ldl", label: "LDL cholesterol", unit: "mg/dL", type: "number", min: 10, max: 500, step: 1 },
      { id: "hdl", label: "HDL cholesterol", unit: "mg/dL", type: "number", min: 5, max: 200, step: 0.1 },
      { id: "triglycerides", label: "Triglycerides", unit: "mg/dL", type: "number", min: 10, max: 3000, step: 1 },
      { id: "creatinine", label: "Creatinine", unit: "mg/dL", type: "number", min: 0.1, max: 15, step: 0.1 },
      { id: "hemoglobin", label: "Hemoglobin", unit: "g/dL", type: "number", min: 3, max: 25, step: 0.1 },
    ],
  },
  {
    id: "echo",
    title: "Heart ultrasound",
    fields: [
      { id: "ejectionFraction", label: "Ejection fraction", unit: "%", type: "number", min: 5, max: 85, step: 1 },
    ],
  },
];

export const HISTORY_TOGGLES = [
  { id: "diabetes", label: "Diabetes" },
  { id: "hypertension", label: "Hypertension" },
  { id: "currentSmoker", label: "Current smoker" },
  { id: "familyHistory", label: "Family history of heart disease" },
  { id: "typicalChestPain", label: "Typical chest pain" },
];
