from sqlalchemy.orm import Session
from app.models.quotations import Quotation
from app.models.product import Product
from app.models.user import User
from sqlalchemy import func


def get_total_quotations(db: Session, company_id: int):
    return (
        db.query(Quotation)
        .filter(Quotation.company_id == company_id)
        .count()
    )
def get_pending_quotations(db: Session, company_id: int):

    return (
        db.query(Quotation)
        .filter(
            Quotation.company_id == company_id,
            Quotation.status == "PENDING_APPROVAL"
        )
        .count()
    )
def get_approved_quotations(db: Session, company_id: int):

    return (
        db.query(Quotation)
        .filter(
            Quotation.company_id == company_id,
            Quotation.status == "APPROVED"
        )
        .count()
    )
def get_rejected_quotations(db: Session, company_id: int):

    return (
        db.query(Quotation)
        .filter(
            Quotation.company_id == company_id,
            Quotation.status == "REJECTED"
        )
        .count()
    )
def get_dispatched_quotations(db: Session, company_id: int):

    return (
        db.query(Quotation)
        .filter(
            Quotation.company_id == company_id,
            Quotation.status == "DISPATCHED"
        )
        .count()
    )
def get_total_revenue(db: Session, company_id: int):

    return (
        db.query(
            func.coalesce(
                func.sum(Quotation.grand_total),
                0
            )
        )
        .filter(
            Quotation.company_id == company_id,
            Quotation.status == "APPROVED"
        )
        .scalar()
    )
def get_company_products(db: Session, company_id: int):
    return (
        db.query(Product)
        .filter(Product.company_id == company_id)
        .all()
    )
def get_total_team_members(db: Session, company_id: int):

    return (
        db.query(User)
        .filter(
            User.company_id == company_id,
            User.role != "ADMIN"
        )
        .count()
    )
def get_total_draft_quotations(db: Session, company_id: int):
    return (
        db.query(Quotation)
        .filter(
            Quotation.company_id == company_id,
            Quotation.status == "DRAFT"
        )
        .count()
    )
