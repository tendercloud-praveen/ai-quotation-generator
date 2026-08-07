from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.utils.auth import get_current_admin
from app.models.user import User

from app.database.database import get_db
from app.schemas.user import UserRegister, CreateUser, UpdateUser
from app.services.user_service import UserService

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.post("/register")
def register(
    user: UserRegister,
    db: Session = Depends(get_db),
    
):
    created_user = UserService.register_user(db, user)

    return {
        "message": "User Registered Successfully",
        "data": created_user
    }


@router.post("/create")
def create_user(
    user: CreateUser,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    created_user = UserService.create_user(db, user)

    return {
        "message": "User Created Successfully",
        "data": created_user
    }


@router.get("/{user_id}")
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    user = UserService.get_user_by_id(db, user_id)

    return {
        "message": "User fetched successfully",
        "data": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "mobile_number": user.mobile_number,
            "role": user.role,
            "is_active": user.is_active
        }
    }


@router.put("/{user_id}")
def update_user(
    user_id: int,
    user: UpdateUser,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    updated_user = UserService.update_user(
        db,
        user_id,
        user
    )

    return {
        "message": "User updated successfully",
        "data": {
            "id": updated_user.id,
            "full_name": updated_user.full_name,
            "email": updated_user.email,
            "mobile_number": updated_user.mobile_number,
            "role": updated_user.role,
            "is_active": updated_user.is_active
        }
    }



@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    UserService.delete_user(db, user_id)

    return {
        "message": "User deleted successfully"
    }