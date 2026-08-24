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

Extract all products from the following document.

The document may use different field names.

SKU fields:
- SKU
- SKU Number
- Item Code
- Product Code
- Code

Product Name fields:
- Product Name
- Item Name
- Product
- Item
- Material

Description fields:
- Description
- Details
- Specification
- Product Details
- Item Details

Unit fields:
- Unit
- UOM
- Unit of Measure

Selling Price fields:
- Price
- Rate
- Selling Price
- Unit Price
- Amount

GST fields:
- GST
- GST %
- GST Percentage
- Tax
- Tax %

Category fields:
- Category
- Product Category
- Product Type
- Type

Cost Price fields:
- Cost Price
- Cost
- Purchase Price
- Buying Price


IMPORTANT DESCRIPTION RULE:

1. First check whether the document already contains a description,
   details, specification, or similar information.

2. If a description is available:
   - Keep the original description/information.
   - Do not unnecessarily change it.
   - Do not invent additional specifications.

3. If description is NOT available:
   - Create a short useful description using the product name
     and other information available in the document.
   - Do not invent technical specifications.
   - Do not invent brand, model, size, color, material, or other
     information that is not present.


IMPORTANT CATEGORY RULE — MUST FOLLOW:

If the document does not explicitly provide a category, you MUST determine
the category from the product_name, description, and product details.

DO NOT return "General" when the product can be reasonably categorized.

Examples:

Laptop, HP Laptop, Dell Laptop, Computer, Desktop, Monitor,
Keyboard, Mouse, Printer, Mobile Phone, SSD, Hard Disk
→ Electronics

Office Chair, Table, Desk, Sofa, Cupboard
→ Furniture

T-Shirt, Shirt, Jeans, Shoes, Dress
→ Clothing

Cement, Steel, Bricks, Paint, Sand
→ Construction Materials

Rice, Sugar, Oil, Biscuits, Food Items
→ Food & Grocery

Shampoo, Soap, Toothpaste, Face Wash
→ Personal Care

CRITICAL EXAMPLE:

Input:
Product Name: HP Laptop
Description: 15.6 inch business laptop

Correct category:
"Electronics"

Returning "General" for a Laptop is INCORRECT.

Use "General" ONLY when you genuinely cannot determine any reasonable
category from the product name or description.

Use exactly this format:

[
    {{
        "sku": "string",
        "product_name": "string",
        "description": "string",
        "unit": "string",
        "selling_price": 0.0,
        "gst_percentage": 0.0,
        "category": "string",
        "cost_price": 0.0
    }}
]

If a field is not available:

- string fields → ""
- numeric fields → 0

Document text:

{text}
"""

    response = llm.invoke(prompt)

    result = response.content.strip()

    # Remove markdown code block if AI returns ```json
    if result.startswith("```json"):
        result = result.replace("```json", "", 1)

    if result.startswith("```"):
        result = result.replace("```", "", 1)

    if result.endswith("```"):
        result = result[:-3]

    result = result.strip()

    try:
        products = json.loads(result)

    except json.JSONDecodeError:
        raise ValueError(
            "AI could not return valid product JSON"
        )

    return products