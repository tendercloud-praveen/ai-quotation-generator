from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)

    # Customer belongs to the logged-in admin's company
    company_id = Column(
        Integer,
        ForeignKey("companies.id"),
        nullable=False,
        index=True
    )

    company_name = Column(String(255), nullable=False)
    contact_person = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    mobile = Column(String(20), nullable=False)
    address = Column(Text, nullable=True)

    # Relationship with Company
    company = relationship("Company", back_populates="customers")
    quotations = relationship(
        "Quotation",
        back_populates="customer"
    )