# from typing import Optional
# from fastapi import APIRouter, Depends, Query
# from sqlalchemy.orm import Session

# from app.database.database import get_db
# from app.utils.auth import get_current_admin
# from app.models.quotations import Quotation  # Added missing import to fix NameError


# router = APIRouter(
#     prefix="/admin/quotation-status",
#     tags=["Admin Quotation Status"]
# )


# # =========================================================
# # DYNAMIC QUOTATION LIST (REPLACES ALL 5 ENDPOINTS)
# # =========================================================


# @router.get("/")
# def get_quotations(
#     status: Optional[str] = Query(
#         None, 
#         description="Filter status: PENDING, APPROVED, REJECTED, DISPATCHED, DRAFT, or ALL"
#     ),
#     db: Session = Depends(get_db),
#     admin_user=Depends(get_current_admin)
# ):
#     company_id = admin_user.company_id

#     # 1. Base query filtered by company_id
#     query = db.query(Quotation).filter(Quotation.company_id == company_id)

#     # 2. Dynamically filter by status if passed (and not 'ALL')
#     if status and status.strip().upper() != "ALL":
#         query = query.filter(Quotation.status == status.strip().upper())

#     quotations = query.order_by(Quotation.created_at.desc()).all()

#     # 3. Return unified response format
#     return {
#         "company_id": company_id,
#         "filter_status": status.upper() if status else "ALL",
#         "total_count": len(quotations),
#         "quotations": [
#             {
#                 "id": quotation.id,
#                 "quotation_number": quotation.quotation_number,
#                 "user_id": quotation.user_id,
#                 "company_id": quotation.company_id,
#                 "manager_id": quotation.manager_id,
#                 "inquiry_text": quotation.inquiry_text,
#                 "subtotal": quotation.subtotal,
#                 "total_gst": quotation.total_gst,
#                 "grand_total": quotation.grand_total,
#                 "status": quotation.status,
#                 "submitted_at": quotation.submitted_at,
#                 "created_at": quotation.created_at,
#                 "updated_at": quotation.updated_at
#             }
#             for quotation in quotations
#         ]
#     }



from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.utils.auth import get_current_admin
from app.models.quotations import Quotation, QuotationItem
from app.models.customer import Customer
from app.models.product import Product


router = APIRouter(
    prefix="/admin/quotation-status",
    tags=["Admin Quotation Status"]
)


# =========================================================
# DYNAMIC QUOTATION LIST
# =========================================================

@router.get("/")
def get_quotations(
    status: Optional[str] = Query(
        None,
        description="Filter status: PENDING, APPROVED, REJECTED, DISPATCHED, DRAFT, or ALL"
    ),
    db: Session = Depends(get_db),
    admin_user=Depends(get_current_admin)
):
    company_id = admin_user.company_id

    # =====================================================
    # 1. Base query filtered by company_id
    # =====================================================

    query = db.query(Quotation).filter(
        Quotation.company_id == company_id
    )

    # =====================================================
    # 2. Dynamically filter by status
    # =====================================================

    if status and status.strip().upper() != "ALL":
        query = query.filter(
            Quotation.status == status.strip().upper()
        )

    quotations = query.order_by(
        Quotation.created_at.desc()
    ).all()

    # =====================================================
    # 3. Build quotation response
    # =====================================================

    quotation_list = []

    for quotation in quotations:

        # -------------------------------------------------
        # CUSTOMER NAME
        # -------------------------------------------------

        customer_name = "—"

        if quotation.customer_id:
            customer = (
                db.query(Customer)
                .filter(Customer.id == quotation.customer_id)
                .first()
            )

            if customer:
                # Try common customer name fields
                customer_name = (
                    getattr(customer, "customer_name", None)
                    or getattr(customer, "name", None)
                    or getattr(customer, "company_name", None)
                    or "—"
                )

        # -------------------------------------------------
        # MARGIN
        # -------------------------------------------------

        margin = 0.0

        quotation_items = (
            db.query(QuotationItem)
            .filter(
                QuotationItem.quotation_id == quotation.id
            )
            .all()
        )

        for item in quotation_items:

            product = (
                db.query(Product)
                .filter(Product.id == item.product_id)
                .first()
            )

            if product:

                selling_price = float(
                    product.selling_price or 0
                )

                cost_price = float(
                    product.cost_price or 0
                )

                quantity = float(
                    item.quantity or 0
                )

                margin += (
                    selling_price - cost_price
                ) * quantity

        # -------------------------------------------------
        # MARGIN PERCENTAGE
        # -------------------------------------------------

        subtotal = float(
            quotation.subtotal or 0
        )

        if subtotal > 0:
            margin_percentage = (
                margin / subtotal
            ) * 100
        else:
            margin_percentage = 0.0

        # -------------------------------------------------
        # ADD QUOTATION
        # -------------------------------------------------

        quotation_list.append(
            {
                "id": quotation.id,
                "quotation_number": quotation.quotation_number,

                "user_id": quotation.user_id,
                "company_id": quotation.company_id,
                "manager_id": quotation.manager_id,

                # Customer information
                "customer_id": quotation.customer_id,
                "customer_name": customer_name,

                "inquiry_text": quotation.inquiry_text,

                "subtotal": quotation.subtotal,
                "total_gst": quotation.total_gst,
                "grand_total": quotation.grand_total,

                # Margin information
                "margin": round(margin, 2),
                "margin_percentage": round(
                    margin_percentage,
                    2
                ),

                "status": quotation.status,

                "submitted_at": quotation.submitted_at,
                "created_at": quotation.created_at,
                "updated_at": quotation.updated_at
            }
        )

    # =====================================================
    # 4. Return unified response format
    # =====================================================

    return {
        "company_id": company_id,
        "filter_status": status.upper() if status else "ALL",
        "total_count": len(quotation_list),
        "quotations": quotation_list
    }