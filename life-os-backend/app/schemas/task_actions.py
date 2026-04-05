from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class TaskRescheduleRequest(BaseModel):
    new_deadline: datetime
    reason: Optional[str] = None