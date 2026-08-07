from fastapi import FastAPI
from app.models.company import Company
from app.models.user import User
from app.database.database import Base, engine
from app.api.user import router as user_router
from app.api.login import router as login_router
from app.models.login_history import LoginHistory
from app.api.product import router as product_router
<<<<<<< Updated upstream
from app.api.forgot_password import router as forgot_password_router
from app.models.otp import OTP 
=======
from app.api.inquiry import router as inquiry_router
from app.middleware.cors import add_cors
>>>>>>> Stashed changes

app = FastAPI()
add_cors(app)

@app.get("/")
def read_root():
    return {"Hello": "World"}
app.include_router(user_router)
app.include_router(login_router)
app.include_router(product_router)
<<<<<<< Updated upstream
app.include_router(forgot_password_router)
=======
app.include_router(inquiry_router)
>>>>>>> Stashed changes
Base.metadata.create_all(bind=engine)