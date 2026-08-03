from fastapi import FastAPI
from app.models.company import Company
from app.models.user import User
from app.database.database import Base, engine
from app.api.user import router as user_router

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}
app.include_router(user_router)
Base.metadata.create_all(bind=engine)