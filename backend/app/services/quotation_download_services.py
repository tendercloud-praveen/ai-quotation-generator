import os
from datetime import datetime

from sqlalchemy.orm import Session
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle
)

from app.models.quotations import Quotation, QuotationItem
from app.models.user import User


PDF_FOLDER = "generated_quotations"


# ============================================================
# HELPERS
# ============================================================

def safe_value(value):
    """
    Show --- when value is missing.
    """
    if value is None or str(value).strip() == "":
        return "---"

    return str(value)


def format_money(value):
    """
    Format amount like:
    ₹7,710
    """
    if value is None:
        return "---"

    try:
        value = float(value)
        return f"₹{value:,.0f}"
    except (TypeError, ValueError):
        return "---"


def format_date(value):
    """
    Format datetime as:
    14 Aug 2026
    """

    if not value:
        return "---"

    if isinstance(value, datetime):
        return value.strftime("%d %b %Y")

    return str(value)


def get_user_name(user):
    """
    Get user display name safely.
    """

    if not user:
        return "---"

    return (
        getattr(user, "name", None)
        or getattr(user, "full_name", None)
        or getattr(user, "username", None)
        or getattr(user, "email", None)
        or "---"
    )


def get_user_phone(user):
    """
    Get phone number safely.
    """

    if not user:
        return "---"

    return (
        getattr(user, "phone", None)
        or getattr(user, "phone_number", None)
        or getattr(user, "mobile", None)
        or getattr(user, "mobile_number", None)
        or "---"
    )


def get_company_name(quotation):
    """
    Try to get company name if the Quotation model
    has a company relationship.
    """

    company = getattr(
        quotation,
        "company",
        None
    )

    if company:

        return (
            getattr(company, "name", None)
            or getattr(company, "company_name", None)
            or getattr(company, "business_name", None)
            or "---"
        )

    return "---"


def get_company_email(quotation):
    """
    Try to get company email from company relationship.
    """

    company = getattr(
        quotation,
        "company",
        None
    )

    if company:
        return (
            getattr(company, "email", None)
            or getattr(company, "company_email", None)
            or "---"
        )

    return "---"


def get_company_phone(quotation):
    """
    Try to get company phone from company relationship.
    """

    company = getattr(
        quotation,
        "company",
        None
    )

    if company:
        return (
            getattr(company, "phone", None)
            or getattr(company, "phone_number", None)
            or getattr(company, "mobile", None)
            or getattr(company, "mobile_number", None)
            or "---"
        )

    return "---"


# ============================================================
# MAIN SERVICE
# ============================================================

