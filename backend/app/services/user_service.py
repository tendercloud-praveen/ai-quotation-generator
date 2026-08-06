from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.company import Company
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserRegister, CreateUser, UpdateUser
from app.services.email_service import EmailService


class UserService:

    @staticmethod
    def register_user(db: Session, user: UserRegister):

        # Check if email already exists
        existing_email = UserRepository.get_user_by_email(db, user.email)
        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )

        # Check if mobile number already exists
        existing_mobile = db.query(User).filter(
            User.mobile_number == user.mobile_number
        ).first()

        if existing_mobile:
            raise HTTPException(
                status_code=400,
                detail="Mobile number already exists"
            )

        # Check if company exists
        company = db.query(Company).filter(
            Company.company_name == user.company_name
        ).first()

        # Create company if it doesn't exist
        if not company:
            company = Company(company_name=user.company_name)
            db.add(company)
            db.commit()
            db.refresh(company)

        # Create Admin User
        new_user = User(
            full_name=user.full_name,
            email=user.email,
            mobile_number=user.mobile_number,
            password=user.password,
            role="ADMIN",
            company_id=company.id
        )

        created_user = UserRepository.create_user(db, new_user)

        EmailService.send_account_created_email(created_user)

        return created_user

    @staticmethod
    def create_user(db: Session, user: CreateUser):

        # Check if email already exists
        existing_email = UserRepository.get_user_by_email(db, user.email)
        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )

        # Check if mobile number already exists
        existing_mobile = UserRepository.get_user_by_mobile(
            db,
            user.mobile_number
        )

        if existing_mobile:
            raise HTTPException(
                status_code=400,
                detail="Mobile number already exists"
            )

        # Check if company exists
        company = UserRepository.get_company_by_name(
            db,
            user.company_name
        )

        if not company:
            raise HTTPException(
                status_code=404,
                detail="Company not found"
            )

        # Create User
        new_user = User(
            full_name=user.full_name,
            email=user.email,
            mobile_number=user.mobile_number,
            password=user.password,
            role=user.role,
            company_id=company.id
        )

        return UserRepository.create_user(db, new_user)

    @staticmethod
    def get_user_by_id(db: Session, user_id: int):

        user = UserRepository.get_user_by_id(db, user_id)

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        return user

    @staticmethod
    def update_user(db: Session, user_id: int, user_data: UpdateUser):

        user = UserRepository.get_user_by_id(db, user_id)

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        user.full_name = user_data.full_name
        user.email = user_data.email
        user.mobile_number = user_data.mobile_number
        user.role = user_data.role
        user.is_active = user_data.is_active

        return UserRepository.update_user(db, user)


    @staticmethod
    def delete_user(db: Session, user_id: int):

     user = UserRepository.get_user_by_id(db, user_id)

     if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

     UserRepository.delete_user(db, user)