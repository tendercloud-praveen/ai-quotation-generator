from sqlalchemy import Column, Integer, String, DateTime
from app.database.database import Base


class OTP(Base):
    __tablename__ = "otp"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False, unique=True)
    otp = Column(String, nullable=False)
    expiry = Column(DateTime, nullable=False)