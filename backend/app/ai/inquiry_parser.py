import re


def extract_items(text: str):

    if not text:
        return []

    text = text.lower().strip()

    # =========================================================
    # 1. REMOVE COMMON STARTING PHRASES
    # =========================================================

    text = re.sub(
        r"customer\s+product\s+inquiry",
        "",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r"please\s+provide\s+the\s+following\s+products?\s*:?",
        "",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r"^(i\s+)?(need|want|require|i would like)\s+",
        "",
        text,
        flags=re.IGNORECASE
    )

    text = text.strip()

    # =========================================================
    # 2. HANDLE TABLE FORMAT
    #
    # Product Quantity Unit Requirement
    # HP 235 Mouse 200 Nos
    # Dell Keyboard 100 Nos
    #
    # This part looks for quantity followed by a unit.
    # =========================================================

    text = re.sub(
        r"\bproduct\s+quantity\s+unit\s+requirement\b",
        "",
        text,
        flags=re.IGNORECASE
    )

    # =========================================================
    # 3. PRODUCT + QUANTITY + UNIT
    #
    # Example:
    #
    # HP 235 Mouse 200 Nos
    #
    # Product = HP 235 Mouse
    # Quantity = 200
    # =========================================================

    unit_pattern = r"(nos|no|units?|pcs?|pieces?|qty)"

    table_pattern = re.compile(
        rf"(.+?)\s+(\d+)\s+{unit_pattern}(?=\s|,|$)",
        re.IGNORECASE
    )

    table_matches = table_pattern.findall(text)

    if table_matches:

        items = []

        for match in table_matches:

            product_name = match[0].strip()

            quantity = int(match[1])

            product_name = re.sub(
                r"^and\s+",
                "",
                product_name,
                flags=re.IGNORECASE
            )

            product_name = re.sub(
                r"\s+and$",
                "",
                product_name,
                flags=re.IGNORECASE
            )

            if product_name:

                items.append({
                    "product_name": product_name,
                    "quantity": quantity
                })

        if items:
            return items

    # =========================================================
    # 4. QUANTITY FIRST
    #
    # VERY IMPORTANT
    #
    # 2 HP 235 Slim Wireless Mouse
    #
    # First number = quantity
    #
    # 235 = part of product name
    #
    # So:
    #
    # quantity = 2
    # product = HP 235 Slim Wireless Mouse
    # =========================================================

    first_quantity = re.match(
        r"^(\d+)\s+(.+)$",
        text
    )

    if first_quantity:

        quantity = int(
            first_quantity.group(1)
        )

        product_name = first_quantity.group(2).strip()

        if product_name:

            return [{
                "product_name": product_name,
                "quantity": quantity
            }]

    # =========================================================
    # 5. MULTIPLE PRODUCTS WITH COMMA
    #
    # Example:
    #
    # 2 HP 235 Mouse,
    # 5 Dell KB216 Keyboard,
    # 3 Logitech M90 Mouse
    # =========================================================

    text = re.sub(
        r"\s*,\s*",
        ",",
        text
    )

    parts = text.split(",")

    items = []

    for part in parts:

        part = part.strip()

        if not part:
            continue

        # -----------------------------------------------------
        # Quantity first
        # -----------------------------------------------------

        match = re.match(
            r"^(\d+)\s+(.+)$",
            part
        )

        if match:

            quantity = int(
                match.group(1)
            )

            product_name = match.group(2).strip()

            if product_name:

                items.append({
                    "product_name": product_name,
                    "quantity": quantity
                })

            continue

        # -----------------------------------------------------
        # Product first + quantity + unit
        # -----------------------------------------------------

        match = re.match(
            rf"^(.+?)\s+(\d+)\s+{unit_pattern}$",
            part,
            re.IGNORECASE
        )

        if match:

            product_name = match.group(1).strip()

            quantity = int(
                match.group(2)
            )

            if product_name:

                items.append({
                    "product_name": product_name,
                    "quantity": quantity
                })

    return items