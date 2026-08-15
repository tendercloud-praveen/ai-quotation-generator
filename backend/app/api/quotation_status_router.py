from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os

from app.database.database import get_db
from app.utils.auth import get_current_user
from app.services.quotation_download_services import get_quotation_for_download


router = APIRouter(
    prefix="/quotation",
    tags=["Quotation Download"]
)


@router.get("/{quotation_id}/download")
def download_quotation_api(
    quotation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role not in ["ADMIN", "sales"]:
        raise HTTPException(
            status_code=403,
            detail="Only Admin or Sales Person can download quotation"
        )

    file_path = get_quotation_for_download(
        db=db,
        quotation_id=quotation_id,
        company_id=current_user.company_id
    )

    if not file_path:
        raise HTTPException(
            status_code=404,
            detail="Quotation not found"
        )

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail="Quotation PDF not found"
        )

    return FileResponse(
        path=file_path,
        filename=f"quotation_{quotation_id}.pdf",
        media_type="application/pdf"
    )