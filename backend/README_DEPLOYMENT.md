# CardioVision backend deployment

This backend contains the trained CardioVision pipelines and FastAPI API.

## Local run

From this `backend` directory:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API is then available at `http://127.0.0.1:8000`.

- `GET /health` checks whether all four saved models load.
- `POST /api/predict` runs the four trained pipelines.

## Docker

```bash
docker build -t cardiovision-backend .
docker run -p 8000:8000 -e CORS_ORIGINS="*" cardiovision-backend
```

For a real deployment, set `CORS_ORIGINS` to the exact frontend origin instead of `*`.

## Important

The API rejects Cath/LAD/LCX/RCA and Exertional CP in the input to prevent target leakage and to match the training preprocessing.
