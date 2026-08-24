from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.quotations import Quotation, QuotationItem
from app.models.product import Product
from app.models.user import User
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/quotation-approval",
    tags=["Quotation Approval"]
)


# ============================================================
# PYDANTIC SCHEMAS
# ============================================================

class CommentRequest(BaseModel):
    comment: Optional[str] = None


class RejectRequest(BaseModel):
    reason: str = Field(..., min_length=1)


class PriceItem(BaseModel):
    quotation_item_id: int
    selling_price: float = Field(..., gt=0)


class UpdatePricesRequest(BaseModel):
    items: List[PriceItem]


# ============================================================
# HELPER - GET QUOTATION
# ============================================================

def get_quotation_or_404(
    quotation_id: int,
    db: Session
):
    quotation = (
        db.query(Quotation)
        .filter(
            Quotation.id == quotation_id
        )
        .first()
    )

    if not quotation:
        raise HTTPException(
            status_code=404,
            detail="Quotation not found"
        )

    return quotation


# ============================================================
# HELPER - CHECK MANAGER ACCESS
# ============================================================

def check_manager_access(
    quotation: Quotation,
    current_user: User
):
    """
    Only the manager assigned to the quotation
    can manage the quotation.
    """

    if quotation.manager_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to manage this quotation"
        )


# ============================================================
# 1. GET PENDING QUOTATIONS
# ============================================================

