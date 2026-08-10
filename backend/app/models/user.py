from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey,
    UniqueConstraint
)
from sqlalchemy.orm import relationship

from app.database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    full_name = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        nullable=False
    )

    # Mobile remains globally unique
    mobile_number = Column(
        String(10),
        unique=True,
        nullable=False
    )

    password = Column(
        String,
        nullable=False
    )

    role = Column(
        String,
        nullable=False
    )

    is_active = Column(
        Boolean,
        default=True
    )

    company_id = Column(
        Integer,
        ForeignKey("companies.id"),
        nullable=False
    )

    company = relationship(
        "Company",
        back_populates="users"
    )

    # Email must be unique only inside the same company
    __table_args__ = (
        UniqueConstraint(
            "email",
            "company_id",
            name="uq_user_email_company"
        ),
    )