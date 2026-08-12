from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.quotations import Quotation, QuotationItem
from app.schemas.quotation import QuotationCreate, SubmitQuotation
from app.utils.auth import get_current_user
from app.models.user import User


router = APIRouter(
    prefix="/quotations",
    tags=["Quotations"]
)


# ============================================================
# 1. SAVE QUOTATION AS DRAFT
# ============================================================

@router.post("/")
def save_quotation(
    quotation_data: QuotationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    try:
        # ----------------------------------------------------
        # Get logged-in user information
        # ----------------------------------------------------

        user_id = current_user.id
        company_id = current_user.company_id

        # ----------------------------------------------------
        # Generate quotation number
        # ----------------------------------------------------

        last_quotation = (
            db.query(Quotation)
            .order_by(Quotation.id.desc())
            .first()
        )

        if last_quotation:
            quotation_number = f"QT-{last_quotation.id + 1:04d}"
        else:
            quotation_number = "QT-0001"

        # ----------------------------------------------------
        # Create quotation
        # ----------------------------------------------------

        quotation = Quotation(
            quotation_number=quotation_number,
            user_id=user_id,
            company_id=company_id,
            inquiry_text=quotation_data.inquiry_text,

            subtotal=quotation_data.summary.subtotal,
            total_gst=quotation_data.summary.total_gst,
            grand_total=quotation_data.summary.grand_total,

            status="DRAFT"
        )

        db.add(quotation)

        # Get quotation ID
        db.flush()

        # ----------------------------------------------------
        # Save quotation items
        # ----------------------------------------------------

        for item in quotation_data.items:

            quotation_item = QuotationItem(
                quotation_id=quotation.id,

                product_id=item.product_id,
                product_name=item.product_name,

                quantity=item.quantity,
                unit=item.unit,

                unit_price=item.unit_price,
                gst_percentage=item.gst_percentage,

                subtotal=item.subtotal,
                gst_amount=item.gst_amount,
                total_price=item.total_price
            )

            db.add(quotation_item)

        # ----------------------------------------------------
        # Save everything
        # ----------------------------------------------------

        db.commit()
        db.refresh(quotation)

        # ----------------------------------------------------
        # Response
        # ----------------------------------------------------

        return {
            "status": "success",
            "quotation_id": quotation.id,
            "quotation_number": quotation.quotation_number,
            "user_id": user_id,
            "company_id": company_id,
            "quotation_status": quotation.status,
            "message": "Quotation saved as draft"
        }

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ============================================================
# 2. SEND QUOTATION FOR APPROVAL
# ============================================================

@router.post("/{quotation_id}/submit")
def submit_quotation(
    quotation_id: int,
    data: SubmitQuotation,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    # --------------------------------------------------------
    # Step 1: Find quotation
    # --------------------------------------------------------

    quotation = (
        db.query(Quotation)
        .filter(
            Quotation.id == quotation_id,
            Quotation.user_id == current_user.id,
            Quotation.company_id == current_user.company_id
        )
        .first()
    )

    if not quotation:
        raise HTTPException(
            status_code=404,
            detail="Quotation not found"
        )

    # --------------------------------------------------------
    # Step 2: Check quotation status
    # --------------------------------------------------------

    if quotation.status != "DRAFT":
        raise HTTPException(
            status_code=400,
            detail="Only draft quotations can be submitted"
        )

    # --------------------------------------------------------
    # Step 3: Find manager
    # --------------------------------------------------------

    manager = (
        db.query(User)
        .filter(
            User.id == data.manager_id,
            User.company_id == current_user.company_id,
            User.is_active == True
        )
        .first()
    )

    if not manager:
        raise HTTPException(
            status_code=404,
            detail="Manager not found"
        )

    # --------------------------------------------------------
    # Step 4: Check manager role
    # --------------------------------------------------------

    # Your database has "manager" in lowercase.
    # So convert it to lowercase before checking.

    manager_role = str(manager.role).lower()

    # If role is an Enum, use its value
    if hasattr(manager.role, "value"):
        manager_role = str(manager.role.value).lower()

    if manager_role != "manager":
        raise HTTPException(
            status_code=400,
            detail="Selected user is not a manager"
        )

    # --------------------------------------------------------
    # Step 5: Assign manager
    # --------------------------------------------------------

    quotation.manager_id = manager.id

    # --------------------------------------------------------
    # Step 6: Change quotation status
    # --------------------------------------------------------

    quotation.status = "PENDING_APPROVAL"

    # --------------------------------------------------------
    # Step 7: Save submission time
    # --------------------------------------------------------

    quotation.submitted_at = datetime.utcnow()

    # --------------------------------------------------------
    # Step 8: Save to database
    # --------------------------------------------------------

    db.commit()
    db.refresh(quotation)

    # --------------------------------------------------------
    # Step 9: Return response
    # --------------------------------------------------------

    return {
        "status": "success",
        "quotation_id": quotation.id,
        "quotation_number": quotation.quotation_number,
        "manager_id": manager.id,
        "manager_name": manager.full_name,
        "manager_email": manager.email,
        "quotation_status": quotation.status,
        "submitted_at": quotation.submitted_at,
        "message": "Quotation sent for approval"
    }