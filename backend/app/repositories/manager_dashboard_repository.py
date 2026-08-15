from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.quotations import Quotation


def get_manager_pending_quotations(
    db: Session,
    company_id: int,
    manager_id: int
):
    return (
        db.query(Quotation)
        .filter(
            Quotation.company_id == company_id,
            Quotation.manager_id == manager_id,
            Quotation.status == "PENDING_APPROVAL"
        )
        .count()
    )


def get_manager_approved_quotations(
    db: Session,
    company_id: int,
    manager_id: int
):
    return (
        db.query(Quotation)
        .filter(
            Quotation.company_id == company_id,
            Quotation.manager_id == manager_id,
            Quotation.status == "APPROVED"
        )
        .count()
    )
def get_manager_total_revenue(
    db: Session,
    company_id: int,
    manager_id: int
):
    return (
        db.query(
            func.coalesce(
                func.sum(Quotation.grand_total),
                0
            )
        )
        .filter(
            Quotation.company_id == company_id,
            Quotation.manager_id == manager_id,
            Quotation.status == "APPROVED"
        )
        .scalar()
    )
def get_manager_rejected_quotations(
    db: Session,
    company_id: int,
    manager_id: int
):
    return (
        db.query(Quotation)
        .filter(
            Quotation.company_id == company_id,
            Quotation.manager_id == manager_id,
            Quotation.status == "REJECTED"
        )
        .count()
    )
def get_manager_draft_quotations(
    db: Session,
    company_id: int,
    manager_id: int
):
    return (
        db.query(Quotation)
        .filter(
            Quotation.company_id == company_id,
            Quotation.manager_id == manager_id,
            Quotation.status == "DRAFT"
        )
        .count()
    )