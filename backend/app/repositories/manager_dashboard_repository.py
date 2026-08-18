# from typing import Optional
# from sqlalchemy.orm import Session
# from sqlalchemy import func

# from app.models.quotations import Quotation, QuotationItem
# from app.models.product import Product

# # =========================================================
# # EXISTING DASHBOARD STATS (UNTOUCHED)
# # =========================================================

# def get_manager_pending_quotations(
#     db: Session,
#     company_id: int,
#     manager_id: int
# ):
#     return (
#         db.query(Quotation)
#         .filter(
#             Quotation.company_id == company_id,
#             Quotation.manager_id == manager_id,
#             Quotation.status == "PENDING_APPROVAL"
#         )
#         .count()
#     )


# def get_manager_approved_quotations(
#     db: Session,
#     company_id: int,
#     manager_id: int
# ):
#     return (
#         db.query(Quotation)
#         .filter(
#             Quotation.company_id == company_id,
#             Quotation.manager_id == manager_id,
#             Quotation.status == "APPROVED"
#         )
#         .count()
#     )


# def get_manager_total_revenue(
#     db: Session,
#     company_id: int,
#     manager_id: int
# ):
#     return (
#         db.query(
#             func.coalesce(
#                 func.sum(Quotation.grand_total),
#                 0
#             )
#         )
#         .filter(
#             Quotation.company_id == company_id,
#             Quotation.manager_id == manager_id,
#             Quotation.status == "APPROVED"
#         )
#         .scalar()
#     )


# def get_manager_rejected_quotations(
#     db: Session,
#     company_id: int,
#     manager_id: int
# ):
#     return (
#         db.query(Quotation)
#         .filter(
#             Quotation.company_id == company_id,
#             Quotation.manager_id == manager_id,
#             Quotation.status == "REJECTED"
#         )
#         .count()
#     )


# def get_manager_draft_quotations(
#     db: Session,
#     company_id: int,
#     manager_id: int
# ):
#     return (
#         db.query(Quotation)
#         .filter(
#             Quotation.company_id == company_id,
#             Quotation.manager_id == manager_id,
#             Quotation.status == "DRAFT"
#         )
#         .count()
#     )


# def get_manager_total_margin(
#     db: Session,
#     company_id: int,
#     manager_id: int
# ):
#     return (
#         db.query(
#             func.coalesce(
#                 func.sum(
#                     (
#                         Product.selling_price
#                         - Product.cost_price
#                     ) * QuotationItem.quantity
#                 ),
#                 0
#             )
#         )
#         .join(
#             Quotation,
#             Quotation.id == QuotationItem.quotation_id
#         )
#         .join(
#             Product,
#             Product.id == QuotationItem.product_id
#         )
#         .filter(
#             Quotation.company_id == company_id,
#             Quotation.manager_id == manager_id,
#             Quotation.status == "APPROVED"
#         )
#         .scalar()
#     )

# # =========================================================
# # NEW FUNCTION FOR DYNAMIC LIST FILTERING
# # =========================================================

# def get_manager_quotations_list(
#     db: Session,
#     company_id: int,
#     manager_id: int,
#     status: Optional[str] = None
# ):
#     query = db.query(Quotation).filter(
#         Quotation.company_id == company_id,
#         Quotation.manager_id == manager_id
#     )

#     if status and status.strip().upper() != "ALL":
#         filter_status = status.strip().upper()
        
#         # Map frontend "PENDING" to DB "PENDING_APPROVAL"
#         if filter_status == "PENDING":
#             filter_status = "PENDING_APPROVAL"
            
#         query = query.filter(Quotation.status == filter_status)

#     return query.order_by(Quotation.created_at.desc()).all()



from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.quotations import Quotation, QuotationItem
from app.models.product import Product
from app.models.customer import Customer


