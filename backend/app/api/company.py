from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.company import Company
from app.models.user import User
from app.schemas.company import CompanyCreate, CompanyUpdate
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)

@router.post("/")
def create_customer(
    customer_data: CompanyCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    existing_company = db.query(Company).filter(
        Company.company_name == customer_data.company_name
    ).first()

    if existing_company:
        raise HTTPException(
            status_code=400,
            detail="Customer already exists"
        )

    new_company = Company(
        company_name=customer_data.company_name,
        contact_person=customer_data.contact_person,
        email=customer_data.email,
        mobile=customer_data.mobile,
        address=customer_data.address
    )

    db.add(new_company)
    db.commit()
    db.refresh(new_company)

    return {
        "status": "success",
        "message": "Customer added successfully",
        "customer": {
            "id": new_company.id,
            "company_name": new_company.company_name,
            "contact_person": new_company.contact_person,
            "email": new_company.email,
            "mobile": new_company.mobile,
            "address": new_company.address
        }
    }






@router.get("/")
def get_all_customers(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    companies = db.query(Company).all()

    return {
        "status": "success",
        "message": "Customers fetched successfully",
        "data": [
            {
                "id": company.id,
                "company_name": company.company_name,
                "contact_person": company.contact_person,
                "email": company.email,
                "mobile": company.mobile,
                "address": company.address
            }
            for company in companies
        ]
    }







@router.get("/{customer_id}")
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    company = db.query(Company).filter(
        Company.id == customer_id
    ).first()

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    return {
        "status": "success",
        "message": "Customer fetched successfully",
        "customer": {
            "id": company.id,
            "company_name": company.company_name,
            "contact_person": company.contact_person,
            "email": company.email,
            "mobile": company.mobile,
            "address": company.address
        }
    }


@router.delete("/{customer_id}")
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    company = db.query(Company).filter(
        Company.id == customer_id
    ).first()

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    db.delete(company)
    db.commit()

    return {
        "status": "success",
        "message": "Customer deleted successfully",
        "data": {
            "id": customer_id

            
       }

    }





@router.put("/{customer_id}")
def update_customer(
    customer_id: int,
    customer_data: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    company = db.query(Company).filter(
        Company.id == customer_id
    ).first()

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    company.company_name = customer_data.company_name
    company.contact_person = customer_data.contact_person
    company.email = customer_data.email
    company.mobile = customer_data.mobile
    company.address = customer_data.address

    db.commit()
    db.refresh(company)

    return {
        "status": "success",
        "message": "Customer updated successfully",
        "customer": {
            "id": company.id,
            "company_name": company.company_name,
            "contact_person": company.contact_person,
            "email": company.email,
            "mobile": company.mobile,
            "address": company.address
        }
    }