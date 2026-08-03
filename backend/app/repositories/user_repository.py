from sqlalchemy.orm import Session

from app.models.user import User
from app.models.company import Company


class UserRepository:

    @staticmethod
    def get_user_by_email(db: Session, email: str):
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_user_by_mobile(db: Session, mobile_number: str):
        return db.query(User).filter(
            User.mobile_number == mobile_number
        ).first()

    @staticmethod
    def get_company_by_name(db: Session, company_name: str):
        return db.query(Company).filter(
            Company.company_name == company_name
        ).first()

    @staticmethod
    def create_company(db: Session, company: Company):
        db.add(company)
        db.commit()
        db.refresh(company)
        return company

    @staticmethod
    def create_user(db: Session, user: User):
        db.add(user)
        db.commit()
        db.refresh(user)
        return user