# =========================================================
# EXISTING DASHBOARD STATS (UNCHANGED)
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
    """
    Fetch manager quotations based on status.

    Existing quotation filtering logic is preserved.

    Additional response fields:
        - customer_name
        - margin
        - margin_percentage
    """

    # =====================================================
    # MARGIN SUBQUERY
    # =====================================================
    # Calculate quotation-level margin:
    #
    # (selling_price - cost_price) * quantity
    #
    # for all quotation items.
    # =====================================================

    margin_subquery = (
        db.query(
            QuotationItem.quotation_id.label(
                "quotation_id"
            ),

            func.coalesce(
                func.sum(
                    (
                        Product.selling_price
                        - Product.cost_price
                    ) * QuotationItem.quantity
                ),
                0
            ).label("margin")
        )
        .join(
            Product,
            Product.id == QuotationItem.product_id
        )
        .group_by(
            QuotationItem.quotation_id
        )
        .subquery()
    )

    # =====================================================
    # EXISTING QUOTATION QUERY
    # =====================================================
    # We are still filtering by:
    #
    # company_id
    # manager_id
    #
    # exactly as before.
    #
    # Additionally joining Customer and margin subquery.
    # =====================================================

    query = (
        db.query(
            Quotation,

            Customer.company_name.label(
                "customer_name"
            ),

            func.coalesce(
                margin_subquery.c.margin,
                0
            ).label(
                "margin"
            )
        )
        .outerjoin(
            Customer,
            Customer.id == Quotation.customer_id
        )
        .outerjoin(
            margin_subquery,
            margin_subquery.c.quotation_id == Quotation.id
        )
        .filter(
            Quotation.company_id == company_id,
            Quotation.manager_id == manager_id
        )
    )

    # =====================================================
    # EXISTING STATUS FILTER LOGIC
    # =====================================================

    if status and status.strip().upper() != "ALL":

        filter_status = status.strip().upper()

        # Map frontend "PENDING"
        # to database "PENDING_APPROVAL"
        if filter_status == "PENDING":
            filter_status = "PENDING_APPROVAL"

        query = query.filter(
            Quotation.status == filter_status
        )

    # =====================================================
    # EXISTING SORTING LOGIC
    # =====================================================

    rows = (
        query
        .order_by(
            Quotation.created_at.desc()
        )
        .all()
    )

    # =====================================================
    # BUILD RESPONSE
    # =====================================================

    result = []

    for quotation, customer_name, margin in rows:

        # -------------------------------------------------
        # Margin
        # -------------------------------------------------

        margin_value = float(
            margin or 0
        )

        # -------------------------------------------------
        # Subtotal
        # -------------------------------------------------

        subtotal_value = float(
            quotation.subtotal or 0
        )

        # -------------------------------------------------
        # Margin percentage
        # -------------------------------------------------
        #
        # Margin percentage is calculated against subtotal.
        #
        # margin / subtotal * 100
        #
        # Prevent division by zero.
        # -------------------------------------------------

        if subtotal_value > 0:

            margin_percentage = (
                margin_value
                / subtotal_value
            ) * 100

        else:

            margin_percentage = 0

        # -------------------------------------------------
        # Append quotation
        # -------------------------------------------------

        result.append({

            # =============================================
            # EXISTING QUOTATION DATA
            # =============================================

            "id": quotation.id,

            "quotation_number":
                quotation.quotation_number,

            "user_id":
                quotation.user_id,

            "company_id":
                quotation.company_id,

            "manager_id":
                quotation.manager_id,

            "customer_id":
                quotation.customer_id,

            "inquiry_text":
                quotation.inquiry_text,

            "subtotal":
                subtotal_value,

            "total_gst":
                float(
                    quotation.total_gst or 0
                ),

            "grand_total":
                float(
                    quotation.grand_total or 0
                ),

            "status":
                quotation.status,

            "submitted_at":
                quotation.submitted_at,

            "created_at":
                quotation.created_at,

            "updated_at":
                quotation.updated_at,

            # =============================================
            # NEW CUSTOMER FIELD
            # =============================================

            "customer_name":
                customer_name or "—",

            # =============================================
            # NEW MARGIN FIELD
            # =============================================

            "margin":
                round(
                    margin_value,
                    2
                ),

            # =============================================
            # NEW MARGIN PERCENTAGE
            # =============================================

            "margin_percentage":
                round(
                    margin_percentage,
                    2
                )
        })

    # =====================================================
    # RETURN
    # =====================================================

    return result