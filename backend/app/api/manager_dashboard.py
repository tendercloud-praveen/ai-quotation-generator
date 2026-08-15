from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.utils.auth import get_current_user

from app.services.manager_dashboard_service import (
    get_manager_pending_quotations_count,
    get_manager_approved_quotations_count,
    get_manager_rejected_quotations_count,
    get_manager_total_revenue_count,
    get_manager_draft_quotations_count,
    get_manager_total_margin_count
)


router = APIRouter(
    prefix="/manager/dashboard",
    tags=["Manager Dashboard"]
)


@router.get("/dashboard")
def get_manager_dashboard(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # =====================================================
    # LOGGED-IN MANAGER
    # =====================================================

    manager_id = current_user.id

    # =====================================================
    # COMPANY OF LOGGED-IN MANAGER
    # =====================================================

    company_id = current_user.company_id

    # =====================================================
    # PENDING QUOTATIONS
    # =====================================================

    pending_count = get_manager_pending_quotations_count(
        db,
        company_id,
        manager_id
    )

    # =====================================================
    # APPROVED QUOTATIONS
    # =====================================================

    approved_count = get_manager_approved_quotations_count(
        db,
        company_id,
        manager_id
    )

    # =====================================================
    # REJECTED QUOTATIONS
    # =====================================================

    rejected_count = get_manager_rejected_quotations_count(
        db,
        company_id,
        manager_id
    )
    margin_count = get_manager_total_margin_count(
        db,
        company_id,
        manager_id
    )

    # =====================================================
    # TOTAL REVENUE
    # =====================================================

    total_revenue = get_manager_total_revenue_count(
        db,
        company_id,
        manager_id
    )

    # =====================================================
    # RESPONSE
    # =====================================================

    return {
        "manager_id": manager_id,
        "company_id": company_id,
        "pending_quotations": pending_count,
        "approved_quotations": approved_count,
        "rejected_quotations": rejected_count,
        "total_revenue": total_revenue,
        "total_margin": margin_count
    }