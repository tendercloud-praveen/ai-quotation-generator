from app.ai.embedding import generate_embedding
from app.ai.qdrant import (
    create_collection,
    store_product_embedding
)


def create_product_embedding(product):

    # Create searchable text
    search_text = (
        f"{product.product_name} "
        f"{product.category} "
        f"{product.description}"
    )

    print("Search Text:", search_text)

    # Generate embedding
    embedding = generate_embedding(search_text)

    print("Embedding generated")
    print("Vector length:", len(embedding))

    # Create Qdrant collection if it doesn't exist
    create_collection()

    # Store embedding in Qdrant
    store_product_embedding(
        product.id,
        embedding,
        search_text
    )

    print("Vector stored in Qdrant")

    return {
        "product_id": product.id,
        "search_text": search_text
    }