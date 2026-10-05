// Complete model input schema for the trained CardioVision pipelines.
// Target columns (Cath/LAD/LCX/RCA) are deliberately NOT included.
// "Exertional CP" is also omitted because the backend preprocessing drops it.

const yesNo = (id, label) => ({
  id, label, type: "select",
  options: [
    { value: "N", label: "No" },
    { value: "Y", label: "Yes" },
  ],
});

const binaryNumber = (id, label) => ({
  id, label, type: "select",
  options: [
    { value: "0", label: "No" },
    { value: "1", label: "Yes" },
  ],
});

const number = (id, label, unit = "", step = 1) => ({
  id, label, unit, type: "number", step,
});

export const MEASUREMENT_GROUPS = [
  {
    id: "demographics",
    title: "Demographics",
    fields: [
      number("Age", "Age", "years"),
      number("Weight", "Weight", "kg", 0.1),
      number("Length", "Height / length", "cm", 0.1),
      {
        id: "Sex", label: "Sex", type: "select",
        options: [
          { value: "Male", label: "Male" },
          { value: "Female", label: "Female" },
        ],
      },
      { id: "BMI", label: "BMI", unit: "kg/m²", type: "number", step: 0.1, computed: true },
      binaryNumber("DM", "Diabetes"),
      binaryNumber("HTN", "Hypertension"),
      binaryNumber("Current Smoker", "Current smoker"),
      binaryNumber("EX-Smoker", "Ex-smoker"),
      binaryNumber("FH", "Family history"),
      yesNo("Obesity", "Obesity"),
      yesNo("CRF", "Chronic renal failure"),
      yesNo("CVA", "Cerebrovascular accident history"),
      yesNo("Airway disease", "Airway disease"),
      yesNo("Thyroid Disease", "Thyroid disease"),
      yesNo("CHF", "Congestive heart failure"),
      yesNo("DLP", "Dyslipidemia"),
    ],
  },
  {
    id: "vitals",
    title: "Vitals and examination",
    fields: [
      number("BP", "Blood pressure", "mmHg"),
      number("PR", "Pulse rate", "bpm"),
      binaryNumber("Edema", "Edema"),
      yesNo("Weak Peripheral Pulse", "Weak peripheral pulse"),
      yesNo("Lung rales", "Lung rales"),
      yesNo("Systolic Murmur", "Systolic murmur"),
      yesNo("Diastolic Murmur", "Diastolic murmur"),
      binaryNumber("Typical Chest Pain", "Typical chest pain"),
      yesNo("Dyspnea", "Dyspnea"),
      {
        id: "Function Class", label: "Function class", type: "select",
        options: [
          { value: "0", label: "0" },
          { value: "1", label: "1" },
          { value: "2", label: "2" },
          { value: "3", label: "3" },
        ],
      },
      yesNo("Atypical", "Atypical chest pain"),
      yesNo("Nonanginal", "Nonanginal symptoms"),
      // Exertional CP is intentionally omitted: training preprocessing drops it.
      yesNo("LowTH Ang", "Low-threshold angina"),
    ],
  },
  {
    id: "ecg",
    title: "ECG",
    fields: [
      binaryNumber("Q Wave", "Q wave"),
      binaryNumber("St Elevation", "ST elevation"),
      binaryNumber("St Depression", "ST depression"),
      binaryNumber("Tinversion", "T inversion"),
      yesNo("LVH", "LVH"),
      yesNo("Poor R Progression", "Poor R progression"),
      yesNo("BBB", "Bundle branch block"),
    ],
  },
  {
    id: "labs",
    title: "Blood tests",
    fields: [
      number("FBS", "Fasting blood sugar", "mg/dL", 0.1),
      number("CR", "Creatinine", "mg/dL", 0.01),
      number("TG", "Triglycerides", "mg/dL", 0.1),
      number("LDL", "LDL cholesterol", "mg/dL", 0.1),
      number("HDL", "HDL cholesterol", "mg/dL", 0.1),
      number("BUN", "BUN", "mg/dL", 0.1),
      number("ESR", "ESR", "mm/hr", 0.1),
      number("HB", "Hemoglobin", "g/dL", 0.1),
      number("K", "Potassium", "", 0.01),
      number("Na", "Sodium", "", 0.1),
      number("WBC", "White blood cells", "", 0.1),
      number("Lymph", "Lymphocytes", "", 0.1),
      number("Neut", "Neutrophils", "", 0.1),
      number("PLT", "Platelets", "", 0.1),
    ],
  },
  {
    id: "echo",
    title: "Echocardiography",
    fields: [
      number("EF-TTE", "Ejection fraction", "%", 0.1),
      number("Region RWMA", "Region with RWMA", "", 0.1),
      {
        id: "VHD", label: "Valvular heart disease", type: "select",
        options: [
          { value: "N", label: "None" },
          { value: "mild", label: "Mild" },
          { value: "Moderate", label: "Moderate" },
          { value: "Severe", label: "Severe" },
        ],
      },
    ],
  },
];

export const TARGET_COLUMNS = ["Cath", "LAD", "LCX", "RCA"];
export const OMITTED_FEATURES = ["Exertional CP"];

export const ALL_MODEL_FIELDS = MEASUREMENT_GROUPS.flatMap((group) => group.fields);
