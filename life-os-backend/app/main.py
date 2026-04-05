from fastapi import FastAPI

from app.api.routes.auth import router as auth_router
from app.api.routes.health import router as health_router
from app.api.routes.meetings import router as meetings_router
from app.api.routes.planner import router as planner_router
from app.api.routes.integrations import router as integrations_router
from app.api.routes.completion_logs import router as completion_logs_router
from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.core.scheduler import start_scheduler, stop_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield
    stop_scheduler()

app = FastAPI(
    title="LifeOS Backend",
    description="Backend API for LifeOS application",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app = FastAPI(lifespan=lifespan)

app.include_router(health_router)
app.include_router(tasks_router)
app.include_router(meetings_router)
app.include_router(auth_router)
app.include_router(planner_router)
app.include_router(integrations_router)

@app.get("/")
def root():
    return {"message": "LifeOS backend running"}
