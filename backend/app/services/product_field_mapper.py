import re




FIELD_ALIASES = {



    "sku": [
        "sku",
        "sku number",
        "item code",
        "product code",
        "product id",
        "item id",
        "material code",
        "code"
    ],




    "category": [
        "category",
        "product category",
        "item category",
        "material category",
        "type"
    ],


    # -----------------------------------------------------
    # PRODUCT NAME
    # -----------------------------------------------------

    "product_name": [
        "product",
        "product name",
        "item",
        "item name",
        "material",
        "material name",
        "item description",
        "product title"
    ],


    # -----------------------------------------------------
    # DESCRIPTION
    # -----------------------------------------------------

    "description": [
        "description",
        "details",
        "product details",
        "product description",
        "specification",
        "specifications",
        "material description"
    ],


    # -----------------------------------------------------
    # UNIT
    # -----------------------------------------------------

    "unit": [
        "unit",
        "uom",
        "unit of measure",
        "measurement unit",
        "qty unit"
    ],


    # -----------------------------------------------------
    # COST PRICE
    # -----------------------------------------------------

    "cost_price": [
        "cost price",
        "purchase price",
        "buying price",
        "purchase rate",
        "cost",
        "buying rate"
    ],


    # -----------------------------------------------------
    # GST PERCENTAGE
    # -----------------------------------------------------

    "gst_percentage": [
        "gst",
        "gst %",
        "gst percentage",
        "tax",
        "tax %",
        "tax percent",
        "tax percentage"
    ],


    # -----------------------------------------------------
    # SELLING PRICE
    # -----------------------------------------------------

    "selling_price": [
        "selling price",
        "selling rate",
        "price",
        "rate",
        "unit price",
        "sale price",
        "mrp",
        "amount"
    ]
}


# =========================================================
# NORMALIZE FIELD NAME
# Example:
#
# "GST %"           → "gst"
# "Product_Name"    → "product name"
# "Selling-Price"   → "selling price"
# =========================================================

def normalize_field_name(name: str) -> str:

    name = str(name).lower().strip()

    # Remove special characters
    name = re.sub(r"[%()]", "", name)

    # Replace _ and - with spaces
    name = re.sub(r"[_\-]+", " ", name)

    # Remove extra spaces
    name = re.sub(r"\s+", " ", name)

    return name.strip()


# =========================================================
# MAP UPLOADED COLUMNS TO STANDARD PRODUCT FIELDS
# =========================================================

def map_fields(columns):

    mapping = {}

    unmatched = []

    for column in columns:

        normalized_column = normalize_field_name(
            column
        )

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


        # If no matching alias is found
        if not matched:

            unmatched.append(column)


    return mapping, unmatched