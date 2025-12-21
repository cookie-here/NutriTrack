from fastapi import FastAPI
from .database import engine, Base
from . import models  # Import all models
from .routers import (
    auth_router,
  
    static_router,
)
# ... rest same
app = FastAPI(title="NutriTrack API")

Base.metadata.create_all(bind=engine)  # Create tables

app.include_router(auth_router)

app.include_router(static_router)

@app.get("/")
def root():
    return {"message": "NutriTrack API running"}