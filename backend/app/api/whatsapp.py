# from fastapi import APIRouter, Depends
# from sqlalchemy.orm import Session

# from app.database.database import get_db
# from app.models.quotations import Quotation
# from app.models.customer import Customer
# from app.services.whatsapp_service import send_quotation_pdf
# from app.utils.auth import get_current_admin


# router = APIRouter(
#     prefix="/whatsapp",
#     tags=["WhatsApp"]
# )


# @router.post("/quotation/{quotation_id}")
# def send_quotation_on_whatsapp(
#     quotation_id: int,
#     db: Session = Depends(get_db),
#     current_admin=Depends(get_current_admin)
# ):

#     # ---------------------------------------------------------
#     # 1. Find quotation
#     # ---------------------------------------------------------

#     quotation = (
#         db.query(Quotation)
#         .filter(Quotation.id == quotation_id)
#         .first()
#     )

#     if not quotation:
#         return {
#             "success": False,
#             "message": "Quotation not found"
#         }

#     # ---------------------------------------------------------
#     # 2. Check quotation status
#     # ---------------------------------------------------------

#     if quotation.status != "APPROVED":
#         return {
#             "success": False,
#             "message": "Only approved quotations can be sent"
#         }

#     # ---------------------------------------------------------
#     # 3. Check customer
#     # ---------------------------------------------------------

#     if not quotation.customer_id:
#         return {
#             "success": False,
#             "message": "No customer is linked to this quotation"
#         }

#     customer = (
#         db.query(Customer)
#         .filter(Customer.id == quotation.customer_id)
#         .first()
#     )

#     if not customer:
#         return {
#             "success": False,
#             "message": "Customer not found"
#         }

#     # ---------------------------------------------------------
#     # 4. Check mobile number
#     # ---------------------------------------------------------

#     if not customer.mobile:
#         return {
#             "success": False,
#             "message": "Customer mobile number not available"
#         }

#     # ---------------------------------------------------------
#     # 5. Get quotation PDF
#     # ---------------------------------------------------------

#     pdf_path = quotation.pdf_path

#     if not pdf_path:
#         return {
#             "success": False,
#             "message": "Quotation PDF not available"
#         }

#     # ---------------------------------------------------------
#     # 6. Send PDF through WhatsApp
#     # ---------------------------------------------------------

#     return send_quotation_pdf(
#         customer_mobile=customer.mobile,
#         pdf_path=pdf_path,
#         quotation_number=quotation.quotation_number
#     )


from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.quotations import Quotation
from app.models.customer import Customer
from app.services.whatsapp_service import send_quotation_pdf
from app.services.quotation_download_services import get_quotation_for_download
from app.utils.auth import get_current_user
from pathlib import Path

router = APIRouter(
    prefix="/whatsapp",
    tags=["WhatsApp"]
)


@router.post("/quotation/{quotation_id}")
def send_quotation_on_whatsapp(
    quotation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    # ---------------------------------------------------------
    # 1. Find quotation belonging to user's company
    # ---------------------------------------------------------

    quotation = (
        db.query(Quotation)
        .filter(
            Quotation.id == quotation_id,
            Quotation.company_id == current_user.company_id
        )
        .first()
    )

    if not quotation:
        return {
            "success": False,
            "message": "Quotation not found"
        }

    # ---------------------------------------------------------
    # 2. Check quotation status
    # ---------------------------------------------------------

    if quotation.status.upper() != "APPROVED":
        return {
            "success": False,
            "message": "Only approved quotations can be sent"
        }

    # ---------------------------------------------------------
    # 3. Check customer
    # ---------------------------------------------------------

    if not quotation.customer_id:
        return {
            "success": False,
            "message": "No customer is linked to this quotation"
        }

    customer = (
        db.query(Customer)
        .filter(
            Customer.id == quotation.customer_id,
            Customer.company_id == current_user.company_id
        )
        .first()
    )

    if not customer:
        return {
            "success": False,
            "message": "Customer not found"
        }

    # ---------------------------------------------------------
    # 4. Check mobile number
    # ---------------------------------------------------------

    if not customer.mobile:
        return {
            "success": False,
            "message": "Customer mobile number not available"
        }

    # ---------------------------------------------------------
    # 5. Get quotation PDF
    # ---------------------------------------------------------

    

    pdf_path = get_quotation_for_download(
    db=db,
    quotation_id=quotation.id,
    company_id=quotation.company_id
    )

    if not pdf_path:
        return {
        "success": False,
        "message": "Quotation PDF could not be generated"
    }  
    # ---------------------------------------------------------
    # 6. Send PDF through WhatsApp
    # ---------------------------------------------------------

   
    return send_quotation_pdf(
    customer_mobile=customer.mobile,
    pdf_path=pdf_path,
    quotation_number=quotation.quotation_number
    )