def get_quotation_for_download(
    db: Session,
    quotation_id: int,
    company_id: int
):

    # ========================================================
    # 1. GET QUOTATION
    # ========================================================

    quotation = (
        db.query(Quotation)
        .filter(
            Quotation.id == quotation_id,
            Quotation.company_id == company_id
        )
        .first()
    )

    if not quotation:
        return None

    # ========================================================
    # 2. CREATE PDF FOLDER
    # ========================================================

    os.makedirs(
        PDF_FOLDER,
        exist_ok=True
    )

    file_path = os.path.join(
        PDF_FOLDER,
        f"quotation_{quotation.id}.pdf"
    )

    # ========================================================
    # 3. GET SALESPERSON / CREATED BY
    # ========================================================

    salesperson = (
        db.query(User)
        .filter(
            User.id == quotation.user_id
        )
        .first()
    )

    salesperson_name = get_user_name(
        salesperson
    )

    salesperson_email = (
        getattr(
            salesperson,
            "email",
            None
        )
        or "---"
    )

    salesperson_phone = get_user_phone(
        salesperson
    )

    # ========================================================
    # 4. GET MANAGER
    # ========================================================

    manager = None

    if quotation.manager_id:

        manager = (
            db.query(User)
            .filter(
                User.id == quotation.manager_id
            )
            .first()
        )

    manager_name = get_user_name(
        manager
    )

    manager_email = (
        getattr(
            manager,
            "email",
            None
        )
        or "---"
    )

    manager_phone = get_user_phone(
        manager
    )

    # ========================================================
    # 5. COMPANY DETAILS
    # ========================================================

    company_name = get_company_name(
        quotation
    )

    company_email = get_company_email(
        quotation
    )

    company_phone = get_company_phone(
        quotation
    )

    # ========================================================
    # 6. GET QUOTATION ITEMS
    # ========================================================

    items = (
        db.query(QuotationItem)
        .filter(
            QuotationItem.quotation_id == quotation.id
        )
        .all()
    )

    # ========================================================
    # 7. CREATE PDF
    # ========================================================

    document = SimpleDocTemplate(
        file_path,
        pagesize=A4,
        rightMargin=15 * mm,
        leftMargin=15 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "QuotationTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=20,
        alignment=TA_CENTER,
        spaceAfter=8
    )

    company_title_style = ParagraphStyle(
        "CompanyTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=11,
        alignment=TA_CENTER
    )

    normal_style = ParagraphStyle(
        "NormalQuotation",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12
    )

    bold_style = ParagraphStyle(
        "BoldQuotation",
        parent=normal_style,
        fontName="Helvetica-Bold"
    )

    right_style = ParagraphStyle(
        "RightQuotation",
        parent=normal_style,
        alignment=TA_RIGHT
    )

    story = []

    # ========================================================
    # HEADER
    # ========================================================

    story.append(
        Paragraph(
            "QuotaAI AI Quotation Generator",
            company_title_style
        )
    )

    story.append(
        Spacer(1, 5)
    )

    story.append(
        Paragraph(
            "QUOTATION",
            title_style
        )
    )

    story.append(
        Spacer(1, 5)
    )

    # ========================================================
    # QUOTATION NUMBER + DATE
    # ========================================================

    quotation_number = safe_value(
        quotation.quotation_number
    )

    quotation_date = format_date(
        getattr(
            quotation,
            "created_at",
            None
        )
    )

    quotation_header = Table(
        [
            [
                Paragraph(
                    f"<b>Quotation No:</b> {quotation_number}",
                    normal_style
                ),
                Paragraph(
                    f"<b>Date:</b> {quotation_date}",
                    right_style
                )
            ]
        ],
        colWidths=[
            90 * mm,
            80 * mm
        ]
    )

    quotation_header.setStyle(
        TableStyle([
            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "TOP"
            ),
            (
                "LEFTPADDING",
                (0, 0),
                (-1, -1),
                0
            ),
            (
                "RIGHTPADDING",
                (0, 0),
                (-1, -1),
                0
            ),
        ])
    )

    story.append(
        quotation_header
    )

    story.append(
        Spacer(1, 12)
    )

    # ========================================================
    # FROM / TO
    # ========================================================

    # FROM = SALESPERSON
    from_data = [
        [
            Paragraph(
                "<b>From:</b>",
                bold_style
            )
        ],
        [
            Paragraph(
                safe_value(salesperson_name),
                normal_style
            )
        ],
        [
            Paragraph(
                safe_value(salesperson_email),
                normal_style
            )
        ],
        [
            Paragraph(
                safe_value(salesperson_phone),
                normal_style
            )
        ]
    ]

    customer = quotation.customer

    # TO = COMPANY + CUSTOMER
    to_data = [
    [
        Paragraph(
            "<b>To:</b>",
            bold_style
        )
    ],
    
    [
        Paragraph(
            safe_value(
                getattr(customer, "contact_person", None)
            ),
            normal_style
        )
    ],
    [
        Paragraph(
            safe_value(
                getattr(customer, "email", None)
            ),
            normal_style
        )
    ],
    [
        Paragraph(
            safe_value(
                getattr(customer, "mobile", None)
            ),
            normal_style
        )
    ]
]
         
    from_table = Table(
        from_data,
        colWidths=85 * mm
    )

    to_table = Table(
        to_data,
        colWidths=85 * mm
    )

    from_table.setStyle(
        TableStyle([
            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "TOP"
            ),
            (
                "LEFTPADDING",
                (0, 0),
                (-1, -1),
                0
            ),
            (
                "RIGHTPADDING",
                (0, 0),
                (-1, -1),
                0
            ),
        ])
    )

    to_table.setStyle(
        TableStyle([
            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "TOP"
            ),
            (
                "LEFTPADDING",
                (0, 0),
                (-1, -1),
                0
            ),
            (
                "RIGHTPADDING",
                (0, 0),
                (-1, -1),
                0
            ),
        ])
    )

    from_to_table = Table(
        [
            [
                from_table,
                to_table
            ]
        ],
        colWidths=[
            85 * mm,
            85 * mm
        ]
    )

    from_to_table.setStyle(
        TableStyle([
            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "TOP"
            ),
            (
                "LEFTPADDING",
                (0, 0),
                (-1, -1),
                0
            ),
            (
                "RIGHTPADDING",
                (0, 0),
                (-1, -1),
                0
            ),
        ])
    )

    story.append(
        from_to_table
    )

    story.append(
        Spacer(1, 15)
    )

    # ========================================================
    # PRODUCT TABLE
    # ========================================================

    product_data = [
        [
            Paragraph("<b>Product</b>", normal_style),
            Paragraph("<b>Qty</b>", normal_style),
            Paragraph("<b>Unit Price</b>", normal_style),
            Paragraph("<b>Total</b>", normal_style)
        ]
    ]

    for item in items:

        product_name = safe_value(
            item.product_name
        )

        quantity = safe_value(
            item.quantity
        )

        unit_price = format_money(
            item.unit_price
        )

        total_price = format_money(
            item.total_price
        )

        # Try product code if your QuotationItem
        # has product_code.
        product_code = getattr(
            item,
            "product_code",
            None
        )

        if product_code:

            product_display = (
                f"{product_name}<br/>"
                f"<font size='8'>{product_code}</font>"
            )

        else:

            product_display = product_name

        product_data.append(
            [
                Paragraph(
                    product_display,
                    normal_style
                ),

                Paragraph(
                    quantity,
                    normal_style
                ),

                Paragraph(
                    unit_price,
                    normal_style
                ),

                Paragraph(
                    total_price,
                    normal_style
                )
            ]
        )

    # If no products
    if not items:

        product_data.append(
            [
                Paragraph(
                    "---",
                    normal_style
                ),
                Paragraph(
                    "---",
                    normal_style
                ),
                Paragraph(
                    "---",
                    normal_style
                ),
                Paragraph(
                    "---",
                    normal_style
                )
            ]
        )

    product_table = Table(
        product_data,
        colWidths=[
            85 * mm,
            20 * mm,
            32 * mm,
            33 * mm
        ],
        repeatRows=1
    )

    product_table.setStyle(
        TableStyle([
            (
                "GRID",
                (0, 0),
                (-1, -1),
                0.5,
                colors.grey
            ),
            (
                "BACKGROUND",
                (0, 0),
                (-1, 0),
                colors.lightgrey
            ),
            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "MIDDLE"
            ),
            (
                "ALIGN",
                (1, 1),
                (-1, -1),
                "RIGHT"
            ),
            (
                "PADDING",
                (0, 0),
                (-1, -1),
                6
            )
        ])
    )

    story.append(
        product_table
    )

    story.append(
        Spacer(1, 12)
    )

    # ========================================================
    # SUMMARY
    # ========================================================

    subtotal = float(
        quotation.subtotal or 0
    )

    total_gst = float(
        quotation.total_gst or 0
    )

    grand_total = float(
        quotation.grand_total or 0
    )

    # Get GST percentage from first item
    # or show ---
    gst_percentage = None

    if items:

        gst_percentage = getattr(
            items[0],
            "gst_percentage",
            None
        )

    if gst_percentage is not None:

        gst_label = (
            f"GST ({float(gst_percentage):g}%)"
        )

    else:

        gst_label = "GST"

    summary_data = [
        [
            "",
            Paragraph(
                "<b>Subtotal</b>",
                normal_style
            ),
            Paragraph(
                format_money(subtotal),
                right_style
            )
        ],
        [
            "",
            Paragraph(
                f"<b>{gst_label}</b>",
                normal_style
            ),
            Paragraph(
                format_money(total_gst),
                right_style
            )
        ],
        [
            "",
            Paragraph(
                "<b>Grand Total</b>",
                normal_style
            ),
            Paragraph(
                f"<b>{format_money(grand_total)}</b>",
                right_style
            )
        ]
    ]

    summary_table = Table(
        summary_data,
        colWidths=[
            85 * mm,
            45 * mm,
            40 * mm
        ]
    )

    summary_table.setStyle(
        TableStyle([
            (
                "ALIGN",
                (1, 0),
                (-1, -1),
                "RIGHT"
            ),
            (
                "LEFTPADDING",
                (0, 0),
                (-1, -1),
                5
            ),
            (
                "RIGHTPADDING",
                (0, 0),
                (-1, -1),
                5
            ),
            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                4
            ),
            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                4
            )
        ])
    )

    story.append(
        summary_table
    )

    # ========================================================
    # BUILD PDF
    # ========================================================

    document.build(
        story
    )

    return file_path