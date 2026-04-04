"""Firebase authentication middleware."""

from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from app.services.firebase_auth_service import firebase_auth


security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[dict]:
    """Get current authenticated user from Firebase token."""
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
    user: Optional[dict] = Depends(get_current_user)
) -> dict:
    """Get current authenticated user (required)."""
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )
    return user


async def get_current_user_uid(
    user: dict = Depends(get_current_user_required)
) -> str:
    """Get current user's Firebase UID."""
    return user['uid']