from typing import Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.utils.auth import get_current_user
from app.models.user import User

from app.ai.ocr import process_input
from app.ai.qdrant import search_products
from app.models.product import Product


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

    # Check whether user provided text or file
    if not text and not file:
        return {
            "status": "failed",
            "message": "Please enter text or upload a file."
        }

    # Process input and generate embedding
    result = await process_input(
        text=text,
        file=file
    )

    # Get the user's query embedding
    query_embedding = result["embedding"]

    # Search similar products in Qdrant
    similar_products = search_products(
        query_embedding,
        top_k=1
    )

    # Get product IDs from Qdrant
    product_ids = [
        product.payload.get("product_id")
        for product in similar_products
    ]

    # Fetch complete product details from PostgreSQL
    products = []

    for product_id in product_ids:
        product = (
            db.query(Product)
            .filter(Product.id == product_id)
            .first()
        )

        if product:
            products.append(product)

    # Print Qdrant results for testing
    for product in similar_products:
        print(
            "Product ID:",
            product.payload.get("product_id"),
            "Score:",
            product.score
        )

    # Return response
    return {
        "status": "success",
        "user_id": current_user.id,
        "email": current_user.email,
        "input_type": "text" if text else "file",
        "query": result["text"],

        "similar_products": [
            {
                "product_id": product.payload.get("product_id"),
                "score": product.score
            }
            for product in similar_products
        ],

        "products": [
            {
                "product_id": product.id,
                "product_name": product.product_name,
                "category": product.category,
                "description": product.description,
                "price": product.price,
                "unit": product.unit
            }
            for product in products
        ]
    }