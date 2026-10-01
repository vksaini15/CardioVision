# Hackathon Project

Python ML backend (FastAPI) + React frontend (Vite).

## Structure
- `backend/`  - Python API and machine learning code
- `frontend/` - React user interface

## Run the backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Backend runs at http://localhost:8000 (auto docs at /docs).

## Run the frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at http://localhost:5173.
