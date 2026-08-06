from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.forgot_password import (
    ForgotPasswordRequest,
    ResetPasswordRequest
)
from app.services.forgot_password_service import ForgotPasswordService

router = APIRouter(
    prefix="/auth",
    tags=["Forgot Password"]
)


@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    return ForgotPasswordService.forgot_password(
        db,
        request.email
    )


@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    return ForgotPasswordService.reset_password(
        db,
        request.email,
        request.otp,
        request.new_password,
        request.confirm_password
    )