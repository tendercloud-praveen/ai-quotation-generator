from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.product import Product
from app.schemas.product_schema import ProductCreate, ProductResponse
from app.models.user import User
from app.utils.auth import get_current_user

from app.ai.product_embedding import create_product_embedding


router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


@router.post("/", response_model=ProductResponse)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
   
    
):

<<<<<<< Updated upstream
    # 1. Save product to PostgreSQL
=======
    # Check if SKU already exists
    existing_product = (
        db.query(Product)
        .filter(
            Product.sku == product.sku,
            Product.company_id == current_user.company_id
            
        )
        .first()
    )
>>>>>>> Stashed changes

    new_product = Product(
        sku=product.sku,
        category=product.category,
        product_name=product.product_name,
        unit=product.unit,
        cost_price=product.cost_price,
        selling_price=product.selling_price,
        gst_percentage=product.gst_percentage,
        description=product.description,
        company_id=current_user.company_id
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)


    # 2. Create embedding and store in Qdrant

    create_product_embedding(new_product)


    # 3. Return product

    return new_product