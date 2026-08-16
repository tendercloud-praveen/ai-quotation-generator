from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.quotations import Quotation


class DashboardRepository:

    @staticmethod
    def get_quotation_revenue_by_month(
        db: Session,
        company_id: int,
        start_date: datetime
    ):
        results = (
            db.query(
                func.date_trunc(
                    "month",
                    Quotation.created_at
                ).label("month"),

                func.count(
                    Quotation.id
                ).label("quotation_count"),

                func.coalesce(
                    func.sum(
                        Quotation.grand_total
                    ),
                    0
                ).label("revenue")
            )
            .filter(
                Quotation.company_id == company_id,
                Quotation.created_at >= start_date
            )
            .group_by(
                func.date_trunc(
                    "month",
                    Quotation.created_at
                )
            )
            .order_by(
                func.date_trunc(
                    "month",
                    Quotation.created_at
                )
            )
            .all()
        )

        return results