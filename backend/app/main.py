from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.database import Base, engine
from app.api import activities, auth

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Interview Process System API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(activities.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}
