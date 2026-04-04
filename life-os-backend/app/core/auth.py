"""Firebase authentication middleware."""

from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.firebase_auth_service import firebase_auth
from app.services.user_service import UserService
from app.models.user import User


security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[dict]:
    """Get current authenticated user claims from Firebase token."""
    if not credentials:
        return None

    token = credentials.credentials
    user_data = await firebase_auth.verify_token(token)

    if not user_data:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )

    return user_data


async def get_current_user_required(
    user: Optional[dict] = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    """Get current authenticated app user (required)."""
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    user_service = UserService(db)
    app_user = user_service.create_or_update_user_from_firebase(user)
    return app_user


async def get_current_user_uid(
    user: User = Depends(get_current_user_required)
) -> str:
    """Get current user's Firebase UID."""
    return user.firebase_uid