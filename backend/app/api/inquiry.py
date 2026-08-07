from typing import Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.utils.auth import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/inquiries",
    tags=["Inquiry"]
)


@router.post("/extract-text")
async def extract_text(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # User entered text
    if text:
        return {
            "status": "success",
            "user_id": current_user.id,
            "email": current_user.email,
            "input_type": "text",
            "text": text
        }

    # User uploaded a file
    if file:
        return {
            "status": "success",
            "user_id": current_user.id,
            "email": current_user.email,
            "input_type": "file",
            "file_name": file.filename,
            "content_type": file.content_type
        }

    return {
        "status": "failed",
        "message": "Please enter text or upload a file."
    }