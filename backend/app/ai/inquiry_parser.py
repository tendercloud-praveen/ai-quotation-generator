import os
import json

from dotenv import load_dotenv
from langchain_groq import ChatGroq


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()


# =========================================================
# GROQ LLM
# =========================================================

llm = ChatGroq(
    model="openai/gpt-oss-20b",
    temperature=0,
    api_key=os.getenv("GROQ_API_KEY")
)


# =========================================================
# EXTRACT PRODUCTS FROM CUSTOMER TEXT USING AI
# =========================================================

async def extract_items_with_ai(text: str):

    if not text or not text.strip():
        return []

    prompt = f"""
You are a product and quantity extraction system.

Your job is to extract EVERY product requested by the customer.

IMPORTANT RULES:

1. Extract the ACTUAL product names from the user's input.
2. NEVER return placeholder values such as:
   - "product name"
   - "item"
   - "product"
   - "unknown"
3. If a number appears before a product, that number is the quantity.
4. If no quantity is provided, use quantity = 1.
5. Extract multiple products separately.
6. Keep brand names and useful product details.
7. Correct only obvious spelling mistakes.
8. Do not invent products that are not present in the input.
9. Do not explain anything.
10. Return ONLY valid JSON.
11. The output must contain the actual product names from the input.


EXAMPLE 1:

Input:
12 dell laptops

Output:
{{
    "items": [
        {{
            "product_name": "Dell laptops",
            "quantity": 12
        }}
    ]
}}


EXAMPLE 2:

Input:
12 laptops 23 mkuses nad 34 keybords

Output:
{{
    "items": [
        {{
            "product_name": "laptops",
            "quantity": 12
        }},
        {{
            "product_name": "mice",
            "quantity": 23
        }},
        {{
            "product_name": "keyboards",
            "quantity": 34
        }}
    ]
}}


EXAMPLE 3:

Input:
120 dell laptops, 34 hp laptks, 34 mouse, 3 keybords

Output:
{{
    "items": [
        {{
            "product_name": "Dell laptops",
            "quantity": 120
        }},
        {{
            "product_name": "HP laptops",
            "quantity": 34
        }},
        {{
            "product_name": "mouse",
            "quantity": 34
        }},
        {{
            "product_name": "keyboards",
            "quantity": 3
        }}
    ]
}}


EXAMPLE 4:

Input:
10 hp laptops and 20 dell keyboards and 5 logitech mouse

Output:
{{
    "items": [
        {{
            "product_name": "HP laptops",
            "quantity": 10
        }},
        {{
            "product_name": "Dell keyboards",
            "quantity": 20
        }},
        {{
            "product_name": "Logitech mouse",
            "quantity": 5
        }}
    ]
}}


IMPORTANT EXAMPLE 5:

Input:
Full size wired USB keyboard,Dell USB Keyboard

Output:
{{
    "items": [
        {{
            "product_name": "Full size wired USB keyboard",
            "quantity": 1
        }},
        {{
            "product_name": "Dell USB Keyboard",
            "quantity": 1
        }}
    ]
}}


IMPORTANT:

If the customer gives products without quantities:

Input:
Dell laptop, HP laptop, Logitech mouse

Output:
{{
    "items": [
        {{
            "product_name": "Dell laptop",
            "quantity": 1
        }},
        {{
            "product_name": "HP laptop",
            "quantity": 1
        }},
        {{
            "product_name": "Logitech mouse",
            "quantity": 1
        }}
    ]
}}


Now process the following customer input:

{text}

Remember:

- Return the ACTUAL products from the input.
- Do not return "product name".
- Do not return quantity 0 unless the user explicitly says quantity is 0.
- If quantity is missing, use 1.
- Extract every product.
- Return ONLY valid JSON.

Correct output format:

{{
    "items": [
        {{
            "product_name": "ACTUAL PRODUCT NAME",
            "quantity": 1
        }}
    ]
}}
"""

    try:

        response = await llm.ainvoke(prompt)

        result = response.content.strip()

        print("\n========== GROQ RAW RESPONSE ==========")
        print(result)
        print("=======================================\n")

        # Remove markdown code blocks
        if result.startswith("```json"):
            result = result[7:]

        elif result.startswith("```JSON"):
            result = result[7:]

        elif result.startswith("```"):
            result = result[3:]

        if result.endswith("```"):
            result = result[:-3]

        result = result.strip()

        data = json.loads(result)

        items = data.get("items", [])

        # =================================================
        # VALIDATE AI RESULT
        # =================================================

        valid_items = []

        for item in items:

            product_name = str(
                item.get("product_name", "")
            ).strip()

            quantity = item.get(
                "quantity",
                1
            )

            # Ignore empty/placeholder product names
            if not product_name:
                continue

            if product_name.lower() in [
                "product name",
                "product",
                "item",
                "unknown"
            ]:
                continue

            # If AI returns 0 accidentally, use 1
            try:
                quantity = int(quantity)
            except (ValueError, TypeError):
                quantity = 1

            if quantity <= 0:
                quantity = 1

            valid_items.append({
                "product_name": product_name,
                "quantity": quantity
            })

        print("\n========== AI EXTRACTED ITEMS ==========")
        print(valid_items)
        print("========================================\n")

        return valid_items

    except Exception as e:

        print(
            "\n========== AI ITEM EXTRACTION ERROR =========="
        )

        print(str(e))

        print(
            "================================================\n"
        )

        return []