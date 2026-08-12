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
from app.ai.inquiry_parser import extract_quantity
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

    # 1. Check input
    if not text and not file:
        return {
            "status": "failed",
            "message": "Please enter text or upload a file."
        }

    # 2. Extract text and generate embedding
    result = await process_input(
        text=text,
        file=file
    )

    # 3. Extract quantity from user query
    quantity = extract_quantity(
        result["text"]
    )

    # 4. Search products using Qdrant
    search_result = search_product_by_embedding(
        query_embedding=result["embedding"],
        db=db,
        Product=Product,
        top_k=1,
        score_threshold=0.75
    )

    similar_products = search_result["similar_products"]
    products = search_result["products"]

    # 5. Calculate quotation
    quotation = calculate_quotation(
        products,
        quantity
    )

    # 6. Return response
    return {
    "status": "success",

    "user_id": current_user.id,
    "email": current_user.email,

    "inquiry": {
        "input_type": "text" if text else "file",
        "query": result["text"],
        "quantity": quantity
    },

    "match_result": {
        # AI confidence
        

        "message": search_result["message"],

        # Qdrant matching
        "similar_products": [
            {
                "product_id": product.payload.get("product_id"),
                "score": product.score
            }
            for product in similar_products
        ],

        # Matched PostgreSQL products
        "products": [
            {
                "product_id": product.id,
                "product_name": product.product_name,
                "category": product.category,
                "description": product.description,
                "selling_price": product.selling_price,
                "gst_percentage": product.gst_percentage,
                "unit": product.unit
            }
            for product in products
        ],

        # Quotation items
        "items": quotation["quotation_items"],

        # Quotation summary
        "summary": {
            "subtotal": quotation["subtotal"],
            "gst_percentage": 18,
            "total_gst": quotation["total_gst"],
            "grand_total": quotation["grand_total"]
        }
    }
}