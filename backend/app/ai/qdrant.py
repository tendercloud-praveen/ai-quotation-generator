import os

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue
)


# ==========================================
# QDRANT CONFIGURATION
# ==========================================

QDRANT_URL = os.getenv(
    "QDRANT_URL",
    "http://localhost:6333"
)

COLLECTION_NAME = "products"


# ==========================================
# QDRANT CLIENT
# ==========================================

client = QdrantClient(
    url=QDRANT_URL
)


# ==========================================
# CREATE COLLECTION
# ==========================================

def create_collection():

    try:

        collections = client.get_collections()

        existing_collections = [
            collection.name
            for collection in collections.collections
        ]

        print("Existing Qdrant collections:", existing_collections)

        if COLLECTION_NAME not in existing_collections:

            print(
                f"Creating Qdrant collection: "
                f"{COLLECTION_NAME}"
            )

            client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(
                    size=768,
                    distance=Distance.COSINE
                )
            )

            print(
                "Qdrant collection created successfully"
            )

        else:

            print(
                f"Qdrant collection already exists: "
                f"{COLLECTION_NAME}"
            )

    except Exception as e:

        print(
            "ERROR creating/checking Qdrant collection:",
            str(e)
        )

        raise e


# ==========================================
# STORE PRODUCT EMBEDDING
# ==========================================

def store_product_embedding(
    company_id,
    product_id,
    embedding,
    search_text
):

    try:

        # Make sure collection exists
        create_collection()

        # Convert IDs to integers
        company_id = int(company_id)
        product_id = int(product_id)

        print("\n========== QDRANT STORE START ==========")

        print("Company ID:", company_id)

        print("Product ID:", product_id)

        print("Vector size:", len(embedding))

        print("Search text:", search_text)


        # Store vector in Qdrant
        response = client.upsert(
            collection_name=COLLECTION_NAME,
            points=[
                PointStruct(

                    # Unique Qdrant point ID
                    id=product_id,

                    # 768-dimensional embedding
                    vector=embedding,

                    # Product metadata
                    payload={
                        "company_id": company_id,
                        "product_id": product_id,
                        "text": search_text
                    }
                )
            ]
        )


        print("Qdrant upsert response:", response)

        print(
            "PRODUCT SUCCESSFULLY STORED IN QDRANT"
        )

        print(
            "========================================\n"
        )


        return True


    except Exception as e:

        print(
            "QDRANT UPSERT ERROR:",
            str(e)
        )

        raise e


# ==========================================
# SEARCH PRODUCTS
# ==========================================

def search_products(
    query_embedding,
    company_id,
    top_k=5
):

    try:

        # Make sure collection exists
        create_collection()

        company_id = int(company_id)

        print("\n========== QDRANT SEARCH START ==========")

        print("Searching company ID:", company_id)

        print("Query vector size:", len(query_embedding))


        # Filter products by company
        company_filter = Filter(

            must=[
                FieldCondition(
                    key="company_id",

                    match=MatchValue(
                        value=company_id
                    )
                )
            ]
        )


        # Search Qdrant
        results = client.query_points(

            collection_name=COLLECTION_NAME,

            query=query_embedding,

            query_filter=company_filter,

            limit=top_k,

            with_payload=True
        )


        print(
            "Number of results:",
            len(results.points)
        )

        print(
            "Qdrant results:",
            results.points
        )

        print(
            "========================================\n"
        )


        return results.points


    except Exception as e:

        print(
            "QDRANT SEARCH ERROR:",
            str(e)
        )

        raise e


# ==========================================
# CHECK TOTAL VECTORS
# ==========================================

def get_qdrant_product_count():

    try:

        create_collection()

        collection_info = client.get_collection(
            collection_name=COLLECTION_NAME
        )

        print(
            "TOTAL PRODUCTS/VECTORS IN QDRANT:",
            collection_info.points_count
        )

        return collection_info.points_count

    except Exception as e:

        print(
            "ERROR GETTING QDRANT COUNT:",
            str(e)
        )

        return 0