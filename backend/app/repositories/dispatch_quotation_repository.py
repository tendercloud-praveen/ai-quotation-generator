from sqlalchemy.orm import Session
from app.models.quotations import Quotation


def get_quotation_by_id(
    db: Session,
    quotation_id: int,
    company_id: int
):
    return (
        db.query(Quotation)
        .filter(
            Quotation.id == quotation_id,
            Quotation.company_id == company_id
        )
        .first()
    )


def dispatch_quotation(
    db: Session,
    quotation_id: int,
    company_id: int
):
    quotation = (
        db.query(Quotation)
        .filter(
            Quotation.id == quotation_id,
            Quotation.company_id == company_id
        )
        .first()
    )

    if not quotation:
        return None

    # Only APPROVED quotation can be dispatched
    if quotation.status != "APPROVED":
        return None

    quotation.status = "DISPATCHED"

    db.commit()
    db.refresh(quotation)

    return quotation