from pydantic import BaseModel
from typing import List


class QuotationItemCreate(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    unit: str
    unit_price: float
    gst_percentage: float
    subtotal: float
    gst_amount: float
    total_price: float


class QuotationSummary(BaseModel):
    subtotal: float
    total_gst: float
    grand_total: float


class QuotationCreate(BaseModel):
    user_id: int
    customer_id: int
    company_id: int
    ai_confidence: float = 0
    inquiry_text: str
    summary: QuotationSummary
    items: List[QuotationItemCreate]

class SubmitQuotation(BaseModel):
    manager_id: int