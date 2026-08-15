from fastapi import FastAPI
from app.models.company import Company
from app.models.user import User
from app.database.database import Base, engine
from app.api.user import router as user_router
from app.api.login import router as login_router
from app.models.login_history import LoginHistory
from app.api.product import router as product_router
from app.api.forgot_password import router as forgot_password_router
from app.models.otp import OTP 
from app.api.inquiry import router as inquiry_router
from app.middleware.cors import add_cors
from app.models.quotations import Quotation, QuotationItem
from app.api.quotation import router as quotation_router
from app.api.quotation_approval import router as quotation_approval_router
from app.api.product_get import router as product_get_router
from app.api.product_edit_delete import router as product_edit_delete_router
from app.api.managers import router as managers_router
from app.api.admin_dashboard import router as admin_dashboard_router
from app.api.manager_dashboard import router as manager_dashboard_router
from app.api.sales_dashboard import router as sales_dashboard_router

app = FastAPI()
add_cors(app)

@app.get("/")
def read_root():
    return {"Hello": "World"}
app.include_router(user_router)
app.include_router(login_router)
app.include_router(sales_dashboard_router)
app.include_router(product_router)
app.include_router(forgot_password_router)
app.include_router(inquiry_router)
app.include_router(quotation_router)
app.include_router(quotation_approval_router)
app.include_router(product_get_router)
app.include_router(product_edit_delete_router)
app.include_router(managers_router)
app.include_router(admin_dashboard_router)
app.include_router(manager_dashboard_router)
Base.metadata.create_all(bind=engine)