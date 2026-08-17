from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional


class CustomerCreate(BaseModel):
    company_name: str
    contact_person: str
    email: EmailStr
    mobile: str
    address: Optional[str] = None


class CustomerUpdate(BaseModel):
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    address: Optional[str] = None


class CustomerResponse(BaseModel):
    id: int
    company_id: int
    company_name: str
    contact_person: str
    email: EmailStr
    mobile: str
    address: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)