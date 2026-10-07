import os
import json
import re

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
        api_key=api_key,
        max_tokens=1500
    )

    # ==========================================================
    # SPLIT DOCUMENT INTO PRODUCT SECTIONS
    # ==========================================================

    # Handles formats such as:
    #
    # Product ID
    # CON-001
    #
    # Product ID
    # IT-001
    #
    # Product ID
    # HC-001

    product_sections = re.split(
        r'(?=Product\s+ID\s*[:\-]?\s*[A-Za-z0-9_-]+)',
        text,
        flags=re.IGNORECASE
    )

    product_sections = [
        section.strip()
        for section in product_sections
        if section.strip()
        and re.search(
            r'Product\s+ID\s*[:\-]?\s*[A-Za-z0-9_-]+',
            section,
            flags=re.IGNORECASE
        )
    ]

    # ==========================================================
    # IF PRODUCT SECTIONS WERE NOT DETECTED
    # ==========================================================

    if not product_sections:

        # Fallback for documents where Product ID is not available.
        # Split text into manageable chunks.

        chunk_size = 10000

        product_sections = [
            text[i:i + chunk_size]
            for i in range(0, len(text), chunk_size)
        ]

    # ==========================================================
    # GROUP PRODUCTS
    # ==========================================================

    # Process maximum 4 products per AI request.

    chunks = []

    for section in product_sections:
        chunks.append(section)
    

    print("========== AI EXTRACTION ==========")
    print(
        "Product sections detected:",
        len(product_sections)
    )
    print(
        "AI requests:",
        len(chunks)
    )
    print("===================================")

    all_products = []

    # ==========================================================
    # PROCESS EACH GROUP
    # ==========================================================

    for chunk_index, chunk in enumerate(
        chunks,
        start=1
    ):

        print(
            f"Processing AI group "
            f"{chunk_index}/{len(chunks)}..."
        )

        prompt = f"""
You are a highly accurate real-world product extraction system.

Extract EVERY actual product from the document section below.

The document can belong to ANY industry.

Examples:

Construction
IT
Healthcare
Automotive
Electronics
Electrical
Manufacturing
Agriculture
Pharmaceuticals
Food & Beverage
Retail
Logistics
Machinery
Plumbing
Safety Equipment
Office Supplies
Medical Equipment
Telecommunications
Industrial Equipment
and any other industry.

==================================================
IMPORTANT PRODUCT RULE
==================================================

Extract every actual product.

Do NOT treat these as products:

- Category headings
- Industry headings
- Section headings
- Column headers
- Company names
- Supplier names
- Addresses
- Totals
- Subtotals
- Page headers
- Page footers
- Notes

==================================================
FIELD MAPPING
==================================================

SKU can appear as:

SKU
SKU Number
Item Code
Item ID
Product Code
Product ID
Material Code
Part Number
Part No
Reference Number
Stock Code
Article Number
Code

Map to:

"sku"

--------------------------------------------------

PRODUCT NAME can appear as:

Product Name
Item Name
Product
Item
Material
Material Name
Article
Part Name
Equipment Name
Model Name

Map to:

"product_name"

IMPORTANT:

Never use a category heading as product_name.

Example:

Pumps

AquaPrime Booster Pump 2HP
BULK-001

Correct:

"product_name": "AquaPrime Booster Pump 2HP"
"category": "Pumps"

--------------------------------------------------

DESCRIPTION can appear as:

Description
Product Description
Item Description
Details
Product Details
Item Details
Overview
Remarks
Notes

Map to:

"description"

--------------------------------------------------

UNIT can appear as:

Unit
UOM
Unit of Measure
Measurement Unit
Pack
Package
Quantity Unit

Map to:

"unit"

Example:

Rs. 410 / bag

Return:

"selling_price": 410.0
"unit": "bag"

--------------------------------------------------

SELLING PRICE can appear as:

Selling Price
Sale Price
Sales Price
Selling Rate
Sale Rate
Sales Rate
Unit Price
Retail Price
Customer Price
List Price
Rate
Price
Amount

Map to:

"selling_price"

--------------------------------------------------

COST PRICE can appear as:

Cost Price
Cost
Cost Rate
Purchase Price
Purchase Cost
Purchase Rate
Buying Price
Buying Rate
Supplier Price
Vendor Price

Map to:

"cost_price"

--------------------------------------------------

GST / TAX can appear as:

GST
GST %
GST Percentage
GST Rate
Tax
Tax %
Tax Percentage
Tax Rate
VAT
VAT %

Map to:

"gst_percentage"

Return only the numeric value.

Example:

18% -> 18.0

--------------------------------------------------

CATEGORY / INDUSTRY can appear as:

Category
Product Category
Product Type
Type
Industry
Industry Type
Department
Segment
Product Group
Product Family
Classification

Map to:

"category"

If the document explicitly provides Industry or Category,
use that value.

If no category is present, determine a reasonable category
from the product name and description.

Do not use "General" if a reasonable category can be determined.

--------------------------------------------------

SUPPLIER can appear as:

Supplier
Supplier Name
Vendor
Vendor Name
Manufacturer
Manufacturer Name

Map to:

"supplier"

--------------------------------------------------

SPECIFICATIONS can appear as:

Specifications
Specification
Specs
Technical Specifications
Technical Details
Features
Product Features
Attributes
Characteristics

Map to:

"specifications"

Preserve useful industry-specific information.

Examples:

Laptop:
16 GB RAM; 512 GB SSD; Intel Core i7

Cement:
50 kg bag; OPC 53 Grade

Medical equipment:
ECG; SpO2; NIBP

Electrical:
230V; 5KW; 3 Phase

Automotive:
Compatible with Model X; Part No ABC123

Do not invent information.

==================================================
PRICE RULE
==================================================

Convert prices to numbers.

Examples:

Rs. 410 -> 410.0

₹410 -> 410.0

₹61,000 -> 61000.0

Rs. 62,000 / tonne -> 62000.0

Remove currency symbols and commas.

==================================================
MISSING FIELDS
==================================================

If a text field is missing:

""

If a numeric field is missing:

0.0

Do not skip the product.

Do not invent information.

==================================================
DUPLICATES
==================================================

Do not create duplicates.

Repeated page headers or repeated information
must not become duplicate products.

==================================================
OUTPUT
==================================================

Return ONLY valid JSON.

Do NOT return:

- Markdown
- ```json
- Explanation
- Comments
- Extra text

Return this structure:

[
    {{
        "sku": "",
        "product_name": "",
        "description": "",
        "unit": "",
        "selling_price": 0.0,
        "gst_percentage": 0.0,
        "category": "",
        "cost_price": 0.0,
        "supplier": "",
        "specifications": ""
    }}
]

==================================================
DOCUMENT SECTION
==================================================

{chunk}
"""

        try:

            response = llm.invoke(prompt)

            result = response.content.strip()

            # ------------------------------------------
            # Remove Markdown fences
            # ------------------------------------------

            if result.startswith("```json"):
                result = result[7:]

            elif result.startswith("```"):
                result = result[3:]

            if result.endswith("```"):
                result = result[:-3]

            result = result.strip()

            # ------------------------------------------
            # Find JSON array
            # ------------------------------------------

            start = result.find("[")
            end = result.rfind("]")

            if start == -1 or end == -1:

                print(
                    f"WARNING: AI group "
                    f"{chunk_index} did not return JSON"
                )

                print("RAW RESPONSE:")
                print(result)

                continue

            json_text = result[
                start:end + 1
            ]

            products = json.loads(
                json_text
            )

            if not isinstance(
                products,
                list
            ):
                print(
                    f"WARNING: AI group "
                    f"{chunk_index} returned invalid list"
                )

                continue

            # ------------------------------------------
            # Normalize products
            # ------------------------------------------

            for product in products:

                if not isinstance(
                    product,
                    dict
                ):
                    continue

                product_name = str(
                    product.get(
                        "product_name",
                        ""
                    )
                ).strip()

                if not product_name:
                    continue

                normalized_product = {
                    "sku": str(
                        product.get(
                            "sku",
                            ""
                        )
                    ).strip(),

                    "product_name": product_name,

                    "description": str(
                        product.get(
                            "description",
                            ""
                        )
                    ).strip(),

                    "unit": str(
                        product.get(
                            "unit",
                            ""
                        )
                    ).strip(),

                    "selling_price": product.get(
                        "selling_price",
                        0.0
                    ),

                    "gst_percentage": product.get(
                        "gst_percentage",
                        0.0
                    ),

                    "category": str(
                        product.get(
                            "category",
                            ""
                        )
                    ).strip(),

                    "cost_price": product.get(
                        "cost_price",
                        0.0
                    ),

                    "supplier": str(
                        product.get(
                            "supplier",
                            ""
                        )
                    ).strip(),

                    "specifications": str(
                        product.get(
                            "specifications",
                            ""
                        )
                    ).strip()
                }

                all_products.append(
                    normalized_product
                )

        except json.JSONDecodeError as e:

            print(
                f"JSON error in AI group "
                f"{chunk_index}: {e}"
            )

            print(
                "RAW AI RESPONSE:"
            )
            print(result)

        except Exception as e:

            print(
                f"Error in AI group "
                f"{chunk_index}: {e}"
            )

    # ==========================================================
    # REMOVE DUPLICATES
    # ==========================================================

    unique_products = []

    seen = set()

    for product in all_products:

        sku = product.get(
            "sku",
            ""
        ).strip()

        name = product.get(
            "product_name",
            ""
        ).strip()

        if sku:

            key = sku.lower()

        else:

            key = name.lower()

        if key in seen:
            continue

        seen.add(key)

        unique_products.append(
            product
        )

    # ==========================================================
    # FINAL OUTPUT
    # ==========================================================

    products = unique_products

    print(
        "========== AI PRODUCT EXTRACTION =========="
    )

    print(
        "Total products extracted:",
        len(products)
    )

    for index, product in enumerate(
        products,
        start=1
    ):

        print(
            f"{index}. "
            f"{product.get('product_name')} | "
            f"{product.get('category')} | "
            f"{product.get('sku')}"
        )

    print(
        "==========================================="
    )

    if not products:

        raise ValueError(
            "AI could not extract any products"
        )

    return products