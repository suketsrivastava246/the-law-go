from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .models import User
from .seed import seed_database
from .routers import auth_router, lawyers_router, appointments_router, resources_router, ai_router
from .routers import hero_slides_router
import os

# Create DB Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="THE LAW GO API", version="1.0.0")

# Setup CORS for frontend (allows local dev + any Netlify deployment)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https://.*\.netlify\.app.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            print("Database empty: auto-seeding initial sample data & admin account...")
            seed_database()
    except Exception as e:
        print(f"Startup notice: {e}")
    finally:
        db.close()

app.include_router(auth_router.router)
app.include_router(lawyers_router.router)
app.include_router(appointments_router.router)
app.include_router(resources_router.router)
app.include_router(ai_router.router)
app.include_router(hero_slides_router.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to THE LAW GO API - System Online"}
