from pydantic import BaseModel


class ProductCreate(BaseModel):
    sku: str
    category: str
    product_name: str
    unit: str
    cost_price: float
    gst_percentage: float
    selling_price: float
    description: str


class ProductResponse(ProductCreate):
    id: int

    class Config:
        from_attributes = True