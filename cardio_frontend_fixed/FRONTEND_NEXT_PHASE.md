# CardioVision frontend next phase

This version adds the frontend API plumbing:
- `/health` connection check through the Vite dev proxy
- `/api/predict` request service
- loading, success and error states
- mapping of backend `Cath/LAD/LCX/RCA` results to `cad/lad/lcx/rca` cards
- probability bars

Important: the current patient form exposes only a subset of the ML feature schema. The frontend deliberately does not invent missing clinical measurements. The complete model-input form/adapter must be added before real patient predictions can be considered complete.
