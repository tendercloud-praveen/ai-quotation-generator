from datetime import datetime, timedelta

from app.repositories.forgot_password_repository import ForgotPasswordRepository
from app.utils.otp_generator import generate_otp
from app.services.smtp_service import SMTPService


class ForgotPasswordService:

    @staticmethod
    def forgot_password(db, email):

        # Check whether the user exists
        user = ForgotPasswordRepository.get_user_by_email(db, email)

        if not user:
            return {
                "success": False,
                "message": "Email not registered."
            }

        # Generate OTP
        otp = generate_otp()

        # Set expiry time
        expiry = datetime.utcnow() + timedelta(minutes=10)

        # Save OTP in database
        ForgotPasswordRepository.save_otp(
            db,
            email,
            otp,
            expiry
        )

        # Send OTP to email
        SMTPService.send_email(
            to_email=email,
            subject="Password Reset OTP",
            body=f"""
Hello,

Your OTP for password reset is: {otp}

This OTP is valid for 10 minutes.

If you did not request this, please ignore this email.

Thank you.
"""
        )

        return {
            "success": True,
            "message": "OTP sent successfully."
        }

    @staticmethod
    def reset_password(db, email, otp, new_password, confirm_password):

        # Check passwords match
        if new_password != confirm_password:
            return {
                "success": False,
                "message": "Passwords do not match."
            }

        # Check user exists
        user = ForgotPasswordRepository.get_user_by_email(
            db,
            email
        )

        if not user:
            return {
                "success": False,
                "message": "User not found."
            }

        # Get OTP from database
        otp_record = ForgotPasswordRepository.get_otp(
            db,
            email
        )

        if not otp_record:
            return {
                "success": False,
                "message": "OTP not found."
            }

        # Verify OTP
        if otp_record.otp != otp:
            return {
                "success": False,
                "message": "Invalid OTP."
            }

        # Check OTP expiry
        if otp_record.expiry < datetime.utcnow():
            return {
                "success": False,
                "message": "OTP expired."
            }

        # Update password
        ForgotPasswordRepository.update_password(
            db,
            user,
            new_password
        )

        # Delete OTP after successful reset
        ForgotPasswordRepository.delete_otp(
            db,
            email
        )

        return {
            "success": True,
            "message": "Password reset successfully."
        }