from typing import Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.utils.auth import get_current_user
from app.models.user import User

from app.ai.ocr import process_input


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

    # Check whether user provided text or file
    if not text and not file:
        return {
            "status": "failed",
            "message": "Please enter text or upload a file."
        }

    # Send text/file to OCR file
    result = await process_input(
        text=text,
        file=file
    )

    return {
        "status": "success",
        "user_id": current_user.id,
        "email": current_user.email,
        "input_type": "text" if text else "file",
        "result": result
    }