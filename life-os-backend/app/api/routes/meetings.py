from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.meeting import MeetingCreate, MeetingUpdate, MeetingResponse
from app.repositories.meeting_repository import MeetingRepository

router = APIRouter(prefix="/meetings", tags=["meetings"])
repo = MeetingRepository()

DUMMY_USER_ID = 1


@router.post("", response_model=MeetingResponse)
def create_meeting(payload: MeetingCreate, db: Session = Depends(get_db)):
    return repo.create(db, user_id=DUMMY_USER_ID, payload=payload)


@router.get("", response_model=list[MeetingResponse])
def list_meetings(db: Session = Depends(get_db)):
    return repo.list_all(db, user_id=DUMMY_USER_ID)


@router.patch("/{meeting_id}", response_model=MeetingResponse)
def update_meeting(meeting_id: int, payload: MeetingUpdate, db: Session = Depends(get_db)):
    meeting = repo.get_by_id(db, meeting_id=meeting_id, user_id=DUMMY_USER_ID)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return repo.update(db, meeting=meeting, payload=payload)