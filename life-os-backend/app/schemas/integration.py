from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class IntegrationCreate(BaseModel):
    provider: str
    status: str = "connected"
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    is_active: bool = True


class IntegrationUpdate(BaseModel):
    status: Optional[str] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    is_active: Optional[bool] = None
    last_synced_at: Optional[datetime] = None


class IntegrationResponse(BaseModel):
    id: int
    user_id: int
    provider: str
    status: str
    is_active: bool
    last_synced_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class SyncResultResponse(BaseModel):
    provider: str
    tasks_created: int
    tasks_updated: int
    meetings_created: int
    meetings_updated: int
    skipped: int
    status: str
    detail: str