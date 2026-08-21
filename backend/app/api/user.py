from http.client import HTTPException
from fastapi import APIRouter, Depends

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.utils.auth import get_current_admin
from app.models.user import User

from app.database.database import get_db
from app.schemas.user import UserRegister, CreateUser, UpdateUser
from app.services.user_service import UserService
from app.utils.auth import get_current_user

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
    current_admin: User = Depends(get_current_admin),
    current_user: User = Depends(get_current_user)
):
    created_user = UserService.create_user(db, user, current_user)

    return {
        "message": "User Created Successfully",
        "data": created_user
    }

@router.get("/")
def get_all_users(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
    current_user: User = Depends(get_current_user)
):
    users = (
    db.query(User)
    .filter(
        User.company_id == current_admin.company_id,
        User.is_active == True
    )
    .all()
)

    return {
        "message": "Users fetched successfully",
        "data": [
            {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "mobile_number": user.mobile_number,
                "role": user.role,
                "is_active": user.is_active,
                "created_at": user.created_at
            }
            for user in users
        ]
    }

@router.get("/{user_id}")
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
    current_user: User = Depends(get_current_user)
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
            "is_active": user.is_active,
            "created_at": user.created_at
            
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
            "is_active": updated_user.is_active,
            "created_at": user.created_at
        }
    }



@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if user.id == current_admin.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot delete your own account"
        )

    # Soft delete
    user.is_active = False

    db.commit()
    db.refresh(user)

    return {
        "message": "User deleted successfully",
        "data": {
            "id": user.id,
            "is_active": user.is_active
        }
    }