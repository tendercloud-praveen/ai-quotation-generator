from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    mobile_number = Column(String(10), unique=True, nullable=False)
    password = Column(String, nullable=False)

    role = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    company_id = Column(Integer, ForeignKey("companies.id"))

    company = relationship("Company", back_populates="users")