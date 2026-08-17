from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.database import Base


# ============================================================
# QUOTATION
# ============================================================

class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    quotation_number = Column(
        String,
        unique=True,
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    company_id = Column(
        Integer,
        ForeignKey("companies.id"),
        nullable=False
    )

    # Manager assigned to approve this quotation
    manager_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    inquiry_text = Column(
        Text,
        nullable=False
    )

    subtotal = Column(
        Float,
        nullable=False,
        default=0
    )

    total_gst = Column(
        Float,
        nullable=False,
        default=0
    )

    grand_total = Column(
        Float,
        nullable=False,
        default=0
    )

    status = Column(
        String,
        nullable=False,
        default="DRAFT"
    )

    submitted_at = Column(
        DateTime,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # Relationship
    items = relationship(
        "QuotationItem",
        back_populates="quotation",
        cascade="all, delete-orphan"
    )
    customer_id = Column(
    Integer,
    ForeignKey("customers.id"),
    nullable=True
)

    customer = relationship(
    "Customer",
    back_populates="quotations"
)



# ============================================================
# QUOTATION ITEMS
# ============================================================

class QuotationItem(Base):
    __tablename__ = "quotation_items"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    quotation_id = Column(
        Integer,
        ForeignKey("quotations.id"),
        nullable=False
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False
    )

    product_name = Column(
        String,
        nullable=False
    )

    quantity = Column(
        Integer,
        nullable=False
    )

    unit = Column(
        String,
        nullable=False
    )

    unit_price = Column(
        Float,
        nullable=False
    )

    gst_percentage = Column(
        Float,
        nullable=False
    )

    subtotal = Column(
        Float,
        nullable=False
    )

    gst_amount = Column(
        Float,
        nullable=False
    )

    total_price = Column(
        Float,
        nullable=False
    )

    quotation = relationship(
        "Quotation",
        back_populates="items"
    )