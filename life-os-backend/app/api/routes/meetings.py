from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.auth import get_current_user_required
from app.core.database import get_db
from app.models.user import User
from app.schemas.meeting import MeetingCreate, MeetingUpdate, MeetingResponse
from app.repositories.meeting_repository import MeetingRepository

router = APIRouter(prefix="/meetings", tags=["meetings"])
repo = MeetingRepository()


@router.post("", response_model=MeetingResponse)
def create_meeting(
    payload: MeetingCreate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    return repo.create(db, user_id=current_user.id, payload=payload)


@router.get("", response_model=list[MeetingResponse])
def list_meetings(
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    return repo.list_all(db, user_id=current_user.id)


@router.patch("/{meeting_id}", response_model=MeetingResponse)
def update_meeting(
    meeting_id: int,
    payload: MeetingUpdate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    meeting = repo.get_by_id(db, meeting_id=meeting_id, user_id=current_user.id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return repo.update(db, meeting=meeting, payload=payload)