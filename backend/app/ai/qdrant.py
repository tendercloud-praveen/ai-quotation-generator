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


QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")

client = QdrantClient(
    url=QDRANT_URL
)

COLLECTION_NAME = "products"


def create_collection():

    collections = client.get_collections()

    existing_collections = [
        collection.name
        for collection in collections.collections
    ]

    if COLLECTION_NAME not in existing_collections:

        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=768,
                distance=Distance.COSINE
            )
        )


def store_product_embedding(
    company_id,
    product_id,
    embedding,
    search_text
):

    client.upsert(
        collection_name=COLLECTION_NAME,
        points=[
            PointStruct(
                id=product_id,
                vector=embedding,
                payload={
                    "company_id": company_id,
                    "product_id": product_id,
                    "text": search_text
                }
            )
        ]
    )


def search_products(
    query_embedding,
    company_id,
    top_k=1
):
    create_collection()
    print("Searching company ID:", company_id)

    company_filter = Filter(
        must=[
            FieldCondition(
                key="company_id",
                match=MatchValue(value=company_id)
            )
        ]
    )

    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_embedding,
        query_filter=company_filter,
        limit=top_k,
        with_payload=True
    )

    return results.points