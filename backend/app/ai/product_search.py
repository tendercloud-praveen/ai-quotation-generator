from app.ai.qdrant import search_products


def search_product_by_embedding(
    query_embedding,
    db,
    Product,
    top_k=3,
    score_threshold=0.75
):

    # Search Qdrant
    similar_products = search_products(
        query_embedding,
        top_k=top_k
    )

    # Keep only relevant products
    similar_products = [
        product
        for product in similar_products
        if product.score >= score_threshold
    ]

    # Get product IDs
    product_ids = [
        product.payload.get("product_id")
        for product in similar_products
    ]

    # No matching product
    if not product_ids:
        return {
            "found": False,
            "message": "No matching products found.",
            "similar_products": [],
            "products": []
        }

    # Get products from PostgreSQL
    products = (
        db.query(Product)
        .filter(Product.id.in_(product_ids))
        .all()
    )

    # Product IDs found in Qdrant but not PostgreSQL
    if not products:
        return {
            "found": False,
            "message": "No matching products found.",
            "similar_products": [],
            "products": []
        }

    return {
        "found": True,
        "message": "Matching products found.",
        "similar_products": similar_products,
        "products": products
    }