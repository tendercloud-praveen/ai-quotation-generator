# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session

# from app.database.database import get_db
# from app.models.product import Product
# from app.models.user import User
# from app.schemas.product_schema import ProductResponse
# from app.utils.auth import get_current_user


# router = APIRouter(
#     prefix="/products",
#     tags=["Products"]
# )


# # Get all products
# @router.get("/", response_model=list[ProductResponse])
# def get_products(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):

#     products = (
#         db.query(Product)
#         .filter(Product.company_id == current_user.company_id)
#         .all()
#     )

#     return products


# # Get one product by ID
# @router.get("/{product_id}", response_model=ProductResponse)
# def get_product(
#     product_id: int,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):

#     product = (
#         db.query(Product)
#         .filter(
#             Product.id == product_id,
#             Product.company_id == current_user.company_id
#         )
#         .first()
#     )

#     if not product:
#         raise HTTPException(
#             status_code=404,
#             detail="Product not found"
#         )

#     return product

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.product import Product
from app.models.user import User
from app.schemas.product_schema import ProductResponse
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


# =========================================================
# GET ALL PRODUCTS
# =========================================================

@router.get("/", response_model=list[ProductResponse])
def get_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    products = (
        db.query(Product)
        .filter(
            Product.company_id == current_user.company_id
        )
        .all()
    )

    # Protect against old NULL GST values
    for product in products:
        if product.gst_percentage is None:
            product.gst_percentage = 0.0

    return products


# =========================================================
# GET ONE PRODUCT BY ID
# =========================================================

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    product = (
        db.query(Product)
        .filter(
            Product.id == product_id,
            Product.company_id == current_user.company_id
        )
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    # Protect against NULL GST
    if product.gst_percentage is None:
        product.gst_percentage = 0.0

    return product