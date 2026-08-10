from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.product import Product
from app.schemas.product_schema import ProductCreate, ProductResponse
from app.models.user import User
from app.utils.auth import get_current_user
from app.ai.embedding import generate_embedding
from app.ai.qdrant import create_collection, store_product_embedding


router = APIRouter(prefix="/products", tags=["Products"])


@router.post("/", response_model=ProductResponse)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Step 1: Save product to PostgreSQL
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


    # Step 2: Create searchable text
    search_text = (
        f"{new_product.product_name} "
        f"{new_product.category} "
        f"{new_product.description}"
    )

    print("Search Text:", search_text)


    # Step 3: Generate embedding
    embedding = generate_embedding(search_text)

    print("Embedding generated")
    print("Vector length:", len(embedding))
    print("Embedding:", embedding)


    # Step 4: Store vector + Product ID in Qdrant
    create_collection()

    store_product_embedding(
    new_product.id,
    embedding,
    search_text
)

    print("Vector stored in Qdrant")


    return new_product