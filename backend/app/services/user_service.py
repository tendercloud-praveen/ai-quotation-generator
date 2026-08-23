from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.company import Company
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserRegister, CreateUser, UpdateUser
from app.services.email_service import EmailService


class UserService:

    # =========================================================
    # REGISTER COMPANY + ADMIN
    # =========================================================
    @staticmethod
    def register_user(
        db: Session,
        user: UserRegister
    ):

        # -----------------------------------------------------
        # 1. CHECK COMPANY NAME
        # -----------------------------------------------------
        existing_company = db.query(Company).filter(
            Company.company_name == user.company_name
        ).first()

        if existing_company:
            raise HTTPException(
                status_code=400,
                detail="Company name already exists."
            )

        # -----------------------------------------------------
        # 2. CHECK EMAIL GLOBALLY
        # -----------------------------------------------------
        existing_email = db.query(User).filter(
    User.email == user.email
).first()

        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="Email already exists."
            )

        # -----------------------------------------------------
        # 3. CHECK MOBILE GLOBALLY
        # -----------------------------------------------------
        existing_mobile = UserRepository.get_user_by_mobile(
            db,
            user.mobile_number
        )

        if existing_mobile:
            raise HTTPException(
                status_code=400,
                detail="Mobile number already exists."
            )

        # -----------------------------------------------------
        # 4. CREATE COMPANY
        # -----------------------------------------------------
        company = Company(
            company_name=user.company_name
        )

        db.add(company)
        db.commit()
        db.refresh(company)

        # -----------------------------------------------------
        # 5. CREATE ADMIN
        # -----------------------------------------------------
        new_user = User(
            full_name=user.full_name,
            email=user.email,
            mobile_number=user.mobile_number,
            password=user.password,
            role="ADMIN",
            company_id=company.id
        )

        # -----------------------------------------------------
        # 6. SAVE ADMIN
        # -----------------------------------------------------
        created_user = UserRepository.create_user(
            db,
            new_user
        )

        # -----------------------------------------------------
        # 7. SEND EMAIL
        # -----------------------------------------------------
        EmailService.send_account_created_email(
            created_user
        )

        return created_user


    # =========================================================
    # ADMIN CREATES SALES / MANAGER / OTHER USERS
    # =========================================================
    @staticmethod
    def create_user(
        db: Session,
        user: CreateUser,
        current_user: User
    ):

        # -----------------------------------------------------
        # 1. ONLY ADMIN CAN CREATE USERS
        # -----------------------------------------------------
        if current_user.role != "ADMIN":
            raise HTTPException(
                status_code=403,
                detail="Only admin can create users."
            )

        # -----------------------------------------------------
        # 2. GET ADMIN COMPANY ID
        # -----------------------------------------------------
        company_id = current_user.company_id

        # -----------------------------------------------------
        # 3. CHECK EMAIL GLOBALLY
        # -----------------------------------------------------
        existing_email = UserRepository.get_user_by_email(
            db,
            user.email,
            company_id
        )

        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="Email already exists."
            )

        # -----------------------------------------------------
        # 4. CHECK MOBILE GLOBALLY
        # -----------------------------------------------------
        existing_mobile = UserRepository.get_user_by_mobile(
            db,
            user.mobile_number
        )

        if existing_mobile:
            raise HTTPException(
                status_code=400,
                detail="Mobile number already exists."
            )

        # -----------------------------------------------------
        # 5. DO NOT ALLOW ANOTHER ADMIN
        # -----------------------------------------------------
        if user.role == "ADMIN":

            existing_admin = db.query(User).filter(
                User.company_id == company_id,
                User.role == "ADMIN"
            ).first()

            if existing_admin:
                raise HTTPException(
                    status_code=400,
                    detail="This company already has an admin account."
                )

        # -----------------------------------------------------
        # 6. CREATE USER
        # -----------------------------------------------------
        new_user = User(
            full_name=user.full_name,
            email=user.email,
            mobile_number=user.mobile_number,
            password=user.password,
            role=user.role,
            company_id=company_id
        )

        # -----------------------------------------------------
        # 7. SAVE USER
        # -----------------------------------------------------
        created_user = UserRepository.create_user(
            db,
            new_user
        )

        return created_user


    # =========================================================
    # GET USER BY ID
    # =========================================================
    @staticmethod
    def get_user_by_id(
        db: Session,
        user_id: int
    ):

        user = UserRepository.get_user_by_id(
            db,
            user_id
        )

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found."
            )

        return user


    # =========================================================
    # UPDATE USER
    # =========================================================
    @staticmethod
    def update_user(
        db: Session,
        user_id: int,
        user_data: UpdateUser
    ):

        # -----------------------------------------------------
        # 1. FIND USER
        # -----------------------------------------------------
        user = UserRepository.get_user_by_id(
            db,
            user_id
        )

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found."
            )

        # -----------------------------------------------------
        # 2. CHECK EMAIL GLOBALLY
        # -----------------------------------------------------
        existing_email = db.query(User).filter(
            User.email == user_data.email,
            User.id != user.id
        ).first()

        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="Email already exists."
            )

        # -----------------------------------------------------
        # 3. CHECK MOBILE GLOBALLY
        # -----------------------------------------------------
        existing_mobile = db.query(User).filter(
            User.mobile_number == user_data.mobile_number,
            User.id != user.id
        ).first()

        if existing_mobile:
            raise HTTPException(
                status_code=400,
                detail="Mobile number already exists."
            )

        # -----------------------------------------------------
        # 4. CHECK ADMIN
        # -----------------------------------------------------
        if (
            user_data.role == "ADMIN"
            and user.role != "ADMIN"
        ):

            existing_admin = db.query(User).filter(
                User.company_id == user.company_id,
                User.role == "ADMIN",
                User.id != user.id
            ).first()

            if existing_admin:
                raise HTTPException(
                    status_code=400,
                    detail="This company already has an admin account."
                )

        # -----------------------------------------------------
        # 5. UPDATE USER
        # -----------------------------------------------------
        user.full_name = user_data.full_name
        user.email = user_data.email
        user.mobile_number = user_data.mobile_number
        user.role = user_data.role
        user.is_active = user_data.is_active

        # -----------------------------------------------------
        # 6. SAVE USER
        # -----------------------------------------------------
        return UserRepository.update_user(
            db,
            user
        )


    # =========================================================
    # DELETE USER
    # =========================================================
    @staticmethod
    def delete_user(
        db: Session,
        user_id: int
    ):

        # -----------------------------------------------------
        # 1. FIND USER
        # -----------------------------------------------------
        user = UserRepository.get_user_by_id(
            db,
            user_id
        )

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found."
            )

        # -----------------------------------------------------
        # 2. DELETE USER
        # -----------------------------------------------------
        UserRepository.delete_user(
            db,
            user
        )

        return {
            "message": "User deleted successfully."
        }