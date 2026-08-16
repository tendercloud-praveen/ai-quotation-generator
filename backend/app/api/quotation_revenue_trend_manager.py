from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.services.quotation_revenue_trend_manager import (
    QuotationRevenueTrendManagerService
)
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/dashboard",
    tags=["Manager Dashboard"]
)


@router.get(
    "/manager/{manager_id}/quotation-revenue-trend"
)
def manager_quotation_revenue_trend(
    manager_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return (
        QuotationRevenueTrendManagerService
        .get_manager_quotation_revenue_trend(
            db=db,
            manager_id=manager_id,
            company_id=current_user.company_id
        )
    )