"""User service for managing user operations."""

from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.repositories.user_repository import UserRepository


class UserService:
    """Service for user-related business logic."""

    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def get_user_by_firebase_uid(self, firebase_uid: str) -> Optional[User]:
        """Get user by Firebase UID."""
        return self.user_repo.get_by_firebase_uid(firebase_uid)

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID."""
        return self.user_repo.get_by_id(user_id)

    def create_or_update_user_from_firebase(self, firebase_user_data: dict) -> User:
        """Create or update user from Firebase authentication data."""
        firebase_uid = firebase_user_data['uid']

        # Check if user already exists
        existing_user = self.get_user_by_firebase_uid(firebase_uid)

        if existing_user:
            # Update existing user with latest Firebase data
            return self._update_user_from_firebase(existing_user, firebase_user_data)
        else:
            # Create new user
            return self._create_user_from_firebase(firebase_user_data)

    def _create_user_from_firebase(self, firebase_user_data: dict) -> User:
        """Create new user from Firebase data."""
        user_data = UserCreate(
            firebase_uid=firebase_user_data['uid'],
            email=firebase_user_data.get('email', ''),
            full_name=firebase_user_data.get('name', ''),
            # Other fields will use defaults
        )
        return self.user_repo.create(user_data)

    def _update_user_from_firebase(self, user: User, firebase_user_data: dict) -> User:
        """Update existing user with Firebase data."""
        # Update fields that might have changed
        if firebase_user_data.get('email') and user.email != firebase_user_data['email']:
            user.email = firebase_user_data['email']
        if firebase_user_data.get('name') and user.full_name != firebase_user_data['name']:
            user.full_name = firebase_user_data['name']

        self.db.commit()
        self.db.refresh(user)
        return user

    def get_user_response(self, user: User) -> UserResponse:
        """Convert User model to UserResponse schema."""
        return UserResponse.model_validate(user)