from fastapi import APIRouter, Depends
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/manager/dashboard",
    tags=["Manager Dashboard"]
)


@router.get("/dashboard")
def get_manager_dashboard(
    current_user=Depends(get_current_user),
    
):
    return {
        "message": "Manager Dashboard",
        
    }