from fastapi import HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository
from app.repositories.login_history_repository import LoginHistoryRepository
from app.utils.auth import create_access_token


class LoginService:

    @staticmethod
    def login_user(
        db: Session,
        form_data: OAuth2PasswordRequestForm
    ):

        # Check if user exists
        existing_user = UserRepository.get_user_by_email(
            db,
            form_data.username
        )

        if not existing_user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        # Check password
        if existing_user.password != form_data.password:
            raise HTTPException(
                status_code=401,
                detail="Invalid password"
            )

        # Create JWT Token
        access_token = create_access_token(
            data={
                "sub": existing_user.email,
                "user_id": existing_user.id
            }
        )

        # Save Login History
        LoginHistoryRepository.create_login_history(
            db=db,
            user_id=existing_user.id
        )

        return {
            "message": "Login Successful",
            "access_token": access_token,
            "token_type": "bearer",
            "id": existing_user.id,
            "full_name": existing_user.full_name,
            "email": existing_user.email,
            "role": existing_user.role,
            "company_id": existing_user.company_id
        }