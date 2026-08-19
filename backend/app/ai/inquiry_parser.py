import re


def extract_items(text: str):

    if not text:
        return []

    text = text.lower().strip()

    # ---------------------------------------------------------
    # Remove starting phrases
    # ---------------------------------------------------------

    text = re.sub(
        r"customer\s+product\s+inquiry",
        "",
        text
    )

    text = re.sub(
        r"please\s+provide\s+the\s+following\s+products?\s*:?",
        "",
        text
    )

    text = re.sub(
        r"^(i\s+)?(need|want|require|i would like)\s+",
        "",
        text
    )

    # ---------------------------------------------------------
    # NEW:
    # Handle PDF/table format
    #
    # Example:
    #
    # Product Quantity Unit Requirement
    # HP ProBook 450 G10 Laptop 200 Nos Business laptops...
    #
    # Dell Latitude 5440 Laptop 100 Nos Business laptops...
    #
    # IMPORTANT:
    # We extract the product + quantity + Nos first,
    # BEFORE adding commas before numbers.
    # ---------------------------------------------------------

    table_items = []

    # Remove table headers
    text = re.sub(
        r"\bproduct\s+quantity\s+unit\s+requirement\b",
        "",
        text,
        flags=re.IGNORECASE
    )

    # ---------------------------------------------------------
    # Known product starting words for the PDF/table format
    #
    # This prevents the Requirement text from being included
    # in the next product.
    # ---------------------------------------------------------

    product_starts = (
        r"(?:hp\s+probook|"
        r"dell\s+latitude|"
        r"lenovo\s+thinkpad|"
        r"dell\s+kb216|"
        r"logitech\s+k120|"
        r"logitech\s+m90|"
        r"dell\s+ms116|"
        r"dell\s+p2422h|"
        r"hp\s+laserjet)"
    )

    table_pattern = re.compile(
        rf"({product_starts}.*?\s+\d+\s+(?:nos|no|units?|pcs?))",
        re.IGNORECASE
    )

    table_matches = table_pattern.findall(text)

    if table_matches:

        for match in table_matches:

            match = match.strip()

            # Find quantity immediately before Nos
            quantity_match = re.search(
                r"\s+(\d+)\s+(nos|no|units?|pcs?)\s*$",
                match,
                re.IGNORECASE
            )

            if not quantity_match:
                continue

            quantity = int(quantity_match.group(1))

            product_name = match[:quantity_match.start()].strip()

            # Remove "and" from beginning/end
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

                table_items.append({
                    "product_name": product_name,
                    "quantity": quantity
                })

        # If PDF/table products were successfully found,
        # return them directly.
        #
        # This prevents the old number-splitting logic from
        # changing 450, 5440, KB216, etc.
        if table_items:
            return table_items

    # ---------------------------------------------------------
    # EXISTING LOGIC
    # ---------------------------------------------------------
    # Convert "and" before a quantity into a separator
    # ---------------------------------------------------------

    text = re.sub(
        r"\s+and\s+(?=\d+\s+)",
        ", ",
        text
    )

    # ---------------------------------------------------------
    # Remove unnecessary commas
    # ---------------------------------------------------------

    text = re.sub(
        r",+",
        ",",
        text
    )

    # ---------------------------------------------------------
    # EXISTING LOGIC
    #
    # Add comma before every new quantity.
    #
    # Example:
    #
    # 10 hp laptops 12 mouses 3 keyboards
    #
    # becomes:
    #
    # 10 hp laptops, 12 mouses, 3 keyboards
    # ---------------------------------------------------------

    text = re.sub(
        r"\s+(?=\d+\s+)",
        ", ",
        text
    )

    # ---------------------------------------------------------
    # Split into individual products
    # ---------------------------------------------------------

    parts = text.split(",")

    items = []

    for part in parts:

        part = part.strip()

        if not part:
            continue

        # -----------------------------------------------------
        # EXISTING + NEW LOGIC:
        #
        # Product Name + Quantity + Unit
        #
        # Example:
        #
        # hp laptop 200 nos
        # -----------------------------------------------------

        match_product_first = re.match(
            r"^(.+?)\s+(\d+)\s+(nos|no|units?|pcs?)\s*$",
            part,
            re.IGNORECASE
        )

        if match_product_first:

            product_name = match_product_first.group(1).strip()

            quantity = int(match_product_first.group(2))

            # Remove "and" from beginning/end
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

            continue

        # -----------------------------------------------------
        # YOUR ORIGINAL LOGIC
        #
        # Quantity + Product Name
        #
        # Example:
        #
        # 10 hp laptops
        # -----------------------------------------------------

        match = re.match(
            r"^(\d+)\s+(.+?)\s*$",
            part
        )

        if not match:
            continue

        quantity = int(match.group(1))

        product_name = match.group(2).strip()

        # -----------------------------------------------------
        # Remove "and" from beginning/end
        # -----------------------------------------------------

        product_name = re.sub(
            r"^and\s+",
            "",
            product_name
        )

        product_name = re.sub(
            r"\s+and$",
            "",
            product_name
        )

        if product_name:

            items.append({
                "product_name": product_name,
                "quantity": quantity
            })

    return items