from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.services.quotation_revenue_trend_salesperson import DashboardService
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get(
    "/salesperson/{salesperson_id}/quotation-revenue-trend"
)
def salesperson_quotation_revenue_trend(
    salesperson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return DashboardService.get_salesperson_quotation_revenue_trend(
        db=db,
        salesperson_id=salesperson_id,
        company_id=current_user.company_id
    )