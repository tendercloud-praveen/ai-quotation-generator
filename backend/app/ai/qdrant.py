from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

client = QdrantClient(
    host="localhost",
    port=6333
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


def store_product_embedding(product_id, embedding, search_text):

    client.upsert(
        collection_name=COLLECTION_NAME,
        points=[
            PointStruct(
                id=product_id,
                vector=embedding,
                payload={
                    "product_id": product_id,
                    "text": search_text
                }
            )
        ]
    )


def search_products(query_embedding, top_k=1):
    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_embedding,
        limit=top_k,
        with_payload=True
    )

    return results.points