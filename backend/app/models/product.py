from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)

    sku = Column(String, unique=True, nullable=False)
    category = Column(String, nullable=False)
    product_name = Column(String, nullable=False)
    unit = Column(String, nullable=False)

    cost_price = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)

    description = Column(String, nullable=True)

    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)

    company = relationship("Company", back_populates="products")

    