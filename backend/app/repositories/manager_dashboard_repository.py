from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.quotations import Quotation, QuotationItem
from app.models.product import Product

# =========================================================
# EXISTING DASHBOARD STATS (UNTOUCHED)
# =========================================================

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


def get_manager_total_margin(
    db: Session,
    company_id: int,
    manager_id: int
):
    return (
        db.query(
            func.coalesce(
                func.sum(
                    (
                        Product.selling_price
                        - Product.cost_price
                    ) * QuotationItem.quantity
                ),
                0
            )
        )
        .join(
            Quotation,
            Quotation.id == QuotationItem.quotation_id
        )
        .join(
            Product,
            Product.id == QuotationItem.product_id
        )
        .filter(
            Quotation.company_id == company_id,
            Quotation.manager_id == manager_id,
            Quotation.status == "APPROVED"
        )
        .scalar()
    )

# =========================================================
# NEW FUNCTION FOR DYNAMIC LIST FILTERING
# =========================================================

def get_manager_quotations_list(
    db: Session,
    company_id: int,
    manager_id: int,
    status: Optional[str] = None
):
    query = db.query(Quotation).filter(
        Quotation.company_id == company_id,
        Quotation.manager_id == manager_id
    )

    if status and status.strip().upper() != "ALL":
        filter_status = status.strip().upper()
        
        # Map frontend "PENDING" to DB "PENDING_APPROVAL"
        if filter_status == "PENDING":
            filter_status = "PENDING_APPROVAL"
            
        query = query.filter(Quotation.status == filter_status)

    return query.order_by(Quotation.created_at.desc()).all()