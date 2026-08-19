import re


def extract_items(text: str):

    if not text:
        return []

    text = text.lower().strip()

    # Remove starting phrases
    text = re.sub(
        r"^(i\s+)?(need|want|require|i would like)\s+",
        "",
        text
    )

    # Convert " and " before a quantity into a separator
    # Example:
    # "2 hp laptops and 23 mouses"
    # -> "2 hp laptops, 23 mouses"
    text = re.sub(
        r"\s+and\s+(?=\d+\s+)",
        ", ",
        text
    )

    # Remove unnecessary commas
    text = re.sub(r",+", ",", text)

    # Split into individual products
    parts = text.split(",")

    items = []

    for part in parts:

        part = part.strip()

        if not part:
            continue

        # Find quantity + product name
        match = re.match(
            r"^(\d+)\s+(.+?)\s*$",
            part
        )

        if not match:
            continue

        quantity = int(match.group(1))
        product_name = match.group(2).strip()

        # Remove "and" from beginning/end
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