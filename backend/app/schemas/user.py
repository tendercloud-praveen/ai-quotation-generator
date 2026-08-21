
from pydantic import BaseModel
from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    company_name: str
    full_name: str
    email: str
    mobile_number: str
    password: str

class CreateUser(BaseModel):
    # company_name: str
    full_name: str
    email: EmailStr
    mobile_number: str
    password: str
    role: str


class UpdateUser(BaseModel):
    full_name: str
    email: EmailStr
    mobile_number: str
    role: str
    is_active: bool