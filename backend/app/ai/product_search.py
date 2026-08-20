from app.ai.qdrant import search_products


def search_product_by_embedding(
    query_embedding,
    db,
    Product,
    company_id,
    top_k=3,
    score_threshold=0.85
):
    """
    Search products using Qdrant embeddings.

    A product is considered MATCHED only when:
    1. Qdrant returns a product
    2. Its similarity score is >= score_threshold
    3. The product exists in PostgreSQL

    Similar products below the threshold are NOT treated as matches.
    """

    # ---------------------------------------------------------
    # 1. Search Qdrant
    # ---------------------------------------------------------

    similar_products = search_products(
        query_embedding,
        company_id=company_id,
        top_k=top_k
    )

    if not similar_products:
        return {
            "found": False,
            "message": "No matching products found.",
            "similar_products": [],
            "products": []
        }

    # ---------------------------------------------------------
    # 2. Keep only HIGH-CONFIDENCE products
    # ---------------------------------------------------------

    high_confidence_products = [
        product
        for product in similar_products
        if product.score >= score_threshold
    ]

    # ---------------------------------------------------------
    # 3. If nothing reaches threshold
    # ---------------------------------------------------------

    if not high_confidence_products:
        return {
            "found": False,
            "message": "No matching products found.",
            "similar_products": [],
            "products": []
        }

    # ---------------------------------------------------------
    # 4. Get product IDs
    # ---------------------------------------------------------

    product_ids = []

    for product in high_confidence_products:

        product_id = product.payload.get("product_id")

        if product_id is not None:
            product_ids.append(product_id)

    # Remove duplicate IDs
    product_ids = list(set(product_ids))

    # ---------------------------------------------------------
    # 5. No valid product IDs
    # ---------------------------------------------------------

    if not product_ids:
        return {
            "found": False,
            "message": "No matching products found.",
            "similar_products": [],
            "products": []
        }

    # ---------------------------------------------------------
    # 6. Get products from PostgreSQL
    # ---------------------------------------------------------

    products = (
        db.query(Product)
        .filter(Product.id.in_(product_ids))
        .all()
    )

    # ---------------------------------------------------------
    # 7. Qdrant product exists but PostgreSQL product doesn't
    # ---------------------------------------------------------

    if not products:
        return {
            "found": False,
            "message": "No matching products found.",
            "similar_products": [],
            "products": []
        }

    # ---------------------------------------------------------
    # 8. Return ONLY HIGH-CONFIDENCE products
    # ---------------------------------------------------------

    return {
        "found": True,
        "message": "Matching products found.",
        "similar_products": high_confidence_products,
        "products": products
    }