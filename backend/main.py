import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.health import router as health_router
from backend.routes.recommend import router as recommend_router
from backend.routes.detect_crop import router as detect_crop_router
from backend.routes.voice import router as voice_router

app = FastAPI(
    title="DRISHTI API",
    description="Sustainable Agriculture Assistant — Explainable, forecast-aware recommendations for Indian farmers",
    version="1.1"
)

# CORS setup for frontend (supports local dev and Vercel deployments)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routes
app.include_router(health_router)
app.include_router(recommend_router)
app.include_router(detect_crop_router)
app.include_router(voice_router)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)
