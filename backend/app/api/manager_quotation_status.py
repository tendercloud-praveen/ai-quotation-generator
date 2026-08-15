from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.utils.auth import get_current_user  # Adjust if using get_current_manager
from app.services import manager_dashboard_service

router = APIRouter(
    prefix="/manager/quotation-status",
    tags=["Manager Quotation Status"]
)

@router.get("/")
@router.get("")
def get_manager_quotations(
    status: Optional[str] = Query(
        None, 
        description="Filter by: APPROVED, REJECTED, PENDING, DISPATCHED, DRAFT, or ALL"
    ),
    db: Session = Depends(get_db),
    manager_user = Depends(get_current_user)
):
    # Fetch data safely from service layer
    quotations = manager_dashboard_service.get_manager_quotations_by_status(
        db=db,
        company_id=manager_user.company_id,
        manager_id=manager_user.id,
        status=status
    )

    return {
        "status": "success",
        "filter": status.upper() if status else "ALL",
        "total_count": len(quotations),
        "quotations": quotations
    }