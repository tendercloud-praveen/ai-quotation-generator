from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.utils.auth import get_current_user

from app.services.sales_dashboard_service import (
    get_sales_pending_quotations_count,
    get_sales_approved_quotations_count,
)


router = APIRouter(
    prefix="/sales/dashboard",
    tags=["Sales Dashboard"]
)


@router.get("/dashboard")
def get_sales_dashboard(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    sales_user_id = current_user.id
    company_id = current_user.company_id

    pending_count = get_sales_pending_quotations_count(
        db,
        company_id,
        sales_user_id
    )

    approved_count = get_sales_approved_quotations_count(
        db,
        company_id,
        sales_user_id
    )

    return {
        "sales_user_id": sales_user_id,
        "company_id": company_id,
        "pending_quotations": pending_count,
        "approved_quotations": approved_count
    }