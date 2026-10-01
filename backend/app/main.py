"""Entry point of the backend.

This is where the web server starts. Right now it only creates an empty
app. Routes (URLs the frontend can call) will be added later.

Run it (from the backend/ folder) with:
    uvicorn app.main:app --reload
"""
from fastapi import FastAPI

app = FastAPI(title="Hackathon Project API")
