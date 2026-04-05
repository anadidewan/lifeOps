from fastapi import FastAPI

from app.api.routes.auth import router as auth_router
from app.api.routes.health import router as health_router
from app.api.routes.meetings import router as meetings_router
from app.api.routes.planner import router as planner_router
from app.api.routes.tasks import router as tasks_router

app = FastAPI(
    title="LifeOS Backend",
    description="Backend API for LifeOS application",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.include_router(health_router)
app.include_router(tasks_router)
app.include_router(meetings_router)
app.include_router(auth_router)
app.include_router(planner_router)


@app.get("/")
def root():
    return {"message": "LifeOS backend running"}
