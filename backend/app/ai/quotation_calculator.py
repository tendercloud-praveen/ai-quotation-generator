def calculate_product_total(product, quantity):

    unit_price = float(product.selling_price)

    total_price = unit_price * quantity

    return {
        "product_id": product.id,
        "product_name": product.product_name,
        "quantity": quantity,
        "unit": product.unit,
        "unit_price": unit_price,
        "total_price": total_price
    }


def calculate_product_total(product, quantity):

    unit_price = float(product.selling_price)
    gst_percentage = float(product.gst_percentage or 0)

    # Price before GST
    subtotal = unit_price * quantity

    # GST amount
    gst_amount = subtotal * (gst_percentage / 100)

    # Final price including GST
    total_price = subtotal + gst_amount

    return {
        "product_id": product.id,
        "product_name": product.product_name,
        "quantity": quantity,
        "unit": product.unit,

        "unit_price": unit_price,

        "gst_percentage": gst_percentage,
        "subtotal": round(subtotal, 2),
        "gst_amount": round(gst_amount, 2),

        "total_price": round(total_price, 2)
    }


def calculate_quotation(products, quantity):

    quotation_items = []

    for product in products:

        item = calculate_product_total(
            product,
            quantity
        )

        quotation_items.append(item)

    subtotal = sum(
        item["subtotal"]
        for item in quotation_items
    )

    total_gst = sum(
        item["gst_amount"]
        for item in quotation_items
    )

    grand_total = subtotal + total_gst

    return {
        "quotation_items": quotation_items,
        "subtotal": round(subtotal, 2),
        "total_gst": round(total_gst, 2),
        "grand_total": round(grand_total, 2)
    }