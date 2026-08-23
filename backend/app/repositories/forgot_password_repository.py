from app.models.user import User
from app.models.otp import OTP


class ForgotPasswordRepository:

    @staticmethod
    def get_user_by_email(db, email,company_id):

        return db.query(User).filter(
            User.email == email,User.company_id == company_id
        ).first()

    @staticmethod
    def save_otp(db, email, otp, expiry):

        existing = db.query(OTP).filter(
            OTP.email == email
        ).first()

        if existing:
            existing.otp = otp
            existing.expiry = expiry

        else:
            db.add(
                OTP(
                    email=email,
                    otp=otp,
                    expiry=expiry
                )
            )

        db.commit()

    @staticmethod
    def get_otp(db, email):

        return db.query(OTP).filter(
            OTP.email == email
        ).first()

    @staticmethod
    def update_password(db, user, new_password):

        user.password = new_password
        db.commit()

    @staticmethod
    def delete_otp(db, email):

        db.query(OTP).filter(
            OTP.email == email
        ).delete()

        db.commit()