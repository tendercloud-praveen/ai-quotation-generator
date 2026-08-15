from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.company import Company
from app.models.user import User
from app.schemas.company import CompanyCreate, CompanyUpdate
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/companies",
    tags=["Companies"]
)

@router.post("/")
def create_company(
    company_data: CompanyCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    existing_company = db.query(Company).filter(
        Company.company_name == company_data.company_name
    ).first()

    if existing_company:
        raise HTTPException(
            status_code=400,
            detail="Company already exists"
        )

    new_company = Company(
        company_name=company_data.company_name,
        contact_person=company_data.contact_person,
        email=company_data.email,
        mobile=company_data.mobile,
        address=company_data.address
    )

    db.add(new_company)
    db.commit()
    db.refresh(new_company)

    return {
        "status": "success",
        "message": "Company added successfully",
        "company": {
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







@router.get("/{company_id}")
def get_customer(
    company_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    company = db.query(Company).filter(
        Company.id == company_id
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








@router.delete("/{company_id}")
def delete_customer(
    company_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    company = db.query(Company).filter(
        Company.id == company_id
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
            "id": company_id
        }
    }







@router.put("/{company_id}")
def update_company(
    company_id: int,
    company_data: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    company = db.query(Company).filter(
        Company.id == company_id
    ).first()

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company not found"
        )

    company.company_name = company_data.company_name
    company.contact_person = company_data.contact_person
    company.email = company_data.email
    company.mobile = company_data.mobile
    company.address = company_data.address

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