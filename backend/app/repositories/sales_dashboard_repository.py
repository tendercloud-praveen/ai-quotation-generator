from sqlalchemy.orm import Session

from app.models.quotations import Quotation


def get_sales_pending_quotations(
    db: Session,
    company_id: int,
    sales_user_id: int
):
    return (
        db.query(Quotation)
        .filter(
            Quotation.company_id == company_id,
            Quotation.user_id == sales_user_id,
            Quotation.status == "PENDING_APPROVAL"
        )
        .count()
    )


def get_sales_approved_quotations(
    db: Session,
    company_id: int,
    sales_user_id: int
):
    return (
        db.query(Quotation)
        .filter(
            Quotation.company_id == company_id,
            Quotation.user_id == sales_user_id,
            Quotation.status == "APPROVED"
        )
        .count()
    )