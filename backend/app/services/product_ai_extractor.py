import os
import json

from dotenv import load_dotenv
from langchain_groq import ChatGroq


load_dotenv()


def extract_products_with_ai(text: str):

    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise ValueError(
            "GROQ_API_KEY not found in .env file"
        )

    llm = ChatGroq(
        model="openai/gpt-oss-20b",
        temperature=0,
        api_key=api_key
    )

    prompt = f"""
You are a product data extraction system.

Extract all products from the following text.

The document may use different field names such as:

SKU:
SKU Number
Item Code
Product Code
Code

Product Name:
Product Name
Item Name
Product
Item
Material

Description:
Description
Details
Specification

Unit:
Unit
UOM
Unit of Measure

Selling Price:
Price
Rate
Selling Price
Unit Price
Amount

GST:
GST
GST %
Tax
Tax %

Return ONLY valid JSON.

Use this format:

[
    {{
        "sku": "string",
        "product_name": "string",
        "description": "string",
        "unit": "string",
        "selling_price": 0.0,
        "gst_percentage": 0.0,
        "category": "General",
        "cost_price": 0.0
    }}
]

If a field is not available, use:
- string fields: ""
- numeric fields: 0

Document text:

{text}
"""

    response = llm.invoke(prompt)

    result = response.content.strip()

    # Remove markdown if AI returns ```json
    if result.startswith("```json"):
        result = result.replace("```json", "", 1)

    if result.startswith("```"):
        result = result.replace("```", "", 1)

    if result.endswith("```"):
        result = result[:-3]

    try:
        products = json.loads(result.strip())

    except json.JSONDecodeError:
        raise ValueError(
            "AI could not return valid product JSON"
        )

    return products