from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth_router, lawyers_router, appointments_router, resources_router, ai_router
from .routers import hero_slides_router
import os

# Create DB Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="THE LAW GO API", version="1.0.0")

# Setup CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(lawyers_router.router)
app.include_router(appointments_router.router)
app.include_router(resources_router.router)
app.include_router(ai_router.router)
app.include_router(hero_slides_router.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to THE LAW GO API - System Online"}
