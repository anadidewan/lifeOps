from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

import requests
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from urllib.parse import urlencode

from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse

from app.core.config import settings
from app.models.user import User
from app.core.config import settings
from app.models.integration import Integration



from app.core.auth import get_current_user_required
from app.core.database import get_db
from app.models.user import User
from app.models.integration import Integration
from app.schemas.integration_sync import SyncResultResponse

from app.services.integrations.gmail_service import GmailService
from app.services.sync_service import run_provider_sync

router = APIRouter(prefix="/integrations", tags=["integrations"])


@router.post("/{provider}/sync", response_model=SyncResultResponse)
def sync_provider(
    provider: Literal["canvas", "gmail"],
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    try:
        return run_provider_sync(
            db=db,
            user=current_user,
            provider=provider,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )



@router.get("/gmail/connect")
def gmail_connect(current_user: User = Depends(get_current_user_required)):
    state = f"{current_user.id}"  # later replace with signed state

    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile https://www.googleapis.com/auth/gmail.readonly",
        "access_type": "offline",
        "prompt": "consent",
        "state": state,
    }

    auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(params)
    return RedirectResponse(auth_url)


@router.get("/gmail/callback")
def gmail_callback(code: str, state: str, db: Session = Depends(get_db)):
    user_id = int(state)

    token_resp = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        },
        timeout=30,
    )
    token_resp.raise_for_status()
    token_data = token_resp.json()

    access_token = token_data["access_token"]
    refresh_token = token_data.get("refresh_token")
    expires_in = token_data.get("expires_in", 3600)
    token_type = token_data.get("token_type")
    scope = token_data.get("scope")

    userinfo_resp = requests.get(
        "https://openidconnect.googleapis.com/v1/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=30,
    )
    userinfo_resp.raise_for_status()
    userinfo = userinfo_resp.json()

    integration = (
        db.query(Integration)
        .filter(
            Integration.user_id == user_id,
            Integration.provider == "gmail",
        )
        .first()
    )

    if not integration:
        integration = Integration(
            user_id=user_id,
            provider="gmail",
        )
        db.add(integration)

    integration.access_token = access_token
    if refresh_token:
        integration.refresh_token = refresh_token
    integration.token_type = token_type
    integration.scope = scope
    integration.expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
    integration.provider_email = userinfo.get("email")
    integration.provider_account_id = userinfo.get("sub")
    integration.is_active = True

    db.commit()

    return RedirectResponse("http://localhost:3000/settings?gmail=connected")




@router.post("/gmail/sync")
def sync_gmail(
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    integration = (
        db.query(Integration)
        .filter(
            Integration.user_id == current_user.id,
            Integration.provider == "gmail",
            Integration.is_active.is_(True),
        )
        .first()
    )

    if not integration:
        raise HTTPException(status_code=404, detail="No active gmail integration found")

    gmail_service = GmailService()
    tasks = gmail_service.sync(integration, db)

    return {
        "provider": "gmail",
        "tasks_found": len(tasks),
        "tasks": [task.model_dump() for task in tasks],
    }