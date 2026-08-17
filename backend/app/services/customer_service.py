from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories import customer_repository
from app.schemas.customer import CustomerCreate, CustomerUpdate


def create_customer(
    db: Session,
    customer_data: CustomerCreate,
    company_id: int
):
    # Check if customer with same email already exists
    existing_customer = (
        customer_repository.get_customer_by_email(
            db,
            customer_data.email,
            company_id
        )
    )

    if existing_customer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Customer with this email already exists"
        )

    return customer_repository.create_customer(
        db,
        customer_data,
        company_id
    )


def get_customers(
    db: Session,
    company_id: int
):
    return customer_repository.get_customers(
        db,
        company_id
    )


def get_customer_by_id(
    db: Session,
    customer_id: int,
    company_id: int
):
    customer = customer_repository.get_customer_by_id(
        db,
        customer_id,
        company_id
    )

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )

    return customer


def update_customer(
    db: Session,
    customer_id: int,
    customer_data: CustomerUpdate,
    company_id: int
):
    customer = customer_repository.get_customer_by_id(
        db,
        customer_id,
        company_id
    )

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )

    return customer_repository.update_customer(
        db,
        customer,
        customer_data
    )


def delete_customer(
    db: Session,
    customer_id: int,
    company_id: int
):
    customer = customer_repository.get_customer_by_id(
        db,
        customer_id,
        company_id
    )

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )

    customer_repository.delete_customer(
        db,
        customer
    )

    return {
        "message": "Customer deleted successfully"
    }