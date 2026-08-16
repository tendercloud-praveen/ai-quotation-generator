from datetime import datetime

from sqlalchemy import func, case
from sqlalchemy.orm import Session

from app.models.quotations import Quotation


class DashboardRepository:

    @staticmethod
    def get_salesperson_quotation_revenue(
        db: Session,
        salesperson_id: int,
        company_id: int,
        start_date: datetime
    ):
        """
        Get quotation count and approved revenue
        month-wise for one salesperson.
        """

        results = (
            db.query(
                func.date_trunc(
                    "month",
                    Quotation.created_at
                ).label("month"),

                # Total quotations created by salesperson
                func.count(
                    Quotation.id
                ).label("quotation_count"),

                # Revenue only from APPROVED quotations
                func.coalesce(
                    func.sum(
                        case(
                            (
                                Quotation.status == "APPROVED",
                                Quotation.grand_total
                            ),
                            else_=0
                        )
                    ),
                    0
                ).label("revenue")
            )
            .filter(
                Quotation.user_id == salesperson_id,

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