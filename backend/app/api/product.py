from fastapi import APIRouter, Depends,HTTPException
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

    # Check if SKU already exists
    existing_product = (
        db.query(Product)
        .filter(
            Product.sku == product.sku,
            Product.company_id == current_user.company_id
            
        )
        .first()
    )
    existing_product = (
    db.query(Product)
    .filter(
        Product.company_id == current_user.company_id,
        Product.sku == product.sku
    )
    .first()
)

    if existing_product:
        raise HTTPException(
                status_code=400,
                detail="This SKU already exists for your company"
            )
    

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
    create_product_embedding(new_product)


    # 2. Create embedding and store in Qdrant

    # c


    # 3. Return product

    return new_product