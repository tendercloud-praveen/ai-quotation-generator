from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate


def create_customer(
    db: Session,
    customer_data: CustomerCreate,
    company_id: int
):
    customer = Customer(
        company_id=company_id,
        company_name=customer_data.company_name,
        contact_person=customer_data.contact_person,
        email=customer_data.email,
        mobile=customer_data.mobile,
        address=customer_data.address,
    )

    db.add(customer)
    db.commit()
    db.refresh(customer)

    return customer


def get_customer_by_email(
    db: Session,
    email: str,
    company_id: int
):
    return (
        db.query(Customer)
        .filter(
            Customer.email == email,
            Customer.company_id == company_id
        )
        .first()
    )


def get_customers(
    db: Session,
    company_id: int
):
    return (
        db.query(Customer)
        .filter(
            Customer.company_id == company_id
        )
        .order_by(Customer.id.desc())
        .all()
    )


def get_customer_by_id(
    db: Session,
    customer_id: int,
    company_id: int
):
    return (
        db.query(Customer)
        .filter(
            Customer.id == customer_id,
            Customer.company_id == company_id
        )
        .first()
    )


def update_customer(
    db: Session,
    customer: Customer,
    customer_data: CustomerUpdate
):
    update_data = customer_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(customer, field, value)

    db.commit()
    db.refresh(customer)

    return customer


def delete_customer(
    db: Session,
    customer: Customer
):
    db.delete(customer)
    db.commit()

    return True