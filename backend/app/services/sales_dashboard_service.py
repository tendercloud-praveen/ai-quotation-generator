from sqlalchemy.orm import Session

from app.repositories.sales_dashboard_repository import (
    get_sales_pending_quotations,
    get_sales_approved_quotations,
    get_sales_draft_quotations,
    get_sales_rejected_quotations,
    get_sales_dispatched_quotations
)


def get_sales_pending_quotations_count(
    db: Session,
    company_id: int,
    sales_user_id: int
):
    pending_count = get_sales_pending_quotations(
        db,
        company_id,
        sales_user_id
    )

    print(
        f"Company {company_id} | "
        f"Sales User {sales_user_id} | "
        f"Pending Quotations: {pending_count}"
    )

    return pending_count


def get_sales_approved_quotations_count(
    db: Session,
    company_id: int,
    sales_user_id: int
):
    approved_count = get_sales_approved_quotations(
        db,
        company_id,
        sales_user_id
    )

    print(
        f"Company {company_id} | "
        f"Sales User {sales_user_id} | "
        f"Approved Quotations: {approved_count}"
    )

    return approved_count
def get_sales_draft_quotations_count(
    db: Session,
    company_id: int,
    sales_user_id: int
):
    draft_count = get_sales_draft_quotations(
        db,
        company_id,
        sales_user_id
    )

    print(
        f"Company {company_id} | "
        f"Sales User {sales_user_id} | "
        f"Draft Quotations: {draft_count}"
    )

    return draft_count
def get_sales_rejected_quotations_count(
    db: Session,
    company_id: int,
    sales_user_id: int
):
    rejected_count = get_sales_rejected_quotations(
        db,
        company_id,
        sales_user_id
    )

    print(
        f"Company {company_id} | "
        f"Sales User {sales_user_id} | "
        f"Rejected Quotations: {rejected_count}"
    )

    return rejected_count

def get_sales_dispatched_quotations_count(
    db: Session,
    company_id: int,
    sales_user_id: int
):
    dispatched_count = get_sales_dispatched_quotations(
        db,
        company_id,
        sales_user_id
    )

    print(
        f"Company {company_id} | "
        f"Sales User {sales_user_id} | "
        f"Dispatched Quotations: {dispatched_count}"
    )

    return dispatched_count