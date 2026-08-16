from datetime import datetime

from sqlalchemy import func, case
from sqlalchemy.orm import Session

from app.models.quotations import Quotation


class QuotationRevenueTrendManagerRepository:

    @staticmethod
    def get_manager_quotation_revenue(
        db: Session,
        manager_id: int,
        company_id: int,
        start_date: datetime
    ):
        """
        Get quotation count and approved revenue
        month-wise for one manager.
        """

        results = (
            db.query(
                func.date_trunc(
                    "month",
                    Quotation.created_at
                ).label("month"),

                # Total quotations assigned to manager
                func.count(
                    Quotation.id
                ).label("quotation_count"),

                # Revenue only from approved quotations
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
                Quotation.manager_id == manager_id,

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