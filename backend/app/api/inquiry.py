from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    UploadFile
)

from sqlalchemy.orm import Session

from app.database.database import get_db
from app.utils.auth import get_current_user

from app.models.user import User
from app.models.product import Product

from app.ai.ocr import process_input
from app.ai.product_search import search_product_by_embedding
from app.ai.inquiry_parser import extract_items_with_ai
from app.ai.quotation_calculator import calculate_quotation


router = APIRouter(
    prefix="/inquiries",
    tags=["Inquiry"]
)


@router.post("/extract-text")
async def extract_text(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # ---------------------------------------------------------
    # 1. Validate input
    # ---------------------------------------------------------

    if not text and not file:
        return {
            "status": "failed",
            "message": "Please enter text or upload a file."
        }

    # ---------------------------------------------------------
    # 2. Extract text
    #
    # If text is provided:
    #     process_input() uses the text directly.
    #
    # If file is provided:
    #     process_input() performs OCR and returns the text.
    # ---------------------------------------------------------

    result = await process_input(
        text=text,
        file=file
    )

    inquiry_text = result["text"]

    if not inquiry_text:
        return {
            "status": "failed",
            "message": "Unable to extract text from the input."
        }

    # ---------------------------------------------------------
    # 3. Extract products + quantities
    # ---------------------------------------------------------

    extracted_items = await extract_items_with_ai(inquiry_text)

    if not extracted_items:
        return {
            "status": "failed",
            "message": "Unable to identify products and quantities.",
            "extracted_text": inquiry_text
        }

    # ---------------------------------------------------------
    # 4. Search each product separately
    # ---------------------------------------------------------

    matched_products = []
    quotation_items = []

    total_subtotal = 0
    total_gst = 0
    grand_total = 0

    for item in extracted_items:

        product_name = item["product_name"]
        quantity = item["quantity"]

        # -----------------------------------------------------
        # Generate embedding for individual product
        # -----------------------------------------------------

        product_embedding_result = await process_input(
            text=product_name,
            file=None
        )

        # -----------------------------------------------------
        # Search product in Qdrant
        # -----------------------------------------------------

        search_result = search_product_by_embedding(
            query_embedding=product_embedding_result["embedding"],
            db=db,
            Product=Product,
            company_id=current_user.company_id,
            top_k=3,
            score_threshold=0.85
        )

        similar_products = search_result.get(
            "similar_products",
            []
        )

        products = search_result.get(
            "products",
            []
        )

        # -----------------------------------------------------
        # Product not found
        # -----------------------------------------------------

        if not products:

            matched_products.append({
                "requested_product": product_name,
                "quantity": quantity,
                "matched": False,
                "message": search_result.get(
                    "message",
                    "Product not found."
                ),
                "similar_products": [
                    {
                        "product_id": product.payload.get("product_id"),
                        "score": product.score
                    }
                    for product in similar_products
                ]
            })

            continue

        # -----------------------------------------------------
        # Take best matched PostgreSQL product
        # -----------------------------------------------------

        product = products[0]

        # -----------------------------------------------------
        # Calculate quotation for this product
        # -----------------------------------------------------

        quotation = calculate_quotation(
            [product],
            quantity
        )

        quotation_product_items = quotation.get(
            "quotation_items",
            []
        )

        quotation_items.extend(
            quotation_product_items
        )

        # -----------------------------------------------------
        # Add totals
        # -----------------------------------------------------

        total_subtotal += quotation.get(
            "subtotal",
            0
        )

        total_gst += quotation.get(
            "total_gst",
            0
        )

        grand_total += quotation.get(
            "grand_total",
            0
        )

        # -----------------------------------------------------
        # Add matched product information
        # -----------------------------------------------------

        matched_products.append({
            "requested_product": product_name,
            "quantity": quantity,
            "matched": True,

            "similar_products": [
                {
                    "product_id": similar_product.payload.get(
                        "product_id"
                    ),
                    "score": similar_product.score
                }
                for similar_product in similar_products
            ],

            "product": {
                "product_id": product.id,
                "product_name": product.product_name,
                "category": product.category,
                "description": product.description,
                "selling_price": product.selling_price,
                "gst_percentage": product.gst_percentage,
                "unit": product.unit
            }
        })

    # ---------------------------------------------------------
    # 5. Final response
    # ---------------------------------------------------------

    return {
        "status": "success",

        "user_id": current_user.id,
        "email": current_user.email,

        "inquiry": {
            "input_type": "text" if text else "file",
            "query": inquiry_text
        },

        "items_requested": extracted_items,

        "match_result": {
            "products": matched_products,

            "items": quotation_items,

            "summary": {
                "subtotal": round(total_subtotal, 2),
                "total_gst": round(total_gst, 2),
                "grand_total": round(grand_total, 2)
            }
        }
    }