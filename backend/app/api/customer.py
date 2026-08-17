from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.customer import (
    CustomerCreate,
    CustomerUpdate,
    CustomerResponse,
)
from app.services import customer_service
from app.utils.auth import get_current_admin


router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)


@router.post(
    "/",
    response_model=CustomerResponse,
    status_code=status.HTTP_201_CREATED
)
def create_customer(
    customer_data: CustomerCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    company_id = current_admin.company_id

    return customer_service.create_customer(
        db=db,
        customer_data=customer_data,
        company_id=company_id
    )


@router.get(
    "/",
    response_model=list[CustomerResponse]
)
def get_customers(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    company_id = current_admin.company_id

    return customer_service.get_customers(
        db=db,
        company_id=company_id
    )


@router.get(
    "/{customer_id}",
    response_model=CustomerResponse
)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    company_id = current_admin.company_id

    return customer_service.get_customer_by_id(
        db=db,
        customer_id=customer_id,
        company_id=company_id
    )


@router.put(
    "/{customer_id}",
    response_model=CustomerResponse
)
def update_customer(
    customer_id: int,
    customer_data: CustomerUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    company_id = current_admin.company_id

    return customer_service.update_customer(
        db=db,
        customer_id=customer_id,
        customer_data=customer_data,
        company_id=company_id
    )


@router.delete(
    "/{customer_id}"
)
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    company_id = current_admin.company_id

    return customer_service.delete_customer(
        db=db,
        customer_id=customer_id,
        company_id=company_id
    )