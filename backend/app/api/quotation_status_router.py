# from fastapi import APIRouter, Depends, HTTPException
# from fastapi.responses import FileResponse
# from sqlalchemy.orm import Session
# import os

# from app.database.database import get_db
# from app.utils.auth import get_current_user
# from app.services.quotation_download_services import get_quotation_for_download


# router = APIRouter(
#     prefix="/quotation",
#     tags=["Quotation Download"]
# )


# @router.get("/{quotation_id}/download")
# def download_quotation_api(
#     quotation_id: int,
#     db: Session = Depends(get_db),
#     current_user=Depends(get_current_user)
# ):
#     if current_user.role not in ["ADMIN", "sales"]:
#         raise HTTPException(
#             status_code=403,
#             detail="Only Admin or Sales Person can download quotation"
#         )

#     file_path = get_quotation_for_download(
#         db=db,
#         quotation_id=quotation_id,
#         company_id=current_user.company_id
#     )

#     if not file_path:
#         raise HTTPException(
#             status_code=404,
#             detail="Quotation not found"
#         )

#     if not os.path.exists(file_path):
#         raise HTTPException(
#             status_code=404,
#             detail="Quotation PDF not found"
#         )

#     return FileResponse(
#         path=file_path,
#         filename=f"quotation_{quotation_id}.pdf",
#         media_type="application/pdf"
#     )


from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.utils.auth import get_current_user
from app.services.disapatch_quotation_service import dispatch_quotation_service


router = APIRouter(
    prefix="/quotation",
    tags=["Quotation Dispatch"]
)


@router.put("/{quotation_id}/dispatch")
def dispatch_quotation_api(
    quotation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    # Only Admin and Sales can dispatch
    if current_user.role not in ["ADMIN", "sales"]:
        raise HTTPException(
            status_code=403,
            detail="Only Admin or Sales Person can dispatch quotation"
        )

    quotation = dispatch_quotation_service(
        db=db,
        quotation_id=quotation_id,
        company_id=current_user.company_id
    )

    if not quotation:
        raise HTTPException(
            status_code=404,
            detail="Quotation not found"
        )

    return {
        "message": "Quotation dispatched successfully",
        "quotation_id": quotation.id,
        "quotation_number": quotation.quotation_number,
        "status": quotation.status
    }