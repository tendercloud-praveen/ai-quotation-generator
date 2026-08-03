from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
 

from app.database.database import get_db
from app.schemas.user import UserRegister,CreateUser
from app.services.user_service import UserService


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.post("/register")
def register(
    user: UserRegister,
    db: Session = Depends(get_db)
):
    created_user = UserService.register_user(db, user)

    return {
        "message": "User Registered Successfully",
        "data": created_user
    }
@router.post("/create")
def create_user(
    user: CreateUser,
    db: Session = Depends(get_db)
):
    created_user = UserService.create_user(db, user)

    return {
        "message": "User Created Successfully",
        "data": created_user
    }