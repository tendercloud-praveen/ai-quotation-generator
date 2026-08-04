from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository
from app.repositories.login_history_repository import LoginHistoryRepository
from app.schemas.login import LoginUser
from app.utils.auth import create_access_token


class LoginService:

    @staticmethod
    def login_user(db: Session, user: LoginUser):

        # Check if email exists
        existing_user = UserRepository.get_user_by_email(db, user.email)

        if not existing_user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        # Check password
        if existing_user.password != user.password:
            raise HTTPException(
                status_code=401,
                detail="Invalid password"
            )

        # Generate JWT Token
        access_token = create_access_token(
            data={
                "sub": existing_user.email,
                "role": existing_user.role,
                "company_id": existing_user.company_id
            }
        )

        # Save Login History
        LoginHistoryRepository.create_login_history(
            db=db,
            user_id=existing_user.id
        )

        # Return Response
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