from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.database.database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, nullable=False, unique=True)
    

    users = relationship("User", back_populates="company")
    products = relationship("Product", back_populates="company")
    customers = relationship(
        "Customer",
        back_populates="company"
    )