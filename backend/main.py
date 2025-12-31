from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
import models  # Import all models
from routers import auth_router, static_router, growth_router, reminders_router

app = FastAPI(title="NutriTrack API")

# Allow the Vite dev server and same-origin calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)  # Create tables

app.include_router(auth_router)
app.include_router(static_router)
app.include_router(growth_router)
app.include_router(reminders_router)


@app.get("/")
def root():
    return {"message": "NutriTrack API running"}