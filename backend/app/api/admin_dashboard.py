from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.services.dashboard_service import get_total_quotations_count, get_pending_quotations_count, get_approved_quotations_count,get_dispatched_quotations_count, get_total_revenue_count, get_company_products_count, get_total_team_members_count
from app.utils.auth import get_current_user,get_current_admin


router = APIRouter(
    prefix="/admin/dashboard",
    tags=["Admin Dashboard"]
)

@router.get("/quotations")
def get_quotations_count(
    db: Session = Depends(get_db),
    admin_user=Depends(get_current_admin)
):
    company_id = admin_user.company_id

    total_quotations = get_total_quotations_count(
        db,
        company_id
    )

    pending_count = get_pending_quotations_count(
        db,
        company_id
    )
    approved_count = get_approved_quotations_count(
        db,
        company_id
    )
    
    dispatched_count = get_dispatched_quotations_count(
        db,
        company_id
    )
    total_revenue = get_total_revenue_count(
        db, 

        company_id
    )
    product_count = get_company_products_count(
        db,
        company_id
    )
    total_team_members = get_total_team_members_count   (
        db,     
        company_id
    )
    return {
        "company_id": company_id,
        "total_quotations": total_quotations,
        "pending_quotations": pending_count,
        "approved_quotations": approved_count,
        "dispatched_quotations": dispatched_count,
        "total_revenue": total_revenue,
        "product_count": product_count,
        "total_team_members": total_team_members
    }
