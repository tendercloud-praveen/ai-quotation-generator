from sqlalchemy.orm import Session

from app.repositories.sales_dashboard_repository import (
    get_sales_pending_quotations,
    get_sales_approved_quotations,
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