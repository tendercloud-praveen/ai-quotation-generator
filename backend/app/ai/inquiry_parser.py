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

Extract every requested product and its quantity.

IMPORTANT RULES:

1. The number before a product is its quantity.
2. Always extract an item when the input contains a number followed by a product.
3. If no quantity is mentioned, always set quantity to 1.
4. Never return quantity as 0.
5. Correct obvious spelling mistakes.
6. Multiple numbers usually mean multiple products.
7. Do not explain anything.
8. Do not return markdown.
9. Return ONLY valid JSON.

Examples:

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

Output:
{{
    "items": [
        {{
            "product_name": "Dell laptop",
            "quantity": 1
        }},
        {{
            "product_name": "HP keyboard",
            "quantity": 1
        }}
    ]
}}

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

Input:
120 dell laptops ,34 hp laptks 34 mouse snad 3 keybords

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

Now process this input:

{text}

Return ONLY this JSON structure:

{{
    "items": [
        {{
            "product_name": "product name",
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
        result = result.replace("```json", "")
        result = result.replace("```JSON", "")
        result = result.replace("```", "")
        result = result.strip()

        data = json.loads(result)

        items = data.get("items", [])

        print("\n========== AI EXTRACTED ITEMS ==========")
        print(items)
        print("========================================\n")

        return items

    except Exception as e:

        print("\n========== AI ITEM EXTRACTION ERROR ==========")
        print(str(e))
        print("================================================\n")

        return []