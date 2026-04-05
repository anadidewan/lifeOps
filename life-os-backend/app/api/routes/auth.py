"""Authentication routes for Firebase integration."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.services.integrations.integration_service import upsert_integration

from app.core.database import get_db
from app.core.auth import get_current_user, get_current_user_required
from app.models.user import User
from app.services.user_service import UserService
from app.services.firebase_auth_service import firebase_auth
from app.schemas.user import UserResponse
from app.repositories.integration_repository import IntegrationCreate
router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/verify-token", response_model=Dict[str, Any])
async def verify_token(
    token_data: Dict[str, Any],
    db: Session = Depends(get_db),
):
    token = token_data.get("token")
    canvas_token = token_data.get("canvas_token")

    if not token:
        raise HTTPException(status_code=400, detail="Token is required")

    firebase_user = await firebase_auth.verify_token(token)

    if not firebase_user:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_service = UserService(db)

    user = user_service.create_or_update_user_from_firebase(firebase_user)

    # save canvas token if provided
    if canvas_token:

        integration_data = IntegrationCreate(
            provider="canvas",
            access_token=canvas_token,
            status="connected",
            is_active=True,
        )

        upsert_integration(
            db=db,
            user_id=user.id,
            data=integration_data,
        )

    return {
        "user": user_service.get_user_response(user).model_dump(),
        "firebase_user": firebase_user,
        "message": "Token verified successfully",
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user_required)
):
    """Get current authenticated user's profile."""
    return UserResponse.model_validate(current_user)


@router.get("/firebase-user")
async def get_firebase_user_info(
    current_user: User = Depends(get_current_user_required)
):
    """Get current user's Firebase information."""
    firebase_user = await firebase_auth.get_user(current_user.firebase_uid)
    if not firebase_user:
        raise HTTPException(status_code=404, detail="Firebase user not found")

    return firebase_user