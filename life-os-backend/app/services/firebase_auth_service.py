"""Firebase authentication service."""

import firebase_admin
from firebase_admin import auth, credentials
from typing import Optional, Dict, Any
from app.core.config import settings


class FirebaseAuthService:
    """Service for Firebase authentication operations."""

    def __init__(self):
        self._initialize_firebase()

    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK."""
        if not firebase_admin._apps:
            if settings.FIREBASE_PRIVATE_KEY and settings.FIREBASE_CLIENT_EMAIL:
                # Use service account credentials
                cred = credentials.Certificate({
                    "type": "service_account",
                    "project_id": settings.FIREBASE_PROJECT_ID,
                    "private_key": settings.FIREBASE_PRIVATE_KEY.replace('\\n', '\n'),
                    "client_email": settings.FIREBASE_CLIENT_EMAIL,
                    "token_uri": "https://oauth2.googleapis.com/token",
                })
                firebase_admin.initialize_app(cred)
            else:
                # Use default credentials (for GCP environments)
                firebase_admin.initialize_app()

    async def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify Firebase ID token and return decoded token data."""
        try:
            decoded_token = auth.verify_id_token(token)
            return decoded_token
        except Exception as e:
            print(f"Token verification failed: {e}")
            return None

    async def get_user(self, uid: str) -> Optional[Dict[str, Any]]:
        """Get Firebase user by UID."""
        try:
            user = auth.get_user(uid)
            return {
                'uid': user.uid,
                'email': user.email,
                'email_verified': user.email_verified,
                'display_name': user.display_name,
                'photo_url': user.photo_url,
                'disabled': user.disabled,
                'custom_claims': user.custom_claims,
            }
        except Exception as e:
            print(f"Failed to get user {uid}: {e}")
            return None

    async def create_user(self, email: str, password: str = None, display_name: str = None) -> Optional[str]:
        """Create a new Firebase user."""
        try:
            user = auth.create_user(
                email=email,
                password=password,
                display_name=display_name,
            )
            return user.uid
        except Exception as e:
            print(f"Failed to create user: {e}")
            return None

    async def update_user(self, uid: str, **updates) -> bool:
        """Update Firebase user."""
        try:
            auth.update_user(uid, **updates)
            return True
        except Exception as e:
            print(f"Failed to update user {uid}: {e}")
            return False


# Global instance
firebase_auth = FirebaseAuthService()