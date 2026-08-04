from sqlalchemy.orm import Session

from app.models.login_history import LoginHistory


class LoginHistoryRepository:

    @staticmethod
    def create_login_history(db: Session, user_id: int):

        login_history = LoginHistory(
            user_id=user_id
        )

        db.add(login_history)
        db.commit()
        db.refresh(login_history)

        return login_history