@router.get("/pending")
def get_pending_quotations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Manager sees quotations waiting for approval.
    """

    quotations = (
        db.query(Quotation)
        .filter(
            Quotation.manager_id == current_user.id,
            Quotation.status == "PENDING_APPROVAL"
        )
        .order_by(
            Quotation.created_at.desc()
        )
        .all()
    )

    result = []

    for quotation in quotations:

        items = (
            db.query(QuotationItem)
            .filter(
                QuotationItem.quotation_id == quotation.id
            )
            .all()
        )

        response_items = []

        total_amount = 0

        for item in items:

            quantity = int(item.quantity)
            unit_price = float(item.unit_price)

            subtotal = float(
                item.subtotal
            )

            gst_amount = float(
                item.gst_amount
            )

            total_price = float(
                item.total_price
            )

            total_amount += total_price

            response_items.append({
                "quotation_item_id": item.id,
                "product_id": item.product_id,
                "product_name": item.product_name,
                "quantity": quantity,
                "unit": item.unit,
                "unit_price": unit_price,
                "gst_percentage": float(
                    item.gst_percentage
                ),
                "subtotal": subtotal,
                "gst_amount": gst_amount,
                "total_price": total_price
            })

        # Get salesperson details
        salesperson = (
            db.query(User)
            .filter(
                User.id == quotation.user_id
            )
            .first()
        )

        salesperson_name = None
        salesperson_email = None

        if salesperson:
            salesperson_name = (
                getattr(
                    salesperson,
                    "name",
                    None
                )
                or getattr(
                    salesperson,
                    "full_name",
                    None
                )
                or getattr(
                    salesperson,
                    "username",
                    None
                )
                or salesperson.email
            )

            salesperson_email = salesperson.email

        # Manager details
        manager_name = (
            getattr(
                current_user,
                "name",
                None
            )
            or getattr(
                current_user,
                "full_name",
                None
            )
            or getattr(
                current_user,
                "username",
                None
            )
            or current_user.email
        )

        result.append({
            "quotation_id": quotation.id,
            "quotation_number": quotation.quotation_number,

            "inquiry_text": quotation.inquiry_text,

            "created_by": {
                "user_id": quotation.user_id,
                "name": salesperson_name,
                "email": salesperson_email
            },

            "manager": {
                "manager_id": quotation.manager_id,
                "manager_name": manager_name,
                "manager_email": current_user.email
            },

            "items": response_items,

            "summary": {
                "subtotal": float(
                    quotation.subtotal
                ),
                "total_gst": float(
                    quotation.total_gst
                ),
                "grand_total": float(
                    quotation.grand_total
                )
            },

            "total_amount": total_amount,

            "status": quotation.status,

            "submitted_at": quotation.submitted_at,

            "created_at": quotation.created_at
        })

    return {
        "status": "success",
        "count": len(result),
        "quotations": result
    }


# ============================================================
# 2. GET QUOTATION DETAILS
# ============================================================

@router.get("/{quotation_id}")
def get_quotation_details(
    quotation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Manager views complete quotation details.
    """

    quotation = get_quotation_or_404(
        quotation_id,
        db
    )

    check_manager_access(
        quotation,
        current_user
    )

    items = (
        db.query(QuotationItem)
        .filter(
            QuotationItem.quotation_id == quotation.id
        )
        .all()
    )

    response_items = []

    for item in items:

        quantity = int(
            item.quantity
        )

        unit_price = float(
            item.unit_price
        )



        product = (
    db.query(Product)
    .filter(Product.id == item.product_id)
    .first()
     )

    cost_price = float(product.cost_price) if product else 0.0

    margin = (
    (unit_price - cost_price)
    * quantity
        )




    subtotal = float(
            item.subtotal
        )

    gst_percentage = float(
            item.gst_percentage
        )

    gst_amount = float(
            item.gst_amount
        )

    total_price = float(
            item.total_price
        )

    response_items.append({
            "quotation_item_id": item.id,

            "product_id": item.product_id,

            "product_name": item.product_name,

            "quantity": quantity,

            "unit": item.unit,

            "unit_price": unit_price,

            "cost_price": cost_price,

            "margin": margin,

            "gst_percentage": gst_percentage,

            "subtotal": subtotal,

            "gst_amount": gst_amount,

            "total_price": total_price
        })

    # Get salesperson
    salesperson = (
        db.query(User)
        .filter(
            User.id == quotation.user_id
        )
        .first()
    )

    salesperson_name = None
    salesperson_email = None

    if salesperson:

        salesperson_name = (
            getattr(
                salesperson,
                "name",
                None
            )
            or getattr(
                salesperson,
                "full_name",
                None
            )
            or getattr(
                salesperson,
                "username",
                None
            )
            or salesperson.email
        )

        salesperson_email = salesperson.email

    manager_name = (
        getattr(
            current_user,
            "name",
            None
        )
        or getattr(
            current_user,
            "full_name",
            None
        )
        or getattr(
            current_user,
            "username",
            None
        )
        or current_user.email
    )

    return {
        "status": "success",

        "quotation_id": quotation.id,

        "quotation_number": quotation.quotation_number,

        "inquiry_text": quotation.inquiry_text,

        "created_by": {
            "user_id": quotation.user_id,
            "name": salesperson_name,
            "email": salesperson_email
        },

        "manager": {
            "manager_id": quotation.manager_id,
            "manager_name": manager_name,
            "manager_email": current_user.email
        },

        "quotation_status": quotation.status,

        "summary": {
            "subtotal": float(
                quotation.subtotal
            ),
            "total_gst": float(
                quotation.total_gst
            ),
            "grand_total": float(
                quotation.grand_total
            )
        },

        "items": response_items,

        "submitted_at": quotation.submitted_at,

        "created_at": quotation.created_at
    }


# ============================================================
# 3. APPROVE QUOTATION
# ============================================================

