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
You are a highly accurate product table extraction system.

Your job is to extract EVERY individual product/item from the document.

========================
CRITICAL RULES
========================

1. Extract EVERY product in the document.

2. There is NO fixed product limit.

3. If there are 10 products, return 10.

4. If there are 100 products, return 100.

5. If there are 500 products, return all products that can be
   reliably extracted from the document.

6. NEVER intentionally stop after 10, 20, or any other number.

For example, if the document contains:

Pumps
AquaPrime Booster Pump 2HP
BULK-PDF-1001
7200

Then:

category = "Pumps"
product_name = "AquaPrime Booster Pump 2HP"

NOT:

product_name = "Pumps"

========================
FIELD MAPPING
========================

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
- Material Name

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


========================
CATEGORY RULE
========================

If category is explicitly present, use it.

If category is NOT explicitly present, determine a reasonable category
from the product name and description.

Examples:

Laptop, Computer, Monitor, Keyboard, Mouse, Printer
→ Electronics

Cement, Steel, Bricks, Paint, Sand
→ Construction Materials

Pump, Water Pump, Booster Pump
→ Pumps / Water Equipment

Pipe, Elbow, Coupler, Plumbing Fitting
→ Plumbing

Safety Vest, Helmet, Safety Shoes
→ Safety Equipment

DO NOT use "General" if a reasonable category can be determined.

Use "General" ONLY when the category genuinely cannot be determined.


========================
DESCRIPTION RULE
========================

If the document contains a description, specification, or details:
- Preserve that information.
- Do not invent information.

If no description exists:
- Create a short description using only information available
  in the document.
- Do not invent brand, model, size, color, material, or specifications.


========================
IMPORTANT TABLE RULE
========================

When the document contains a table:

Read the table row by row.

EVERY PRODUCT ROW MUST BE EXTRACTED.

Do not treat:
- section headings
- category headings
- column headers
- page headers
- page footers
- company names
- addresses
- totals

as products.

If a category heading appears above several products, apply that category
to the products underneath it.

Example:

Pumps
1 | BULK-001 | AquaPrime Booster Pump 2HP | Nos | 7200
2 | BULK-002 | AquaPrime Water Pump 1HP | Nos | 4500

Correct result:

[
    {{
        "sku": "BULK-001",
        "product_name": "AquaPrime Booster Pump 2HP",
        "category": "Pumps"
    }},
    {{
        "sku": "BULK-002",
        "product_name": "AquaPrime Water Pump 1HP",
        "category": "Pumps"
    }}
]

NOT:

[
    {{
        "product_name": "Pumps"
    }}
]


========================
FINAL CHECK BEFORE RESPONSE
========================

Before returning JSON:

1. Count every product row in the document.
2. Make sure every product row has a JSON object.
3. Make sure category headings are NOT product names.
4. Make sure duplicate products are not accidentally created.
5. Do not omit products because some fields are missing.
6. Missing fields must still produce a product object.

Return ONLY valid JSON.

Use exactly this format:

[
    {{
        "sku": "",
        "product_name": "",
        "description": "",
        "unit": "",
        "selling_price": 0.0,
        "gst_percentage": 0.0,
        "category": "",
        "cost_price": 0.0
    }}
]

If a string field is unavailable:
""

If a numeric field is unavailable:
0

========================
DOCUMENT TEXT
========================

{text}
"""

    response = llm.invoke(prompt)

    result = response.content.strip()

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

    if not isinstance(products, list):
        raise ValueError(
            "AI response must be a list of products"
        )

    print("========== AI PRODUCT EXTRACTION ==========")
    print("Total products extracted:", len(products))

    for index, product in enumerate(products, start=1):
        print(
            f"{index}. "
            f"{product.get('product_name')} | "
            f"{product.get('category')} | "
            f"{product.get('sku')}"
        )

    print("===========================================")

    return products