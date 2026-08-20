import re


FIELD_ALIASES = {
    "sku": [
        "sku",
        "sku number",
        "item code",
        "product code",
        "code"
    ],

    "product_name": [
        "product",
        "product name",
        "item",
        "item name",
        "material",
        "material name"
    ],

    "description": [
        "description",
        "details",
        "product details",
        "specification"
    ],

    "unit": [
        "unit",
        "uom",
        "unit of measure"
    ],

    "price": [
        "price",
        "rate",
        "unit price",
        "selling price",
        "amount"
    ],

    "gst": [
        "gst",
        "gst %",
        "tax",
        "tax %",
        "tax percent"
    ]
}


def normalize_field_name(name: str) -> str:

    name = str(name).lower().strip()

    name = re.sub(r"[%()]", "", name)
    name = re.sub(r"[_\-]+", " ", name)
    name = re.sub(r"\s+", " ", name)

    return name.strip()


def map_fields(columns):

    mapping = {}
    unmatched = []

    for column in columns:

        normalized_column = normalize_field_name(column)

        matched = False

        for standard_field, aliases in FIELD_ALIASES.items():

            normalized_aliases = [
                normalize_field_name(alias)
                for alias in aliases
            ]

            if normalized_column in normalized_aliases:

                mapping[standard_field] = column
                matched = True
                break

        if not matched:
            unmatched.append(column)

    return mapping, unmatched