@router.post("/{quotation_id}/approve")
def approve_quotation(
    quotation_id: int,
    payload: CommentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Manager approves quotation.

    PENDING_APPROVAL
            ↓
        APPROVED
    """

    quotation = get_quotation_or_404(
        quotation_id,
        db
    )

    check_manager_access(
        quotation,
        current_user
    )

    if quotation.status != "PENDING_APPROVAL":
        raise HTTPException(
            status_code=400,
            detail=(
                f"Quotation cannot be approved. "
                f"Current status: {quotation.status}"
            )
        )

    quotation.status = "APPROVED"

    # These fields must exist in your Quotation model
    # before using them.
    #
    # quotation.approved_by = current_user.id
    # quotation.approved_at = datetime.utcnow()
    # quotation.approval_comment = payload.comment

    db.commit()
    db.refresh(quotation)

    manager_name = (
        getattr(
            current_user,
            "name",
            None
        )
        or getattr(
            current_user,
            "full_name",
            None
        )
        or getattr(
            current_user,
            "username",
            None
        )
        or current_user.email
    )

    return {
        "status": "success",

        "quotation_id": quotation.id,

        "quotation_number": quotation.quotation_number,

        "quotation_status": quotation.status,

        "approved_by": current_user.id,

        "approved_by_name": manager_name,

        "message": (
            f"Quotation "
            f"{quotation.quotation_number} "
            f"approved successfully"
        )
    }


# ============================================================
# 4. REJECT QUOTATION
# ============================================================

@router.post("/{quotation_id}/reject")
def reject_quotation(
    quotation_id: int,
    payload: RejectRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Manager rejects quotation.

    PENDING_APPROVAL
            ↓
        REJECTED
    """

    quotation = get_quotation_or_404(
        quotation_id,
        db
    )

    check_manager_access(
        quotation,
        current_user
    )

    if quotation.status != "PENDING_APPROVAL":
        raise HTTPException(
            status_code=400,
            detail=(
                f"Quotation cannot be rejected. "
                f"Current status: {quotation.status}"
            )
        )

    quotation.status = "REJECTED"

    db.commit()
    db.refresh(quotation)

    manager_name = (
        getattr(
            current_user,
            "name",
            None
        )
        or getattr(
            current_user,
            "full_name",
            None
        )
        or getattr(
            current_user,
            "username",
            None
        )
        or current_user.email
    )

    return {
        "status": "success",

        "quotation_id": quotation.id,

        "quotation_number": quotation.quotation_number,

        "quotation_status": quotation.status,

        "rejected_by": current_user.id,

        "rejected_by_name": manager_name,

        "reason": payload.reason,

        "message": (
            f"Quotation "
            f"{quotation.quotation_number} "
            f"rejected"
        )
    }


# ============================================================
# 5. REQUEST CHANGES
# ============================================================

@router.post("/{quotation_id}/request-changes")
def request_changes(
    quotation_id: int,
    payload: CommentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Manager asks salesperson to modify quotation.

    PENDING_APPROVAL
            ↓
    CHANGES_REQUESTED
    """

    if not payload.comment:
        raise HTTPException(
            status_code=400,
            detail="Please provide the changes required"
        )

    quotation = get_quotation_or_404(
        quotation_id,
        db
    )

    check_manager_access(
        quotation,
        current_user
    )

    if quotation.status != "PENDING_APPROVAL":
        raise HTTPException(
            status_code=400,
            detail=(
                f"Changes cannot be requested. "
                f"Current status: {quotation.status}"
            )
        )

    quotation.status = "CHANGES_REQUESTED"

    db.commit()
    db.refresh(quotation)

    manager_name = (
        getattr(
            current_user,
            "name",
            None
        )
        or getattr(
            current_user,
            "full_name",
            None
        )
        or getattr(
            current_user,
            "username",
            None
        )
        or current_user.email
    )

    return {
        "status": "success",

        "quotation_id": quotation.id,

        "quotation_number": quotation.quotation_number,

        "quotation_status": quotation.status,

        "requested_by": current_user.id,

        "requested_by_name": manager_name,

        "comment": payload.comment,

        "message": (
            f"Changes requested for "
            f"{quotation.quotation_number}"
        )
    }


# ============================================================
# 6. UPDATE PRICES
# ============================================================

@router.put("/{quotation_id}/prices")
def update_quotation_prices(
    quotation_id: int,
    payload: UpdatePricesRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Manager edits quotation prices before approval.

    IMPORTANT:
    Database field = unit_price
    API request field = selling_price
    """

    quotation = get_quotation_or_404(
        quotation_id,
        db
    )

    check_manager_access(
        quotation,
        current_user
    )

    if quotation.status != "PENDING_APPROVAL":
        raise HTTPException(
            status_code=400,
            detail=(
                "Prices can only be edited while "
                "quotation is pending approval"
            )
        )

    updated_items = []

    new_quotation_subtotal = 0
    new_total_gst = 0
    new_grand_total = 0

    for price_item in payload.items:

        item = (
            db.query(QuotationItem)
            .filter(
                QuotationItem.id ==
                price_item.quotation_item_id,

                QuotationItem.quotation_id ==
                quotation.id
            )
            .first()
        )

        if not item:
            raise HTTPException(
                status_code=404,
                detail=(
                    f"Quotation item "
                    f"{price_item.quotation_item_id} "
                    f"not found"
                )
            )

        # New selling price is stored
        # in existing unit_price column
        new_unit_price = float(
            price_item.selling_price
        )

        quantity = int(
            item.quantity
        )

        gst_percentage = float(
            item.gst_percentage
        )

        # Recalculate subtotal
        new_subtotal = (
            new_unit_price *
            quantity
        )

        # Recalculate GST
        new_gst_amount = (
            new_subtotal *
            gst_percentage /
            100
        )

        # Recalculate total
        new_total_price = (
            new_subtotal +
            new_gst_amount
        )

        # Update database
        item.unit_price = new_unit_price

        item.subtotal = new_subtotal

        item.gst_amount = new_gst_amount

        item.total_price = new_total_price

        # Add quotation totals
        new_quotation_subtotal += new_subtotal

        new_total_gst += new_gst_amount

        new_grand_total += new_total_price

        updated_items.append({
            "quotation_item_id": item.id,

            "product_id": item.product_id,

            "product_name": item.product_name,

            "quantity": quantity,

            "unit": item.unit,

            "unit_price": new_unit_price,

            "gst_percentage": gst_percentage,

            "subtotal": new_subtotal,

            "gst_amount": new_gst_amount,

            "total_price": new_total_price
        })

    # Update quotation totals
    quotation.subtotal = new_quotation_subtotal

    quotation.total_gst = new_total_gst

    quotation.grand_total = new_grand_total

    quotation.updated_at = datetime.utcnow()

    db.commit()

    db.refresh(quotation)

    return {
        "status": "success",

        "quotation_id": quotation.id,

        "quotation_number": quotation.quotation_number,

        "message": (
            "Quotation prices updated successfully"
        ),

        "summary": {
            "subtotal": new_quotation_subtotal,
            "total_gst": new_total_gst,
            "grand_total": new_grand_total
        },

        "items": updated_items
    }


# ============================================================
# 7. SALESPERSON - MY QUOTATIONS
# ============================================================

@router.get("/salesperson/my-quotations")
def get_my_quotations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Salesperson sees quotations created by them.

    Possible statuses:

    DRAFT
    PENDING_APPROVAL
    APPROVED
    REJECTED
    CHANGES_REQUESTED
    """

    quotations = (
        db.query(Quotation)
        .filter(
            Quotation.user_id ==
            current_user.id
        )
        .order_by(
            Quotation.created_at.desc()
        )
        .all()
    )

    result = []

    for quotation in quotations:

        manager_name = None
        manager_email = None

        if quotation.manager_id:

            manager = (
                db.query(User)
                .filter(
                    User.id ==
                    quotation.manager_id
                )
                .first()
            )

            if manager:

                manager_name = (
                    getattr(
                        manager,
                        "name",
                        None
                    )
                    or getattr(
                        manager,
                        "full_name",
                        None
                    )
                    or getattr(
                        manager,
                        "username",
                        None
                    )
                    or manager.email
                )

                manager_email = manager.email

        result.append({
            "quotation_id": quotation.id,

            "quotation_number":
                quotation.quotation_number,

            "status":
                quotation.status,

            "manager": {
                "manager_id":
                    quotation.manager_id,

                "manager_name":
                    manager_name,

                "manager_email":
                    manager_email
            },

            "subtotal":
                float(quotation.subtotal),

            "total_gst":
                float(quotation.total_gst),

            "grand_total":
                float(quotation.grand_total),

            "submitted_at":
                quotation.submitted_at,

            "created_at":
                quotation.created_at
        })

    return {
        "status": "success",

        "count": len(result),

        "quotations": result
    }