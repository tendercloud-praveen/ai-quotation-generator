from fastapi import FastAPI
from app.models.company import Company
from app.models.user import User
from app.database.database import Base, engine
from app.api.user import router as user_router
from app.api.login import router as login_router
from app.models.login_history import LoginHistory
from app.api.product import router as product_router

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}
app.include_router(user_router)
app.include_router(login_router)
app.include_router(product_router)
Base.metadata.create_all(bind=engine)