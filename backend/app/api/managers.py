from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/managers",
    tags=["Managers"]
)


@router.get("/")
def get_managers(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    managers = (
        db.query(User)
        .filter(
            User.company_id == current_user.company_id,
            User.role == "manager"
        )
        .all()
    )

    return {
        "status": "success",
        "managers": [
            {
                "id": manager.id,
                "full_name": manager.full_name,
                "email": manager.email,
                "mobile_number": manager.mobile_number,
                "role": manager.role
            }
            for manager in managers
        ]
    }