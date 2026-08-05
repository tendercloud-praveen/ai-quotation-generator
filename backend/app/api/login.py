from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.services.login_service import LoginService

router = APIRouter(
    prefix="/users",
    tags=["Login"]
)

@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    return LoginService.login_user(db, form_data)