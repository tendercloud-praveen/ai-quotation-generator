from app.services.smtp_service import SMTPService


class EmailService:

    @staticmethod
    def send_account_created_email(user):

        subject = "Account Created Successfully"

        body = f"""
Dear {user.full_name},

Welcome to the AI Quotation Generator!

Your account has been successfully created by our administrator.

Role: {user.role}

You can now access the system and start using the application based on your assigned role.

If you require any assistance, please contact our support team.

Best Regards,
AI Quotation Generator Team
"""

        SMTPService.send_email(
            to_email=user.email,
            subject=subject,
            body=body
        )