from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.product import Product
from app.models.user import User
from app.schemas.product_schema import ProductCreate, ProductResponse
from app.utils.auth import get_current_user

from app.ai.product_embedding import create_product_embedding


router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


# ============================================================
# UPDATE PRODUCT
# ============================================================

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------------
    # 1. Find product belonging to logged-in user's company
    # --------------------------------------------------------

    existing_product = (
        db.query(Product)
        .filter(
            Product.id == product_id,
            Product.company_id == current_user.company_id
        )
        .first()
    )

    if not existing_product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    # --------------------------------------------------------
    # 2. Check duplicate SKU
    # --------------------------------------------------------

    sku_exists = (
        db.query(Product)
        .filter(
            Product.sku == product.sku,
            Product.company_id == current_user.company_id,
            Product.id != product_id
        )
        .first()
    )

    if sku_exists:
        raise HTTPException(
            status_code=400,
            detail=f"SKU '{product.sku}' already exists"
        )

    # --------------------------------------------------------
    # 3. Update product information
    # --------------------------------------------------------

    existing_product.sku = product.sku
    existing_product.category = product.category
    existing_product.product_name = product.product_name
    existing_product.unit = product.unit
    existing_product.cost_price = product.cost_price
    existing_product.gst_percentage = product.gst_percentage
    existing_product.selling_price = product.selling_price
    existing_product.description = product.description

    # --------------------------------------------------------
    # 4. Save updated product
    # --------------------------------------------------------

    db.commit()
    db.refresh(existing_product)

    # --------------------------------------------------------
    # 5. Update product embedding in Qdrant
    # --------------------------------------------------------

    create_product_embedding(existing_product)

    # --------------------------------------------------------
    # 6. Return updated product
    # --------------------------------------------------------

    return existing_product