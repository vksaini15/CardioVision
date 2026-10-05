# Complete model input schema

The UI now exposes the 54 features actually consumed by the trained preprocessing pipeline:
59 original dataset columns - 4 target columns (Cath/LAD/LCX/RCA) - Exertional CP (explicitly dropped by preprocessing).

No target labels are collected from the patient form. No prediction values are hardcoded.

The form requires all model inputs before submitting `/api/predict`.
