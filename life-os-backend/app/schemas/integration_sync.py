from typing import Optional

from pydantic import BaseModel


class ConnectCanvasRequest(BaseModel):
    access_token: str

    
class SyncResultResponse(BaseModel):
    provider: str
    tasks_created: int = 0
    tasks_updated: int = 0
    meetings_created: int = 0
    meetings_updated: int = 0
    skipped: int = 0
    status: str = "success"
    detail: Optional[str] = None