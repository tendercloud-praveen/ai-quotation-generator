import os
import re

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database.database import get_db
from app.utils.auth import get_current_user
from app.ai.ocr import process_input
from app.models.product import Product


router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


# =========================================================
# Helper: Extract products from PDF text
# =========================================================

def extract_products_from_text(text: str):

    products = []

    pattern = re.compile(
        r"""
        (?P<sku>
            (?:DEL|HP)
            [-\s]*
            [A-Z0-9]+
            [-\s]*
            [A-Z0-9]+
        )
        \s+
        (?P<name>.*?)
        \s+
        (?P<category>Laptops|Accessories|Monitors)
        \s+
        (?P<brand>Dell|HP)
        \s+
        (?P<price>[\d,]+\.\d{2})
        \s+
        (?P<stock>\d+)
        \s+
        (?P<specification>.*?)
        \s+
        (?P<status>Active|Inactive)
        \s+
        (?P<weight>[\d.]+\s*kg)
        """,
        re.IGNORECASE | re.VERBOSE
    )

    matches = pattern.finditer(text)

    for match in matches:

        data = match.groupdict()

        products.append({
            "sku": data["sku"].replace(" ", ""),
            "product_name": data["name"].strip(),
            "category": data["category"].strip(),
            "brand": data["brand"].strip(),
            "price": float(
                data["price"].replace(",", "")
            ),
            "stock": int(data["stock"]),
            "description": data["specification"].strip(),
            "status": data["status"].strip(),
            "weight": data["weight"].strip()
        })

    return products


# =========================================================
# BULK UPLOAD API
# =========================================================

@router.post("/bulk-upload")
async def bulk_upload_products(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    # =====================================================
    # 1. CHECK FILE
    # =====================================================

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="File is required"
        )

    # =====================================================
    # 2. CHECK FILE EXTENSION
    # =====================================================

    extension = os.path.splitext(
        file.filename
    )[1].lower()

    allowed_extensions = [
        ".pdf",
        ".docx",
        ".jpg",
        ".jpeg",
        ".png",
        ".bmp",
        ".tiff",
        ".webp"
    ]

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format: {extension}"
        )

    # =====================================================
    # 3. EXTRACT TEXT
    # =====================================================

    try:

        result = await process_input(
            file=file
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"File processing failed: {str(e)}"
        )

    if not result:
        raise HTTPException(
            status_code=400,
            detail="No content extracted from file"
        )

    extracted_text = result.get(
        "text",
        ""
    )

    if not extracted_text:
        raise HTTPException(
            status_code=400,
            detail="No text found in uploaded file"
        )

    # =====================================================
    # 4. EXTRACT PRODUCTS
    # =====================================================

    products = extract_products_from_text(
        extracted_text
    )

    if not products:
        raise HTTPException(
            status_code=400,
            detail=(
                "No products could be extracted "
                "from the uploaded file"
            )
        )

    # =====================================================
    # 5. SAVE PRODUCTS TO DATABASE
    # =====================================================

    saved_products = []

    try:

        for product_data in products:

            # ---------------------------------------------
            # Check duplicate SKU
            # ---------------------------------------------

            existing_product = (
                db.query(Product)
                .filter(
                    Product.sku == product_data["sku"],
                    Product.company_id == current_user.company_id
                )
                .first()
            )

            if existing_product:
                continue

            # ---------------------------------------------
            # Create Product
            # ---------------------------------------------

            new_product = Product(
                sku=product_data["sku"],

                category=product_data.get(
                    "category",
                    "General"
                ),

                product_name=product_data[
                    "product_name"
                ],

                description=product_data.get(
                    "description"
                ),

                selling_price=product_data.get(
                    "price",
                    0.0
                ),

                unit=product_data.get(
                    "unit",
                    "piece"
                ),

                cost_price=product_data.get(
                    "cost_price",
                    0.0
                ),

                gst_percentage=product_data.get(
                    "gst_percentage",
                    0.0
                ),

                company_id=current_user.company_id
            )

            # ---------------------------------------------
            # Add to database
            # ---------------------------------------------

            db.add(new_product)

            db.commit()

            db.refresh(new_product)

            # ---------------------------------------------
            # Add to response
            # ---------------------------------------------

            saved_products.append({
                "id": new_product.id,
                "sku": new_product.sku,
                "product_name": new_product.product_name,
                "category": new_product.category,
                "unit": new_product.unit,
                "cost_price": new_product.cost_price,
                "selling_price": new_product.selling_price,
                "gst_percentage": new_product.gst_percentage,
                "description": new_product.description
            })

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Database save failed: {str(e)}"
        )

    # =====================================================
    # 6. RETURN RESPONSE
    # =====================================================

    return {
        "message": "Products uploaded successfully",
        "total_extracted": len(products),
        "total_saved": len(saved_products),
        "products": saved_products
    }