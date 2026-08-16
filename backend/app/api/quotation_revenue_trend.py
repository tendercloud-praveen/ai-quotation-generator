from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.services.quotation_revenue_trend import DashboardService
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/quotation-revenue-trend")
def quotation_revenue_trend(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return DashboardService.get_quotation_revenue_trend(
        db=db,
        company_id=current_user.company_id
    )