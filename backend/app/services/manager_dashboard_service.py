from typing import Optional
from sqlalchemy.orm import Session

from app.repositories.manager_dashboard_repository import (
    get_manager_pending_quotations,
    get_manager_approved_quotations,
    get_manager_rejected_quotations,
    get_manager_total_revenue,
    get_manager_draft_quotations,
    get_manager_total_margin,
    get_manager_quotations_list  # Added new repository function
)

# =========================================================
# EXISTING SERVICE WRAPPERS (UNTOUCHED)
# =========================================================

def get_manager_pending_quotations_count(
    db: Session,
    company_id: int,
    manager_id: int
):
    pending_count = get_manager_pending_quotations(
        db, company_id, manager_id
    )
    print(f"Company {company_id} | Manager {manager_id} | Pending Quotations: {pending_count}")
    return pending_count


def get_manager_approved_quotations_count(
    db: Session,
    company_id: int,
    manager_id: int
):
    approved_count = get_manager_approved_quotations(
        db, company_id, manager_id
    )
    print(f"Company {company_id} | Manager {manager_id} | Approved Quotations: {approved_count}")
    return approved_count


def get_manager_rejected_quotations_count(
    db: Session,
    company_id: int,
    manager_id: int
):
    rejected_count = get_manager_rejected_quotations(
        db, company_id, manager_id
    )
    print(f"Company {company_id} | Manager {manager_id} | Rejected Quotations: {rejected_count}")
    return rejected_count


def get_manager_total_revenue_count(
    db: Session,
    company_id: int,
    manager_id: int
):
    total_revenue = get_manager_total_revenue(
        db, company_id, manager_id
    )
    print(f"Company {company_id} | Manager {manager_id} | Total Revenue: {total_revenue}")
    return total_revenue


def get_manager_draft_quotations_count(
    db: Session,
    company_id: int,
    manager_id: int
):
    draft_count = get_manager_draft_quotations(
        db, company_id, manager_id
    )
    print(f"Company {company_id} | Manager {manager_id} | Draft Quotations: {draft_count}")
    return draft_count


def get_manager_total_margin_count(
    db: Session,
    company_id: int,
    manager_id: int
):
    total_margin = get_manager_total_margin(
        db, company_id, manager_id
    )
    print(f"Company {company_id} | Manager {manager_id} | Total Margin: {total_margin}")
    return total_margin

# =========================================================
# NEW COMPLETED SERVICE FUNCTION
# =========================================================

def get_manager_quotations_by_status(
    db: Session, 
    company_id: int, 
    manager_id: int, 
    status: Optional[str] = None
):
    """
    Fetches quotations based on status filter without breaking existing code.
    """
    return get_manager_quotations_list(
        db=db,
        company_id=company_id,
        manager_id=manager_id,
        status=status
    )