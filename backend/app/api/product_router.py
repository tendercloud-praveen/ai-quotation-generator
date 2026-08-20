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

from app.services.product_ai_extractor import (
    extract_products_with_ai
)


router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


# =========================================================
# Helper: Extract products from PDF text
# =========================================================

def extract_products_from_text(text: str):

    products = []

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    # Find the line where actual products start
    start_index = None

    for i, line in enumerate(lines):

        # Product SKU pattern
        if re.match(
            r"^[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+$",
            line
        ):

            start_index = i
            break

    # No product SKU found
    if start_index is None:
        return products

    # Get only product data
    product_lines = lines[start_index:]

    # Each product has 6 fields
    for i in range(0, len(product_lines), 6):

        row = product_lines[i:i + 6]

        # Make sure complete product exists
        if len(row) < 6:
            continue

        try:

            product = {

                "sku": row[0],

                "product_name": row[1],

                "description": row[2],

                "unit": row[3],

                "selling_price": float(
                    row[4].replace(",", "")
                ),

                "gst_percentage": float(
                    row[5].replace("%", "")
                ),

                # Default values
                "category": "General",

                "cost_price": 0.0
            }

            products.append(product)

        except (ValueError, IndexError):

            continue

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


    # =====================================================
    # 4. EXTRACT PRODUCTS
    # =====================================================

    # First try normal extraction

    products = extract_products_from_text(
        extracted_text
    )


    # If normal extraction fails, use AI

    if not products:

        print(
            "Normal extraction failed. Trying AI extraction..."
        )

        try:

            products = extract_products_with_ai(
                extracted_text
            )

        except Exception as e:

            raise HTTPException(
                status_code=400,
                detail=(
                    f"AI extraction failed: {str(e)}"
                )
            )


    # Final check

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

                    Product.sku
                    == product_data["sku"],

                    Product.company_id
                    == current_user.company_id
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
                    "selling_price",
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

            db.add(
                new_product
            )

            db.commit()

            db.refresh(
                new_product
            )


            # ---------------------------------------------
            # Add to response
            # ---------------------------------------------

            saved_products.append({

                "id": new_product.id,

                "sku": new_product.sku,

                "product_name":
                    new_product.product_name,

                "category":
                    new_product.category,

                "unit":
                    new_product.unit,

                "cost_price":
                    new_product.cost_price,

                "selling_price":
                    new_product.selling_price,

                "gst_percentage":
                    new_product.gst_percentage,

                "description":
                    new_product.description
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

        "message":
            "Products uploaded successfully",

        "total_extracted":
            len(products),

        "total_saved":
            len(saved_products),

        "products":
            saved_products
    }
# =========================================================
# DELETE PRODUCT API
# =========================================================

@router.delete("/{product_id}")
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    # -----------------------------------------------------
    # Find product belonging to current company
    # -----------------------------------------------------

    product = (
        db.query(Product)
        .filter(
            Product.id == product_id,
            Product.company_id == current_user.company_id
        )
        .first()
    )

    # -----------------------------------------------------
    # Product not found
    # -----------------------------------------------------

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    # -----------------------------------------------------
    # Delete product
    # -----------------------------------------------------

    try:

        db.delete(product)
        db.commit()

        return {
            "message": "Product deleted successfully",
            "product_id": product_id
        }

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete product: {str(e)}"
        )