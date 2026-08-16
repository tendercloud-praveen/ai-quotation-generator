from pydantic import BaseModel, EmailStr


class CompanyCreate(BaseModel):
    company_name: str
    contact_person: str
    email: EmailStr
    mobile: str
    address: str | None = None


class CompanyUpdate(BaseModel):
    company_name: str
    contact_person: str
    email: EmailStr
    mobile: str
    address: str | None = None