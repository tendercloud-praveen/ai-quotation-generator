from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.product import Product
from app.schemas.product_schema import ProductCreate, ProductResponse
from app.models.user import User
from app.utils.auth import get_current_user

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("/", response_model=ProductResponse)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    new_product = Product(
        sku=product.sku,
        category=product.category,
        product_name=product.product_name,
        unit=product.unit,
        cost_price=product.cost_price,
        selling_price=product.selling_price,
        description=product.description,

        # Temporary value
        company_id=current_user.company_id
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product