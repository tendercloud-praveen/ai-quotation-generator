from app.database.database import SessionLocal

# Import all related models
from app.models.user import User
from app.models.company import Company
from app.models.customer import Customer
from app.models.product import Product

from app.ai.product_embedding import create_product_embedding


def index_all_products():

    db = SessionLocal()

    try:

        products = db.query(Product).all()

        print("\n================================")
        print("TOTAL PRODUCTS:", len(products))
        print("================================")

        if not products:
            print("No products found.")
            return

        for product in products:

            print("\n-------------------------------")
            print("Product ID:", product.id)
            print("Product Name:", product.product_name)
            print("Company ID:", product.company_id)
            print("-------------------------------")

            create_product_embedding(product)

        print("\n================================")
        print("ALL PRODUCTS INDEXED SUCCESSFULLY")
        print("================================")

    except Exception as e:

        print("\nERROR:", e)

    finally:

        db.close()


if __name__ == "__main__":
    index_all_products()