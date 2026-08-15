from sqlalchemy.orm import Session

from app.repositories.manager_dashboard_repository import (
    get_manager_pending_quotations,
    get_manager_approved_quotations,
    get_manager_rejected_quotations,
    get_manager_total_revenue
)


# =========================================================
# PENDING QUOTATIONS
# =========================================================

def get_manager_pending_quotations_count(
    db: Session,
    company_id: int,
    manager_id: int
):
    pending_count = get_manager_pending_quotations(
        db,
        company_id,
        manager_id
    )

    print(
        f"Company {company_id} | "
        f"Manager {manager_id} | "
        f"Pending Quotations: {pending_count}"
    )

    return pending_count


# =========================================================
# APPROVED QUOTATIONS
# =========================================================

def get_manager_approved_quotations_count(
    db: Session,
    company_id: int,
    manager_id: int
):
    approved_count = get_manager_approved_quotations(
        db,
        company_id,
        manager_id
    )

    print(
        f"Company {company_id} | "
        f"Manager {manager_id} | "
        f"Approved Quotations: {approved_count}"
    )

    return approved_count


# =========================================================
# REJECTED QUOTATIONS
# =========================================================

def get_manager_rejected_quotations_count(
    db: Session,
    company_id: int,
    manager_id: int
):
    rejected_count = get_manager_rejected_quotations(
        db,
        company_id,
        manager_id
    )

    print(
        f"Company {company_id} | "
        f"Manager {manager_id} | "
        f"Rejected Quotations: {rejected_count}"
    )

    return rejected_count


# =========================================================
# TOTAL REVENUE
# =========================================================

def get_manager_total_revenue_count(
    db: Session,
    company_id: int,
    manager_id: int
):
    total_revenue = get_manager_total_revenue(
        db,
        company_id,
        manager_id
    )

    print(
        f"Company {company_id} | "
        f"Manager {manager_id} | "
        f"Total Revenue: {total_revenue}"
    )

    return total_revenue