from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.login import LoginUser
from app.services.login_service import LoginService

router = APIRouter(
    prefix="/users",
    tags=["Login"]
)

@router.post("/login")
def login(
    user: LoginUser,
    db: Session = Depends(get_db)
):
    return LoginService.login_user(db, user)