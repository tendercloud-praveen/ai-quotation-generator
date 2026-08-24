from app.ai.qdrant import client, COLLECTION_NAME

client.delete_collection(
    collection_name=COLLECTION_NAME
)

print("Qdrant collection deleted successfully")